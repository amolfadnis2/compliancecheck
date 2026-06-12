import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit } from '@/lib/rate-limit'

/**
 * POSH Assessment Submission API
 * 
 * POST /api/assessment/posh-submit
 * 
 * Saves POSH compliance assessment results to Supabase
 */

// Lazy-init Supabase — module-level init breaks Netlify build when env vars are absent
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabase(): any {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _supabase
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
    if (!checkRateLimit(`submit:${ip}`, 10, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': '60' } })
    }

    const body = await request.json()

    const {
      companyDetails,
      applicabilityResponses,
      complianceResponses,
      results,
      assessmentType,
    } = body

    // Validate required fields
    if (!companyDetails || !results) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Local fallback when Supabase is unconfigured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        success: true,
        assessmentId: `local_${Date.now()}`,
        savedToDb: false,
        message: 'Database not configured. Results saved locally.',
      })
    }

    // Generate assessment ID
    const assessmentId = crypto.randomUUID()
    
    // Prepare data for insertion
    const assessmentData = {
      id: assessmentId,
      assessment_type: assessmentType || 'posh',
      
      // Company details
      company_name: companyDetails.companyName,
      email: companyDetails.email,
      phone: companyDetails.phone,
      full_name: companyDetails.fullName,
      
      // Responses stored as JSONB
      applicability_responses: applicabilityResponses,
      compliance_responses: complianceResponses,
      
      // Results
      overall_score: results.overallScore,
      risk_level: results.riskLevel,
      category_scores: results.categoryScores,
      action_items: results.actionItems,
      compliant_items: results.compliantItems,
      non_compliant_items: results.nonCompliantItems,
      applicability_results: results.applicabilityResults,
      assessment_profile: results.profile,
      
      // Metadata
      created_at: new Date().toISOString(),
      completed: true,
    }

    // Insert into Supabase
    const { data, error } = await getSupabase()
      .from('posh_assessments')
      .insert([assessmentData])
      .select('id')
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      // Still return success with ID for localStorage fallback
      return NextResponse.json({
        success: true,
        assessmentId,
        savedToDb: false,
        message: 'Results saved locally. Database sync pending.',
      })
    }

    // Send email notification (optional)
    if (companyDetails.email) {
      try {
        await sendEmailNotification(companyDetails.email, {
          companyName: companyDetails.companyName,
          fullName: companyDetails.fullName,
          score: results.overallScore,
          riskLevel: results.riskLevel,
          actionItemsCount: results.actionItems.length,
          assessmentId,
        })
      } catch (emailError) {
        console.error('Email notification error:', emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      assessmentId: data?.id || assessmentId,
      savedToDb: true,
    })

  } catch (error) {
    console.error('Assessment submission error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save assessment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Email notification helper
async function sendEmailNotification(
  email: string,
  data: {
    companyName: string
    fullName: string
    score: number
    riskLevel: string
    actionItemsCount: number
    assessmentId: string
  }
) {
  // Check if Resend API key is configured
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    console.log('Resend API key not configured, skipping email')
    return
  }

  const { Resend } = await import('resend')
  const resend = new Resend(resendApiKey)

  const riskLevelEmoji = {
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    critical: '🔴',
  }[data.riskLevel] || '⚪'

  await resend.emails.send({
    from: 'ComplianceCheck <noreply@compliancecheck.co.in>',
    to: email,
    subject: `Your POSH Compliance Assessment Results - ${data.score}% Score`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e40af; margin-bottom: 5px;">ComplianceCheck</h1>
          <p style="color: #666; font-size: 14px;">POSH Compliance Assessment Results</p>
        </div>
        
        <p>Dear ${data.fullName},</p>
        
        <p>Thank you for completing the POSH Act 2013 Compliance Assessment for <strong>${data.companyName}</strong>.</p>
        
        <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
          <div style="font-size: 48px; font-weight: bold; color: ${data.score >= 90 ? '#16a34a' : data.score >= 70 ? '#d97706' : '#dc2626'};">
            ${data.score}%
          </div>
          <div style="color: #666; margin-top: 8px;">Overall Compliance Score</div>
          <div style="margin-top: 16px; font-size: 18px;">
            ${riskLevelEmoji} ${data.riskLevel.charAt(0).toUpperCase() + data.riskLevel.slice(1)} Risk
          </div>
        </div>
        
        ${data.actionItemsCount > 0 ? `
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
          <strong>⚠️ ${data.actionItemsCount} Action Item${data.actionItemsCount > 1 ? 's' : ''} Identified</strong>
          <p style="margin: 8px 0 0 0; font-size: 14px;">Review your detailed report for prioritized remediation steps.</p>
        </div>
        ` : `
        <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 4px;">
          <strong>✅ Excellent Work!</strong>
          <p style="margin: 8px 0 0 0; font-size: 14px;">Your organization demonstrates strong POSH compliance practices.</p>
        </div>
        `}
        
        <p>Access your complete assessment report and detailed remediation guidance at:</p>
        
        <div style="text-align: center; margin: 24px 0;">
          <a href="https://compliancecheck.co.in/assessment/posh?resultId=${data.assessmentId}"
             style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
            View Full Report
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
        
        <p style="font-size: 12px; color: #666;">
          This assessment is based on the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 
          and associated Rules. For legal advice, please consult a qualified legal professional.
        </p>
        
        <p style="font-size: 12px; color: #666;">
          Questions? Reply to this email or contact us at support@compliancecheck.co.in
        </p>
        
        <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #999;">
            © ${new Date().getFullYear()} ComplianceCheck | Pune, India
          </p>
        </div>
      </body>
      </html>
    `,
  })
}
