/**
 * Summary data — the teaser shape shown before payment.
 *
 * Mirrors the shared-PDF adapter idea (`report-data-adapter.ts`): a single
 * `UnifiedSummaryData` shape that every assessment renders through the shared
 * <AssessmentSummary> component. `toSummary()` derives it from any already-scored
 * source — the unified report data (via `buildSummaryData`) or an in-memory
 * computed result (POSH) — deliberately dropping remediation text, citations and
 * deadlines so the teaser can be served publicly without leaking the paid report.
 */

import { getAssessmentDisplayName, type AssessmentType } from '@/lib/constants/assessment-types'

export interface SummaryCategoryScore {
  key: string
  name: string
  percentage: number
  status: 'compliant' | 'needs-attention' | 'non-compliant'
}

export interface UnifiedSummaryData {
  assessmentType: AssessmentType
  displayName: string
  priceINR: number
  overallScore: number
  riskLabel: string
  riskColor: 'green' | 'amber' | 'red'
  categoryScores: SummaryCategoryScore[]
  gapsCount: number
  highPriorityCount: number
  penaltyRange: string
  /** Titles are intentionally excluded — only priority + category reach the client. */
  topIssues: Array<{ priority: string; category: string }>
  companyName: string
}

/**
 * Minimal structural input that both `UnifiedReportData` and the in-memory POSH
 * result satisfy — so `toSummary` can consume either without pulling in the
 * heavy PDF adapter/rule modules on the client.
 */
export interface SummarySource {
  overallScore: number
  categoryScores: Array<{ category: string; score: number }>
  actionItems: Array<{ priority: string; category: string }>
  companyName?: string
}

function bandColor(score: number): 'green' | 'amber' | 'red' {
  return score >= 70 ? 'green' : score >= 40 ? 'amber' : 'red'
}

function bandLabel(score: number): string {
  return score >= 70 ? 'Compliant' : score >= 40 ? 'Needs Attention' : 'Non-Compliant'
}

function categoryStatus(percentage: number): SummaryCategoryScore['status'] {
  return percentage >= 70 ? 'compliant' : percentage >= 40 ? 'needs-attention' : 'non-compliant'
}

// Generic penalty-range sentence keyed off the overall score. Kept intentionally
// vague (a range, not per-issue exposure) since exact figures are part of the
// paid report.
function penaltyRangeFor(score: number): string {
  if (score >= 70) return "Low exposure — you're in reasonable shape"
  if (score >= 40) return 'Estimated Rs.1L-5L in penalties across defaults'
  return 'Significant exposure — up to Rs.25L+ across multiple defaults'
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'general'
}

/**
 * Build the public teaser from an already-scored source. `companyName` defaults
 * to '' (the PDF adapters use 'Not specified' as a placeholder — treat that as
 * empty so the summary header just omits it).
 */
export function toSummary(
  src: SummarySource,
  opts: { assessmentType: AssessmentType; priceINR: number }
): UnifiedSummaryData {
  const overallScore = Math.round(src.overallScore ?? 0)

  const categoryScores: SummaryCategoryScore[] = (src.categoryScores ?? []).map((c) => {
    const percentage = Math.round(c.score ?? 0)
    return {
      key: slugify(c.category ?? 'general'),
      name: c.category ?? 'General',
      percentage,
      status: categoryStatus(percentage),
    }
  })

  const actionItems = src.actionItems ?? []
  const gapsCount = actionItems.length
  const highPriorityCount = actionItems.filter(
    (i) => i.priority === 'high' || i.priority === 'critical'
  ).length

  const topIssues = actionItems.slice(0, 3).map((i) => ({
    priority: i.priority ?? 'low',
    category: i.category ?? 'General',
  }))

  const companyName =
    src.companyName && src.companyName !== 'Not specified' ? src.companyName : ''

  return {
    assessmentType: opts.assessmentType,
    displayName: getAssessmentDisplayName(opts.assessmentType as AssessmentType),
    priceINR: opts.priceINR,
    overallScore,
    riskLabel: bandLabel(overallScore),
    riskColor: bandColor(overallScore),
    categoryScores,
    gapsCount,
    highPriorityCount,
    penaltyRange: penaltyRangeFor(overallScore),
    topIssues,
    companyName,
  }
}
