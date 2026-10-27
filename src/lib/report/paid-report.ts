/**
 * One entry point for the paid PDF of any of the seven assessments — used by
 * the email route and the share-link routes so every delivery channel sends
 * the same file the download button produces.
 *
 * Ownership: the caller passes the email they claim; it must match the email
 * stored on the assessment (the share route, which holds a signed token
 * instead, passes the stored owner email it looked up). Entitlement is always
 * re-checked: an unpaid report never renders.
 *
 * Server-only (service-role reads). Never import from a client component.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { ASSESSMENT_TYPES, isPaymentLive, type AssessmentType } from '@/lib/constants/assessment-types'
import { getEntitlement } from '@/lib/payment/entitlement'
import { generateAssessmentPdf } from '@/lib/pdf/server-report'
import { generatePoshAssessmentPdf } from '@/lib/pdf/server-posh-report'
import { generateAutoDealerPdfForRow, computeAutoDealerResults, type AutoDealerRow } from '@/lib/pdf/auto-dealer-report'
import { getPeerAverages } from '@/lib/benchmarks/peer-averages'

export interface PaidReportPdf {
  bytes: Uint8Array
  filename: string
  companyName: string
  score: number
}

export type PaidReportResult = PaidReportPdf | { error: 'not_found' | 'unauthorized' | 'payment_required' }

export interface ReportOwner {
  email: string | null
  phone: string | null
  companyName: string | null
}

const sameEmail = (a: string | null | undefined, b: string | null | undefined) =>
  !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase()

/** Who an assessment belongs to (email/phone captured in Step 0 or by OTP). */
export async function getReportOwner(type: AssessmentType, id: string): Promise<ReportOwner | null> {
  const supabase = createAdminClient()

  if (type === ASSESSMENT_TYPES.POSH) {
    const { data } = await supabase.from('posh_assessments').select('email, phone, company_name').eq('id', id).maybeSingle()
    return data ? { email: data.email, phone: data.phone, companyName: data.company_name } : null
  }

  if (type === ASSESSMENT_TYPES.AUTO_DEALER) {
    const { data } = await supabase
      .from('auto_dealer_assessments')
      .select('user_email, email_verified, phone, company_name')
      .eq('id', id)
      .maybeSingle()
    // Auto Dealer's report is only ever released to an OTP-verified email.
    if (!data || !data.email_verified) return null
    return { email: data.user_email, phone: data.phone, companyName: data.company_name }
  }

  const { data } = await supabase
    .from('assessments')
    .select('assessment_type, responses, user_details')
    .eq('id', id)
    .maybeSingle()
  if (!data || data.assessment_type !== type) return null
  const ud = { ...(data.user_details ?? {}), ...(data.responses?.userDetails ?? {}) }
  return {
    email: ud.email ?? ud.contactEmail ?? null,
    phone: ud.phone ?? ud.phoneNumber ?? ud.contactPhone ?? null,
    companyName: ud.companyName ?? null,
  }
}

export async function generatePaidReportPdf(
  type: AssessmentType,
  id: string,
  email: string | null | undefined
): Promise<PaidReportResult> {
  if (type === ASSESSMENT_TYPES.POSH) {
    return generatePoshAssessmentPdf(id, email)
  }

  if (type === ASSESSMENT_TYPES.AUTO_DEALER) {
    const { data: row } = await createAdminClient()
      .from('auto_dealer_assessments')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (!row) return { error: 'not_found' }
    const r = row as AutoDealerRow
    if (!r.email_verified || !sameEmail(email, r.user_email)) return { error: 'unauthorized' }
    if (isPaymentLive(ASSESSMENT_TYPES.AUTO_DEALER) && (await getEntitlement(id, ASSESSMENT_TYPES.AUTO_DEALER)) === 'none') {
      return { error: 'payment_required' }
    }
    const peers = await getPeerAverages(ASSESSMENT_TYPES.AUTO_DEALER, { excludeId: id })
    const bytes = generateAutoDealerPdfForRow(r, peers?.categories)
    return {
      bytes,
      filename: `Auto-Dealer-Compliance-${new Date().toISOString().split('T')[0]}.pdf`,
      companyName: r.company_name || 'Your Company',
      score: computeAutoDealerResults(r).overallScore.score,
    }
  }

  const result = await generateAssessmentPdf(id, email)
  if ('error' in result) return result
  // The row's stored type is authoritative; a mismatched link must not serve it.
  if (result.assessmentType !== type) return { error: 'not_found' }
  return result
}
