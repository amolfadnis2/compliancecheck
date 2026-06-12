import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isValidAssessmentType, type AssessmentType } from '@/lib/constants/assessment-types'

export async function POST(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const body = await request.json()
    const { assessmentId, assessmentType, code, email } = body

    if (!assessmentId || !assessmentType || !code || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!isValidAssessmentType(assessmentType)) {
      return NextResponse.json({ error: 'Invalid assessment type' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const normalizedCode = (code as string).toUpperCase().trim()

    // Validate promo code — promo_codes has no anonymous SELECT policy so this
    // only succeeds via the service_role client used here.
    const { data: promo, error: promoError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', normalizedCode)
      .eq('active', true)
      .maybeSingle()

    if (promoError || !promo) {
      return NextResponse.json({ error: 'Invalid or inactive promo code' }, { status: 400 })
    }

    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Promo code has expired' }, { status: 400 })
    }

    if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
      return NextResponse.json({ error: 'Promo code usage limit reached' }, { status: 400 })
    }

    const appliesToAll = promo.applies_to.includes('all')
    if (!appliesToAll && !promo.applies_to.includes(assessmentType as AssessmentType)) {
      return NextResponse.json({ error: 'Promo code is not valid for this assessment' }, { status: 400 })
    }

    const { error: entitlementError } = await supabase
      .from('assessment_entitlements')
      .upsert(
        {
          assessment_id: assessmentId,
          assessment_type: assessmentType,
          amount_paise: 0,
          status: 'waived',
          payment_method: 'waiver',
          promo_code: normalizedCode,
          email,
          paid_at: new Date().toISOString(),
        },
        { onConflict: 'assessment_id,assessment_type' }
      )

    if (entitlementError) {
      console.error('Entitlement upsert error:', entitlementError)
      return NextResponse.json({ error: 'Failed to apply promo code' }, { status: 500 })
    }

    // Increment usage count and write audit row (best-effort — non-fatal)
    await Promise.allSettled([
      supabase
        .from('promo_codes')
        .update({ used_count: promo.used_count + 1 })
        .eq('id', promo.id),
      supabase.from('promo_redemptions').insert({
        promo_code: normalizedCode,
        assessment_id: assessmentId,
        assessment_type: assessmentType,
        email,
      }),
    ])

    return NextResponse.json({ success: true, assessmentId })
  } catch (error) {
    console.error('redeem-waiver error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
