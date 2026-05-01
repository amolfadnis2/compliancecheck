import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

import { APPLICABILITY_QUESTIONS } from '@/lib/assessments/auto-dealer/applicability-questions'
import { PHASE2_STATUTORY_QUESTIONS as PHASE_2_QUESTIONS } from '@/lib/assessments/auto-dealer/phase-2-statutory'
import { PHASE3_WORKSHOP_EHS_QUESTIONS as PHASE_3_QUESTIONS } from '@/lib/assessments/auto-dealer/phase-3-workshop-ehs'
import { PHASE4_DEALER_SPECIFIC_QUESTIONS as PHASE_4_QUESTIONS } from '@/lib/assessments/auto-dealer/phase-4-dealer-specific'
import { PHASE5_EPR_QUESTIONS as PHASE_5_QUESTIONS } from '@/lib/assessments/auto-dealer/phase-5-epr'
import { PHASE6_DATA_CORPORATE_QUESTIONS as PHASE_6_QUESTIONS } from '@/lib/assessments/auto-dealer/phase-6-data-corporate'
import {
  buildApplicabilityProfileFromResponses,
  computePhaseScores,
  computeOverallScore,
  generateGapAnalysis,
  computePriceTier,
} from '@/lib/assessments/auto-dealer/rules-engine'
import type { Responses } from '@/types/auto-dealer'

const ALL_QUESTIONS = [
  ...APPLICABILITY_QUESTIONS,
  ...PHASE_2_QUESTIONS,
  ...PHASE_3_QUESTIONS,
  ...PHASE_4_QUESTIONS,
  ...PHASE_5_QUESTIONS,
  ...PHASE_6_QUESTIONS,
]

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
    const body = await request.json() as {
      assessmentId?: string
      phase?: number
      responses?: Responses
      durationSeconds?: number
    }
    const { assessmentId, phase, responses, durationSeconds } = body

    if (!assessmentId || !responses) {
      return NextResponse.json({ success: false, error: 'assessmentId and responses are required' }, { status: 400 })
    }

    const supabase = getSupabase()

    // Fetch existing responses from DB to merge (phase-by-phase submission)
    const { data: existing } = await supabase
      .from('auto_dealer_assessments')
      .select('responses, applicability_profile')
      .eq('id', assessmentId)
      .single()

    const existingResponses: Responses = (existing?.responses as Responses) ?? {}
    const mergedResponses: Responses = { ...existingResponses, ...responses }

    const profile = buildApplicabilityProfileFromResponses(mergedResponses)
    const phaseScores = computePhaseScores(profile, ALL_QUESTIONS, mergedResponses)
    const overallScore = computeOverallScore(phaseScores)
    const gapAnalysis = generateGapAnalysis(profile, ALL_QUESTIONS, mergedResponses)
    const tier = computePriceTier(profile, ALL_QUESTIONS)

    // Build update payload
    const updatePayload: Record<string, unknown> = {
      responses: mergedResponses,
      applicability_profile: profile,
      phase_scores: phaseScores,
      gap_analysis: gapAnalysis,
      overall_score: overallScore.score,
      compliance_status: overallScore.status,
      price_tier: tier,
      labour_regime: profile.labourRegime,
    }

    // If all phases submitted (phase 6 is the last), mark as final
    if (phase === 6) {
      updatePayload.submitted_at = new Date().toISOString()
    }

    if (durationSeconds !== undefined) {
      updatePayload[`phase_${phase}_duration_seconds`] = durationSeconds
    }

    const { error: updateError } = await supabase
      .from('auto_dealer_assessments')
      .update(updatePayload)
      .eq('id', assessmentId)

    if (updateError) {
      console.error('Submit update error:', updateError)
      // Non-fatal — return success so client can navigate
    }

    return NextResponse.json({
      success: true,
      phase,
      overallScore,
      phaseScores,
    })
  } catch (err) {
    console.error('Submit route error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
