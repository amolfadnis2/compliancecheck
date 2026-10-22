/**
 * PF calculator URL/share-state decoding with zod (server side: page render,
 * share loading, server actions). A bad or missing value falls back to the
 * prototype default, so a hand-edited or stale URL always opens a working
 * calculator.
 */

import { z } from 'zod'
import { DEFAULT_STATE, KEYS, type PfState, type PfStateKey as Key } from './url-state'

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
}) satisfies z.ZodType<PfState>

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
  return normaliseState(out as unknown as PfState)
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
  return normaliseState(out as unknown as PfState)
}

/** Keep cross-field invariants a URL can't express (retire age above current age). */
function normaliseState(s: PfState): PfState {
  if (s.retirementAge <= s.age) return { ...s, retirementAge: Math.max(DEFAULT_STATE.retirementAge, s.age + 1) }
  return s
}

