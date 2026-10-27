import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ASSESSMENT_PRICES, isValidAssessmentType, type AssessmentType } from '@/lib/constants/assessment-types'
import { assessmentTableFor } from '@/lib/payment/assessment-table'
import { captureServerEvent } from '@/lib/analytics/server'
import { ANALYTICS_EVENTS } from '@/lib/analytics/events'
import { normalizeIndianMobile } from '@/lib/identity/phone'

export async function POST(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const body = await request.json()
    const { assessmentId, assessmentType, code, email } = body
    // Optional WhatsApp number for report delivery; stored only when valid.
    const phone = normalizeIndianMobile(body.phone)

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

    const { data: assessmentRow } = await supabase
      .from(assessmentTableFor(assessmentType))
      .select('id')
      .eq('id', assessmentId)
      .maybeSingle()
    if (!assessmentRow) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // Already unlocked: don't burn a use or overwrite a real payment with a waiver.
    const { data: existing } = await supabase
      .from('assessment_entitlements')
      .select('status')
      .eq('assessment_id', assessmentId)
      .eq('assessment_type', assessmentType)
      .maybeSingle()
    if (existing?.status === 'paid' || existing?.status === 'waived') {
      return NextResponse.json({ success: true, assessmentId, alreadyPaid: true })
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
          ...(phone ? { phone } : {}),
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

    await captureServerEvent(ANALYTICS_EVENTS.PAYMENT_SUCCEEDED, email, {
      assessment_type: assessmentType as AssessmentType,
      assessment_id: assessmentId,
      amount_inr: Math.round(ASSESSMENT_PRICES[assessmentType as AssessmentType].amountPaise / 100),
      payment_method: 'waiver',
      source: 'server',
    })

    return NextResponse.json({ success: true, assessmentId })
  } catch (error) {
    console.error('redeem-waiver error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
