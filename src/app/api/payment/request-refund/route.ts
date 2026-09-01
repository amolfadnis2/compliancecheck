import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { isValidAssessmentType, getAssessmentDisplayName } from '@/lib/constants/assessment-types'

// Lazy initialization (Netlify build safety, CLAUDE.md sec 3)
let resend: Resend | null = null
function getResendClient(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

const REFUND_WINDOW_MS = 7 * 24 * 60 * 60 * 1000
const FOUNDER_EMAIL = process.env.REFUND_NOTIFY_EMAIL || 'compliancecheck@zohomail.in'

/**
 * 7-day no-questions money-back guarantee (P0-A.3). This is a MANUAL refund
 * queue by design (low volume, safer to start): a request immediately marks
 * the entitlement 'refund_requested' and notifies the founder, but the
 * actual Razorpay refund is issued by hand within the 2-business-day SLA.
 * Marking status 'refunded' (which revokes report access — see
 * getEntitlement()) happens separately once the money has actually moved.
 */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const { assessmentId, assessmentType, email } = await request.json()

    if (!assessmentId || !isValidAssessmentType(assessmentType)) {
      return NextResponse.json({ error: 'Missing or invalid assessment' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: entitlement, error: lookupError } = await supabase
      .from('assessment_entitlements')
      .select('status, payment_method, paid_at, email, amount_paise')
      .eq('assessment_id', assessmentId)
      .eq('assessment_type', assessmentType)
      .maybeSingle()

    if (lookupError || !entitlement) {
      return NextResponse.json({ error: 'No payment found for this assessment' }, { status: 404 })
    }

    if (entitlement.status === 'refund_requested') {
      return NextResponse.json({ success: true, alreadyRequested: true })
    }
    if (entitlement.status === 'refunded') {
      return NextResponse.json({ error: 'This assessment has already been refunded' }, { status: 400 })
    }
    if (entitlement.payment_method !== 'razorpay' || entitlement.status !== 'paid') {
      return NextResponse.json({ error: 'No paid Razorpay purchase found to refund' }, { status: 400 })
    }
    if (!entitlement.paid_at) {
      return NextResponse.json({ error: 'No payment date on record' }, { status: 400 })
    }

    const paidAt = new Date(entitlement.paid_at).getTime()
    const withinWindow = Date.now() - paidAt <= REFUND_WINDOW_MS

    if (!withinWindow) {
      return NextResponse.json({ error: 'window_closed', message: 'The 7-day guarantee window has closed for this purchase.' }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('assessment_entitlements')
      .update({ status: 'refund_requested', refund_requested_at: new Date().toISOString() })
      .eq('assessment_id', assessmentId)
      .eq('assessment_type', assessmentType)

    if (updateError) {
      console.error('[request-refund] update error:', updateError)
      return NextResponse.json({ error: 'Failed to record refund request' }, { status: 500 })
    }

    const recipientEmail = email || entitlement.email
    const displayName = getAssessmentDisplayName(assessmentType)
    const amountINR = ((entitlement.amount_paise ?? 0) / 100).toLocaleString('en-IN')

    if (process.env.RESEND_API_KEY) {
      try {
        await getResendClient().emails.send({
          from: process.env.EMAIL_FROM || 'ComplianceCheck <noreply@compliancecheck.co.in>',
          to: FOUNDER_EMAIL,
          subject: `Refund requested — ${displayName} (₹${amountINR})`,
          html: `<p>Assessment ID: ${assessmentId}</p><p>Type: ${displayName}</p><p>Amount: ₹${amountINR}</p><p>Customer email: ${recipientEmail || 'unknown'}</p><p>Please issue the Razorpay refund within 2 business days and mark the entitlement 'refunded'.</p>`,
        })
        if (recipientEmail) {
          await getResendClient().emails.send({
            from: process.env.EMAIL_FROM || 'ComplianceCheck <noreply@compliancecheck.co.in>',
            to: recipientEmail,
            subject: 'Your refund request has been received',
            html: `<p>We've received your refund request for your ${displayName} report (₹${amountINR}).</p><p>Refunds are processed within 2 business days to your original payment method.</p><p>No further action is needed from you.</p>`,
          })
        }
      } catch (emailErr) {
        // Refund request is already recorded — don't fail the request over email delivery.
        console.error('[request-refund] email send failed:', emailErr)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[request-refund] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
