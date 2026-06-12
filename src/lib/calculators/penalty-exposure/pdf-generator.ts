import { jsPDF } from 'jspdf'
import type { BusinessInput, PenaltyExposureResult } from './types'
import { formatRupees } from './calculator'
import { cleanText } from '@/lib/pdf/unified-report-generator'


// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------
const W = 210
const ML = 14
const MR = 14
const CW = W - ML - MR

const C = {
  primary: [30, 64, 175] as [number, number, number],
  danger: [220, 38, 38] as [number, number, number],
  warning: [217, 119, 6] as [number, number, number],
  success: [5, 150, 105] as [number, number, number],
  text: [31, 41, 55] as [number, number, number],
  textLight: [107, 114, 128] as [number, number, number],
  lightGray: [243, 244, 246] as [number, number, number],
  amber50: [255, 251, 235] as [number, number, number],
  amber700: [180, 83, 9] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
}

function newPage(doc: jsPDF): number {
  doc.addPage()
  return 20
}

function checkY(doc: jsPDF, y: number, needed = 20): number {
  if (y + needed > 275) return newPage(doc)
  return y
}

// ---------------------------------------------------------------------------
// Public entry point — returns base64 data URI
// ---------------------------------------------------------------------------
export function generatePenaltyPDF(
  input: BusinessInput,
  result: PenaltyExposureResult,
  businessName?: string
): string {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = 0

  // ── Cover / Header ────────────────────────────────────────────────────────
  doc.setFillColor(...C.primary)
  doc.rect(0, 0, W, 50, 'F')

  doc.setTextColor(...C.white)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('ComplianceCheck', ML, 18)

  doc.setFontSize(13)
  doc.setFont('helvetica', 'normal')
  doc.text('Compliance Penalty Exposure Report', ML, 27)

  doc.setFontSize(9)
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, ML, 35)
  doc.text('Rates current as of April 2026 | Not legal advice', ML, 41)

  y = 60

  // ── Business Summary Box ──────────────────────────────────────────────────
  doc.setFillColor(...C.lightGray)
  doc.rect(ML, y, CW, 30, 'F')
  doc.setTextColor(...C.text)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Business Profile', ML + 4, y + 7)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  if (businessName) {
    doc.text(cleanText(businessName), ML + 4, y + 14)
  }
  doc.text(`State: ${input.state}  |  Employees: ${input.employeeCount}  |  Industry: ${input.industry.toUpperCase()}`, ML + 4, y + 20)
  doc.text(
    `Annual Turnover: approx Rs.${input.annualTurnoverCr} Cr  |  Processes Personal Data: ${input.processesPersonalData ? 'Yes' : 'No'}  |  Women Employees: ${input.hasWomenEmployees ? 'Yes' : 'No'}`,
    ML + 4, y + 26
  )
  y += 38

  // ── Two-Number Hero ───────────────────────────────────────────────────────
  const colW = CW / 2 - 3
  // Typical risk box
  doc.setFillColor(239, 246, 255)
  doc.rect(ML, y, colW, 28, 'F')
  doc.setTextColor(...C.primary)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('TYPICAL ANNUAL RISK', ML + 4, y + 7)
  doc.setFontSize(18)
  doc.text(cleanText(formatRupees(result.totalTypicalRisk)), ML + 4, y + 18)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...C.textLight)
  doc.text('Probability-weighted estimate', ML + 4, y + 24)

  // Max exposure box
  const x2 = ML + colW + 6
  doc.setFillColor(254, 242, 242)
  doc.rect(x2, y, colW, 28, 'F')
  doc.setTextColor(...C.danger)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('MAXIMUM STATUTORY EXPOSURE', x2 + 4, y + 7)
  doc.setFontSize(18)
  doc.text(cleanText(formatRupees(result.totalMaxExposure)), x2 + 4, y + 18)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...C.textLight)
  doc.text('Statutory ceilings for applicable laws', x2 + 4, y + 24)
  y += 36

  if (result.hasCriminalRisk) {
    doc.setTextColor(...C.danger)
    doc.setFontSize(8)
    doc.text('* Criminal liability (imprisonment) also possible under EPF Section 14 and/or ESI Section 85.', ML, y)
    y += 6
  }

  // ── Disclaimer Box ────────────────────────────────────────────────────────
  y = checkY(doc, y, 30)
  doc.setFillColor(...C.amber50)
  doc.rect(ML, y, CW, 26, 'F')
  doc.setDrawColor(...C.warning)
  doc.rect(ML, y, CW, 26)
  doc.setTextColor(...C.amber700)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.text('DISCLAIMER', ML + 3, y + 6)
  doc.setFont('helvetica', 'normal')
  const disclaimer =
    'Estimates only. Maximum penalties are statutory ceilings; actual penalties are determined by ' +
    'adjudicating authorities based on case specifics. Typical risk figures are probability-weighted ' +
    'estimates, not predictions for your business. This is not legal advice. Consult a qualified ' +
    'compliance professional. Penalty rates current as of April 2026.'
  const lines = doc.splitTextToSize(cleanText(disclaimer), CW - 6)
  doc.text(lines, ML + 3, y + 12)
  y += 32

  // ── Risk Breakdown Table ──────────────────────────────────────────────────
  y = checkY(doc, y, 16)
  doc.setTextColor(...C.text)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Risk Breakdown by Law', ML, y)
  y += 8

  // Table header
  doc.setFillColor(...C.primary)
  doc.rect(ML, y, CW, 8, 'F')
  doc.setTextColor(...C.white)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('Law / Violation', ML + 2, y + 5.5)
  doc.text('Typical Annual Risk', ML + 95, y + 5.5)
  doc.text('Max Statutory', ML + 135, y + 5.5)
  doc.text('Reference', ML + 163, y + 5.5)
  y += 8

  let rowAlt = false
  for (const exposure of result.lawExposures) {
    if (exposure.typicalAnnualRisk === 0 && exposure.maxStatutoryPenalty === 0 && !exposure.isCriminal) continue
    y = checkY(doc, y, 12)
    if (rowAlt) {
      doc.setFillColor(249, 250, 251)
      doc.rect(ML, y, CW, 10, 'F')
    }
    rowAlt = !rowAlt
    doc.setTextColor(...C.text)
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.text(cleanText(exposure.law), ML + 2, y + 4)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...C.textLight)
    const vLines = doc.splitTextToSize(cleanText(exposure.violation), 88)
    doc.text(vLines[0], ML + 2, y + 8)
    doc.setTextColor(...C.primary)
    doc.setFont('helvetica', 'bold')
    doc.text(cleanText(formatRupees(exposure.typicalAnnualRisk)), ML + 95, y + 6)
    doc.setTextColor(...C.text)
    doc.setFont('helvetica', 'normal')
    const maxStr = exposure.isCriminal
      ? 'Criminal'
      : cleanText(formatRupees(exposure.maxStatutoryPenalty))
    doc.text(maxStr, ML + 135, y + 6)
    const refLines = doc.splitTextToSize(cleanText(exposure.governmentRef), 42)
    doc.text(refLines[0], ML + 163, y + 6)
    y += 10
  }
  y += 4

  // ── Top 5 Risks + Remediation ─────────────────────────────────────────────
  if (result.topRisks.length > 0) {
    y = checkY(doc, y, 20)
    doc.setTextColor(...C.text)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Top Priority Areas', ML, y)
    y += 8

    const remediation: Record<string, string> = {
      dpdp_security: 'Conduct a DPDP gap assessment; appoint a Data Protection Officer; implement access controls and encryption.',
      dpdp_breach_notification: 'Draft and test an incident response plan; ensure 72-hour notification capability to DPB.',
      dpdp_children: 'Map all data flows for children; implement verifiable parental consent mechanisms before processing.',
      dpdp_sdf: 'Register as Significant Data Fiduciary; complete DPIA; engage a DPDP auditor.',
      dpdp_rights: 'Build a Data Principal rights portal; automate erasure and correction workflows.',
      posh_no_icc: 'Constitute an Internal Committee with an external member; display IC details prominently at workplace.',
      posh_annual_return: 'File annual return to the District Officer by January 31 each year.',
      epf_late_payment: 'Automate EPF remittance by the 15th of every month; set up ECR auto-pay.',
      esi_late_payment: 'Automate ESI challan by the 15th; audit covered employee count quarterly.',
      code_on_wages: 'Audit all components against 50% basic wage rule; update payroll software for Code on Wages.',
      fssai_no_license: 'Apply for FSSAI State licence via FoSCoS portal; display licence at business premises.',
      factories_act: 'Register factory with state Inspector of Factories; ensure hazardous process permits are current.',
      osh_hazardous: 'Designate a safety officer; maintain safety committee; conduct quarterly inspections.',
      gratuity_non_payment: 'Set up gratuity trust or obtain Group Gratuity insurance; pay within 30 days of separation.',
      gst_late_filing: 'Enable auto-debit on GST portal for GSTR-3B; set calendar reminders before the 11th/20th.',
      companies_act_late_filing: 'Use MCA21 reminder service; file AOC-4, MGT-7 before October 31 each year.',
    }

    result.topRisks.forEach((risk, idx) => {
      y = checkY(doc, y, 22)
      doc.setFillColor(...C.lightGray)
      doc.rect(ML, y, CW, 18, 'F')
      doc.setTextColor(...C.primary)
      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'bold')
      doc.text(`${idx + 1}. ${cleanText(risk.law)} — ${cleanText(risk.violation)}`, ML + 3, y + 6)
      doc.setTextColor(...C.text)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      const rem = remediation[risk.id] ?? 'Review applicable legislation and consult a compliance professional.'
      const remLines = doc.splitTextToSize(cleanText(rem), CW - 6)
      doc.text(remLines.slice(0, 2), ML + 3, y + 12)
      y += 22
    })
  }

  // ── Footer on all pages ────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages()
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p)
    doc.setFillColor(249, 250, 251)
    doc.rect(0, 282, W, 15, 'F')
    doc.setTextColor(...C.textLight)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text('ComplianceCheck.co.in | This report is not legal advice.', ML, 289)
    doc.text(`Page ${p} of ${pageCount}`, W - MR - 20, 289)
  }

  return doc.output('datauristring')
}
