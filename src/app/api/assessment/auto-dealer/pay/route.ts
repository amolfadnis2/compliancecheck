import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Razorpay from 'razorpay'

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

const TIER_PRICES = {
  basic: 99900,      // Rs.999 in paise
  standard: 249900,  // Rs.2,499 in paise
  premium: 499900,   // Rs.4,999 in paise
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { assessmentId?: string }
    const { assessmentId } = body

    if (!assessmentId) {
      return NextResponse.json({ success: false, error: 'assessmentId is required' }, { status: 400 })
    }

    const supabase = getSupabase()

    // Fetch assessment to check email_verified and tier
    const { data: assessment, error: fetchErr } = await supabase
      .from('auto_dealer_assessments')
      .select('id, user_email, email_verified, price_tier, payment_status, company_name')
      .eq('id', assessmentId)
      .single()

    if (fetchErr || !assessment) {
      return NextResponse.json({ success: false, error: 'Assessment not found' }, { status: 404 })
    }

    const a = assessment as {
      id: string; user_email: string; email_verified: boolean;
      price_tier: string | null; payment_status: string; company_name: string | null
    }

    if (!a.email_verified) {
      return NextResponse.json({ success: false, error: 'Email verification required before payment' }, { status: 403 })
    }

    if (a.payment_status === 'paid') {
      return NextResponse.json({ success: false, error: 'Assessment already paid' }, { status: 400 })
    }

    const tier = (a.price_tier ?? 'standard') as 'basic' | 'standard' | 'premium'
    const amount = TIER_PRICES[tier] ?? TIER_PRICES.standard

    const order = await getRazorpay().orders.create({
      amount,
      currency: 'INR',
      receipt: assessmentId.slice(0, 40),
      notes: {
        assessmentId,
        email: a.user_email,
        companyName: a.company_name ?? '',
        tier,
      },
    })

    // Store Razorpay order ID
    await supabase
      .from('auto_dealer_assessments')
      .update({
        razorpay_order_id: order.id,
        payment_status: 'initiated',
      })
      .eq('id', assessmentId)

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      tier,
    })
  } catch (err) {
    console.error('Pay route error:', err)
    return NextResponse.json({ success: false, error: 'Failed to create payment order' }, { status: 500 })
  }
}
