import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import fs from 'node:fs/promises'
import path from 'node:path'
import { isValidAssessmentType, getAssessmentDisplayName } from '@/lib/constants/assessment-types'

// Lazy initialization — never construct at module load (Netlify build safety, CLAUDE.md sec 3)
let resend: Resend | null = null
function getResendClient(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const { email, assessmentType } = await request.json()

    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }
    if (!isValidAssessmentType(assessmentType)) {
      return NextResponse.json({ error: 'Invalid assessment type' }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), 'public', 'samples', `${assessmentType}-sample.pdf`)
    let pdfBuffer: Buffer
    try {
      pdfBuffer = await fs.readFile(filePath)
    } catch {
      return NextResponse.json({ error: 'Sample report not found' }, { status: 404 })
    }

    const displayName = getAssessmentDisplayName(assessmentType)

    const { error } = await getResendClient().emails.send({
      from: process.env.EMAIL_FROM || 'ComplianceCheck <noreply@compliancecheck.co.in>',
      to: email,
      subject: `Your sample ${displayName} report`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1F2937;">Here's your sample ${displayName} report</h2>
          <p>This is an illustrative report generated from a sample company so you can see exactly what a real ComplianceCheck report looks like &mdash; the same format, the same level of detail, before you pay for your own.</p>
          <p style="margin-top: 24px;">
            <a href="https://compliancecheck.co.in" style="display: inline-block; background: #1E40AF; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
              Run your own assessment
            </a>
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `${assessmentType}-sample-report.pdf`,
          content: pdfBuffer.toString('base64'),
        },
      ],
    })

    if (error) {
      console.error('[samples/email] Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[samples/email] error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
