import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@supabase/supabase-js'
import { ASSESSMENT_PRICES, isValidAssessmentType, type AssessmentType } from '@/lib/constants/assessment-types'

let _razorpay: Razorpay | null = null
function getRazorpay() {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })
  }
  return _razorpay
}

export async function POST(request: Request) {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 503 })
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const body = await request.json()
    const { assessmentId, assessmentType, email } = body

    if (!assessmentId || !assessmentType || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!isValidAssessmentType(assessmentType)) {
      return NextResponse.json({ error: 'Invalid assessment type' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Guard: don't overwrite an existing paid/waived entitlement
    const { data: existing } = await supabase
      .from('assessment_entitlements')
      .select('status')
      .eq('assessment_id', assessmentId)
      .eq('assessment_type', assessmentType)
      .maybeSingle()

    if (existing?.status === 'paid' || existing?.status === 'waived') {
      return NextResponse.json({ alreadyPaid: true }, { status: 200 })
    }

    const amountPaise = ASSESSMENT_PRICES[assessmentType as AssessmentType].amountPaise

    const order = await getRazorpay().orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: assessmentId.slice(0, 40),
      notes: { assessmentId, assessmentType, email },
    })

    await supabase.from('assessment_entitlements').upsert(
      {
        assessment_id: assessmentId,
        assessment_type: assessmentType,
        amount_paise: amountPaise,
        status: 'initiated',
        payment_method: 'razorpay',
        razorpay_order_id: order.id,
        email,
      },
      { onConflict: 'assessment_id,assessment_type' }
    )

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error('create-order error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
