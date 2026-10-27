/**
 * Auto Dealer -> shared summary teaser. Auto Dealer keeps its own scoring and
 * PDF (CLAUDE.md sec 14), but its pre-payment summary is the same
 * <AssessmentSummary> every paid assessment shows: phases play the role of
 * categories (keyed by phase number, matching `phase_scores` for peer
 * benchmarks), gap severity is the priority, and the legal references are the
 * compliance areas that apply to this dealership.
 */

import type { ApplicabilityCheckResult, GapItem, PhaseScore } from '@/types/auto-dealer'
import { PHASE_METADATA } from '@/types/auto-dealer'
import { ASSESSMENT_PRICES, ASSESSMENT_TYPES } from '@/lib/constants/assessment-types'
import { toSummary, type UnifiedSummaryData } from './summary-data'

export function toAutoDealerSummary(input: {
  overallScore: number
  phaseScores: PhaseScore[]
  gapAnalysis: GapItem[]
  applicabilityChecks: ApplicabilityCheckResult[]
  companyName?: string | null
}): UnifiedSummaryData {
  const phaseName = (phase: number, fallback: string) =>
    PHASE_METADATA.find((m) => m.phase === phase)?.name ?? fallback

  return toSummary(
    {
      overallScore: input.overallScore,
      categoryScores: input.phaseScores.map((ps) => ({
        category: phaseName(ps.phase, ps.phaseName),
        key: String(ps.phase),
        score: ps.score,
      })),
      actionItems: input.gapAnalysis.map((g) => ({
        priority: g.severity,
        category: phaseName(g.phase, g.phaseName),
        title: g.title,
      })),
      legislation: Array.from(
        new Set(input.applicabilityChecks.filter((c) => c.applies).map((c) => c.label))
      ),
      companyName: input.companyName ?? undefined,
    },
    {
      assessmentType: ASSESSMENT_TYPES.AUTO_DEALER,
      priceINR: Math.round(ASSESSMENT_PRICES[ASSESSMENT_TYPES.AUTO_DEALER].amountPaise / 100),
    }
  )
}
