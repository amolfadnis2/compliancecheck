/**
 * Server-side report generation for DB-backed assessments.
 *
 * Single source of truth used by both the download route
 * (`GET /api/report/[id]/pdf`) and the email route (`/api/email/send-report`):
 * fetch the assessment row, validate ownership, and render the PDF bytes via
 * the unified generator. Because both callers run this same code, the emailed
 * attachment is guaranteed to match the downloaded file.
 *
 * Server-only — imports the admin (service-role) Supabase client. Never import
 * from a client component.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { buildReportData } from './report-registry'
import type { AssessmentData } from './report-data-adapter'
import { generateUnifiedReportBytes } from './unified-report-generator'
import { getEntitlement } from '@/lib/payment/entitlement'
import { isPaymentLive, isValidAssessmentType } from '@/lib/constants/assessment-types'

export interface GeneratedAssessmentPdf {
  bytes: Uint8Array
  filename: string
  assessmentType: string
  companyName: string
  score: number
}

export type GenerateAssessmentPdfResult =
  | GeneratedAssessmentPdf
  | { error: 'not_found' | 'unauthorized' | 'payment_required' }

// Same select + user-detail normalisation as GET /api/assessment/[id] so the
// AssessmentData shape and ownership check match exactly.
export async function generateAssessmentPdf(
  id: string,
  email: string | null | undefined
): Promise<GenerateAssessmentPdfResult> {
  const supabase = createAdminClient()

  const { data: assessment, error } = await supabase
    .from('assessments')
    .select(`
      *,
      companies (
        company_name,
        industry_type,
        employee_count,
        registered_state
      ),
      users (
        email,
        full_name,
        phone
      )
    `)
    .eq('id', id)
    .single()

  if (error || !assessment) {
    return { error: 'not_found' }
  }

  // Ownership gate: caller must provide the email that matches this assessment.
  const responsesUserDetails = assessment.responses?.userDetails || {}
  const userDetailsField = assessment.user_details || {}
  const assessmentEmail =
    assessment.users?.email ||
    responsesUserDetails.email ||
    responsesUserDetails.contactEmail ||
    userDetailsField.email
  if (
    !email ||
    !assessmentEmail ||
    email.toLowerCase() !== assessmentEmail.toLowerCase()
  ) {
    return { error: 'unauthorized' }
  }

  const data: AssessmentData = {
    id: assessment.id,
    assessment_type: assessment.assessment_type,
    overall_score: assessment.overall_score,
    category_scores: assessment.category_scores || assessment.phase_scores,
    responses: assessment.responses,
    userDetails: {
      fullName:
        assessment.users?.full_name ||
        responsesUserDetails.fullName ||
        responsesUserDetails.contactName ||
        userDetailsField.fullName,
      email: assessmentEmail,
      phone:
        assessment.users?.phone ||
        responsesUserDetails.phone ||
        userDetailsField.phone,
      companyName:
        assessment.companies?.company_name ||
        responsesUserDetails.companyName ||
        userDetailsField.companyName,
      industry:
        assessment.companies?.industry_type ||
        responsesUserDetails.industry ||
        userDetailsField.industry,
      employeeCount:
        assessment.companies?.employee_count ||
        responsesUserDetails.employeeCount ||
        userDetailsField.employeeCount,
      state:
        assessment.companies?.registered_state ||
        responsesUserDetails.state ||
        userDetailsField.state,
    },
  }

  const assessmentType = assessment.assessment_type || ''

  // Entitlement gate — the real paywall. For any assessment whose payment is
  // live, the server refuses to produce the full PDF unless it has been paid or
  // waived. When live:false this is skipped, so today only Statutory Health is
  // gated and every other assessment downloads/emails exactly as before.
  if (isValidAssessmentType(assessmentType) && isPaymentLive(assessmentType)) {
    const entitlement = await getEntitlement(id, assessmentType)
    if (entitlement === 'none') {
      return { error: 'payment_required' }
    }
  }

  const reportData = buildReportData(assessmentType, data)
  const bytes = generateUnifiedReportBytes(reportData)

  const dateStr = new Date().toISOString().split('T')[0]
  const filename = `${reportData.config.filenamePrefix}-${dateStr}.pdf`

  return {
    bytes,
    filename,
    assessmentType,
    companyName: reportData.userDetails.companyName || 'Your Company',
    score: reportData.overallScore,
  }
}
