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

const FOUNDER_EMAIL = process.env.EXPERT_CALL_NOTIFY_EMAIL || 'compliancecheck@zohomail.in'
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Demand-capture only (P0-B.2) — there is no CA/credentialed expert on staff
 * yet, so this records the request and sends an acknowledgement. Fulfilment
 * is manual for now; the request rate is the signal used to decide whether
 * to staff the expert layer (see PRD success metrics).
 */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const { assessmentId, assessmentType, email, topic, preferredWindow } = await request.json()

    if (!assessmentId || !isValidAssessmentType(assessmentType)) {
      return NextResponse.json({ error: 'Missing or invalid assessment' }, { status: 400 })
    }
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase.from('expert_call_requests').insert({
      assessment_id: assessmentId,
      assessment_type: assessmentType,
      email,
      topic: topic || null,
      preferred_window: preferredWindow || null,
    })

    if (error) {
      console.error('[expert-call/request] insert error:', error)
      return NextResponse.json({ error: 'Failed to record request' }, { status: 500 })
    }

    const displayName = getAssessmentDisplayName(assessmentType)

    if (process.env.RESEND_API_KEY) {
      try {
        await getResendClient().emails.send({
          from: process.env.EMAIL_FROM || 'ComplianceCheck <noreply@compliancecheck.co.in>',
          to: FOUNDER_EMAIL,
          subject: `Expert call requested — ${displayName}`,
          html: `<p>Assessment ID: ${assessmentId}</p><p>Type: ${displayName}</p><p>Email: ${email}</p><p>Topic: ${topic || 'Not specified'}</p><p>Preferred window: ${preferredWindow || 'Not specified'}</p>`,
        })
        await getResendClient().emails.send({
          from: process.env.EMAIL_FROM || 'ComplianceCheck <noreply@compliancecheck.co.in>',
          to: email,
          subject: 'We received your request to talk to a compliance specialist',
          html: `<p>Thanks for reaching out about your ${displayName} results.</p><p>A compliance specialist will review your results and follow up within 2 business days.</p>`,
        })
      } catch (emailErr) {
        // Request is already recorded — don't fail over email delivery.
        console.error('[expert-call/request] email send failed:', emailErr)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[expert-call/request] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
