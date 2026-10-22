import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { buildParams, rowOn, MissingParamError } from '@/lib/calculators/epf/params'
import { FALLBACK_PARAM_ROWS, FALLBACK_RATE_ROWS, FALLBACK_PARAMS } from '@/lib/calculators/epf/defaults'

const SQL = readFileSync(
  path.resolve(__dirname, '../../supabase/migrations/20261022000000_pf_calculator.sql'),
  'utf8'
)

describe('EPF params mapping', () => {
  it('builds the engine params from seed rows', () => {
    const p = FALLBACK_PARAMS
    expect(p.version).toBe('2026-10-22')
    expect(p.pfCeiling.map((s) => s.v)).toEqual([15000, 25000])
    expect(p.pfCeiling[1]).toMatchObject({ from: '2026-09-17', to: null, src: 'S.O. 5109(E), 17 Sep 2026' })
    expect(p.epsCeiling.map((s) => s.v)).toEqual([15000, 25000])
    expect(p.epsCeilingAlt.map((s) => s.v)).toEqual([15000])
    expect(p.taxThreshold).toBe(250000)
    expect(p.taxThresholdNoEmployer).toBe(500000)
    expect(p.rates['2025-26']).toBe(8.25)
    expect(p.scenarios).toEqual({ conservative: 7.5, base: 8.25, optimistic: 8.5 })
  })

  it('resolves scalar rows by date and prefers the latest effective_from', () => {
    const rows = [
      ...FALLBACK_PARAM_ROWS,
      { ...FALLBACK_PARAM_ROWS.find((r) => r.key === 'eps_min_pension')!, value: { amount: 3000 }, effective_from: '2027-04-01' },
    ]
    expect(buildParams(rows, FALLBACK_RATE_ROWS, '2026-12-01').params.epsMinPension).toBe(1000)
    expect(buildParams(rows, FALLBACK_RATE_ROWS, '2027-04-01').params.epsMinPension).toBe(3000)
    expect(rowOn(rows, 'eps_min_pension', '1800-01-01')).toBeUndefined()
  })

  it('accepts numeric strings from Postgres NUMERIC columns', () => {
    const rates = FALLBACK_RATE_ROWS.map((r) => ({ ...r, rate: String(r.rate) }))
    expect(buildParams(FALLBACK_PARAM_ROWS, rates, '2026-10-22').params.rates['2015-16']).toBe(8.8)
  })

  it('throws MissingParamError when a key is absent', () => {
    expect(() => buildParams(FALLBACK_PARAM_ROWS.filter((r) => r.key !== 'edli_max'), FALLBACK_RATE_ROWS, '2026-10-22')).toThrow(MissingParamError)
    expect(() => buildParams(FALLBACK_PARAM_ROWS.filter((r) => r.key !== 'pf_wage_ceiling'), FALLBACK_RATE_ROWS)).toThrow(MissingParamError)
  })
})

describe('defaults.ts stays in step with the migration seed', () => {
  it('every fallback param row appears in the seed with the same value and dates', () => {
    for (const r of FALLBACK_PARAM_ROWS) {
      const value = JSON.stringify(r.value)
      const needle = `('${r.key}', '${value}', '${r.effective_from}', ${r.effective_to ? `'${r.effective_to}'` : 'NULL'}, '${r.status}'`
      expect(SQL, `${r.key} ${r.effective_from}`).toContain(needle)
    }
  })

  it('every fallback EPF rate appears in the seed', () => {
    for (const r of FALLBACK_RATE_ROWS) {
      expect(SQL).toContain(`('${r.fy}', ${Number(r.rate).toFixed(2)}, '${r.status}'`)
    }
  })
})
