/**
 * Public sample-report routes.
 *
 * Deliberately separate from sample-report-fixtures.ts: that module pulls in
 * the jsPDF generator, so pages and components that only need a link must
 * import from here instead of bundling the whole PDF stack.
 */

import { ASSESSMENT_TYPES, type AssessmentType } from '@/lib/constants/assessment-types'

/** URL slug -> assessment type, for /api/sample-report/[type]. */
export const SAMPLE_REPORT_SLUGS: Record<string, AssessmentType> = {
  'statutory-health': ASSESSMENT_TYPES.STATUTORY_HEALTH,
  'dpdp': ASSESSMENT_TYPES.DPDP,
  'posh': ASSESSMENT_TYPES.POSH,
}

export function hasSampleReport(type: AssessmentType): boolean {
  return Object.values(SAMPLE_REPORT_SLUGS).includes(type)
}

/** Public path to an assessment's sample report, or null if it has none. */
export function getSampleReportPath(type: AssessmentType): string | null {
  const slug = Object.keys(SAMPLE_REPORT_SLUGS).find((s) => SAMPLE_REPORT_SLUGS[s] === type)
  return slug ? `/api/sample-report/${slug}` : null
}
