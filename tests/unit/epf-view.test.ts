import { describe, it, expect } from 'vitest'
import { FALLBACK_LOADED, FALLBACK_PARAMS } from '@/lib/calculators/epf/defaults'
import { project } from '@/lib/calculators/epf'
import { DEFAULT_STATE, coerceState, decodeState, encodeState, startMonthAfter, toProjectInput } from '@/lib/calculators/epf/url-state'
import {
  callouts, chartPoints, compact, corpusBand, factsFrom, fmtDate, headline, headlineText, inr, lakh, resultsSummary,
  salaryBand, sessionInputs, sourceRows, stats, tableRow, yearTableCsv,
} from '@/lib/calculators/epf/view'
import { pfFaq } from '@/lib/calculators/epf/faq'

const start = { startY: 2026, startM: 11 }

describe('URL state', () => {
  it('defaults encode to an empty query and decode back', () => {
    expect(encodeState(DEFAULT_STATE)).toBe('')
    expect(decodeState(new URLSearchParams(''))).toEqual(DEFAULT_STATE)
  })

  it('round-trips every non-default field', () => {
    const s = { ...DEFAULT_STATE, age: 35, retirementAge: 60, basic: 55000, hikePct: 7.5, stepUpMonth: 7, opening: 0, vpfPct: 5,
      scenario: 'custom' as const, customRate: 7.9, inflationPct: 5.5, basis: 'actual' as const, epsMember: false, pastEpsYears: 2.5,
      reduced: true, labourCode: true, allowances: 12000, epsCeilingReading: '15000' as const, interestTiming: 'same_month' as const,
      taxRegime: 'old' as const, slabPct: 20 as const, view: 'real' as const }
    const qs = encodeState(s)
    expect(decodeState(new URLSearchParams(qs))).toEqual(s)
    expect(decodeState(Object.fromEntries(new URLSearchParams(qs)))).toEqual(s)
  })

  it('falls back to defaults for invalid values and fixes retire ≤ age', () => {
    const s = decodeState(new URLSearchParams('a=99&b=abc&sc=wild&sl=7&e=maybe&h='))
    expect(s.age).toBe(DEFAULT_STATE.age)
    expect(s.basic).toBe(DEFAULT_STATE.basic)
    expect(s.scenario).toBe('base')
    expect(s.slabPct).toBe(30)
    expect(s.epsMember).toBe(true)
    expect(decodeState({ a: '57', r: '50' }).retirementAge).toBe(58)
    expect(decodeState({ a: ['40', '41'] }).age).toBe(40)
  })

  it('coerceState validates share rows field by field', () => {
    expect(coerceState({ ...DEFAULT_STATE, basic: 30000, junk: 1, hikePct: 99 })).toEqual({ ...DEFAULT_STATE, basic: 30000 })
    expect(coerceState(null)).toEqual(DEFAULT_STATE)
  })

  it('startMonthAfter rolls over December', () => {
    expect(startMonthAfter(new Date(2026, 9, 22))).toEqual({ startY: 2026, startM: 11 })
    expect(startMonthAfter(new Date(2026, 11, 5))).toEqual({ startY: 2027, startM: 1 })
  })

  it('toProjectInput maps UI fields (reduced rate, allowances only with the Labour Code rule)', () => {
    const i = toProjectInput({ ...DEFAULT_STATE, reduced: true }, start)
    expect(i.contributionRate).toBe(0.1)
    expect(i.allowances).toBe(0)
    expect(toProjectInput({ ...DEFAULT_STATE, labourCode: true }, start).allowances).toBe(60000)
  })
})

describe('view helpers', () => {
  const facts = factsFrom(FALLBACK_PARAMS, FALLBACK_LOADED.rateRows)
  const res = project(toProjectInput(DEFAULT_STATE, start), FALLBACK_PARAMS)

  it('formats Indian numbers', () => {
    expect(inr(1234567)).toBe('₹12,34,567')
    expect(compact(12345678)).toBe('₹1.23 Cr')
    expect(compact(250000)).toBe('₹2.50 L')
    expect(compact(999)).toBe('₹999')
    expect(lakh(250000)).toBe('₹2.5 lakh')
    expect(lakh(700000)).toBe('₹7 lakh')
    expect(fmtDate('2026-09-17')).toBe('17 Sep 2026')
  })

  it('derives copy facts from params', () => {
    expect(facts).toMatchObject({ ceiling: 25000, previousCeiling: 15000, maxEe: 3000, previousMaxEe: 1800, latestFy: '2025-26', latestRate: 8.25, epsShare: '8.33%' })
  })

  it('builds the prototype headline, stats and default callout', () => {
    const h = headline(res, 58)
    expect(headlineText(h)).toBe('By 58, your PF could grow to ₹79.51 L, which is ₹13.84 L in today’s money. Every ₹1 you put in becomes ₹6.2, a return of 9.1% a year on your own money.')
    expect(stats(res).map((s) => s.label)).toEqual(['Effective PF return', 'Your return after inflation', 'Total you put in', 'Interest earned'])
    const c = callouts(res, DEFAULT_STATE, facts)
    expect(c.map((x) => x.id)).toEqual(['cap_freeze'])
    expect(c[0].body).toContain('₹25,000 ceiling')
    expect(c[0].body).toContain('₹3,000 a month')
    expect(callouts(res, { ...DEFAULT_STATE, retirementAge: 60 }, facts).map((x) => x.id)).toContain('eps_stops')
  })

  it('renders table rows, chart points and CSV', () => {
    expect(tableRow(res.rows[0])[0]).toBe('FY 2026-27')
    const pts = chartPoints(res.rows, false)
    const last = pts[pts.length - 1]
    expect(last.own + last.er + last.int).toBeCloseTo(res.corpus, 0)
    expect(chartPoints(res.rows, true)[pts.length - 1].total).toBeCloseTo(res.rows[res.rows.length - 1].real, 6)
    const csv = yearTableCsv(res.rows, { engineVersion: '1.0.0', paramsVersion: 'x' })
    expect(csv.split('\n')[1]).toBe("FY,Age,Rate %,PF wage per month,You incl VPF,Employer to PF,To EPS,Interest,Balance,In today's money")
    expect(csv.trim().split('\n')).toHaveLength(res.rows.length + 2)
  })

  it('renders every params row as a source with date', () => {
    const rows = sourceRows(FALLBACK_LOADED.paramRows, FALLBACK_LOADED.rateRows, DEFAULT_STATE, FALLBACK_PARAMS)
    expect(rows[0]).toMatchObject({ value: 'EPF interest rate FY 2025-26', used: '8.25%' })
    expect(rows[0].source).toContain('CBT 239th meeting')
    expect(rows.length).toBe(FALLBACK_LOADED.paramRows.length + 3)
    expect(rows.find((r) => r.value.startsWith('PF wage ceiling') && r.used === '₹25,000')?.source).toContain('S.O. 5109(E)')
    expect(rows.find((r) => r.value === 'EPS wage ceiling (selected)')).toBeTruthy()
    expect(rows[rows.length - 1]).toMatchObject({ value: 'Future rate (your choice)', used: '8.25%', source: 'Assumption' })
  })

  it('bands values for analytics and strips money from session inputs', () => {
    expect([salaryBand(10000), salaryBand(20000), salaryBand(40000), salaryBand(60000), salaryBand(150000)]).toEqual(['<15k', '15k-25k', '25k-50k', '50k-1L', '1L+'])
    expect([corpusBand(5e5), corpusBand(2e6), corpusBand(7e6), corpusBand(2e7), corpusBand(9e7)]).toEqual(['<10L', '10L-50L', '50L-1Cr', '1Cr-5Cr', '5Cr+'])
    expect(resultsSummary(res)).toMatchObject({ corpus_band: '50L-1Cr', cap_freeze: true, pension_eligible: true })
    const keys = Object.keys(sessionInputs(DEFAULT_STATE))
    expect(keys.some((k) => /basic|opening|allowance|salary|balance/.test(k))).toBe(false)
  })

  it('FAQ answers are built from params', () => {
    const faq = pfFaq(facts)
    expect(faq[0].answer).toContain('₹25,000')
    expect(faq[1].question).toBe('What is the EPF interest rate for 2025-26?')
    expect(faq[1].answer).toBe('8.25%. The Central Board of Trustees recommended it on 2 Mar 2026, and EPFO issued crediting instructions on 1 Jul 2026.')
    expect(faq[2].question).toBe('What changed on 17 Sep 2026?')
  })
})
