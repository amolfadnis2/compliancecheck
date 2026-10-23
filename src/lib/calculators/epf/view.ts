/**
 * Presentation helpers for the PF calculator — copy, formatting, sources and
 * CSV. Pure (no React/DOM). Wording follows the approved prototype; every
 * statutory number is read from StatutoryParams / params rows, never typed in.
 */

import type { ProjectionResult, StatutoryParams, YearRow } from './types'
import type { EpfRateRow, StatutoryParamRow } from './params'
import type { PfState } from './url-state'

// ---------------------------------------------------------------------------
// Formatting (Indian grouping)
// ---------------------------------------------------------------------------

export const inr = (n: number): string => '₹' + Math.round(n).toLocaleString('en-IN')

export function compact(n: number): string {
  const a = Math.abs(n)
  if (a >= 1e7) return '₹' + (n / 1e7).toFixed(2) + ' Cr'
  if (a >= 1e5) return '₹' + (n / 1e5).toFixed(2) + ' L'
  return inr(n)
}

export const pct = (x: number | null, d = 1): string => (x == null ? '—' : (x * 100).toFixed(d) + '%')

/** ₹2,50,000 → "₹2.5 lakh". */
export function lakh(n: number): string {
  const v = n / 1e5
  return `₹${Number.isInteger(v) ? v : Number(v.toFixed(2))} lakh`
}

/** Rate in percent → "8.25%". */
export const ratePct = (r: number): string => `${r.toFixed(2)}%`

/** 0.0833 → "8.33%". */
export const sharePct = (x: number): string => `${Number((x * 100).toFixed(2))}%`

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** '2026-09-17' → '17 Sep 2026'. */
export function fmtDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

// ---------------------------------------------------------------------------
// Params-derived facts used in copy
// ---------------------------------------------------------------------------

export interface PfFacts {
  ceiling: number
  ceilingFrom: string
  previousCeiling: number
  maxEe: number
  previousMaxEe: number
  latestFy: string
  latestRate: number
  latestRateRow: EpfRateRow | undefined
  epsShare: string
  taxThreshold: number
  taxThresholdNoEmployer: number
  employerCap: number
  epsMinPension: number
  sec80c: number
  edliMin: number
  edliMax: number
  edliBonusCap: number
  epsAlt: number
  epsPrimarySrc: string
  epsAltSrc: string
}

export function factsFrom(params: StatutoryParams, rateRows: EpfRateRow[]): PfFacts {
  const pf = params.pfCeiling
  const latest = pf[pf.length - 1]
  const previous = pf.length > 1 ? pf[pf.length - 2] : latest
  const fys = Object.keys(params.rates).sort()
  const latestFy = fys[fys.length - 1]
  const eps = params.epsCeiling
  return {
    ceiling: latest.v,
    ceilingFrom: latest.from,
    previousCeiling: previous.v,
    maxEe: Math.round(latest.v * 0.12),
    previousMaxEe: Math.round(previous.v * 0.12),
    latestFy,
    latestRate: params.rates[latestFy],
    latestRateRow: rateRows.find((r) => r.fy === latestFy),
    epsShare: sharePct(params.epsRate),
    taxThreshold: params.taxThreshold,
    taxThresholdNoEmployer: params.taxThresholdNoEmployer,
    employerCap: params.employerCap,
    epsMinPension: params.epsMinPension,
    sec80c: params.sec80C,
    edliMin: params.edliMin,
    edliMax: params.edliMax,
    edliBonusCap: params.edliBonusCap,
    epsAlt: params.epsCeilingAlt[params.epsCeilingAlt.length - 1].v,
    epsPrimarySrc: eps[eps.length - 1].src ?? '',
    epsAltSrc: params.epsCeilingAlt[params.epsCeilingAlt.length - 1].src ?? '',
  }
}

/** "FY 2025-26" label for a FY key. */
export const fyLabel = (fy: string) => `FY ${fy}`

export function scenarioLabel(key: 'conservative' | 'base' | 'optimistic' | 'custom', params: StatutoryParams, customRate: number): string {
  return key === 'custom' ? `At ${customRate.toFixed(2)}%` : `At ${ratePct(params.scenarios[key])}`
}

// ---------------------------------------------------------------------------
// Results copy
// ---------------------------------------------------------------------------

export interface Headline {
  ageEnd: number
  corpus: string
  realCorpus: string
  multiple: string | null
  xirrOwn: string
}

export function headline(res: ProjectionResult, retirementAge: number): Headline {
  return {
    ageEnd: retirementAge,
    corpus: compact(res.corpus),
    realCorpus: compact(res.realCorpus),
    multiple: res.moneyMultiple == null ? null : `₹${res.moneyMultiple.toFixed(1)}`,
    xirrOwn: pct(res.xirrOwn),
  }
}

/** Plain-text headline (PDF, aria). */
export function headlineText(h: Headline): string {
  const first = `By ${h.ageEnd}, your PF could grow to ${h.corpus}, which is ${h.realCorpus} in today’s money.`
  return h.multiple ? `${first} Every ₹1 you put in becomes ${h.multiple}, a return of ${h.xirrOwn} a year on your own money.` : first
}

export function stats(res: ProjectionResult): { value: string; label: string }[] {
  return [
    { value: pct(res.xirrCorpus, 2), label: 'Effective PF return' },
    { value: pct(res.realXirr), label: 'Your return after inflation' },
    { value: compact(res.totals.own), label: 'Total you put in' },
    { value: compact(res.totals.interest), label: 'Interest earned' },
  ]
}

export type CalloutId = 'cap_freeze' | 'tax_threshold' | 'employer_cap' | 'eps_stops'

export interface Callout {
  id: CalloutId
  title: string
  body: string
}

export function callouts(res: ProjectionResult, state: PfState, facts: PfFacts): Callout[] {
  const out: Callout[] = []
  if (res.flags.capFreeze && res.first) {
    out.push({
      id: 'cap_freeze',
      title: 'Your salary hikes won’t raise your statutory PF.',
      body: `Your employer caps PF at the ${inr(facts.ceiling)} ceiling, so you and your employer each put in ${inr(res.first.ee - res.first.vpf)} a month however much your Basic rises. Switch to “Full Basic” above to see the difference, or add VPF.`,
    })
  }
  if (res.flags.taxThresholdFY) {
    out.push({
      id: 'tax_threshold',
      title: `Part of your interest becomes taxable from FY ${res.flags.taxThresholdFY}.`,
      body: `Your own contributions cross ${lakh(facts.taxThreshold)} a year. Estimated tax on that interest by retirement: ${compact(res.taxOnInterest)}, leaving ${compact(res.postTax)}.`,
    })
  }
  if (res.flags.employerCapFY) {
    out.push({
      id: 'employer_cap',
      title: `Employer contributions exceed ${lakh(facts.employerCap)} a year from FY ${res.flags.employerCapFY}.`,
      body: 'The excess, plus returns on it, is taxed as a perquisite. That isn’t deducted in this estimate.',
    })
  }
  if (state.retirementAge > 58) {
    out.push({
      id: 'eps_stops',
      title: 'EPS stops at 58.',
      body: `From then until ${state.retirementAge}, your employer’s full 12% goes to your PF.`,
    })
  }
  return out
}

export function employerCostNote(res: ProjectionResult): string {
  if (!res.first) return ''
  const f = res.first
  return `${inr(f.erTot)} PF/EPS + ${inr(f.edli)} EDLI + ${inr(f.admin)} admin today. That’s ${compact(f.empCost * 12)} a year, before hikes.`
}

// ---------------------------------------------------------------------------
// Chart data
// ---------------------------------------------------------------------------

export interface ChartPoint {
  label: string
  age: number
  fy: string
  own: number
  er: number
  int: number
  total: number
}

export function chartPoints(rows: YearRow[], real: boolean): ChartPoint[] {
  return rows.map((r) => {
    const f = r.closing ? (real ? r.real / r.closing : 1) : 1
    return {
      label: String(r.age),
      age: r.age,
      fy: r.fy,
      own: r.cumOwn * f,
      er: r.cumEr * f,
      int: Math.max(0, r.closing - r.cumOwn - r.cumEr) * f,
      total: r.closing * f,
    }
  })
}

// ---------------------------------------------------------------------------
// Year table + CSV
// ---------------------------------------------------------------------------

export const TABLE_HEADERS = [
  'Year',
  'Age',
  'Rate',
  'PF wage / month',
  'You (incl. VPF)',
  'Employer to PF',
  'To EPS',
  'Interest',
  'Balance',
  'In today’s ₹',
] as const

export function tableRow(r: YearRow): string[] {
  return [
    `FY ${r.fy}`,
    String(r.age),
    `${r.rate.toFixed(2)}%`,
    inr(r.pfWage),
    inr(r.ee + r.vpf),
    inr(r.erEpf),
    inr(r.eps),
    inr(r.interest),
    inr(r.closing),
    inr(r.real),
  ]
}

const csvCell = (v: string | number) => {
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** CSV with raw numbers (no ₹ / grouping) so it opens cleanly in spreadsheets. */
export function yearTableCsv(rows: YearRow[], meta: { engineVersion: string; paramsVersion: string }): string {
  const header = ['FY', 'Age', 'Rate %', 'PF wage per month', 'You incl VPF', 'Employer to PF', 'To EPS', 'Interest', 'Balance', "In today's money"]
  const lines = rows.map((r) =>
    [r.fy, r.age, r.rate.toFixed(2), Math.round(r.pfWage), Math.round(r.ee + r.vpf), Math.round(r.erEpf), Math.round(r.eps), Math.round(r.interest), Math.round(r.closing), Math.round(r.real)]
      .map(csvCell)
      .join(',')
  )
  const note = `# ComplianceCheck PF calculator - engine ${meta.engineVersion}, params ${meta.paramsVersion}. Estimates only; future rates are assumptions.`
  return [note, header.map(csvCell).join(','), ...lines].join('\n') + '\n'
}

// ---------------------------------------------------------------------------
// Sources (methodology table) — rendered from params rows
// ---------------------------------------------------------------------------

export interface SourceRow {
  value: string
  used: string
  source: string
  effective: string
  verified: string
}

const LABELS: Record<string, string> = {
  pf_wage_ceiling: 'PF wage ceiling',
  eps_wage_ceiling: 'EPS wage ceiling',
  eps_wage_ceiling_alt: 'EPS wage ceiling (alternative reading)',
  eps_rate: 'EPS share of employer 12%',
  edli_rate: 'EDLI charge',
  admin_rate: 'Admin charge',
  edli_min: 'EDLI cover, minimum',
  edli_max: 'EDLI cover, maximum',
  edli_bonus_cap: 'EDLI balance-linked component, cap',
  tax_interest_threshold: 'Taxable interest threshold',
  employer_cap: 'Employer contribution tax cap',
  eps_min_pension: 'EPS minimum pension',
  sec80c: 'Section 80C limit',
  epf_rate_scenarios: 'Future-rate scenarios',
}

function rowValue(r: StatutoryParamRow): string {
  const v = r.value
  switch (r.key) {
    case 'eps_rate':
    case 'edli_rate':
    case 'admin_rate':
      return sharePct(Number(v.amount))
    case 'tax_interest_threshold':
      return `${lakh(Number(v.with_employer))} of own contributions a year (${lakh(Number(v.without_employer))} if the employer doesn’t contribute)`
    case 'epf_rate_scenarios':
      return `${ratePct(Number(v.conservative))} / ${ratePct(Number(v.base))} / ${ratePct(Number(v.optimistic))}`
    case 'eps_min_pension':
      return `${inr(Number(v.amount))} a month`
    default:
      return Number(v.amount) >= 1e5 ? lakh(Number(v.amount)) : inr(Number(v.amount))
  }
}

function effective(from: string, to: string | null): string {
  const f = from.slice(0, 10)
  if (f <= '1901-01-01') return to ? `to ${fmtDate(to)}` : 'in force'
  return to ? `${fmtDate(f)} to ${fmtDate(to)}` : `from ${fmtDate(f)}`
}

export function sourceRows(paramRows: StatutoryParamRow[], rateRows: EpfRateRow[], state: PfState, params: StatutoryParams): SourceRow[] {
  const sorted = [...paramRows].sort((a, b) =>
    a.key === b.key ? (a.effective_from < b.effective_from ? -1 : 1) : Object.keys(LABELS).indexOf(a.key) - Object.keys(LABELS).indexOf(b.key)
  )
  const rows: SourceRow[] = []

  const latest = [...rateRows].sort((a, b) => (a.fy < b.fy ? 1 : -1))[0]
  if (latest) {
    const detail = [latest.cbt_meeting, latest.decided_on && fmtDate(latest.decided_on)].filter(Boolean).join(', ')
    const notified = latest.notified_on ? `; EPFO crediting circular, ${fmtDate(latest.notified_on)}` : ''
    rows.push({
      value: `EPF interest rate FY ${latest.fy}`,
      used: ratePct(Number(latest.rate)),
      source: `${detail || 'EPFO'}${notified}`,
      effective: `FY ${latest.fy} (${latest.status})`,
      verified: '',
    })
    const past = rateRows.filter((r) => r.fy !== latest.fy).map((r) => Number(r.rate))
    if (past.length) {
      const fys = rateRows.filter((r) => r.fy !== latest.fy).map((r) => r.fy).sort()
      rows.push({
        value: `Past rates FY ${fys[0]} to ${fys[fys.length - 1]}`,
        used: `${ratePct(Math.min(...past))} to ${ratePct(Math.max(...past))}`,
        source: 'EPFO declared rates',
        effective: 'credited',
        verified: '',
      })
    }
  }

  for (const r of sorted) {
    const selected =
      (r.key === 'eps_wage_ceiling' && state.epsCeilingReading === '25000') ||
      (r.key === 'eps_wage_ceiling_alt' && state.epsCeilingReading === '15000')
    rows.push({
      value: `${LABELS[r.key] ?? r.key}${selected && !r.effective_to ? ' (selected)' : ''}`,
      used: rowValue(r),
      source: [r.source_ref ?? r.source_name, r.status === 'under_clarification' ? 'under clarification' : null].filter(Boolean).join(' — ') + (r.notes && r.status !== 'superseded' ? `. ${r.notes}` : ''),
      effective: effective(r.effective_from, r.effective_to),
      verified: fmtDate(r.verified_at),
    })
  }

  const future =
    state.scenario === 'custom' ? state.customRate : params.scenarios[state.scenario]
  rows.push({ value: 'Future rate (your choice)', used: ratePct(future), source: 'Assumption', effective: 'future years', verified: '' })
  return rows
}

// ---------------------------------------------------------------------------
// Analytics bands (never send exact salary or corpus)
// ---------------------------------------------------------------------------

export const salaryBand = (b: number): string =>
  b < 15000 ? '<15k' : b < 25000 ? '15k-25k' : b < 50000 ? '25k-50k' : b < 100000 ? '50k-1L' : '1L+'

export const corpusBand = (c: number): string =>
  c < 1e6 ? '<10L' : c < 5e6 ? '10L-50L' : c < 1e7 ? '50L-1Cr' : c < 5e7 ? '1Cr-5Cr' : '5Cr+'

export interface ResultsSummary {
  years: number
  corpus_band: string
  xirr_corpus: number | null
  xirr_own: number | null
  pension_eligible: boolean
  tax_threshold_hit: boolean
  cap_freeze: boolean
  engine_ms: number
}

export function resultsSummary(res: ProjectionResult): ResultsSummary {
  return {
    years: res.years,
    corpus_band: corpusBand(res.corpus),
    xirr_corpus: res.xirrCorpus == null ? null : +(res.xirrCorpus * 100).toFixed(2),
    xirr_own: res.xirrOwn == null ? null : +(res.xirrOwn * 100).toFixed(2),
    pension_eligible: res.pension != null,
    tax_threshold_hit: !!res.flags.taxThresholdFY,
    cap_freeze: res.flags.capFreeze,
    engine_ms: +res.engineMs.toFixed(1),
  }
}

/** Session-log inputs: the prototype's shape — no salary, balance or allowances. */
export function sessionInputs(s: PfState) {
  return {
    age: s.age,
    retirement_age: s.retirementAge,
    hike_pct: s.hikePct,
    step_up_month: s.stepUpMonth,
    vpf_pct: s.vpfPct,
    scenario: s.scenario,
    basis: s.basis,
    eps_member: s.epsMember,
    labour_code: s.labourCode,
    eps_ceiling_reading: s.epsCeilingReading,
    tax_regime: s.taxRegime,
  }
}
