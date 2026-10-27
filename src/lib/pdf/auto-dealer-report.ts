/**
 * Auto-dealer PDF report — server-side jsPDF generator (CLAUDE.md sec 14: the
 * auto-dealer report intentionally keeps its own generator). Extracted from the
 * report.pdf route so the email and share-link routes render the identical PDF.
 */

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
  AREA_OFFICIAL_LINKS,
} from '@/lib/assessments/auto-dealer/rules-engine'
import type {
  Responses, PhaseScore, OverallScore, GapItem,
  ApplicabilityCheckResult, ApplicabilityProfile,
} from '@/types/auto-dealer'
import { PHASE_METADATA, PRICE_TIERS } from '@/types/auto-dealer'
import { cleanText } from './pdf-primitives'

export const AUTO_DEALER_ALL_QUESTIONS = [
  ...APPLICABILITY_QUESTIONS,
  ...PHASE_2_QUESTIONS,
  ...PHASE_3_QUESTIONS,
  ...PHASE_4_QUESTIONS,
  ...PHASE_5_QUESTIONS,
  ...PHASE_6_QUESTIONS,
]

/** The stored columns of an `auto_dealer_assessments` row the report needs. */
export interface AutoDealerRow {
  id: string
  user_email: string
  email_verified: boolean
  full_name: string | null
  company_name: string | null
  phone: string | null
  responses: Responses
  price_tier: string | null
  labour_regime: string
  payment_status: string
}

/**
 * Recompute everything the report shows from the stored responses (never trust
 * cached scores on the row — the rules engine may have changed since).
 */
export function computeAutoDealerResults(row: Pick<AutoDealerRow, 'responses' | 'price_tier'>) {
  const responses: Responses = (row.responses as Responses) ?? {}
  const profile = buildApplicabilityProfileFromResponses(responses)
  const phaseScores: PhaseScore[] = computePhaseScores(profile, AUTO_DEALER_ALL_QUESTIONS, responses)
  const overallScore: OverallScore = computeOverallScore(phaseScores)
  const gapAnalysis: GapItem[] = generateGapAnalysis(profile, AUTO_DEALER_ALL_QUESTIONS, responses)
  const applicabilityChecks: ApplicabilityCheckResult[] = generateApplicabilityChecks(profile)
  const priceTier = (row.price_tier ?? computePriceTier(profile, AUTO_DEALER_ALL_QUESTIONS)) as
    'basic' | 'standard' | 'premium'
  const totalQuestions = AUTO_DEALER_ALL_QUESTIONS.filter(q => q.phase !== 1 && q.appliesWhen(profile)).length
  return { responses, profile, phaseScores, overallScore, gapAnalysis, applicabilityChecks, priceTier, totalQuestions }
}

/** Build the report PDF for a stored row. */
export function generateAutoDealerPdfForRow(row: AutoDealerRow): Uint8Array {
  const r = computeAutoDealerResults(row)
  return generateAutoDealerPdf({
    assessmentId: row.id,
    email: row.user_email,
    fullName: row.full_name,
    companyName: row.company_name,
    labourRegime: row.labour_regime,
    profile: r.profile,
    phaseScores: r.phaseScores,
    overallScore: r.overallScore,
    gapAnalysis: r.gapAnalysis,
    applicabilityChecks: r.applicabilityChecks,
    totalQuestions: r.totalQuestions,
    priceTier: r.priceTier,
    generatedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
  })
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PAGE_W = 210
const PAGE_H = 297
const ML = 15   // margin left
const MR = 15   // margin right
const MT = 15   // margin top
const MB = 20   // margin bottom
const CW = PAGE_W - ML - MR  // content width

const C = {
  primary:   [30, 64, 175]  as [number, number, number],
  success:   [34, 197, 94]  as [number, number, number],
  warning:   [245, 158, 11] as [number, number, number],
  danger:    [220, 38, 38]  as [number, number, number],
  text:      [31, 41, 55]   as [number, number, number],
  muted:     [107, 114, 128] as [number, number, number],
  lightGray: [243, 244, 246] as [number, number, number],
  white:     [255, 255, 255] as [number, number, number],
}

// ASCII-safe sanitiser. Delegates to the shared canonical sanitiser in
// pdf-primitives.ts so jsPDF glyph handling stays in one place (CLAUDE.md sec 5).
function ascii(s: string): string {
  return cleanText(s)
}

function severityColor(sev: string): [number, number, number] {
  if (sev === 'critical' || sev === 'high') return C.danger
  if (sev === 'medium') return C.warning
  return C.success
}

function statusColor(status: string): [number, number, number] {
  if (status === 'green') return C.success
  if (status === 'yellow') return C.warning
  return C.danger
}

function statusLabel(status: string): string {
  if (status === 'green') return 'GREEN'
  if (status === 'yellow') return 'YELLOW'
  return 'RED'
}

function pageBreak(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_H - MB) {
    doc.addPage()
    return MT
  }
  return y
}

function addHeader(doc: jsPDF, company: string, pageNum: number): void {
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...C.muted)
  doc.text(ascii(company), ML, 10)
  doc.text(`Page ${pageNum}`, PAGE_W - MR, 10, { align: 'right' })
}

function addFooter(doc: jsPDF): void {
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...C.muted)
  doc.text(
    'Generated by ComplianceCheck.co.in | This report does not constitute legal advice',
    ML, PAGE_H - MB + 5
  )
}

function isUrl(value: string): boolean {
  return /^https?:\/\/\S+$/i.test(value.trim())
}

/** "Link: <url>" (clickable) or "Where: <office>" for areas without a portal. */
function linkLine(doc: jsPDF, value: string, x: number, y: number): void {
  const url = isUrl(value)
  const prefix = url ? 'Link: ' : 'Where: '
  doc.setTextColor(...C.muted)
  doc.text(prefix, x, y)
  const px = x + doc.getTextWidth(prefix)
  if (url) {
    doc.setTextColor(...C.primary)
    doc.textWithLink(ascii(value), px, y, { url: value })
  } else {
    doc.text(ascii(value), px, y)
  }
  doc.setTextColor(...C.text)
}

const TIMELINE_BUCKETS: Array<{ timeline: GapItem['timeline']; label: string; color: [number, number, number] }> = [
  { timeline: '30_days',         label: 'IMMEDIATE (0-30 days)',     color: C.danger },
  { timeline: '90_days',         label: 'SHORT TERM (31-90 days)',   color: C.warning },
  { timeline: '365_days',        label: 'WITHIN THE YEAR',           color: C.primary },
  { timeline: 'prepare_by_2027', label: 'PREPARE BY MAY 2027 (DPDP)', color: C.primary },
  { timeline: 'ongoing',         label: 'ONGOING',                   color: C.success },
]

function hline(doc: jsPDF, y: number, color: [number, number, number] = C.lightGray): void {
  doc.setDrawColor(...color)
  doc.setLineWidth(0.3)
  doc.line(ML, y, PAGE_W - MR, y)
}

// --------------------------------------------------------------------------
// PDF generator (pure function — no side effects)
// --------------------------------------------------------------------------

export interface AutoDealerReportData {
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

export function generateAutoDealerPdf(data: AutoDealerReportData): Uint8Array {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const company = ascii(data.companyName ?? 'N/A')
  let pageNum = 1

  // ==========================================================================
  // PAGE 1 — COVER
  // ==========================================================================

  // Blue header bar
  doc.setFillColor(...C.primary)
  doc.rect(0, 0, PAGE_W, 60, 'F')
  doc.setFontSize(26)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...C.white)
  doc.text('ComplianceCheck', PAGE_W / 2, 35, { align: 'center' })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Pay-as-you-go Compliance Assessments for Indian SMEs', PAGE_W / 2, 48, { align: 'center' })

  // Assessment title
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...C.text)
  doc.text('Auto Dealership', PAGE_W / 2, 85, { align: 'center' })
  doc.text('Compliance Assessment', PAGE_W / 2, 97, { align: 'center' })

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...C.muted)
  doc.text('Full Compliance Report — All Phases', PAGE_W / 2, 108, { align: 'center' })

  // "Prepared For" box
  doc.setFillColor(...C.lightGray)
  doc.rect(ML, 118, CW, 52, 'F')

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...C.muted)
  doc.text('Prepared For', ML + 5, 126)

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...C.text)
  doc.text(company, ML + 5, 135)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...C.muted)
  doc.text(ascii(data.fullName ?? 'N/A'), ML + 5, 143)
  doc.text(ascii(data.email), ML + 5, 150)
  doc.text(
    `Labour Regime: ${data.labourRegime === 'new' ? 'New Labour Codes (eff. 21 Nov 2025)' : 'Legacy Acts'}`,
    ML + 5, 157
  )
  doc.text(`Price Tier: ${ascii(PRICE_TIERS.find(t => t.id === data.priceTier)?.label ?? data.priceTier)}`, ML + 5, 164)

  // Assessment date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...C.text)
  doc.text(`Assessment Date: ${ascii(data.generatedAt)}`, ML, 185)
  doc.text(`Assessment ID: ${data.assessmentId.slice(0, 8)}`, ML, 192)

  // Overall score hero
  const sc = data.overallScore
  const scColor = statusColor(sc.status)
  doc.setFontSize(42)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...scColor)
  doc.text(`${sc.score}`, ML, 220)
  doc.setFontSize(20)
  doc.text('/100', ML + 28, 220)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...C.text)
  doc.text('Overall Compliance Score', ML, 228)

  doc.setFontSize(10)
  doc.setTextColor(...scColor)
  doc.setFont('helvetica', 'bold')
  doc.text(
    sc.status === 'green' ? 'GREEN — Strong' : sc.status === 'yellow' ? 'YELLOW — Moderate' : 'RED — Material Gaps',
    ML, 235
  )

  // Confidential footer on cover
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...C.danger)
  doc.text('CONFIDENTIAL — For Internal Use Only', PAGE_W / 2, PAGE_H - 10, { align: 'center' })

  // ==========================================================================
  // PAGE 2 — EXECUTIVE SUMMARY
  // ==========================================================================

  doc.addPage()
  pageNum++
  addHeader(doc, company, pageNum)
  addFooter(doc)

  let y = 20

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...C.primary)
  doc.text('Executive Summary', ML, y)
  y += 12

  // Score + status boxes side by side
  const bw = (CW - 5) / 2
  doc.setFillColor(...statusColor(sc.status))
  doc.rect(ML, y, bw, 28, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...C.white)
  doc.text('Overall Score', ML + 3, y + 6)
  doc.setFontSize(22)
  doc.text(`${sc.score}/100`, ML + 3, y + 20)

  const riskText = sc.status === 'green' ? 'Low Risk' : sc.status === 'yellow' ? 'Moderate Risk' : 'High Risk'
  doc.setFillColor(...(sc.status === 'green' ? C.success : sc.status === 'yellow' ? C.warning : C.danger))
  doc.rect(ML + bw + 5, y, bw, 28, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...C.white)
  doc.text('Risk Level', ML + bw + 8, y + 6)
  doc.setFontSize(14)
  doc.text(riskText, ML + bw + 8, y + 20)
  y += 36

  // Key stats row
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...C.text)
  doc.text(`Points Earned: ${sc.totalEarned} of ${sc.totalMax}`, ML, y)
  doc.text(`Questions Answered: ${data.totalQuestions}`, ML + 80, y)
  y += 10

  hline(doc, y)
  y += 6

  // Phase scores table
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...C.primary)
  doc.text('Phase-by-Phase Breakdown', ML, y)
  y += 8

  // Table header
  doc.setFillColor(...C.primary)
  doc.rect(ML, y, CW, 7, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...C.white)
  doc.text('Phase', ML + 2, y + 5)
  doc.text('Score', ML + 88, y + 5)
  doc.text('Compliant', ML + 112, y + 5)
  doc.text('Status', ML + 148, y + 5)
  y += 9

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  for (const ps of data.phaseScores) {
    y = pageBreak(doc, y, 8)
    const info = PHASE_METADATA.find(m => m.phase === ps.phase)
    const phaseName = ascii(`Ph ${ps.phase}: ${info?.name ?? ps.phaseName}`)
    const sc2 = statusColor(ps.status)

    // Alternate row shading
    if (data.phaseScores.indexOf(ps) % 2 === 0) {
      doc.setFillColor(...C.lightGray)
      doc.rect(ML, y - 4, CW, 8, 'F')
    }

    doc.setTextColor(...C.text)
    const nameLines = doc.splitTextToSize(phaseName, 82)
    doc.text(nameLines, ML + 2, y)
    doc.text(`${ps.score}%`, ML + 88, y)
    doc.text(`${ps.compliantCount}/${ps.questionCount}`, ML + 112, y)

    // Colored status badge
    doc.setFillColor(...sc2)
    doc.rect(ML + 145, y - 3.5, 22, 5.5, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...C.white)
    doc.text(statusLabel(ps.status), ML + 147, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...C.text)

    y += nameLines.length > 1 ? nameLines.length * 4 + 2 : 8
  }
  y += 4
  hline(doc, y)
  y += 8

  // High-level gap summary
  const highGaps = data.gapAnalysis.filter(g => g.severity === 'critical' || g.severity === 'high').length
  const medGaps  = data.gapAnalysis.filter(g => g.severity === 'medium').length
  const lowGaps  = data.gapAnalysis.filter(g => g.severity === 'low').length
  const compliantCount = data.applicabilityChecks.filter(c => c.applies).length

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...C.primary)
  doc.text('Key Findings', ML, y)
  y += 8

  const findings = [
    `* ${data.gapAnalysis.length} compliance gap(s) identified across all phases`,
    `* ${highGaps} Critical/High priority items requiring immediate action`,
    `* ${medGaps} Medium priority items — address within 30-60 days`,
    `* ${lowGaps} Low priority items — address as resources permit`,
    `* ${compliantCount} applicable regulatory obligations identified`,
  ]
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...C.text)
  for (const f of findings) {
    y = pageBreak(doc, y, 6)
    doc.text(ascii(f), ML + 3, y)
    y += 6
  }

  // ==========================================================================
  // PAGE 3+ — APPLICABILITY OVERVIEW
  // ==========================================================================

  doc.addPage()
  pageNum++
  addHeader(doc, company, pageNum)
  addFooter(doc)
  y = 20

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...C.primary)
  doc.text('Applicability Overview', ML, y)
  y += 6

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...C.muted)
  doc.text('Regulatory obligations checked against your dealership profile.', ML, y)
  y += 10

  // Group by phase
  const byPhase: Record<number, typeof data.applicabilityChecks> = {}
  for (const ch of data.applicabilityChecks) {
    if (!byPhase[ch.phase]) byPhase[ch.phase] = []
    byPhase[ch.phase].push(ch)
  }

  for (const phaseKey of Object.keys(byPhase).map(Number).sort()) {
    const checks = byPhase[phaseKey]
    const info = PHASE_METADATA.find(m => m.phase === phaseKey)
    y = pageBreak(doc, y, 12)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...C.text)
    doc.text(ascii(`Phase ${phaseKey}: ${info?.name ?? ''}`), ML, y)
    y += 7

    for (const ch of checks) {
      y = pageBreak(doc, y, 6)
      const badge = ch.applies ? '[Y]' : '[N]'
      const badgeColor = ch.applies ? C.success : C.muted

      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...badgeColor)
      doc.text(badge, ML + 2, y)

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...C.text)
      const labelLines = doc.splitTextToSize(ascii(ch.label), CW - 20)
      doc.text(labelLines, ML + 12, y)
      y += labelLines.length * 4

      doc.setTextColor(...C.muted)
      const reasonLines = doc.splitTextToSize(ascii(ch.triggerReason), CW - 20)
      doc.text(reasonLines, ML + 12, y)
      y += reasonLines.length * 3.5 + 2
    }
    y += 3
    hline(doc, y)
    y += 5
  }

  const sortOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  const sortedGaps = [...data.gapAnalysis].sort(
    (a, b) => (sortOrder[a.severity] ?? 3) - (sortOrder[b.severity] ?? 3)
  )

  // ==========================================================================
  // YOUR ACTION PLAN (every gap on one timeline, with its legal source and link)
  // ==========================================================================

  if (sortedGaps.length > 0) {
    doc.addPage()
    pageNum++
    addHeader(doc, company, pageNum)
    addFooter(doc)
    y = 20

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...C.primary)
    doc.text('Your Action Plan', ML, y)
    y += 6
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...C.muted)
    doc.text(`${sortedGaps.length} actions, in the order to tackle them. Full findings and recommendations follow.`, ML, y)
    y += 9

    const newPage = () => {
      doc.addPage()
      pageNum++
      addHeader(doc, company, pageNum)
      addFooter(doc)
      y = 20
    }

    let n = 1
    for (const bucket of TIMELINE_BUCKETS) {
      const items = sortedGaps.filter(g => g.timeline === bucket.timeline)
      if (items.length === 0) continue
      if (y + 30 > PAGE_H - MB) newPage()

      doc.setFillColor(...bucket.color)
      doc.rect(ML, y, CW, 7, 'F')
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...C.white)
      doc.text(`${bucket.label}  -  ${items.length} action${items.length === 1 ? '' : 's'}`, ML + 2, y + 5)
      y += 11

      for (const gap of items) {
        doc.setFontSize(9)
        const titleLines = doc.splitTextToSize(ascii(`${n}. ${gap.title}`), CW - 4)
        doc.setFontSize(7)
        const metaLines = doc.splitTextToSize(
          ascii(`${gap.severity.toUpperCase()}  |  ${gap.source}`), CW - 8
        )
        const needed = titleLines.length * 4.5 + metaLines.length * 3.2 + 8
        if (y + needed > PAGE_H - MB) newPage()

        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...C.text)
        doc.text(titleLines, ML + 2, y)
        y += titleLines.length * 4.5

        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...C.muted)
        doc.text(metaLines, ML + 6, y)
        y += metaLines.length * 3.2
        linkLine(doc, AREA_OFFICIAL_LINKS[gap.complianceArea], ML + 6, y)
        y += 6
        n++
      }
      y += 2
    }
  }

  // ==========================================================================
  // GAP ANALYSIS PAGES (sorted: critical → high → medium → low)
  // ==========================================================================

  if (sortedGaps.length > 0) {
    doc.addPage()
    pageNum++
    addHeader(doc, company, pageNum)
    addFooter(doc)
    y = 20

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...C.primary)
    doc.text('Gap Analysis', ML, y)
    y += 6

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...C.muted)
    doc.text(`${sortedGaps.length} compliance gap(s) identified — sorted by severity.`, ML, y)
    y += 10

    let n = 1
    for (const gap of sortedGaps) {
      const needed = 45
      if (y + needed > PAGE_H - MB) {
        doc.addPage()
        pageNum++
        addHeader(doc, company, pageNum)
        addFooter(doc)
        y = 20
      }

      const sevColor = severityColor(gap.severity)

      // Severity badge
      const badgeW = 22
      doc.setFillColor(...sevColor)
      doc.rect(ML, y, badgeW, 6, 'F')
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...C.white)
      doc.text(gap.severity.toUpperCase(), ML + 2, y + 4.5)

      // Phase tag
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...C.muted)
      const info2 = PHASE_METADATA.find(m => m.phase === gap.phase)
      doc.text(ascii(`Phase ${gap.phase}: ${info2?.name ?? gap.phaseName}`), ML + badgeW + 3, y + 4.5)
      y += 9

      // Title
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...C.text)
      const titleLines = doc.splitTextToSize(ascii(`${n}. ${gap.title}`), CW - 4)
      doc.text(titleLines, ML + 2, y)
      y += titleLines.length * 5 + 2

      // Finding
      doc.setFontSize(8)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(...C.muted)
      const findLines = doc.splitTextToSize(ascii(gap.finding), CW - 4)
      doc.text(findLines, ML + 2, y)
      y += findLines.length * 4 + 2

      // Recommendation
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...C.text)
      doc.text('Recommendation:', ML + 2, y)
      y += 5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const recLines = doc.splitTextToSize(ascii(gap.recommendation), CW - 6)
      doc.text(recLines, ML + 4, y)
      y += recLines.length * 4 + 2

      // Timeline + Penalty row
      doc.setFontSize(8)
      doc.setTextColor(...C.muted)
      doc.text(`Timeline: ${ascii(gap.timeline.replace(/_/g, ' '))}`, ML + 2, y)

      if (gap.penaltyExposure) {
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...C.danger)
        const penText = `Penalty: ${ascii(gap.penaltyExposure)}`
        const penLines = doc.splitTextToSize(penText, CW / 2 - 4)
        doc.text(penLines, ML + 90, y)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...C.muted)
      }
      y += 5

      // Source
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...C.muted)
      const srcLines = doc.splitTextToSize(`Source: ${ascii(gap.source)}`, CW - 4)
      doc.text(srcLines, ML + 2, y)
      y += srcLines.length * 3.5
      linkLine(doc, AREA_OFFICIAL_LINKS[gap.complianceArea], ML + 2, y)
      y += 4

      hline(doc, y)
      y += 5
      n++
    }
  } else {
    doc.addPage()
    pageNum++
    addHeader(doc, company, pageNum)
    addFooter(doc)
    y = 20

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...C.success)
    doc.text('No Compliance Gaps Identified', ML, y)
    y += 10
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...C.text)
    doc.text('Your dealership is fully compliant across all assessed phases.', ML, y)
  }

  // ==========================================================================
  // NEXT STEPS & RESOURCES PAGE
  // ==========================================================================

  doc.addPage()
  pageNum++
  addHeader(doc, company, pageNum)
  addFooter(doc)
  y = 20

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...C.primary)
  doc.text('Next Steps & Resources', ML, y)
  y += 12

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...C.text)
  const intro = doc.splitTextToSize(
    'Work through Your Action Plan in order, starting with the Immediate items. Re-assess every 6-12 months, or after a change in headcount, premises, brands or states of operation.',
    CW
  )
  doc.text(intro, ML, y)
  y += intro.length * 4.5 + 6

  // Government resources
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...C.primary)
  doc.text('Government Resources', ML, y)
  y += 8

  const resources = [
    ['Ministry of Road Transport & Highways (MoRTH)', 'https://morth.nic.in'],
    ['Central Motor Vehicles Rules — HSRP', 'https://parivahan.gov.in'],
    ['Bureau of Indian Standards (BIS) — CMVR', 'https://www.bis.gov.in'],
    ['IRDAI — Insurance Regulatory Guidelines',  'https://irdai.gov.in'],
    ['RBI — DSA / Vehicle Finance Norms',        'https://www.rbi.org.in'],
    ['CPCB — EPR / Waste Management Rules',      'https://cpcb.nic.in'],
    ['MCA — Companies Act / CSR',                'https://www.mca.gov.in'],
    ['MeitY — DPDP Act 2023',                    'https://www.meity.gov.in'],
  ]
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  for (const [name, url] of resources) {
    y = pageBreak(doc, y, 7)
    doc.setTextColor(...C.text)
    doc.setFont('helvetica', 'bold')
    doc.text(ascii(name), ML + 2, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...C.primary)
    doc.textWithLink(url, ML + 2, y + 4.5, { url })
    doc.setTextColor(...C.text)
    y += 11
  }
  y += 3
  hline(doc, y)
  y += 8

  // Disclaimer box
  y = pageBreak(doc, y, 28)
  doc.setFillColor(255, 237, 213)  // amber-100
  doc.rect(ML, y, CW, 22, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(180, 83, 9)  // amber-700
  doc.text('DISCLAIMER', ML + 3, y + 6)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...C.text)
  const disc = 'This report provides general guidance based on central legislation and research current to May 2026. ' +
    'State-specific rules vary and change with Budgets. DPDP Act 2023 substantive obligations take effect 13 May 2027 — ' +
    'items marked "Prepare by 2027" are advisory. Always consult a qualified compliance professional for legal advice.'
  const discLines = doc.splitTextToSize(ascii(disc), CW - 6)
  doc.text(discLines, ML + 3, y + 11)
  y += 24

  // Report metadata
  doc.setFontSize(7)
  doc.setTextColor(...C.muted)
  doc.text(`Report Generated: ${ascii(data.generatedAt)}`, ML, y)
  doc.text(`Assessment ID: ${data.assessmentId.slice(0, 8)}`, ML, y + 4)

  // ==========================================================================
  // APPENDIX: LEGAL REFERENCES (every source cited by a gap, by phase)
  // ==========================================================================

  if (sortedGaps.length > 0) {
    doc.addPage()
    pageNum++
    addHeader(doc, company, pageNum)
    addFooter(doc)
    y = 20
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...C.primary)
    doc.text('Appendix: Legal References', ML, y)
    y += 6
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...C.muted)
    doc.text('The provisions behind each gap in this report - useful when briefing your CA or lawyer.', ML, y)
    y += 9

    const byPhase = new Map<string, Set<string>>()
    for (const gap of sortedGaps) {
      const name = PHASE_METADATA.find(m => m.phase === gap.phase)?.name ?? gap.phaseName
      if (!byPhase.has(name)) byPhase.set(name, new Set())
      byPhase.get(name)!.add(gap.source)
    }
    for (const [phaseName, sources] of Array.from(byPhase.entries())) {
      if (y + 12 > PAGE_H - MB) {
        doc.addPage(); pageNum++; addHeader(doc, company, pageNum); addFooter(doc); y = 20
      }
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...C.text)
      doc.text(ascii(phaseName), ML, y)
      y += 5
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      for (const src of Array.from(sources)) {
        const lines = doc.splitTextToSize(ascii(`* ${src}`), CW - 4)
        if (y + lines.length * 3.8 > PAGE_H - MB) {
          doc.addPage(); pageNum++; addHeader(doc, company, pageNum); addFooter(doc); y = 20
        }
        doc.text(lines, ML + 2, y)
        y += lines.length * 3.8 + 0.5
      }
      y += 3
    }
  }

  return new Uint8Array(doc.output('arraybuffer'))
}

