import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Lazy initialization - only create client when needed
let resend: Resend | null = null

function getResendClient(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

// Generate email HTML based on assessment type
function generateEmailHtml(
  assessmentType: string,
  reportLabel: string,
  companyName: string | undefined,
  score: number,
  status: string,
  statusColour: string
): string {
  // Food Business specific template (orange theme)
  if (assessmentType === 'food_business') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Header - Orange theme for Food Business -->
        <div style="background: linear-gradient(135deg, #EA580C 0%, #F97316 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">ComplianceCheck</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Restaurant & Food Business Compliance</p>
        </div>
        
        <!-- Main Content -->
        <div style="background: #ffffff; padding: 30px; border: 1px solid #E5E7EB; border-top: none;">
          
          <h2 style="color: #1F2937; margin-top: 0;">Your Food Business Compliance Report is Ready</h2>
          
          ${companyName ? `<p style="color: #6B7280; margin-bottom: 20px;">Report for: <strong style="color: #1F2937;">${companyName}</strong></p>` : ''}
          
          <!-- Score Box -->
          <div style="background: #FFF7ED; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; border-left: 4px solid ${statusColour};">
            <p style="color: #6B7280; margin: 0 0 5px 0; font-size: 14px;">Overall Compliance Score</p>
            <p style="font-size: 48px; font-weight: bold; color: ${statusColour}; margin: 0;">${score || 0}%</p>
            <p style="color: ${statusColour}; font-weight: 600; margin: 5px 0 0 0;">${status}</p>
          </div>
          
          <p style="color: #374151;">Your detailed compliance report is attached as a PDF. It covers <strong>8 key compliance areas</strong> for food businesses:</p>
          
          <!-- Compliance Areas Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0;">
            <div style="background: #FFF7ED; padding: 10px; border-radius: 6px; border-left: 3px solid #EA580C;">
              <strong style="color: #EA580C; font-size: 13px;">FSSAI Licensing</strong>
              <p style="color: #6B7280; font-size: 11px; margin: 5px 0 0 0;">Registration, display, annual returns</p>
            </div>
            <div style="background: #FFF7ED; padding: 10px; border-radius: 6px; border-left: 3px solid #EA580C;">
              <strong style="color: #EA580C; font-size: 13px;">Fire Safety</strong>
              <p style="color: #6B7280; font-size: 11px; margin: 5px 0 0 0;">NOC, equipment, evacuation plan</p>
            </div>
            <div style="background: #FFF7ED; padding: 10px; border-radius: 6px; border-left: 3px solid #EA580C;">
              <strong style="color: #EA580C; font-size: 13px;">GST & Taxation</strong>
              <p style="color: #6B7280; font-size: 11px; margin: 5px 0 0 0;">Registration, returns, TDS</p>
            </div>
            <div style="background: #FFF7ED; padding: 10px; border-radius: 6px; border-left: 3px solid #EA580C;">
              <strong style="color: #EA580C; font-size: 13px;">Labour Compliance</strong>
              <p style="color: #6B7280; font-size: 11px; margin: 5px 0 0 0;">EPF, ESI, minimum wages, POSH</p>
            </div>
            <div style="background: #FFF7ED; padding: 10px; border-radius: 6px; border-left: 3px solid #EA580C;">
              <strong style="color: #EA580C; font-size: 13px;">Liquor & Excise</strong>
              <p style="color: #6B7280; font-size: 11px; margin: 5px 0 0 0;">Bar license, excise permits</p>
            </div>
            <div style="background: #FFF7ED; padding: 10px; border-radius: 6px; border-left: 3px solid #EA580C;">
              <strong style="color: #EA580C; font-size: 13px;">Health & Hygiene</strong>
              <p style="color: #6B7280; font-size: 11px; margin: 5px 0 0 0;">FOSTAC, medical certificates</p>
            </div>
            <div style="background: #FFF7ED; padding: 10px; border-radius: 6px; border-left: 3px solid #EA580C;">
              <strong style="color: #EA580C; font-size: 13px;">Business Registration</strong>
              <p style="color: #6B7280; font-size: 11px; margin: 5px 0 0 0;">Trade license, shops act</p>
            </div>
            <div style="background: #FFF7ED; padding: 10px; border-radius: 6px; border-left: 3px solid #EA580C;">
              <strong style="color: #EA580C; font-size: 13px;">Special Permits</strong>
              <p style="color: #6B7280; font-size: 11px; margin: 5px 0 0 0;">Music, outdoor seating, late night</p>
            </div>
          </div>
          
          <p style="color: #374151; font-size: 14px;">The attached PDF includes:</p>
          <ul style="color: #374151; padding-left: 20px; font-size: 14px;">
            <li>Category-wise compliance scores</li>
            <li>Specific gaps requiring immediate action</li>
            <li>Government portal links (FSSAI FoSCoS, EPFO, ESIC, GST)</li>
            <li>Step-by-step remediation guidance</li>
            <li>Applicable penalties and deadlines</li>
          </ul>
          
          <!-- Key Deadlines Reminder -->
          <div style="background: #FEF2F2; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #DC2626;">
            <p style="color: #991B1B; margin: 0; font-size: 13px; font-weight: 600;">Key Compliance Deadlines</p>
            <ul style="color: #7F1D1D; margin: 10px 0 0 0; padding-left: 18px; font-size: 12px;">
              <li>FSSAI Annual Return (Form D-1): May 31</li>
              <li>EPF/ESI Monthly: 15th of following month</li>
              <li>GST Returns: 11th/20th monthly</li>
              <li>Fire NOC Renewal: Annually</li>
            </ul>
          </div>
          
          <!-- CTA -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://compliancecheck.co.in/assessment/food-business" style="display: inline-block; background: #EA580C; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600;">
              Retake Assessment
            </a>
          </div>
          
          <!-- Help Section -->
          <div style="background: #FEF3C7; border-radius: 8px; padding: 15px; margin-top: 20px;">
            <p style="color: #92400E; margin: 0; font-size: 14px;">
              <strong>Need help with FSSAI or compliance?</strong> Reply to this email or contact us at 
              <a href="mailto:compliancecheck@zohomail.in" style="color: #92400E;">compliancecheck@zohomail.in</a>
            </p>
          </div>
          
        </div>
        
        <!-- Footer -->
        <div style="background: #FFF7ED; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #E5E7EB; border-top: none;">
          <p style="color: #9CA3AF; margin: 0; font-size: 12px;">
            ComplianceCheck | Simplifying compliance for Indian businesses
          </p>
          <p style="color: #9CA3AF; margin: 10px 0 0 0; font-size: 12px;">
            <a href="https://compliancecheck.co.in/privacy" style="color: #6B7280; text-decoration: none;">Privacy Policy</a>
            &nbsp;|&nbsp;
            <a href="https://compliancecheck.co.in/terms" style="color: #6B7280; text-decoration: none;">Terms of Service</a>
          </p>
        </div>
        
        <!-- Disclaimer -->
        <p style="color: #9CA3AF; font-size: 11px; margin-top: 20px; text-align: center;">
          This report is for informational purposes only and does not constitute legal advice. 
          Food business compliance requirements vary by state and municipality.
          Please consult a qualified Food Safety Consultant or CA for specific guidance.
        </p>
        
      </body>
      </html>
    `
  }
  
  // Default template for other assessment types (blue theme)
  return `
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
          <a href="https://compliancecheck.co.in" style="display: inline-block; background: #1E40AF; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600;">
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
          <a href="https://compliancecheck.co.in/privacy" style="color: #6B7280; text-decoration: none;">Privacy Policy</a>
          &nbsp;|&nbsp;
          <a href="https://compliancecheck.co.in/terms" style="color: #6B7280; text-decoration: none;">Terms of Service</a>
        </p>
      </div>
      
      <!-- Disclaimer -->
      <p style="color: #9CA3AF; font-size: 11px; margin-top: 20px; text-align: center;">
        This report is for informational purposes only and does not constitute legal advice. 
        Please consult a qualified professional for specific compliance guidance.
      </p>
      
    </body>
    </html>
  `
}

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
      'state_wise_compliance': 'State-Wise Compliance Check',
      'food_business': 'Restaurant & Food Business Compliance',
    }
    const reportLabel = reportTypeLabels[assessmentType] || 'Compliance Assessment'
    
    const filenamePrefixes: Record<string, string> = {
      'statutory_health': 'Statutory-Health-Check',
      'labour_code': 'Labour-Code-Readiness',
      'dpdp': 'DPDP-Gap-Assessment',
      'state_wise_compliance': 'State-Wise-Compliance',
      'food_business': 'Food-Business-Compliance',
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
    const { data, error } = await getResendClient().emails.send({
      from: process.env.EMAIL_FROM || 'ComplianceCheck <noreply@compliancecheck.co.in>',
      to: email,
      subject: `Your ${reportLabel} Report - ${companyName || 'Assessment Complete'}`,
      html: generateEmailHtml(assessmentType, reportLabel, companyName, score || 0, status, statusColour),
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