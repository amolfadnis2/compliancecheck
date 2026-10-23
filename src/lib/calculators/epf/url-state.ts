/**
 * PF calculator UI state -> URL query (client-safe, no zod).
 *
 * Only non-default values are written, keeping links short. `s` is reserved
 * for share slugs. Decoding/validation (zod) lives in ./url-state-schema.ts,
 * which runs on the server.
 */

import type { ProjectInput } from './types'

export interface PfState {
  age: number
  retirementAge: number
  basic: number
  hikePct: number
  stepUpMonth: number
  opening: number
  vpfPct: number
  scenario: 'conservative' | 'base' | 'optimistic' | 'custom'
  customRate: number
  inflationPct: number
  basis: 'capped' | 'actual'
  epsMember: boolean
  pastEpsYears: number
  reduced: boolean
  labourCode: boolean
  allowances: number
  epsCeilingReading: '25000' | '15000'
  interestTiming: 'next_month' | 'same_month'
  taxRegime: 'new' | 'old'
  slabPct: 0 | 5 | 10 | 15 | 20 | 30
  view: 'nominal' | 'real'
}

/** Prototype defaults (docs/prototypes/pf-calculator.html). */
export const DEFAULT_STATE: PfState = {
  age: 28,
  retirementAge: 58,
  basic: 40000,
  hikePct: 8,
  stepUpMonth: 4,
  opening: 200000,
  vpfPct: 0,
  scenario: 'base',
  customRate: 8,
  inflationPct: 6,
  basis: 'actual',
  epsMember: true,
  pastEpsYears: 4,
  reduced: false,
  labourCode: false,
  allowances: 60000,
  epsCeilingReading: '25000',
  interestTiming: 'next_month',
  taxRegime: 'new',
  slabPct: 30,
  view: 'nominal',
}

export type PfStateKey = keyof PfState
type Key = PfStateKey

/** Short query keys. */
export const KEYS: Record<Key, string> = {
  age: 'a',
  retirementAge: 'r',
  basic: 'b',
  hikePct: 'h',
  stepUpMonth: 'm',
  opening: 'o',
  vpfPct: 'v',
  scenario: 'sc',
  customRate: 'cr',
  inflationPct: 'i',
  basis: 'bs',
  epsMember: 'e',
  pastEpsYears: 'pe',
  reduced: 'rd',
  labourCode: 'lc',
  allowances: 'al',
  epsCeilingReading: 'er',
  interestTiming: 't',
  taxRegime: 'tr',
  slabPct: 'sl',
  view: 'vw',
}

function encodeValue(v: PfState[Key]): string {
  if (typeof v === 'boolean') return v ? '1' : '0'
  return String(v)
}

/** Query string with only the non-default fields (no leading '?'). */
export function encodeState(state: PfState): string {
  const params = new URLSearchParams()
  for (const key of Object.keys(KEYS) as Key[]) {
    if (state[key] !== DEFAULT_STATE[key]) params.set(KEYS[key], encodeValue(state[key]))
  }
  return params.toString()
}

/** First projected month: the month after `today` (as the prototype does). */
export function startMonthAfter(today: Date): { startY: number; startM: number } {
  let y = today.getFullYear()
  let m = today.getMonth() + 2
  if (m > 12) {
    m = 1
    y++
  }
  return { startY: y, startM: m }
}

/** UI state → engine input. Inputs are passed through as typed; the engine schema validates them. */
export function toProjectInput(s: PfState, start: { startY: number; startM: number }): ProjectInput {
  return {
    age: s.age,
    retirementAge: s.retirementAge,
    startY: start.startY,
    startM: start.startM,
    basic: s.basic,
    allowances: s.labourCode ? s.allowances : 0,
    hikePct: s.hikePct,
    stepUpMonth: s.stepUpMonth,
    opening: s.opening,
    vpfPct: s.vpfPct,
    scenario: s.scenario,
    customRate: s.customRate,
    inflationPct: s.inflationPct,
    basis: s.basis,
    epsMember: s.epsMember,
    pastEpsYears: s.pastEpsYears,
    contributionRate: s.reduced ? 0.1 : 0.12,
    labourCode: s.labourCode,
    epsCeilingReading: s.epsCeilingReading,
    interestTiming: s.interestTiming,
    taxRegime: s.taxRegime,
    slabPct: s.slabPct,
    rounding: 'rupee',
  }
}
