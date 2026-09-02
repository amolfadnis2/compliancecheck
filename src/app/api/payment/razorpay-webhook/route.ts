import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

/**
 * Razorpay server-to-server webhook — the durable half of the paywall.
 *
 * /api/payment/verify only runs if the browser survives the redirect back from
 * Razorpay Checkout. Close the tab at the wrong moment and the customer is
 * charged but never entitled. Razorpay retries this endpoint independently of
 * the browser, so it is what actually guarantees a captured payment lands in
 * `assessment_entitlements`.
 *
 * Dashboard setup: Settings > Webhooks > Add New Webhook
 *   URL:     https://compliancecheck.co.in/api/payment/razorpay-webhook
 *   Secret:  the value of RAZORPAY_WEBHOOK_SECRET (NOT RAZORPAY_KEY_SECRET)
 *   Events:  payment.captured
 */

/** Constant-time compare that tolerates unequal lengths. */
function signaturesMatch(expected: string, received: string): boolean {
  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(received, 'utf8')
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!webhookSecret) {
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    // The signature is over the exact bytes Razorpay sent. Parsing JSON first
    // and re-serialising would change key order/whitespace and break it.
    const rawBody = await request.text()
    const receivedSignature = request.headers.get('x-razorpay-signature')

    if (!receivedSignature) {
      return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 })
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex')

    if (!signaturesMatch(expectedSignature, receivedSignature)) {
      console.error('razorpay-webhook: signature mismatch')
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
    }

    let event: {
      event?: string
      payload?: { payment?: { entity?: Record<string, unknown> } }
    }
    try {
      event = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Malformed webhook payload' }, { status: 400 })
    }

    // Anything we do not deliberately handle is acknowledged, not retried.
    if (event.event !== 'payment.captured') {
      return NextResponse.json({ ignored: true, event: event.event ?? null }, { status: 200 })
    }

    const entity = event.payload?.payment?.entity
    const orderId = typeof entity?.order_id === 'string' ? entity.order_id : null
    const paymentId = typeof entity?.id === 'string' ? entity.id : null
    const notes = (entity?.notes ?? {}) as Record<string, unknown>

    if (!orderId || !paymentId) {
      return NextResponse.json({ error: 'Payload missing order or payment id' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: entitlement, error: lookupError } = await supabase
      .from('assessment_entitlements')
      .select('assessment_id, assessment_type, status')
      .eq('razorpay_order_id', orderId)
      .maybeSingle()

    if (lookupError || !entitlement) {
      console.error('razorpay-webhook: no entitlement for order', orderId, lookupError?.message)
      return NextResponse.json({ error: 'Unknown payment order' }, { status: 400 })
    }

    // Same binding check as /api/payment/verify: the signature proves the event
    // is genuinely from Razorpay, not which assessment it unlocks. The order's
    // own notes must agree with the row we are about to mark paid.
    if (
      notes.assessmentId !== entitlement.assessment_id ||
      notes.assessmentType !== entitlement.assessment_type
    ) {
      console.error('razorpay-webhook: order/assessment mismatch', orderId)
      return NextResponse.json({ error: 'Order does not match this assessment' }, { status: 400 })
    }

    // Idempotent: Razorpay retries, and /api/payment/verify usually wins the
    // race. Never downgrade or rewrite an entitlement that is already granted.
    if (entitlement.status === 'paid' || entitlement.status === 'waived') {
      return NextResponse.json({ success: true, alreadyRecorded: true }, { status: 200 })
    }

    const noteEmail = typeof notes.email === 'string' ? notes.email : null

    const { error: updateError } = await supabase
      .from('assessment_entitlements')
      .update({
        status: 'paid',
        payment_method: 'razorpay',
        razorpay_payment_id: paymentId,
        ...(noteEmail ? { email: noteEmail } : {}),
        paid_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', orderId)

    if (updateError) {
      console.error('razorpay-webhook: entitlement update failed', updateError.message)
      // 500 so Razorpay retries — the payment is real and must be recorded.
      return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 })
    }

    return NextResponse.json({ success: true, assessmentId: entitlement.assessment_id })
  } catch (error) {
    console.error('razorpay-webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
