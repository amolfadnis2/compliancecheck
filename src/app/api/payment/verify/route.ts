import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isValidCheckoutSignature } from '@/lib/payment/razorpay-signature'
import { captureServerEvent } from '@/lib/analytics/server'
import { ANALYTICS_EVENTS } from '@/lib/analytics/events'
import type { AssessmentType } from '@/lib/constants/assessment-types'
import { normalizeIndianMobile } from '@/lib/identity/phone'

export async function POST(request: Request) {
  try {
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET
    if (!razorpaySecret) {
      return NextResponse.json({ error: 'Payment verification not configured' }, { status: 503 })
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const body = await request.json()
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      assessmentId,
      assessmentType,
      email,
    } = body
    // Optional WhatsApp number for report delivery; stored only when valid.
    const phone = normalizeIndianMobile(body.phone)

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !assessmentId || !assessmentType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!isValidCheckoutSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature, razorpaySecret)) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Bind the payment to the entitlement created at create-order. The HMAC only
    // proves the order/payment pair is a genuine Razorpay payment — it says
    // nothing about which assessment it was for, so the client-claimed
    // assessmentId/assessmentType must match the row keyed by razorpay_order_id
    // or a single cheap payment could be replayed to unlock any assessment.
    const { data: entitlement, error: lookupError } = await supabase
      .from('assessment_entitlements')
      .select('assessment_id, assessment_type, status, amount_paise')
      .eq('razorpay_order_id', razorpay_order_id)
      .maybeSingle()

    if (lookupError || !entitlement) {
      console.error('verify: no entitlement for order', razorpay_order_id, lookupError?.message)
      return NextResponse.json({ error: 'Unknown payment order' }, { status: 400 })
    }
    if (entitlement.assessment_id !== assessmentId || entitlement.assessment_type !== assessmentType) {
      console.error('verify: order/assessment mismatch', razorpay_order_id, assessmentId, assessmentType)
      return NextResponse.json({ error: 'Order does not match this assessment' }, { status: 400 })
    }

    // Idempotent: the Razorpay webhook may have already marked this order paid.
    if (entitlement.status === 'paid') {
      return NextResponse.json({ success: true, assessmentId })
    }

    const { error } = await supabase
      .from('assessment_entitlements')
      .update({
        status: 'paid',
        payment_method: 'razorpay',
        razorpay_payment_id,
        razorpay_signature,
        email: email ?? null,
        ...(phone ? { phone } : {}),
        paid_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', razorpay_order_id)

    if (error) {
      console.error('Entitlement update error:', error)
      return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 })
    }

    await captureServerEvent(ANALYTICS_EVENTS.PAYMENT_SUCCEEDED, email || assessmentId, {
      assessment_type: assessmentType as AssessmentType,
      assessment_id: assessmentId,
      amount_inr: Math.round((entitlement.amount_paise ?? 0) / 100),
      payment_method: 'razorpay',
      source: 'server',
    })

    return NextResponse.json({ success: true, assessmentId })
  } catch (error) {
    console.error('verify error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
