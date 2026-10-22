/**
 * Fallback statutory params for the EPF engine.
 *
 * Used ONLY when Supabase (statutory_params / epf_interest_rates) is
 * unreachable. Values mirror the seed rows in
 * supabase/migrations/*_pf_calculator.sql — keep the two in step.
 */

import type { StatutoryParams } from './types'

export const FALLBACK_PARAMS: StatutoryParams = {
  version: '2026-10-22',
  pfCeiling: [
    { from: '1900-01-01', to: '2026-09-16', v: 15000, src: 'EPF Scheme (pre-change)' },
    { from: '2026-09-17', to: null, v: 25000, src: 'S.O. 5109(E), 17 Sep 2026' },
  ],
  epsCeiling: [
    { from: '1900-01-01', to: '2026-09-16', v: 15000, src: 'EPS 1995 (pre-change)' },
    { from: '2026-09-17', to: null, v: 25000, src: 'PIB release, 23 Sep 2026' },
  ],
  epsCeilingAlt: [{ from: '1900-01-01', to: null, v: 15000, src: 'G.S.R. 890(E) reading' }],
  epsRate: 0.0833,
  edliRate: 0.005,
  adminRate: 0.005,
  edliMin: 250000,
  edliMax: 700000,
  edliBonusCap: 175000,
  taxThreshold: 250000,
  taxThresholdNoEmployer: 500000,
  employerCap: 750000,
  epsMinPension: 1000,
  sec80C: 150000,
  rates: {
    '2015-16': 8.8,
    '2016-17': 8.65,
    '2017-18': 8.55,
    '2018-19': 8.65,
    '2019-20': 8.5,
    '2020-21': 8.5,
    '2021-22': 8.1,
    '2022-23': 8.15,
    '2023-24': 8.25,
    '2024-25': 8.25,
    '2025-26': 8.25,
  },
  scenarios: { conservative: 7.5, base: 8.25, optimistic: 8.5 },
}
