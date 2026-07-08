/**
 * Server-side PDF generation for POSH (posh_assessments table).
 *
 * POSH's report is otherwise built entirely client-side from in-memory data
 * (see PAYMENTS_FRAMEWORK.md O-5) — its download button has no server gate.
 * This route closes that gap: fetch the persisted row, verify ownership +
 * entitlement, and render the same PDF server-side so an unpaid user cannot
 * bypass payment by calling the download action directly.
 *
 * Server-only — imports the admin (service-role) Supabase client. Never import
 * from a client component.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { adaptPOSHRow } from './report-data-adapter'
import { generateUnifiedReportBytes } from './unified-report-generator'
import { getEntitlement } from '@/lib/payment/entitlement'
import { ASSESSMENT_TYPES, isPaymentLive } from '@/lib/constants/assessment-types'

export interface GeneratedPoshPdf {
  bytes: Uint8Array
  filename: string
  companyName: string
  score: number
}

export type GeneratePoshPdfResult =
  | GeneratedPoshPdf
  | { error: 'not_found' | 'unauthorized' | 'payment_required' }

export async function generatePoshAssessmentPdf(
  id: string,
  email: string | null | undefined
): Promise<GeneratePoshPdfResult> {
  const supabase = createAdminClient()

  const { data: row, error } = await supabase
    .from('posh_assessments')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !row) {
    return { error: 'not_found' }
  }

  // Ownership gate: caller must provide the email that matches this assessment.
  if (!email || !row.email || email.toLowerCase() !== row.email.toLowerCase()) {
    return { error: 'unauthorized' }
  }

  // Entitlement gate — the real paywall. Skipped while posh.live is false, so
  // today's behaviour (free download once email-verified) is unchanged.
  if (isPaymentLive(ASSESSMENT_TYPES.POSH)) {
    const entitlement = await getEntitlement(id, ASSESSMENT_TYPES.POSH)
    if (entitlement === 'none') {
      return { error: 'payment_required' }
    }
  }

  const reportData = adaptPOSHRow(row)
  const bytes = generateUnifiedReportBytes(reportData)

  const dateStr = new Date().toISOString().split('T')[0]
  const filename = `${reportData.config.filenamePrefix}-${dateStr}.pdf`

  return {
    bytes,
    filename,
    companyName: reportData.userDetails.companyName || 'Your Company',
    score: reportData.overallScore,
  }
}
