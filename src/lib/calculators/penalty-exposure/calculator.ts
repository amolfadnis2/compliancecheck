import { PENALTY_RULES } from './rules'
import type { BusinessInput, LawExposure, PenaltyExposureResult, AssessmentKey } from './types'

// ---------------------------------------------------------------------------
// Probability weights (industry surveys + internal assessment data)
// Sources: CII-Protiviti India Risk Survey 2024, PwC DPDP Readiness Survey 2024
// ---------------------------------------------------------------------------
export const COMPLIANCE_GAP_RATES = {
  epf_late_payment: 0.35,
  esi_late_payment: 0.30,
  posh_no_icc: 0.42,
  posh_no_annual_return: 0.65,
  dpdp_security_gap: 0.84,          // PwC: only 16% claim DPDP readiness
  dpdp_breach_reporting_gap: 0.78,
  dpdp_rights_gap: 0.75,
  dpdp_children_gap: 0.80,
  dpdp_sdf_gap: 0.70,
  labour_code_wage_gap: 0.70,
  osh_hazardous_gap: 0.22,
  osh_standing_orders_gap: 0.18,
  gst_late_filing: 0.25,
  companies_act_filing: 0.30,
  fssai_lapse: 0.20,
  factories_act_lapse: 0.15,
  gratuity_gap: 0.15,
} as const

// Assumed average monthly wage for probability-weighted calculations
const AVG_MONTHLY_WAGE = 25_000
const EPF_WAGE_CEILING = 15_000
const ESI_GROSS_CEILING = 21_000

export function calculateEPFRisk(input: BusinessInput): { typical: number; max: number } {
  if (input.employeeCount < 20) return { typical: 0, max: 0 }
  const monthlyContribution = input.employeeCount * EPF_WAGE_CEILING * 0.24
  // One missed cycle: 1% damages + 1% interest = 2% of contribution per month
  const oneMissedCycleDamages = monthlyContribution * 0.02
  const typical = Math.round(oneMissedCycleDamages * COMPLIANCE_GAP_RATES.epf_late_payment * 12)
  // Max: 100% damages cap on full annual contribution arrears
  const annualContribution = monthlyContribution * 12
  const max = Math.round(annualContribution * 1.0)
  return { typical, max }
}

export function calculateESIRisk(input: BusinessInput): { typical: number; max: number } {
  if (input.employeeCount < 10) return { typical: 0, max: 0 }
  const monthlyContribution = input.employeeCount * Math.min(AVG_MONTHLY_WAGE, ESI_GROSS_CEILING) * 0.0325
  const avgDamagesRate = (0.05 + 0.25) / 2
  const typical = Math.round(
    monthlyContribution * avgDamagesRate * COMPLIANCE_GAP_RATES.esi_late_payment * 12
  )
  const max = Math.round(monthlyContribution * 0.25 * 12)
  return { typical, max }
}

export function calculatePOSHRisk(input: BusinessInput): { typical: number; max: number } {
  if (input.employeeCount < 10 || !input.hasWomenEmployees) return { typical: 0, max: 0 }
  const typical = Math.round(
    50_000 * COMPLIANCE_GAP_RATES.posh_no_icc +
    50_000 * COMPLIANCE_GAP_RATES.posh_no_annual_return
  )
  const max = 50_000 + 50_000
  return { typical, max }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculateLabourCodeRisk(input: BusinessInput): { typical: number; max: number } {
  const typical = Math.round(100_000 * COMPLIANCE_GAP_RATES.labour_code_wage_gap)
  return { typical, max: 100_000 }
}

export function calculateOSHHazardousRisk(input: BusinessInput): { typical: number; max: number } {
  if (input.industry !== 'manufacturing' && input.industry !== 'food') return { typical: 0, max: 0 }
  const typical = Math.round(500_000 * COMPLIANCE_GAP_RATES.osh_hazardous_gap)
  return { typical, max: 500_000 }
}

export function calculateOSHStandingOrdersRisk(input: BusinessInput): { typical: number; max: number } {
  if (input.employeeCount < 300) return { typical: 0, max: 0 }
  const typical = Math.round(200_000 * COMPLIANCE_GAP_RATES.osh_standing_orders_gap)
  return { typical, max: 200_000 }
}

export function calculateGratuityRisk(input: BusinessInput): { typical: number; max: number } {
  if (input.employeeCount < 10) return { typical: 0, max: 0 }
  const typical = Math.round(20_000 * COMPLIANCE_GAP_RATES.gratuity_gap)
  return { typical, max: 20_000 }
}

export function calculateDPDPSecurityRisk(input: BusinessInput): { typical: number; max: number } {
  if (!input.processesPersonalData) return { typical: 0, max: 0 }
  const baseRisk =
    input.annualTurnoverCr < 2 ? 100_000 :
    input.annualTurnoverCr < 10 ? 500_000 :
    input.annualTurnoverCr < 50 ? 2_500_000 :
    input.annualTurnoverCr < 500 ? 10_000_000 :
    50_000_000
  const typical = Math.round(baseRisk * COMPLIANCE_GAP_RATES.dpdp_security_gap)
  return { typical, max: 2_500_000_000 }
}

export function calculateDPDPBreachRisk(input: BusinessInput): { typical: number; max: number } {
  if (!input.processesPersonalData) return { typical: 0, max: 0 }
  const baseRisk =
    input.annualTurnoverCr < 2 ? 50_000 :
    input.annualTurnoverCr < 10 ? 250_000 :
    input.annualTurnoverCr < 50 ? 1_000_000 :
    input.annualTurnoverCr < 500 ? 5_000_000 :
    25_000_000
  const typical = Math.round(baseRisk * COMPLIANCE_GAP_RATES.dpdp_breach_reporting_gap)
  return { typical, max: 2_000_000_000 }
}

export function calculateDPDPChildrenRisk(input: BusinessInput): { typical: number; max: number } {
  if (input.industry !== 'edtech' && input.industry !== 'healthcare') return { typical: 0, max: 0 }
  const baseRisk = input.annualTurnoverCr < 10 ? 500_000 : 2_500_000
  const typical = Math.round(baseRisk * COMPLIANCE_GAP_RATES.dpdp_children_gap)
  return { typical, max: 2_000_000_000 }
}

export function calculateDPDPSDFRisk(input: BusinessInput): { typical: number; max: number } {
  if (!input.processesPersonalData || input.annualTurnoverCr < 500) return { typical: 0, max: 0 }
  const typical = Math.round(10_000_000 * COMPLIANCE_GAP_RATES.dpdp_sdf_gap)
  return { typical, max: 1_500_000_000 }
}

export function calculateDPDPRightsRisk(input: BusinessInput): { typical: number; max: number } {
  if (!input.processesPersonalData) return { typical: 0, max: 0 }
  const baseRisk =
    input.annualTurnoverCr < 2 ? 25_000 :
    input.annualTurnoverCr < 10 ? 100_000 :
    input.annualTurnoverCr < 50 ? 500_000 :
    2_000_000
  const typical = Math.round(baseRisk * COMPLIANCE_GAP_RATES.dpdp_rights_gap)
  return { typical, max: 500_000_000 }
}

export function calculateGSTRisk(input: BusinessInput): { typical: number; max: number } {
  if (input.annualTurnoverCr < 0.4) return { typical: 0, max: 0 }
  // 12 monthly GSTR-3B filings + 12 GSTR-1 filings per year
  const annualMaxPerReturn = 10_000
  const returnsPerYear = 24
  const typical = Math.round(annualMaxPerReturn * COMPLIANCE_GAP_RATES.gst_late_filing * returnsPerYear * 0.2)
  const max = annualMaxPerReturn * returnsPerYear
  return { typical, max }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculateCompaniesActRisk(input: BusinessInput): { typical: number; max: number } {
  // Rs.100/day for late forms; assume 3 filings/yr at 30-day average delay
  const typical = Math.round(100 * 30 * 3 * COMPLIANCE_GAP_RATES.companies_act_filing)
  const max = 100 * 365 * 3
  return { typical, max }
}

export function calculateFSSAIRisk(input: BusinessInput): { typical: number; max: number } {
  if (input.industry !== 'food') return { typical: 0, max: 0 }
  const typical = Math.round(500_000 * COMPLIANCE_GAP_RATES.fssai_lapse)
  return { typical, max: 500_000 }
}

export function calculateFactoriesActRisk(input: BusinessInput): { typical: number; max: number } {
  if (input.industry !== 'manufacturing' || input.employeeCount < 10) return { typical: 0, max: 0 }
  const typical = Math.round(1_000_000 * COMPLIANCE_GAP_RATES.factories_act_lapse)
  return { typical, max: 1_000_000 }
}

// ---------------------------------------------------------------------------
// Risk dispatcher — maps rule id → calculation function
// ---------------------------------------------------------------------------
function getRisk(ruleId: string, input: BusinessInput): { typical: number; max: number } {
  switch (ruleId) {
    case 'epf_late_payment': return calculateEPFRisk(input)
    case 'epf_wilful_default': return { typical: 0, max: 0 }  // criminal; no monetary estimate
    case 'esi_late_payment': return calculateESIRisk(input)
    case 'code_on_wages': return calculateLabourCodeRisk(input)
    case 'osh_hazardous': return calculateOSHHazardousRisk(input)
    case 'osh_standing_orders': return calculateOSHStandingOrdersRisk(input)
    case 'posh_no_icc': return { typical: Math.round(50_000 * COMPLIANCE_GAP_RATES.posh_no_icc), max: 50_000 }
    case 'posh_annual_return': return { typical: Math.round(50_000 * COMPLIANCE_GAP_RATES.posh_no_annual_return), max: 50_000 }
    case 'gratuity_non_payment': return calculateGratuityRisk(input)
    case 'dpdp_security': return calculateDPDPSecurityRisk(input)
    case 'dpdp_breach_notification': return calculateDPDPBreachRisk(input)
    case 'dpdp_children': return calculateDPDPChildrenRisk(input)
    case 'dpdp_sdf': return calculateDPDPSDFRisk(input)
    case 'dpdp_rights': return calculateDPDPRightsRisk(input)
    case 'gst_late_filing': return calculateGSTRisk(input)
    case 'companies_act_late_filing': return calculateCompaniesActRisk(input)
    case 'fssai_no_license': return calculateFSSAIRisk(input)
    case 'factories_act': return calculateFactoriesActRisk(input)
    default: return { typical: 0, max: 0 }
  }
}

// ---------------------------------------------------------------------------
// Main aggregator
// ---------------------------------------------------------------------------
export function calculateExposure(input: BusinessInput): PenaltyExposureResult {
  const lawExposures: LawExposure[] = PENALTY_RULES
    .filter((rule) => rule.appliesIf(input))
    .map((rule) => {
      const { typical, max } = getRisk(rule.id, input)
      const isCriminal = rule.maxStatutory === 'criminal'
      const statutoryMax = isCriminal ? 0 : (rule.maxStatutory ?? max)
      return {
        id: rule.id,
        law: rule.law,
        lawFullName: rule.lawFullName,
        violation: rule.violation,
        governmentRef: rule.governmentRef,
        typicalAnnualRisk: typical,
        maxStatutoryPenalty: typeof statutoryMax === 'number' ? statutoryMax : max,
        relatedAssessment: rule.relatedAssessment,
        isCriminal,
        note: rule.note,
      } satisfies LawExposure
    })

  const sorted = [...lawExposures].sort((a, b) => b.typicalAnnualRisk - a.typicalAnnualRisk)
  const hasCriminalRisk = lawExposures.some((l) => l.isCriminal)

  const seen = new Set<AssessmentKey>()
  const assessments: AssessmentKey[] = []
  for (const l of lawExposures
    .filter((l) => l.typicalAnnualRisk > 0 && l.relatedAssessment)
    .sort((a, b) => b.typicalAnnualRisk - a.typicalAnnualRisk)) {
    const key = l.relatedAssessment as AssessmentKey
    if (!seen.has(key)) {
      seen.add(key)
      assessments.push(key)
    }
  }

  return {
    totalMaxExposure: lawExposures.reduce((s, l) => s + l.maxStatutoryPenalty, 0),
    totalTypicalRisk: lawExposures.reduce((s, l) => s + l.typicalAnnualRisk, 0),
    lawExposures: sorted,
    topRisks: sorted.filter((l) => l.typicalAnnualRisk > 0).slice(0, 5),
    recommendedAssessments: assessments.slice(0, 4),
    hasCriminalRisk,
  }
}

// ---------------------------------------------------------------------------
// Formatting helpers (shared across UI + PDF)
// ---------------------------------------------------------------------------
export function formatRupees(amount: number): string {
  if (amount >= 1_00_00_00_000) {
    return `₹${(amount / 1_00_00_00_000).toFixed(0)} Cr`
  }
  if (amount >= 1_00_00_000) {
    const cr = amount / 1_00_00_000
    return `₹${cr >= 10 ? cr.toFixed(0) : cr.toFixed(1)} Cr`
  }
  if (amount >= 1_00_000) {
    const lakh = amount / 1_00_000
    return `₹${lakh >= 10 ? lakh.toFixed(0) : lakh.toFixed(1)}L`
  }
  return `₹${amount.toLocaleString('en-IN')}`
}

export function formatRupeesLong(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}
