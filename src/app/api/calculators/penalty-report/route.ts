import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

let resend: Resend | null = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: any = null

function getResendClient(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend as Resend
}

function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (url && key) _supabase = createClient(url, key)
  }
  return _supabase
}

function generateEmailHtml(): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">

      <div style="background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">ComplianceCheck</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Your Penalty Exposure Report</p>
      </div>

      <div style="background: #ffffff; padding: 30px; border: 1px solid #E5E7EB; border-top: none;">
        <h2 style="color: #1F2937; margin-top: 0;">Your Compliance Penalty Exposure Report is Ready</h2>

        <p style="color: #374151;">Your full 6-page penalty exposure report is attached as a PDF. It includes:</p>

        <ul style="color: #374151; padding-left: 20px;">
          <li>Typical annual risk and maximum statutory exposure</li>
          <li>Breakdown by each applicable Indian law</li>
          <li>Top 5 priority risk areas with remediation steps</li>
          <li>Government portal links and legal references</li>
          <li>Full methodology and source citations</li>
        </ul>

        <div style="background: #FEF3C7; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #D97706;">
          <p style="color: #92400E; margin: 0; font-size: 13px; font-weight: 600;">Important Disclaimer</p>
          <p style="color: #92400E; margin: 8px 0 0 0; font-size: 13px;">
            Estimates only. Maximum penalties are statutory ceilings. Typical risk figures are
            probability-weighted estimates, not predictions for your business. This is not legal
            advice. Rates current as of April 2026.
          </p>
        </div>

        <div style="background: #EFF6FF; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #1E40AF; margin-top: 0; font-size: 16px;">Fix the gaps with a detailed assessment</h3>
          <div style="margin: 10px 0;">
            <a href="https://compliancecheck.co.in/assessment/statutory-health" style="color: #1E40AF; text-decoration: none; font-weight: 600; font-size: 14px;">
              Statutory Health Check (FREE)
            </a>
            <p style="color: #6B7280; font-size: 12px; margin: 4px 0 0 0;">EPF, ESI, Gratuity, Professional Tax — 12 questions, 15 minutes</p>
          </div>
          <div style="margin: 10px 0;">
            <a href="https://compliancecheck.co.in/assessment/dpdp" style="color: #1E40AF; text-decoration: none; font-weight: 600; font-size: 14px;">
              DPDP Gap Assessment (Rs.2,499)
            </a>
            <p style="color: #6B7280; font-size: 12px; margin: 4px 0 0 0;">Data protection compliance for DPDP Act 2023</p>
          </div>
          <div style="margin: 10px 0;">
            <a href="https://compliancecheck.co.in/assessment/posh" style="color: #1E40AF; text-decoration: none; font-weight: 600; font-size: 14px;">
              POSH Compliance (FREE)
            </a>
            <p style="color: #6B7280; font-size: 12px; margin: 4px 0 0 0;">ICC constitution, annual returns, policy review</p>
          </div>
          <div style="margin: 10px 0;">
            <a href="https://compliancecheck.co.in/assessment/labour-code" style="color: #1E40AF; text-decoration: none; font-weight: 600; font-size: 14px;">
              Labour Code Readiness (FREE)
            </a>
            <p style="color: #6B7280; font-size: 12px; margin: 4px 0 0 0;">All 4 Labour Codes — effective November 2025</p>
          </div>
        </div>

        <div style="text-align: center; margin: 25px 0;">
          <a href="https://compliancecheck.co.in/calculators/compliance-penalty-calculator" style="display: inline-block; background: #1E40AF; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Recalculate with Different Inputs
          </a>
        </div>

        <div style="background: #FEF3C7; border-radius: 8px; padding: 15px; margin-top: 20px;">
          <p style="color: #92400E; margin: 0; font-size: 14px;">
            <strong>Questions?</strong> Reply to this email or contact us at
            <a href="mailto:contact@compliancecheck.co.in" style="color: #92400E;">contact@compliancecheck.co.in</a>
          </p>
        </div>
      </div>

      <div style="background: #F9FAFB; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #E5E7EB; border-top: none;">
        <p style="color: #9CA3AF; margin: 0; font-size: 12px;">
          ComplianceCheck | Simplifying compliance for Indian businesses
        </p>
        <p style="color: #9CA3AF; margin: 10px 0 0 0; font-size: 12px;">
          <a href="https://compliancecheck.co.in/privacy" style="color: #6B7280; text-decoration: none;">Privacy Policy</a>
          &nbsp;|&nbsp;
          <a href="https://compliancecheck.co.in/terms" style="color: #6B7280; text-decoration: none;">Terms of Service</a>
        </p>
      </div>

      <p style="color: #9CA3AF; font-size: 11px; margin-top: 20px; text-align: center;">
        This report is for informational purposes only and does not constitute legal advice.
        Please consult a qualified compliance professional for specific guidance.
      </p>
    </body>
    </html>
  `
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Email service not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { email, pdfBase64, input, summary } = body

    if (!email || !pdfBase64) {
      return NextResponse.json(
        { success: false, error: 'Email and PDF data are required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const dateStr = new Date().toISOString().split('T')[0]

    const { data, error } = await getResendClient().emails.send({
      from: process.env.EMAIL_FROM || 'ComplianceCheck <noreply@compliancecheck.co.in>',
      to: email,
      subject: `Your Compliance Penalty Exposure Report — ComplianceCheck`,
      html: generateEmailHtml(),
      attachments: [
        {
          filename: `Compliance-Penalty-Exposure-${dateStr}.pdf`,
          content: pdfBase64,
        },
      ],
    })

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to send email' },
        { status: 500 }
      )
    }

    // Persist to Supabase for admin visibility — non-blocking, best-effort
    const supabase = getSupabase()
    if (supabase && input) {
      supabase
        .from('assessments')
        .insert({
          assessment_type: 'penalty_exposure',
          email,
          industry: input.industry ?? null,
          state: input.state ?? null,
          employee_count: input.employeeCount != null ? String(input.employeeCount) : null,
          responses: { input, summary: summary ?? null },
          overall_score: summary?.totalTypicalRisk != null ? Math.round(summary.totalTypicalRisk) : null,
        })
        .then(({ error: dbErr }: { error: { message: string } | null }) => {
          if (dbErr) console.warn('Penalty calculator DB write failed (non-fatal):', dbErr.message)
        })
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
    })
  } catch (err) {
    console.error('Penalty report email error:', err)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
