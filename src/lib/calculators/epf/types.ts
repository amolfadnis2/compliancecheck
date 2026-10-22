/**
 * EPF forecast engine — input/output types and typed error codes.
 *
 * Pure module: no React, DOM, Supabase or zod imports. Statutory values are never
 * declared here; they arrive at runtime as a StatutoryParams object (loaded
 * from Supabase, or the fallback in ./defaults.ts).
 */

export const ENGINE_VERSION = '1.0.0'

// ---------------------------------------------------------------------------
// Statutory params (injected)
// ---------------------------------------------------------------------------

/** A date-effective wage ceiling. Dates are ISO yyyy-mm-dd, `to` inclusive. */
export interface CeilingSegment {
  from: string
  to: string | null
  v: number
  src?: string
}

export interface StatutoryParams {
  /** Identifies the params snapshot (latest verified date); logged with every result. */
  version: string
  /** PF wage ceiling schedule (S.O. 5109(E) change on 17 Sep 2026). */
  pfCeiling: CeilingSegment[]
  /** EPS wage ceiling schedule for the primary reading (₹25,000 from 17 Sep 2026). */
  epsCeiling: CeilingSegment[]
  /** EPS wage ceiling schedule for the alternative G.S.R. 890(E) reading (₹15,000). */
  epsCeilingAlt: CeilingSegment[]
  epsRate: number
  edliRate: number
  adminRate: number
  edliMin: number
  edliMax: number
  edliBonusCap: number
  /** Own-contribution threshold above which interest is taxable (employer contributes). */
  taxThreshold: number
  /** Same threshold where the employer doesn't contribute. */
  taxThresholdNoEmployer: number
  /** Annual employer contribution (PF + EPS) above which the excess is a perquisite. */
  employerCap: number
  epsMinPension: number
  sec80C: number
  /** Declared EPF rates by FY ('2025-26' → 8.25). Percent. */
  rates: Record<string, number>
  /** Future-rate scenarios (assumptions, not statutory). Percent. */
  scenarios: { conservative: number; base: number; optimistic: number }
}

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

export const SCENARIO_KEYS = ['conservative', 'base', 'optimistic', 'custom'] as const
export type Scenario = (typeof SCENARIO_KEYS)[number]

/**
 * Engine input. The engine itself is permissive (goldens exercise edge values
 * such as basic = 0); business rules live in ./rules.ts and the zod schema in
 * ./schema.ts (server/URL boundary) — kept apart so the client bundle has no zod.
 */
export interface ProjectInput {
  age: number
  retirementAge: number
  /** First projected month (calendar year / month 1-12). */
  startY: number
  startM: number
  basic: number
  allowances?: number
  hikePct: number
  stepUpMonth: number
  opening?: number
  basis: 'capped' | 'actual'
  contributionRate?: 0.12 | 0.1
  epsMember: boolean
  pastEpsYears?: number
  labourCode?: boolean
  vpfPct?: number
  interestTiming: 'next_month' | 'same_month'
  scenario: Scenario
  customRate: number
  inflationPct?: number
  taxRegime: 'new' | 'old'
  slabPct?: number
  rounding?: 'rupee' | 'paise'
  epsCeilingReading: '25000' | '15000'
  /** Explicit FY → rate overrides (percent). */
  ratePath?: Record<string, number>
  /** Use declared historical rates where available (default true). */
  useHistorical?: boolean
}

/** Validated input with defaults applied. */
export type EpfInput = ProjectInput &
  Required<Pick<ProjectInput, 'allowances' | 'opening' | 'contributionRate' | 'pastEpsYears' | 'labourCode' | 'vpfPct' | 'inflationPct' | 'slabPct' | 'rounding'>>

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export type EpfErrorCode =
  | 'INVALID_AGE'
  | 'INVALID_RETIREMENT_AGE'
  | 'INVALID_BASIC'
  | 'INVALID_CUSTOM_RATE'
  | 'INVALID_INPUT'
  | 'NO_CEILING_FOR_DATE'
  | 'NO_RATE_FOR_FY'

export class EpfEngineError extends Error {
  constructor(
    public readonly code: EpfErrorCode,
    message: string,
    public readonly field?: string
  ) {
    super(message)
    this.name = 'EpfEngineError'
  }
}

export interface EpfFieldError {
  code: EpfErrorCode
  field: string
  message: string
}

export type EpfValidationResult =
  | { ok: true; value: EpfInput }
  | { ok: false; errors: EpfFieldError[] }

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------

export interface FirstMonth {
  pfWage: number
  cw: number
  ee: number
  vpf: number
  eps: number
  erTot: number
  erEpf: number
  edli: number
  admin: number
  empCost: number
}

export interface YearRow {
  fy: string
  age: number
  pfWage: number
  ee: number
  vpf: number
  erEpf: number
  eps: number
  interest: number
  rate: number
  closing: number
  real: number
  cumOwn: number
  cumEr: number
  cumInt: number
  taxableInt: number
  empCost: number
}

export interface ProjectionFlags {
  capFreeze: boolean
  taxThresholdFY: string | null
  employerCapFY: string | null
  notEpsEligible: boolean
}

export interface ProjectionResult {
  rows: YearRow[]
  months: number
  years: number
  corpus: number
  realCorpus: number
  postTax: number
  taxOnInterest: number
  totals: { ee: number; vpf: number; erEpf: number; eps: number; interest: number; own: number }
  xirrCorpus: number | null
  xirrOwn: number | null
  realXirr: number | null
  moneyMultiple: number | null
  pension: number | null
  pensionNote: string
  edliCover: number | null
  first: FirstMonth | null
  flags: ProjectionFlags
  engineMs: number
}

export interface EpsPensionResult {
  pension: number | null
  note: string
}
