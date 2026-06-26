import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { adaptAutoDealer } from '@/lib/pdf/report-data-adapter'
import { buildReportHtml, getPdfRenderOptions } from '@/lib/pdf/html-report-builder'
import { renderHtmlToPdf } from '@/lib/pdf/html-renderer'

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
  generateApplicabilityChecks,
  computePriceTier,
} from '@/lib/assessments/auto-dealer/rules-engine'
import type {
  Responses, PhaseScore, OverallScore, GapItem,
  ApplicabilityCheckResult, PTSlab, StateAndE, GSTRate,
  ApplicabilityProfile,
} from '@/types/auto-dealer'

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

// (jsPDF constants removed — PDF now rendered via HTML+Playwright pipeline)


// --------------------------------------------------------------------------
// Route handler
// --------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const assessmentId = params.id
  const acceptJson = request.headers.get('accept')?.includes('application/json')

  try {
    const supabase = getSupabase()

    const { data: row, error: fetchErr } = await supabase
      .from('auto_dealer_assessments')
      .select('*')
      .eq('id', assessmentId)
      .single()

    if (fetchErr || !row) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    const a = row as {
      id: string; user_email: string; email_verified: boolean;
      full_name: string | null; company_name: string | null; phone: string | null;
      responses: Responses; applicability_profile: ApplicabilityProfile | null;
      phase_scores: PhaseScore[] | null; gap_analysis: GapItem[] | null;
      overall_score: number | null; compliance_status: string | null;
      payment_status: string; price_tier: string | null;
      labour_regime: string; created_at: string;
    }

    // Always recompute scores from stored responses to avoid stale cached values
    const responses: Responses = (a.responses as Responses) ?? {}
    const profile = buildApplicabilityProfileFromResponses(responses)
    const phaseScores: PhaseScore[] = computePhaseScores(profile, ALL_QUESTIONS, responses)
    const overallScore: OverallScore = computeOverallScore(phaseScores)
    const gapAnalysis: GapItem[] = generateGapAnalysis(profile, ALL_QUESTIONS, responses)
    const applicabilityChecks: ApplicabilityCheckResult[] = generateApplicabilityChecks(profile)
    const tier = (a.price_tier ?? computePriceTier(profile, ALL_QUESTIONS)) as 'basic' | 'standard' | 'premium'
    const totalQuestions = ALL_QUESTIONS.filter(q => q.phase !== 1 && q.appliesWhen(profile)).length

    // Fetch state reference data for verified + paid users
    let ptSlabs: PTSlab[] = []
    let sandE: StateAndE[] = []
    let gstRates: GSTRate[] = []

    if (a.email_verified && a.payment_status === 'paid') {
      const [ptResult, sandEResult, gstResult] = await Promise.all([
        supabase.from('state_pt_slabs').select('*').in('state_code', profile.statesOfOperation),
        supabase.from('state_s_and_e').select('*').in('state_code', profile.statesOfOperation),
        supabase.from('gst_rates_by_hsn').select('*').order('hsn'),
      ])
      if (ptResult.data) ptSlabs = ptResult.data as PTSlab[]
      if (sandEResult.data) sandE = sandEResult.data as StateAndE[]
      if (gstResult.data) gstRates = gstResult.data as GSTRate[]
    }

    // Require email verification for both JSON and PDF responses
    if (!a.email_verified) {
      return NextResponse.json({ error: 'Email verification required' }, { status: 403 })
    }

    // JSON response for the results page metadata fetch
    if (acceptJson) {
      return NextResponse.json({
        email: a.user_email,
        companyName: a.company_name,
        fullName: a.full_name,
        labourRegime: a.labour_regime,
        responses,
        phaseScores,
        overallScore,
        gapAnalysis,
        applicabilityChecks,
        profile,
        ptSlabs,
        sandE,
        gstRates,
        emailVerified: a.email_verified,
        paymentStatus: a.payment_status,
        priceTier: tier,
        totalQuestions,
      })
    }

    const reportData = adaptAutoDealer({
      assessmentId,
      email: a.user_email,
      fullName: a.full_name,
      companyName: a.company_name,
      phaseScores,
      overallScore,
      gapAnalysis,
    })

    const html = buildReportHtml(reportData)
    const pdfBytes = await renderHtmlToPdf(html, getPdfRenderOptions(reportData))

    // Mark PDF generated
    await supabase
      .from('auto_dealer_assessments')
      .update({ pdf_generated_at: new Date().toISOString() })
      .eq('id', assessmentId)

    const filename = `Auto-Dealer-Compliance-${assessmentId.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.pdf`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new NextResponse(pdfBytes as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-cache',
      },
    })
  } catch (err) {
    console.error('Report route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
