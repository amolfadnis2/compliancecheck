import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabase(): any {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _supabase
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      fullName?: string
      email?: string
      phone?: string
      companyName?: string
    }

    const { fullName, email, phone, companyName } = body

    if (!email || !fullName || !phone || !companyName) {
      return NextResponse.json({ success: false, error: 'fullName, email, phone and companyName are required' }, { status: 400 })
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 })
    }

    const assessmentId = crypto.randomUUID()

    const { error: insertError } = await getSupabase()
      .from('auto_dealer_assessments')
      .insert({
        id: assessmentId,
        user_email: email.toLowerCase().trim(),
        email_verified: false,
        full_name: fullName.trim(),
        phone: phone.trim(),
        company_name: companyName.trim(),
        responses: {},
        payment_status: 'pending',
        labour_regime: 'new',
      })

    if (insertError) {
      console.error('Assessment start insert error:', insertError)
      // Return a fallback ID so the client can continue without DB
      const fallbackId = crypto.randomUUID()
      return NextResponse.json({ assessmentId: fallbackId, savedToDb: false })
    }

    return NextResponse.json({ assessmentId, savedToDb: true })
  } catch (err) {
    console.error('Assessment start error:', err)
    // Return fallback so the client is never blocked
    return NextResponse.json({ assessmentId: crypto.randomUUID(), savedToDb: false })
  }
}
