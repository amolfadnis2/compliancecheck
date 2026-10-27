import { NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { isValidWebhookSignature } from '@/lib/payment/razorpay-signature'
import { captureServerEvent } from '@/lib/analytics/server'
import { ANALYTICS_EVENTS } from '@/lib/analytics/events'
import type { AssessmentType } from '@/lib/constants/assessment-types'

/**
 * Razorpay webhook — the backstop for /api/payment/verify.
 *
 * If the buyer closes the tab after paying but before the checkout handler
 * calls /verify, they are charged but never unlocked. Razorpay retries this
 * webhook until it gets a 2xx, so it reliably marks the entitlement paid.
 *
 * Register in the Razorpay dashboard: URL /api/payment/webhook, events
 * payment.captured, order.paid, payment.failed; secret = RAZORPAY_WEBHOOK_SECRET.
 */

let _supabase: SupabaseClient | null = null
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  }
  return _supabase
}

interface RazorpayPaymentEntity {
  id: string
  order_id: string
  email?: string
  error_description?: string
}

interface RazorpayWebhookBody {
  event: string
  payload?: {
    payment?: { entity?: RazorpayPaymentEntity }
    order?: { entity?: { id: string } }
  }
}

export async function POST(request: Request) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!secret) {
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    // Signature is over the exact raw body — read it before parsing.
    const rawBody = await request.text()
    const signature = request.headers.get('x-razorpay-signature') ?? ''
    if (!signature || !isValidWebhookSignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const body = JSON.parse(rawBody) as RazorpayWebhookBody
    const payment = body.payload?.payment?.entity
    const orderId = payment?.order_id || body.payload?.order?.entity?.id

    const handled = ['payment.captured', 'order.paid', 'payment.failed']
    if (!handled.includes(body.event) || !orderId) {
      return NextResponse.json({ ignored: true })
    }

    const supabase = getSupabase()
    const { data: entitlement, error: lookupError } = await supabase
      .from('assessment_entitlements')
      .select('assessment_id, assessment_type, status, amount_paise, email')
      .eq('razorpay_order_id', orderId)
      .maybeSingle()

    if (lookupError) {
      // Let Razorpay retry on a transient DB error.
      console.error('webhook: entitlement lookup failed', orderId, lookupError.message)
      return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
    }
    if (!entitlement) {
      // Not one of ours (e.g. a legacy auto-dealer /pay order). 200 stops retries.
      return NextResponse.json({ ignored: true })
    }

    const funnel = {
      assessment_type: entitlement.assessment_type as AssessmentType,
      assessment_id: entitlement.assessment_id,
      amount_inr: Math.round((entitlement.amount_paise ?? 0) / 100),
    }
    const distinctId = entitlement.email || payment?.email || entitlement.assessment_id

    if (body.event === 'payment.failed') {
      // Never downgrade an order that has already been paid or waived.
      if (entitlement.status === 'initiated') {
        await supabase
          .from('assessment_entitlements')
          .update({ status: 'failed' })
          .eq('razorpay_order_id', orderId)
          .eq('status', 'initiated')
      }
      await captureServerEvent(ANALYTICS_EVENTS.PAYMENT_FAILED, distinctId, {
        ...funnel,
        stage: 'checkout',
        error: payment?.error_description,
      })
      return NextResponse.json({ success: true })
    }

    // payment.captured / order.paid — idempotent.
    if (entitlement.status === 'paid' || entitlement.status === 'waived') {
      return NextResponse.json({ success: true, alreadyPaid: true })
    }

    const { error: updateError } = await supabase
      .from('assessment_entitlements')
      .update({
        status: 'paid',
        payment_method: 'razorpay',
        razorpay_payment_id: payment?.id ?? null,
        paid_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', orderId)

    if (updateError) {
      console.error('webhook: entitlement update failed', orderId, updateError.message)
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    await captureServerEvent(ANALYTICS_EVENTS.PAYMENT_SUCCEEDED, distinctId, {
      ...funnel,
      payment_method: 'razorpay',
      source: 'webhook',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
