export type IndustryType =
  | 'it'
  | 'manufacturing'
  | 'food'
  | 'retail'
  | 'healthcare'
  | 'edtech'
  | 'financial'
  | 'other'

export type TurnoverBand =
  | 'lt40L'
  | '40L-2cr'
  | '2-10cr'
  | '10-50cr'
  | '50-500cr'
  | '500cr+'

export type AssessmentKey =
  | 'statutory-health-check'
  | 'labour-code-readiness'
  | 'dpdp-gap-assessment'
  | 'posh-compliance'
  | 'state-wise-compliance'
  | 'food-business'

export interface BusinessInput {
  state: string
  employeeCount: number
  industry: IndustryType
  annualTurnoverCr: number
  processesPersonalData: boolean
  hasWomenEmployees: boolean
}

export interface PenaltyRule {
  id: string
  law: string
  lawFullName?: string
  violation: string
  appliesIf: (input: BusinessInput) => boolean
  governmentRef: string
  officialLink?: string
  interestRate?: number
  damagesRate?: number
  damagesCap?: number
  karnatakaHCFloor?: number
  damagesRateMin?: number
  damagesRateMax?: number
  maxStatutory: number | 'criminal' | null
  perDayPenalty?: number
  perDayCap?: number
  note?: string
  relatedAssessment: AssessmentKey | null
}

export interface LawExposure {
  id: string
  law: string
  lawFullName?: string
  violation: string
  governmentRef: string
  typicalAnnualRisk: number
  maxStatutoryPenalty: number
  relatedAssessment: AssessmentKey | null
  isCriminal: boolean
  note?: string
}

export interface PenaltyExposureResult {
  totalMaxExposure: number
  totalTypicalRisk: number
  lawExposures: LawExposure[]
  topRisks: LawExposure[]
  recommendedAssessments: AssessmentKey[]
  hasCriminalRisk: boolean
}

export const TURNOVER_BAND_LABELS: Record<TurnoverBand, string> = {
  'lt40L': 'Less than ₹40L',
  '40L-2cr': '₹40L – 2 Cr',
  '2-10cr': '₹2 – 10 Cr',
  '10-50cr': '₹10 – 50 Cr',
  '50-500cr': '₹50 – 500 Cr',
  '500cr+': '₹500 Cr+',
}

export const TURNOVER_BAND_TO_CR: Record<TurnoverBand, number> = {
  'lt40L': 0.2,
  '40L-2cr': 1.0,
  '2-10cr': 5.0,
  '10-50cr': 25.0,
  '50-500cr': 150.0,
  '500cr+': 750.0,
}

export const EMPLOYEE_SNAP_POINTS = [1, 5, 10, 20, 50, 100, 250, 500] as const

export const INDUSTRY_OPTIONS: Array<{ value: IndustryType; label: string }> = [
  { value: 'it', label: 'IT / ITeS' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'food', label: 'Food / FBO' },
  { value: 'retail', label: 'Retail' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'edtech', label: 'EdTech' },
  { value: 'financial', label: 'Financial Services' },
  { value: 'other', label: 'Other' },
]
