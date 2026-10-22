/**
 * PF calculator UI state <-> URL query.
 *
 * Every field is validated with zod; a bad or missing value falls back to the
 * prototype default, so a hand-edited or stale URL always opens a working
 * calculator. Only non-default values are written, keeping links short.
 * `s` is reserved for share slugs.
 */

import { z } from 'zod'
import type { ProjectInput } from './types'

export const pfStateSchema = z.object({
  age: z.number().int().min(18).max(57),
  retirementAge: z.number().int().min(19).max(60),
  basic: z.number().min(0).max(1e8),
  hikePct: z.number().min(0).max(20),
  stepUpMonth: z.number().int().min(1).max(12),
  opening: z.number().min(0).max(1e10),
  vpfPct: z.number().int().min(0).max(50),
  scenario: z.enum(['conservative', 'base', 'optimistic', 'custom']),
  customRate: z.number().min(0).max(20),
  inflationPct: z.number().min(0).max(10),
  basis: z.enum(['capped', 'actual']),
  epsMember: z.boolean(),
  pastEpsYears: z.number().min(0).max(40),
  reduced: z.boolean(),
  labourCode: z.boolean(),
  allowances: z.number().min(0).max(1e8),
  epsCeilingReading: z.enum(['25000', '15000']),
  interestTiming: z.enum(['next_month', 'same_month']),
  taxRegime: z.enum(['new', 'old']),
  slabPct: z.union([z.literal(0), z.literal(5), z.literal(10), z.literal(15), z.literal(20), z.literal(30)]),
  view: z.enum(['nominal', 'real']),
})

export type PfState = z.infer<typeof pfStateSchema>

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
  basis: 'capped',
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

type Key = keyof PfState

/** Short query keys. */
const KEYS: Record<Key, string> = {
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

function decodeValue(key: Key, raw: string): unknown {
  const def = DEFAULT_STATE[key]
  if (typeof def === 'boolean') return raw === '1' ? true : raw === '0' ? false : undefined
  if (typeof def === 'number') {
    const n = Number(raw)
    return raw.trim() !== '' && Number.isFinite(n) ? n : undefined
  }
  return raw
}

/** Read state from a query (URLSearchParams or a Next.js searchParams record). */
export function decodeState(query: URLSearchParams | Record<string, string | string[] | undefined>): PfState {
  const get = (k: string): string | undefined => {
    if (query instanceof URLSearchParams) return query.get(k) ?? undefined
    const v = query[k]
    return Array.isArray(v) ? v[0] : v
  }
  const out: Record<string, unknown> = { ...DEFAULT_STATE }
  const shape = pfStateSchema.shape
  for (const key of Object.keys(KEYS) as Key[]) {
    const raw = get(KEYS[key])
    if (raw == null) continue
    const parsed = shape[key].safeParse(decodeValue(key, raw))
    if (parsed.success) out[key] = parsed.data
  }
  return normaliseState(out as PfState)
}

/** Validate a whole state object (e.g. from a share row); unknown/invalid fields fall back to defaults. */
export function coerceState(input: unknown): PfState {
  const obj = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const out: Record<string, unknown> = { ...DEFAULT_STATE }
  const shape = pfStateSchema.shape
  for (const key of Object.keys(KEYS) as Key[]) {
    const parsed = shape[key].safeParse(obj[key])
    if (parsed.success) out[key] = parsed.data
  }
  return normaliseState(out as PfState)
}

/** Keep cross-field invariants a URL can't express (retire age above current age). */
function normaliseState(s: PfState): PfState {
  if (s.retirementAge <= s.age) return { ...s, retirementAge: Math.max(DEFAULT_STATE.retirementAge, s.age + 1) }
  return s
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
