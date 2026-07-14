/**
 * Summary Registry — the payment-side parallel to `report-registry.ts`.
 *
 * Turns a DB-backed assessment row into the public `UnifiedSummaryData` teaser.
 * It reuses the existing PDF adapters via `buildReportData()` so the teaser
 * numbers are guaranteed to match the paid report — no scoring logic is
 * duplicated here. Adding a new paid assessment needs no change in this file as
 * long as it is registered in `report-registry.ts`.
 *
 * POSH is handled at its own call site (in-memory computed result → `toSummary`)
 * exactly as POSH is absent from `report-registry` for PDFs.
 *
 * Server-only for the DB-backed path (imports the PDF adapters). The plain
 * `toSummary` re-export is safe to use anywhere.
 */

import { buildReportData } from '@/lib/pdf/report-registry'
import type { AssessmentData } from '@/lib/pdf/report-data-adapter'
import { ASSESSMENT_PRICES, type AssessmentType } from '@/lib/constants/assessment-types'
import { toSummary, type UnifiedSummaryData } from './summary-data'

function priceINRFor(type: string): number {
  const paise = ASSESSMENT_PRICES[type as AssessmentType]?.amountPaise ?? 0
  return Math.round(paise / 100)
}

/**
 * Build the teaser for a DB-backed assessment (Statutory Health, Labour Code,
 * DPDP, State-Wise, Food Business).
 */
export function buildSummaryData(type: AssessmentType, data: AssessmentData): UnifiedSummaryData {
  const report = buildReportData(type, data)
  return toSummary(
    {
      overallScore: report.overallScore,
      categoryScores: report.categoryScores,
      actionItems: report.actionItems,
      companyName: report.userDetails.companyName,
    },
    { assessmentType: type, priceINR: priceINRFor(type) }
  )
}

export { toSummary, priceINRFor }
export type { UnifiedSummaryData }
