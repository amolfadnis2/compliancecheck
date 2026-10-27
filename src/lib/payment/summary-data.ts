/**
 * Summary data — the teaser shape shown before payment.
 *
 * Mirrors the shared-PDF adapter idea (`report-data-adapter.ts`): a single
 * `UnifiedSummaryData` shape that every assessment renders through the shared
 * <AssessmentSummary> component. `toSummary()` derives it from any already-scored
 * source — the unified report data (via `buildSummaryData`) or an in-memory
 * computed result (POSH, Auto Dealer) — deliberately dropping remediation steps,
 * section-level citations, penalties and deadlines so the teaser can be served
 * publicly without leaking the paid report. What the teaser does show: the
 * score, critical gaps, the top three action headlines, category scores against
 * peers, and the Acts the assessment covers.
 */

import { getAssessmentDisplayName, type AssessmentType } from '@/lib/constants/assessment-types'

export interface SummaryCategoryScore {
  key: string
  name: string
  percentage: number
  status: 'compliant' | 'needs-attention' | 'non-compliant'
  /** Average of other companies' scores in this category, when enough exist. */
  peerAverage?: number
}

/** A top action as the teaser shows it: a short headline, no steps or citations. */
export interface SummaryTopAction {
  priority: string
  category: string
  headline: string
}

/** Who the peer averages compare against (absent: not enough peers yet). */
export interface SummaryPeerInfo {
  sampleSize: number
  /** 'industry' when compared within the user's industry, else all companies. */
  scope: 'industry' | 'all'
  industry?: string
  overallAverage: number
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
  /** Critical + high priority gaps — shown as "critical gaps". */
  highPriorityCount: number
  penaltyRange: string
  /** Top three actions as headlines only (no steps, penalties or sections). */
  topActions: SummaryTopAction[]
  /** Acts / regulations the assessment covers (names only). */
  legalReferences: string[]
  peers?: SummaryPeerInfo
  companyName: string
}

/**
 * Minimal structural input that both `UnifiedReportData` and the in-memory POSH
 * result satisfy — so `toSummary` can consume either without pulling in the
 * heavy PDF adapter/rule modules on the client.
 */
export interface SummarySource {
  overallScore: number
  categoryScores: Array<{ category: string; score: number; key?: string }>
  actionItems: Array<{ priority: string; category: string; title?: string }>
  legislation?: string[]
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

const PRIORITY_RANK: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }

const HEADLINE_MAX = 90

function headline(title: string | undefined, category: string): string {
  const text = (title ?? '').trim().replace(/\?$/, '') || category
  return text.length > HEADLINE_MAX ? `${text.slice(0, HEADLINE_MAX - 3).trimEnd()}...` : text
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
      key: c.key ?? slugify(c.category ?? 'general'),
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

  // Most urgent first; the sort is stable so source order breaks ties.
  const topActions: SummaryTopAction[] = [...actionItems]
    .sort((a, b) => (PRIORITY_RANK[a.priority] ?? 3) - (PRIORITY_RANK[b.priority] ?? 3))
    .slice(0, 3)
    .map((i) => ({
      priority: i.priority ?? 'low',
      category: i.category ?? 'General',
      headline: headline(i.title, i.category ?? 'General'),
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
    topActions,
    legalReferences: src.legislation ?? [],
    companyName,
  }
}

/**
 * Overlay peer averages (see `lib/benchmarks/peer-averages`) onto a summary.
 * Categories are matched by key; with no peer data the summary is unchanged.
 */
export function withPeerAverages(
  summary: UnifiedSummaryData,
  peers: { sampleSize: number; scope: 'industry' | 'all'; industry?: string; overallAverage: number; categories: Record<string, number> } | null
): UnifiedSummaryData {
  if (!peers) return summary
  return {
    ...summary,
    categoryScores: summary.categoryScores.map((c) =>
      peers.categories[c.key] !== undefined ? { ...c, peerAverage: peers.categories[c.key] } : c
    ),
    peers: {
      sampleSize: peers.sampleSize,
      scope: peers.scope,
      industry: peers.industry,
      overallAverage: peers.overallAverage,
    },
  }
}
