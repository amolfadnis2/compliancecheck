/**
 * Peer benchmarks — "how do other companies score?" for the summary page.
 *
 * Averages the stored category scores of other completed assessments of the
 * same type, so a user can see each of their category scores next to what
 * everyone else scored. Rules:
 *  - compare within the user's industry when it has at least MIN_PEERS rows,
 *    otherwise against every company that took the same assessment;
 *  - below MIN_PEERS in total, return null — the UI hides the comparison rather
 *    than showing an average of two or three companies;
 *  - the user's own assessment is never part of their benchmark.
 *
 * Server-only (service-role read). Cached for an hour per type/industry/id.
 */

import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { ASSESSMENT_TYPES, type AssessmentType } from '@/lib/constants/assessment-types'
import { assessmentTableFor } from '@/lib/payment/assessment-table'
import type { UnifiedReportData } from '@/lib/pdf/unified-report-generator'

export const MIN_PEERS = 20
const MAX_ROWS = 2000

export interface PeerAverages {
  sampleSize: number
  scope: 'industry' | 'all'
  industry?: string
  overallAverage: number
  /** Category key (as stored on the row) -> average percentage, rounded. */
  categories: Record<string, number>
}

export interface PeerRow {
  id: string
  overall_score: number | null
  /** Category scores in any of the stored shapes (see `categoryPercentages`). */
  scores: unknown
  industry?: string | null
}

/**
 * Normalise one row's stored category scores to key -> percentage. Handles
 * every shape currently written:
 *  - { key: number }                                  (Labour Code)
 *  - { key: { percentage } } / { key: { score, max|maxScore } }
 *  - [{ category, categoryName, percentage }]          (POSH; keyed by name)
 *  - [{ phase, score }]                                (Auto Dealer phase_scores)
 */
export function categoryPercentages(scores: unknown): Record<string, number> {
  const out: Record<string, number> = {}
  if (Array.isArray(scores)) {
    for (const entry of scores) {
      if (!entry || typeof entry !== 'object') continue
      const e = entry as Record<string, unknown>
      const key = e.categoryName ?? e.phase ?? e.category
      const pct = typeof e.percentage === 'number' ? e.percentage : typeof e.score === 'number' ? e.score : null
      if (key !== undefined && key !== null && pct !== null) out[String(key)] = pct
    }
    return out
  }
  if (scores && typeof scores === 'object') {
    for (const [key, value] of Object.entries(scores as Record<string, unknown>)) {
      if (typeof value === 'number') {
        out[key] = value
      } else if (value && typeof value === 'object') {
        const v = value as Record<string, unknown>
        const max = (v.maxScore ?? v.max) as number | undefined
        if (typeof v.percentage === 'number') out[key] = v.percentage
        else if (typeof v.score === 'number' && typeof max === 'number' && max > 0) out[key] = (v.score / max) * 100
      }
    }
  }
  return out
}

/** Pure aggregation — exported for tests. */
export function aggregatePeers(
  rows: PeerRow[],
  opts: { excludeId?: string; industry?: string | null }
): PeerAverages | null {
  const others = rows.filter((r) => r.id !== opts.excludeId)
  const sameIndustry = opts.industry ? others.filter((r) => r.industry === opts.industry) : []
  const useIndustry = sameIndustry.length >= MIN_PEERS
  const pool = useIndustry ? sameIndustry : others
  if (pool.length < MIN_PEERS) return null

  const sums: Record<string, { total: number; n: number }> = {}
  let overallTotal = 0
  let overallN = 0
  for (const row of pool) {
    if (typeof row.overall_score === 'number') {
      overallTotal += row.overall_score
      overallN++
    }
    for (const [key, pct] of Object.entries(categoryPercentages(row.scores))) {
      sums[key] ??= { total: 0, n: 0 }
      sums[key].total += pct
      sums[key].n++
    }
  }

  const categories: Record<string, number> = {}
  for (const [key, { total, n }] of Object.entries(sums)) {
    // A category only a handful of peers answered (e.g. an optional area) is
    // not a meaningful benchmark.
    if (n >= MIN_PEERS) categories[key] = Math.round(total / n)
  }

  return {
    sampleSize: pool.length,
    scope: useIndustry ? 'industry' : 'all',
    industry: useIndustry ? opts.industry ?? undefined : undefined,
    overallAverage: overallN > 0 ? Math.round(overallTotal / overallN) : 0,
    categories,
  }
}

async function fetchPeerRows(type: AssessmentType): Promise<PeerRow[]> {
  const supabase = createAdminClient()
  const table = assessmentTableFor(type)

  if (type === ASSESSMENT_TYPES.AUTO_DEALER) {
    const { data, error } = await supabase
      .from(table)
      .select('id, overall_score, phase_scores')
      .not('phase_scores', 'is', null)
      .order('created_at', { ascending: false })
      .limit(MAX_ROWS)
    if (error) throw error
    return (data ?? []).map((r) => ({ id: r.id, overall_score: r.overall_score, scores: r.phase_scores }))
  }

  if (type === ASSESSMENT_TYPES.POSH) {
    const { data, error } = await supabase
      .from(table)
      .select('id, overall_score, category_scores')
      .not('category_scores', 'is', null)
      .order('created_at', { ascending: false })
      .limit(MAX_ROWS)
    if (error) throw error
    return (data ?? []).map((r) => ({ id: r.id, overall_score: r.overall_score, scores: r.category_scores }))
  }

  const { data, error } = await supabase
    .from(table)
    .select('id, overall_score, category_scores, industry:responses->userDetails->>industry')
    .eq('assessment_type', type)
    .not('category_scores', 'is', null)
    .order('created_at', { ascending: false })
    .limit(MAX_ROWS)
  if (error) throw error
  return (data ?? []).map((r) => ({
    id: r.id as string,
    overall_score: r.overall_score as number | null,
    scores: r.category_scores,
    industry: (r as { industry?: string | null }).industry ?? null,
  }))
}

const cachedPeerRows = unstable_cache(
  async (type: AssessmentType) => fetchPeerRows(type),
  ['peer-benchmark-rows'],
  { revalidate: 3600 }
)

/**
 * Peer averages for one assessment, or null when there are not enough peers
 * or the database is unavailable (the summary simply omits the comparison).
 */
export async function getPeerAverages(
  type: AssessmentType,
  opts: { excludeId?: string; industry?: string | null } = {}
): Promise<PeerAverages | null> {
  try {
    const rows = await cachedPeerRows(type)
    return aggregatePeers(rows, opts)
  } catch (err) {
    console.error('[benchmarks] peer averages unavailable:', err)
    return null
  }
}

/** Fill the PDF's "Peer avg" column (matched on category key). */
export function applyPeersToReport(report: UnifiedReportData, peers: PeerAverages | null): UnifiedReportData {
  if (!peers) return report
  return {
    ...report,
    categoryScores: report.categoryScores.map((c) =>
      c.key !== undefined && peers.categories[c.key] !== undefined ? { ...c, peerAverage: peers.categories[c.key] } : c
    ),
  }
}
