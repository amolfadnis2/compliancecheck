/**
 * Fallback statutory params for the EPF engine.
 *
 * Used ONLY when Supabase (statutory_params / epf_interest_rates) is
 * unreachable. These rows mirror the seed in
 * supabase/migrations/20261022000000_pf_calculator.sql exactly — keep the
 * two in step, so the fallback page shows the same sources and dates.
 */

import { buildParams, type EpfRateRow, type LoadedEpfParams, type StatutoryParamRow } from './params'

const VERIFIED = '2026-10-22'
const EPFO = 'https://www.epfindia.gov.in'
const GAZETTE = 'https://egazette.gov.in'
const IT = 'https://incometaxindia.gov.in'

type Seed = [
  key: string,
  value: Record<string, number>,
  from: string,
  to: string | null,
  status: string,
  sourceName: string,
  sourceRef: string | null,
  sourceUrl: string | null,
  notes: string | null,
]

const SEED: Seed[] = [
  ['pf_wage_ceiling', { amount: 15000 }, '1900-01-01', '2026-09-16', 'superseded', 'EPF Scheme, 1952 (para 2(f))', null, EPFO, 'Pre-change ceiling'],
  ['pf_wage_ceiling', { amount: 25000 }, '2026-09-17', null, 'in_force', 'Gazette notification', 'S.O. 5109(E), 17 Sep 2026', GAZETTE, null],
  ['eps_wage_ceiling', { amount: 15000 }, '1900-01-01', '2026-09-16', 'superseded', 'EPS 1995 (para 11)', null, EPFO, 'Pre-change ceiling'],
  ['eps_wage_ceiling', { amount: 25000 }, '2026-09-17', null, 'under_clarification', 'PIB release', 'PIB, 23 Sep 2026', 'https://pib.gov.in', 'G.S.R. 890(E) 15-Oct-2026 under clarification'],
  ['eps_wage_ceiling_alt', { amount: 15000 }, '1900-01-01', null, 'alternative_reading', 'Gazette notification', 'G.S.R. 890(E), 15 Oct 2026', GAZETTE, 'One reading of G.S.R. 890(E): EPS ceiling stays at 15,000'],
  ['eps_rate', { amount: 0.0833 }, '1900-01-01', null, 'in_force', 'EPS 2026', null, EPFO, 'Share of employer 12% diverted to EPS'],
  ['edli_rate', { amount: 0.005 }, '2026-07-01', null, 'in_force', 'Gazette notification', 'S.O. 3581(E), 1 Jul 2026', GAZETTE, null],
  ['admin_rate', { amount: 0.005 }, '2026-07-01', null, 'in_force', 'EPFO FAQs', 'EPFO FAQs, Sep 2026', EPFO, null],
  ['edli_min', { amount: 250000 }, '1900-01-01', null, 'in_force', 'EDLI Scheme, 1976', null, EPFO, 'Minimum assurance benefit'],
  ['edli_max', { amount: 700000 }, '1900-01-01', null, 'in_force', 'EDLI Scheme, 1976', null, EPFO, 'Maximum assurance benefit'],
  ['edli_bonus_cap', { amount: 175000 }, '1900-01-01', null, 'in_force', 'EDLI Scheme, 1976', null, EPFO, 'Cap on the 50%-of-balance component'],
  ['tax_interest_threshold', { with_employer: 250000, without_employer: 500000 }, '1900-01-01', null, 'in_force', 'Income-tax Rules, 1962', 'Rule 9D', IT, 'Own contributions per FY above which interest is taxable'],
  ['employer_cap', { amount: 750000 }, '1900-01-01', null, 'in_force', 'Income-tax Act, 1961', 'Sec 17(2)(vii)', IT, 'Employer PF + NPS + superannuation per FY; excess is a perquisite'],
  ['eps_min_pension', { amount: 1000 }, '1900-01-01', null, 'in_force', 'EPS 1995', null, EPFO, 'Minimum monthly pension'],
  ['sec80c', { amount: 150000 }, '1900-01-01', null, 'in_force', 'Income-tax Act, 1961', 'Sec 80C', IT, 'Old regime only'],
  ['epf_rate_scenarios', { conservative: 7.5, base: 8.25, optimistic: 8.5 }, '1900-01-01', null, 'assumption', 'ComplianceCheck assumption', null, null, 'Future-year rates are assumptions; EPFO declares the rate every year'],
]

export const FALLBACK_PARAM_ROWS: StatutoryParamRow[] = SEED.map(
  ([key, value, from, to, status, sourceName, sourceRef, sourceUrl, notes]) => ({
    key,
    value,
    effective_from: from,
    effective_to: to,
    status,
    source_name: sourceName,
    source_ref: sourceRef,
    source_url: sourceUrl,
    verified_at: VERIFIED,
    notes,
  })
)

const RATES: [string, number][] = [
  ['2015-16', 8.8], ['2016-17', 8.65], ['2017-18', 8.55], ['2018-19', 8.65], ['2019-20', 8.5],
  ['2020-21', 8.5], ['2021-22', 8.1], ['2022-23', 8.15], ['2023-24', 8.25], ['2024-25', 8.25],
]

export const FALLBACK_RATE_ROWS: EpfRateRow[] = [
  ...RATES.map(([fy, rate]): EpfRateRow => ({
    fy, rate, status: 'credited', cbt_meeting: null, decided_on: null, notified_on: null, source_url: EPFO,
  })),
  { fy: '2025-26', rate: 8.25, status: 'notified', cbt_meeting: 'CBT 239th meeting', decided_on: '2026-03-02', notified_on: '2026-07-01', source_url: EPFO },
]

/** Scalars are resolved as of the seed date; every seeded scalar is open-ended. */
export const FALLBACK_PARAMS = buildParams(FALLBACK_PARAM_ROWS, FALLBACK_RATE_ROWS, VERIFIED).params

export const FALLBACK_LOADED: LoadedEpfParams = {
  params: FALLBACK_PARAMS,
  paramRows: FALLBACK_PARAM_ROWS,
  rateRows: FALLBACK_RATE_ROWS,
  verifiedAt: VERIFIED,
  fromFallback: true,
}
