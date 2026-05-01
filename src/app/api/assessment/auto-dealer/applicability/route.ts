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
  getApplicableQuestionsByPhase,
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
    const body = await request.json() as { assessmentId?: string; responses?: Responses }
    const { assessmentId, responses } = body

    if (!assessmentId || !responses) {
      return NextResponse.json({ success: false, error: 'assessmentId and responses are required' }, { status: 400 })
    }

    const profile = buildApplicabilityProfileFromResponses(responses)
    const tier = computePriceTier(profile, ALL_QUESTIONS)

    // Compute which phases apply and total question count
    const applicablePhases: number[] = []
    let totalQuestions = 0

    for (const phase of [2, 3, 4, 5, 6] as const) {
      const qs = getApplicableQuestionsByPhase(profile, ALL_QUESTIONS, phase)
      if (qs.length > 0) {
        applicablePhases.push(phase)
        totalQuestions += qs.length
      }
    }

    // Persist to Supabase
    const { error: updateError } = await getSupabase()
      .from('auto_dealer_assessments')
      .update({
        applicability_profile: profile,
        responses,
        price_tier: tier,
        labour_regime: profile.labourRegime,
      })
      .eq('id', assessmentId)

    if (updateError) {
      console.error('Applicability update error:', updateError)
      // Non-fatal — return success so client can continue
    }

    return NextResponse.json({
      success: true,
      profile,
      applicablePhases,
      totalQuestions,
      tier,
    })
  } catch (err) {
    console.error('Applicability route error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
