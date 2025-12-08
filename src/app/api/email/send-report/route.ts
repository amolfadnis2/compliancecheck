import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return NextResponse.json(
        { success: false, error: 'Email service not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { 
      email, 
      // assessmentId - available in body if needed for future analytics
      pdfBase64, 
      companyName, 
      score, 
      assessmentType 
    } = body

    // Validate required fields
    if (!email || !pdfBase64) {
      return NextResponse.json(
        { success: false, error: 'Email and PDF data are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Determine report type for email subject and filename
    const reportTypeLabels: Record<string, string> = {
      'statutory_health': 'Statutory Compliance Health Check',
      'labour_code': 'Labour Code Readiness Assessment',
      'dpdp': 'DPDP Act 2023 Gap Assessment',
    }
    const reportLabel = reportTypeLabels[assessmentType] || 'Compliance Assessment'
    
    const filenamePrefixes: Record<string, string> = {
      'statutory_health': 'Statutory-Health-Check',
      'labour_code': 'Labour-Code-Readiness',
      'dpdp': 'DPDP-Gap-Assessment',
    }
    const filenamePrefix = filenamePrefixes[assessmentType] || 'ComplianceCheck-Report'

    // Get status based on score
    const getStatus = (score: number): string => {
      if (score >= 80) return 'Compliant'
      if (score >= 50) return 'Needs Attention'
      return 'Non-Compliant'
    }
    const status = getStatus(score || 0)
    const statusColour = score >= 80 ? '#059669' : score >= 50 ? '#D97706' : '#DC2626'

    // Generate date for filename
    const dateStr = new Date().toISOString().split('T')[0]
    const filename = `${filenamePrefix}-${dateStr}.pdf`

    // Send email with PDF attachment
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'ComplianceCheck <reports@compliancecheck.in>',
      to: email,
      subject: `Your ${reportLabel} Report - ${companyName || 'Assessment Complete'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">ComplianceCheck</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Simplifying compliance for Indian businesses</p>
          </div>
          
          <!-- Main Content -->
          <div style="background: #ffffff; padding: 30px; border: 1px solid #E5E7EB; border-top: none;">
            
            <h2 style="color: #1F2937; margin-top: 0;">Your ${reportLabel} is Ready</h2>
            
            ${companyName ? `<p style="color: #6B7280; margin-bottom: 20px;">Report for: <strong style="color: #1F2937;">${companyName}</strong></p>` : ''}
            
            <!-- Score Box -->
            <div style="background: #F9FAFB; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; border-left: 4px solid ${statusColour};">
              <p style="color: #6B7280; margin: 0 0 5px 0; font-size: 14px;">Overall Compliance Score</p>
              <p style="font-size: 48px; font-weight: bold; color: ${statusColour}; margin: 0;">${score || 0}%</p>
              <p style="color: ${statusColour}; font-weight: 600; margin: 5px 0 0 0;">${status}</p>
            </div>
            
            <p style="color: #374151;">Your detailed compliance report is attached to this email as a PDF. The report includes:</p>
            
            <ul style="color: #374151; padding-left: 20px;">
              <li>Category-wise compliance breakdown</li>
              <li>Specific areas requiring attention</li>
              <li>Government references and official links</li>
              <li>Recommended action items with deadlines</li>
              <li>Applicable penalties for non-compliance</li>
            </ul>
            
            <!-- CTA -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://compliancecheck.in" style="display: inline-block; background: #1E40AF; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                Take Another Assessment
              </a>
            </div>
            
            <!-- Help Section -->
            <div style="background: #FEF3C7; border-radius: 8px; padding: 15px; margin-top: 20px;">
              <p style="color: #92400E; margin: 0; font-size: 14px;">
                <strong>Need help?</strong> Reply to this email or contact us at 
                <a href="mailto:compliancecheck@zohomail.in" style="color: #92400E;">compliancecheck@zohomail.in</a>
              </p>
            </div>
            
          </div>
          
          <!-- Footer -->
          <div style="background: #F9FAFB; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #E5E7EB; border-top: none;">
            <p style="color: #9CA3AF; margin: 0; font-size: 12px;">
              ComplianceCheck | Simplifying compliance for Indian businesses
            </p>
            <p style="color: #9CA3AF; margin: 10px 0 0 0; font-size: 12px;">
              <a href="https://compliancecheck.in/privacy" style="color: #6B7280; text-decoration: none;">Privacy Policy</a>
              &nbsp;|&nbsp;
              <a href="https://compliancecheck.in/terms" style="color: #6B7280; text-decoration: none;">Terms of Service</a>
            </p>
          </div>
          
          <!-- Disclaimer -->
          <p style="color: #9CA3AF; font-size: 11px; margin-top: 20px; text-align: center;">
            This report is for informational purposes only and does not constitute legal advice. 
            Please consult a qualified professional for specific compliance guidance.
          </p>
          
        </body>
        </html>
      `,
      attachments: [
        {
          filename: filename,
          content: pdfBase64,
        },
      ],
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to send email' },
        { status: 500 }
      )
    }

    console.log('Email sent successfully:', data?.id)
    
    return NextResponse.json({
      success: true,
      messageId: data?.id,
      message: 'Report sent successfully to ' + email,
    })

  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
