import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { jsPDF } from 'jspdf'

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
import { PHASE_METADATA, PRICE_TIERS } from '@/types/auto-dealer'

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

// ASCII-safe sanitiser: replaces Rs symbols, em-dashes, smart quotes, Unicode bullets
function ascii(s: string): string {
  return s
    .replace(/₹/g, 'Rs.')
    .replace(/[–—]/g, '-')
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[•·]/g, '-')
    .replace(/…/g, '...')
    .replace(/[^\x00-\x7F]/g, '')  // strip remaining non-ASCII
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current.trim())
      current = word
    } else {
      current = current ? current + ' ' + word : word
    }
  }
  if (current) lines.push(current.trim())
  return lines
}

// --------------------------------------------------------------------------
// PDF generator (pure function — no side effects)
// --------------------------------------------------------------------------

interface ReportData {
  assessmentId: string
  email: string
  fullName: string | null
  companyName: string | null
  labourRegime: string
  profile: ApplicabilityProfile
  phaseScores: PhaseScore[]
  overallScore: OverallScore
  gapAnalysis: GapItem[]
  applicabilityChecks: ApplicabilityCheckResult[]
  totalQuestions: number
  priceTier: 'basic' | 'standard' | 'premium'
  generatedAt: string
}

function generatePdf(data: ReportData): Uint8Array {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = 210
  const margin = 15
  const contentW = pageW - 2 * margin
  let y = margin

  const checkPageBreak = (needed: number) => {
    if (y + needed > 285) {
      doc.addPage()
      y = margin
    }
  }

  const heading = (text: string, size = 14) => {
    checkPageBreak(10)
    doc.setFontSize(size)
    doc.setFont('helvetica', 'bold')
    doc.text(ascii(text), margin, y)
    y += size === 14 ? 7 : 5
  }

  const body = (text: string, size = 9, indent = 0) => {
    const lines = wrapText(ascii(text), Math.floor((contentW - indent) / (size * 0.48)))
    for (const line of lines) {
      checkPageBreak(5)
      doc.setFontSize(size)
      doc.setFont('helvetica', 'normal')
      doc.text(line, margin + indent, y)
      y += 5
    }
  }

  const rule = () => {
    checkPageBreak(3)
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, y, pageW - margin, y)
    y += 4
  }

  // ---------- Cover ----------
  doc.setFillColor(29, 78, 216)  // blue-700
  doc.rect(0, 0, pageW, 50, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Auto Dealership Compliance Assessment', margin, 22)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Full Compliance Report', margin, 30)
  doc.setFontSize(9)
  doc.text(`Generated: ${ascii(data.generatedAt)}`, margin, 38)
  doc.text(`Assessment ID: ${data.assessmentId.slice(0, 8)}`, margin, 44)
  doc.setTextColor(0, 0, 0)
  y = 60

  // ---------- Entity Details ----------
  heading('1. ENTITY DETAILS', 13)
  body(`Company: ${data.companyName ?? 'N/A'}`)
  body(`Respondent: ${data.fullName ?? 'N/A'}`)
  body(`Email: ${data.email}`)
  body(`Labour Regime: ${data.labourRegime === 'new' ? 'New Labour Codes (eff. 21 Nov 2025)' : 'Legacy Acts'}`)
  body(`Questions Answered: ${data.totalQuestions}`)
  body(`Price Tier: ${PRICE_TIERS.find(t => t.id === data.priceTier)?.label ?? data.priceTier}`)
  rule()

  // ---------- Overall Score ----------
  heading('2. OVERALL COMPLIANCE SCORE', 13)
  const s = data.overallScore
  const statusLabel = s.status === 'green' ? 'GREEN (Strong)' : s.status === 'yellow' ? 'YELLOW (Moderate)' : 'RED (Material Gaps)'
  body(`Score: ${s.score}/100   Status: ${statusLabel}`)
  body(`Points: ${s.totalEarned} earned of ${s.totalMax} maximum`)
  rule()

  // ---------- Phase Scores ----------
  heading('3. PHASE SCORES', 13)
  for (const ps of data.phaseScores) {
    const info = PHASE_METADATA.find(m => m.phase === ps.phase)
    const label = ps.status === 'green' ? 'GREEN' : ps.status === 'yellow' ? 'YELLOW' : 'RED'
    body(`Phase ${ps.phase}: ${info?.name ?? ps.phaseName}`)
    body(`  Score: ${ps.score}% (${ps.earnedPoints}/${ps.maxPoints} pts) | ${ps.compliantCount}/${ps.questionCount} compliant | ${label}`, 9, 4)
  }
  rule()

  // ---------- Applicability Overview ----------
  heading('4. APPLICABILITY OVERVIEW', 13)
  for (const check of data.applicabilityChecks) {
    const applies = check.applies ? 'Y' : 'N'
    body(`[${applies}] Phase ${check.phase}: ${check.label} — ${check.triggerReason}`, 8)
  }
  rule()

  // ---------- Gap Analysis ----------
  heading('5. GAP ANALYSIS', 13)
  if (data.gapAnalysis.length === 0) {
    body('No compliance gaps identified.')
  } else {
    let n = 1
    for (const gap of data.gapAnalysis) {
      checkPageBreak(30)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(ascii(`${n}. [${gap.severity.toUpperCase()}] ${gap.title.slice(0, 70)}`), margin, y)
      y += 5
      body(`   Area: ${gap.complianceArea.replace(/_/g,' ')} | Phase ${gap.phase} | Weight: ${gap.weight}/10`, 8, 4)
      body(`   Finding: ${gap.finding}`, 8, 4)
      body(`   Recommendation: ${gap.recommendation}`, 8, 4)
      body(`   Timeline: ${gap.timeline.replace(/_/g,' ')} | Penalty: ${gap.penaltyExposure}`, 8, 4)
      body(`   Source: ${gap.source}`, 8, 4)
      y += 2
      n++
    }
  }
  rule()

  // ---------- Disclaimer ----------
  checkPageBreak(25)
  heading('DISCLAIMER', 10)
  body('This report provides general guidance based on central legislation and research current to May 2026. State-specific rules vary and change with Budgets. DPDP Act 2023 substantive obligations take effect 13 May 2027 -- items marked "Prepare by 2027" are advisory. Always consult a qualified compliance professional for legal advice.', 8)

  return doc.output('arraybuffer') as unknown as Uint8Array
}

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

    // Rebuild scores from stored responses if not cached
    const responses: Responses = (a.responses as Responses) ?? {}
    const profile = a.applicability_profile ?? buildApplicabilityProfileFromResponses(responses)
    const phaseScores: PhaseScore[] = (a.phase_scores as PhaseScore[] | null) ?? computePhaseScores(profile, ALL_QUESTIONS, responses)
    const overallScore: OverallScore = computeOverallScore(phaseScores)
    const gapAnalysis: GapItem[] = (a.gap_analysis as GapItem[] | null) ?? generateGapAnalysis(profile, ALL_QUESTIONS, responses)
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

    // PDF response — require email_verified + paid
    if (!a.email_verified) {
      return NextResponse.json({ error: 'Email verification required' }, { status: 403 })
    }
    if (a.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment required to download PDF' }, { status: 402 })
    }

    const pdfData = generatePdf({
      assessmentId,
      email: a.user_email,
      fullName: a.full_name,
      companyName: a.company_name,
      labourRegime: a.labour_regime,
      profile,
      phaseScores,
      overallScore,
      gapAnalysis,
      applicabilityChecks,
      totalQuestions,
      priceTier: tier,
      generatedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
    })

    // Mark PDF generated
    await supabase
      .from('auto_dealer_assessments')
      .update({ pdf_generated_at: new Date().toISOString() })
      .eq('id', assessmentId)

    return new NextResponse(Buffer.from(pdfData), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="compliance-report-${assessmentId.slice(0, 8)}.pdf"`,
        'Cache-Control': 'private, no-cache',
      },
    })
  } catch (err) {
    console.error('Report route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
