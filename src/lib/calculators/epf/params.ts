/**
 * Maps statutory_params / epf_interest_rates rows into the engine's
 * StatutoryParams. Pure — shared by the Supabase loader and the fallback.
 */

import type { CeilingSegment, StatutoryParams } from './types'

export interface StatutoryParamRow {
  key: string
  value: Record<string, number>
  effective_from: string
  effective_to: string | null
  status: string
  source_name: string
  source_ref: string | null
  source_url: string | null
  verified_at: string
  notes: string | null
}

export interface EpfRateRow {
  fy: string
  rate: number | string
  status: 'recommended' | 'notified' | 'credited'
  cbt_meeting: string | null
  decided_on: string | null
  notified_on: string | null
  source_url: string | null
}

export interface LoadedEpfParams {
  params: StatutoryParams
  /** Raw rows — rendered as the methodology/sources table. */
  paramRows: StatutoryParamRow[]
  rateRows: EpfRateRow[]
  /** Latest verified_at (yyyy-mm-dd) across params rows. */
  verifiedAt: string
  fromFallback: boolean
}

const day = (s: string) => s.slice(0, 10)

/** Row in force on `onDate` for a key (latest effective_from wins). */
export function rowOn(rows: StatutoryParamRow[], key: string, onDate: string): StatutoryParamRow | undefined {
  return rows
    .filter((r) => r.key === key && day(r.effective_from) <= onDate && (!r.effective_to || day(r.effective_to) >= onDate))
    .sort((a, b) => (a.effective_from < b.effective_from ? 1 : -1))[0]
}

function schedule(rows: StatutoryParamRow[], key: string): CeilingSegment[] {
  return rows
    .filter((r) => r.key === key)
    .sort((a, b) => (a.effective_from < b.effective_from ? -1 : 1))
    .map((r) => ({
      from: day(r.effective_from),
      to: r.effective_to ? day(r.effective_to) : null,
      v: Number(r.value.amount),
      src: r.source_ref ?? r.source_name,
    }))
}

export class MissingParamError extends Error {
  constructor(public readonly key: string) {
    super(`Missing statutory param: ${key}`)
    this.name = 'MissingParamError'
  }
}

/** Build engine params. `onDate` picks the scalar rows in force (default: today). */
export function buildParams(
  paramRows: StatutoryParamRow[],
  rateRows: EpfRateRow[],
  onDate: string = new Date().toISOString().slice(0, 10)
): { params: StatutoryParams; verifiedAt: string } {
  const val = (key: string, field = 'amount'): number => {
    const row = rowOn(paramRows, key, onDate)
    const v = row ? Number(row.value[field]) : NaN
    if (!Number.isFinite(v)) throw new MissingParamError(key)
    return v
  }
  const sched = (key: string) => {
    const s = schedule(paramRows, key)
    if (s.length === 0) throw new MissingParamError(key)
    return s
  }
  const verifiedAt = paramRows.reduce((max, r) => (day(r.verified_at) > max ? day(r.verified_at) : max), '')

  const params: StatutoryParams = {
    version: verifiedAt,
    pfCeiling: sched('pf_wage_ceiling'),
    epsCeiling: sched('eps_wage_ceiling'),
    epsCeilingAlt: sched('eps_wage_ceiling_alt'),
    epsRate: val('eps_rate'),
    edliRate: val('edli_rate'),
    adminRate: val('admin_rate'),
    edliMin: val('edli_min'),
    edliMax: val('edli_max'),
    edliBonusCap: val('edli_bonus_cap'),
    taxThreshold: val('tax_interest_threshold', 'with_employer'),
    taxThresholdNoEmployer: val('tax_interest_threshold', 'without_employer'),
    employerCap: val('employer_cap'),
    epsMinPension: val('eps_min_pension'),
    sec80C: val('sec80c'),
    rates: Object.fromEntries(rateRows.map((r) => [r.fy, Number(r.rate)])),
    scenarios: {
      conservative: val('epf_rate_scenarios', 'conservative'),
      base: val('epf_rate_scenarios', 'base'),
      optimistic: val('epf_rate_scenarios', 'optimistic'),
    },
  }
  return { params, verifiedAt }
}
