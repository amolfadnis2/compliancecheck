import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { checkRateLimit } from '@/lib/rate-limit'
import { CONTACT_EMAIL } from '@/lib/seo/site'

// Lazy initialization - only create client when needed (Netlify build safety)
let resend: Resend | null = null

function getResendClient(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

const MAX_FIELD_LENGTH = 200
const MAX_MESSAGE_LENGTH = 5000

const SUBJECT_LABELS: Record<string, string> = {
  assessment: 'Assessment Questions',
  pricing: 'Pricing & Plans',
  technical: 'Technical Support',
  partnership: 'Partnership Enquiry',
  feedback: 'Feedback',
  other: 'Other',
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: `Contact form is not available right now. Please email ${CONTACT_EMAIL} directly.` },
        { status: 503 }
      )
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    if (!checkRateLimit(`contact:${ip}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: `Too many messages. Please try again later or email ${CONTACT_EMAIL} directly.` },
        { status: 429 }
      )
    }

    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const company = typeof body.company === 'string' ? body.company.trim() : ''
    const subject = typeof body.subject === 'string' ? body.subject : ''
    const message = typeof body.message === 'string' ? body.message.trim() : ''

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email and message are required.' }, { status: 400 })
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }
    if (name.length > MAX_FIELD_LENGTH || email.length > MAX_FIELD_LENGTH || company.length > MAX_FIELD_LENGTH) {
      return NextResponse.json({ error: 'One of the fields is too long.' }, { status: 400 })
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ error: 'Message is too long (5000 characters max).' }, { status: 400 })
    }

    const subjectLabel = SUBJECT_LABELS[subject] ?? 'General Enquiry'

    // Plain-text body: visitor-supplied content never enters HTML, so no
    // escaping is needed and nothing can be injected into markup.
    const lines = [
      `Name: ${name}`,
      `Email: ${email}`,
      company ? `Company: ${company}` : null,
      `Topic: ${subjectLabel}`,
      '',
      message,
    ].filter((l): l is string => l !== null)

    const { error } = await getResendClient().emails.send({
      from: 'ComplianceCheck <noreply@compliancecheck.co.in>',
      to: [CONTACT_EMAIL],
      replyTo: email,
      subject: `[Contact] ${subjectLabel} — ${name}`,
      text: lines.join('\n'),
    })

    if (error) {
      console.error('contact form send error:', error)
      return NextResponse.json(
        { error: `We could not send your message. Please email ${CONTACT_EMAIL} directly.` },
        { status: 502 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('contact form error:', error)
    return NextResponse.json(
      { error: `Something went wrong. Please email ${CONTACT_EMAIL} directly.` },
      { status: 500 }
    )
  }
}
