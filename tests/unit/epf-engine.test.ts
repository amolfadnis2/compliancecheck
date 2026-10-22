import { describe, it, expect } from 'vitest'
import {
  project,
  epsPension,
  edliBenefit,
  xirrMonthly,
  cappedWage,
  ceilingOn,
  fyOf,
  rateFor,
  pfWageOf,
  validateInput,
  r0,
  r2,
  FALLBACK_PARAMS,
  EpfEngineError,
  type ProjectInput,
  type StatutoryParams,
} from '@/lib/calculators/epf'

const P = FALLBACK_PARAMS

// Identical to the prototype's BASE fixture.
const BASE: ProjectInput = {
  age: 30, retirementAge: 31, startY: 2027, startM: 4, basic: 0, allowances: 0, hikePct: 0, stepUpMonth: 4, opening: 0,
  basis: 'capped', contributionRate: 0.12, epsMember: true, labourCode: false, vpfPct: 0, interestTiming: 'next_month',
  scenario: 'custom', customRate: 8.25, inflationPct: 6, taxRegime: 'new', slabPct: 0, pastEpsYears: 0, rounding: 'rupee', epsCeilingReading: '25000',
}

const eq = (a: number, b: number) => Math.abs(a - b) < 0.005

describe('EPF engine — prototype golden tests', () => {
  it('G1: ₹1,00,000 opening, no contributions, 8.25%, 2 FYs → ₹1,08,250 → ₹1,17,180.63', () => {
    const r = project({ ...BASE, opening: 100000, retirementAge: 32 }, P)
    expect(eq(r.rows[0].closing, 108250)).toBe(true)
    expect(eq(r.corpus, 117180.63)).toBe(true)
  })

  it('G2: Basic ₹15,000, ₹15k ceiling, 12 months, next-month interest', () => {
    const r = project({ ...BASE, startY: 2025, basic: 15000, useHistorical: true }, P)
    expect(r.first!.ee).toBe(1800)
    expect(r.first!.eps).toBe(1250)
    expect(r.first!.erEpf).toBe(550)
    expect(eq(r.totals.interest, 1066.31)).toBe(true)
    expect(eq(r.corpus, 29266.31)).toBe(true)
  })

  it('G3: same as G2 with same-month interest → interest ₹1,260.19', () => {
    const r = project({ ...BASE, startY: 2025, basic: 15000, interestTiming: 'same_month' }, P)
    expect(eq(r.totals.interest, 1260.19)).toBe(true)
  })

  it('G4: Sep 2026 split month, wage ₹20,000 (EPFO FAQ, paise rounding)', () => {
    const r = project({ ...BASE, startY: 2026, startM: 9, retirementAge: 30 + 1 / 12, basic: 20000, rounding: 'paise' }, P)
    const f = r.first!
    const tot = r2(f.ee + f.eps + f.erEpf + f.edli + f.admin)
    expect(eq(f.ee, 2080)).toBe(true)
    expect(eq(f.eps, 1443.87)).toBe(true)
    expect(eq(f.erEpf, 636.13)).toBe(true)
    expect(eq(f.edli, 86.67)).toBe(true)
    expect(eq(f.admin, 86.67)).toBe(true)
    expect(eq(tot, 4333.34)).toBe(true)
  })

  it('G5: Labour Code 50% rule, Basic ₹10,000 + allowances ₹12,000 → PF wage ₹11,000, EE ₹1,320', () => {
    const w = pfWageOf(10000, 12000, true)
    const r = project({ ...BASE, basic: 10000, allowances: 12000, labourCode: true }, P)
    expect(w).toBe(11000)
    expect(r.first!.ee).toBe(1320)
  })

  it('G6: EPS ₹15,000 × (25 + 2 bonus) ÷ 70 → ₹5,785.71/month', () => {
    const p = epsPension({ periods: { 15000: 25 }, avg60: 15000, atSuperannuation: true }, P)
    expect(eq(p.pension!, 5785.71)).toBe(true)
  })

  it('G7: EPS with 8 years service → no pension', () => {
    const p = epsPension({ periods: { 15000: 8 }, avg60: 15000, atSuperannuation: true }, P)
    expect(p.pension).toBeNull()
  })

  it('G8: EDLI avg wage ₹15,000, avg balance ₹5L → ₹7,00,000 (cap)', () => {
    expect(edliBenefit(15000, 500000, P)).toBe(700000)
  })

  it('G9: Basic ₹50,000 capped, 10% hikes, after 17 Sep 2026 → EE stays ₹3,000/month', () => {
    const r = project({ ...BASE, startY: 2026, startM: 11, retirementAge: 33, basic: 50000, hikePct: 10 }, P)
    const ok = r.rows.every(
      (row) => Math.abs(row.ee - 3000 * (row.fy === '2026-27' ? 5 : 12)) < 0.01 || row.fy === '2029-30'
    )
    expect(ok).toBe(true)
  })

  it('P1: corpus XIRR is below the declared 8.25% (crediting lag)', () => {
    const r = project({ ...BASE, basic: 20000, retirementAge: 60, age: 30, hikePct: 7 }, P)
    expect(r.xirrCorpus!).toBeLessThan(0.0825)
    expect(r.xirrCorpus!).toBeGreaterThan(0.08)
  })
})

// Deterministic PRNG so property tests are reproducible.
function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32
  }
}
const pick = (rand: () => number, lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1))

function randomInput(rand: () => number): ProjectInput {
  const age = pick(rand, 20, 50)
  return {
    ...BASE,
    age,
    retirementAge: Math.min(60, age + pick(rand, 2, 30)),
    startY: 2027,
    startM: pick(rand, 1, 12),
    basic: pick(rand, 5, 200) * 1000,
    opening: pick(rand, 0, 50) * 10000,
    hikePct: pick(rand, 0, 15),
    stepUpMonth: pick(rand, 1, 12),
    vpfPct: pick(rand, 0, 10),
  }
}

describe('EPF engine — properties', () => {
  it('corpus is monotonic in the future interest rate', () => {
    const rand = rng(42)
    for (let k = 0; k < 40; k++) {
      const inp = randomInput(rand)
      let prev = -Infinity
      for (const rate of [5, 6.5, 7.5, 8.25, 9, 10.5, 12]) {
        const c = project({ ...inp, scenario: 'custom', customRate: rate }, P).corpus
        expect(c).toBeGreaterThanOrEqual(prev)
        prev = c
      }
    }
  })

  it('corpus is monotonic in the salary hike (actual basis)', () => {
    const rand = rng(7)
    for (let k = 0; k < 40; k++) {
      const inp = { ...randomInput(rand), basis: 'actual' as const }
      let prev = -Infinity
      for (const hike of [0, 2, 5, 8, 12, 20]) {
        const c = project({ ...inp, hikePct: hike }, P).corpus
        expect(c).toBeGreaterThanOrEqual(prev)
        prev = c
      }
    }
  })

  it('capped equals actual when Basic stays at or below the ceiling', () => {
    const rand = rng(99)
    for (let k = 0; k < 40; k++) {
      // Pre-change months are capped at ₹15,000, so start after 17 Sep 2026
      // and keep the wage ≤ ₹25,000 throughout (no hike).
      const inp = { ...randomInput(rand), startY: 2027, hikePct: 0, basic: pick(rand, 5, 25) * 1000 }
      const capped = project({ ...inp, basis: 'capped' }, P)
      const actual = project({ ...inp, basis: 'actual' }, P)
      expect(capped.corpus).toBe(actual.corpus)
      expect(capped.flags.capFreeze).toBe(false)
    }
  })

  it('xirrCorpus is below the declared rate with next_month timing', () => {
    const rand = rng(2026)
    for (let k = 0; k < 40; k++) {
      const rate = [7.5, 8.25, 8.5][k % 3]
      const inp = { ...randomInput(rand), interestTiming: 'next_month' as const, scenario: 'custom' as const, customRate: rate }
      const r = project(inp, P)
      expect(r.xirrCorpus!).toBeLessThan(rate / 100)
    }
  })

  it('a 40-year run takes < 50 ms', () => {
    const inp: ProjectInput = { ...BASE, age: 18, retirementAge: 58, basic: 30000, hikePct: 8, opening: 100000, basis: 'actual' }
    project(inp, P) // warm-up
    const t0 = performance.now()
    const r = project(inp, P)
    const ms = performance.now() - t0
    expect(r.months).toBe(480)
    expect(ms).toBeLessThan(50)
  })
})

describe('EPF engine — helpers and branches', () => {
  it('fyOf maps calendar months to financial years', () => {
    expect(fyOf(2026, 4)).toBe('2026-27')
    expect(fyOf(2027, 3)).toBe('2026-27')
    expect(fyOf(2099, 12)).toBe('2099-00')
  })

  it('cappedWage prorates by day across the 17 Sep 2026 change', () => {
    // 16 days at 15,000 + 14 days at 20,000, over 30 days.
    expect(cappedWage(20000, 2026, 9, P.pfCeiling)).toBeCloseTo((16 * 15000 + 14 * 20000) / 30, 6)
    expect(cappedWage(10000, 2026, 9, P.pfCeiling)).toBe(10000)
    expect(ceilingOn(2026, 9, P.pfCeiling)).toBe(25000)
    expect(ceilingOn(2026, 8, P.pfCeiling)).toBe(15000)
  })

  it('throws a typed error when no ceiling covers the date', () => {
    const gap = [{ from: '2030-01-01', to: null, v: 25000 }]
    expect(() => cappedWage(20000, 2027, 1, gap)).toThrow(EpfEngineError)
    try {
      ceilingOn(2027, 1, gap)
    } catch (e) {
      expect((e as EpfEngineError).code).toBe('NO_CEILING_FOR_DATE')
    }
  })

  it('rateFor prefers ratePath, then declared rates, then the scenario', () => {
    expect(rateFor('2025-26', { ...BASE, ratePath: { '2025-26': 9 } }, P)).toBe(9)
    expect(rateFor('2025-26', BASE, P)).toBe(8.25)
    expect(rateFor('2025-26', { ...BASE, useHistorical: false, customRate: 7 }, P)).toBe(7)
    expect(rateFor('2030-31', { ...BASE, scenario: 'optimistic' }, P)).toBe(8.5)
    expect(rateFor('2030-31', { ...BASE, scenario: undefined as unknown as 'base' }, P)).toBe(8.25)
    expect(() => rateFor('2030-31', { ...BASE, customRate: NaN }, P)).toThrow(EpfEngineError)
  })

  it('pfWageOf leaves Basic alone without the Labour Code rule or when allowances are ≤ 50%', () => {
    expect(pfWageOf(10000, 12000, false)).toBe(10000)
    expect(pfWageOf(30000, 10000, true)).toBe(30000)
  })

  it('rounding helpers round half away from zero', () => {
    expect(r0(1.5)).toBe(2)
    expect(r0(-1.5)).toBe(-2)
    expect(r2(1.005)).toBe(1.01)
    expect(r2(-1.005)).toBe(-1.01)
  })

  it('non-EPS members get no pension and the full 12% goes to PF', () => {
    const r = project({ ...BASE, basic: 20000, epsMember: false }, P)
    expect(r.pension).toBeNull()
    expect(r.flags.notEpsEligible).toBe(true)
    expect(r.first!.eps).toBe(0)
    expect(r.first!.erEpf).toBe(2400)
  })

  it('EPS stops at 58 and pension uses bonus years at superannuation', () => {
    const r = project({ ...BASE, age: 30, retirementAge: 60, basic: 20000, pastEpsYears: 4 }, P)
    const at58 = r.rows.filter((row) => row.age >= 58)
    expect(at58.length).toBeGreaterThan(0)
    expect(at58[at58.length - 1].eps).toBe(0)
    expect(r.pension).toBeGreaterThan(0)
    expect(r.pensionNote).toContain('+ 2 bonus years')
  })

  it('EPS minimum pension applies for a low pensionable salary', () => {
    const p = epsPension({ periods: { 15000: 10 }, avg60: 2000, atSuperannuation: false }, P)
    expect(p.pension).toBe(P.epsMinPension)
  })

  it('the alternative EPS reading lowers the pension after the change', () => {
    const inp = { ...BASE, age: 30, retirementAge: 58, basic: 40000, pastEpsYears: 4 }
    const primary = project(inp, P)
    const alt = project({ ...inp, epsCeilingReading: '15000' as const }, P)
    expect(alt.pension!).toBeLessThan(primary.pension!)
  })

  it('flags the tax threshold, employer cap and cap freeze; old regime counts 80C', () => {
    const r = project(
      { ...BASE, age: 30, retirementAge: 40, basic: 600000, basis: 'actual', vpfPct: 10, taxRegime: 'old', slabPct: 30 },
      P
    )
    expect(r.flags.taxThresholdFY).toBe('2027-28')
    expect(r.flags.employerCapFY).not.toBeNull()
    expect(r.taxOnInterest).toBeGreaterThan(0)
    expect(r.postTax).toBeLessThan(r.corpus)

    const capped = project({ ...BASE, basic: 40000 }, P)
    expect(capped.flags.capFreeze).toBe(true)

    const newRegime = project({ ...BASE, retirementAge: 40, basic: 40000, slabPct: 30 }, P)
    const oldRegime = project({ ...BASE, retirementAge: 40, basic: 40000, slabPct: 30, taxRegime: 'old' }, P)
    expect(oldRegime.xirrOwn!).toBeGreaterThan(newRegime.xirrOwn!)
  })

  it('reduced 10% contribution rate and VPF flow into the first month', () => {
    const r = project({ ...BASE, basic: 20000, contributionRate: 0.1, vpfPct: 5 }, P)
    expect(r.first!.ee).toBe(2000)
    expect(r.first!.vpf).toBe(1000)
  })

  it('zero-length projection returns an empty result', () => {
    const r = project({ ...BASE, retirementAge: 30 }, P)
    expect(r.months).toBe(0)
    expect(r.rows).toHaveLength(0)
    expect(r.first).toBeNull()
    expect(r.edliCover).toBeNull()
    expect(r.xirrCorpus).toBeNull()
    expect(r.moneyMultiple).toBeNull()
  })

  it('xirrMonthly handles degenerate and bisection-only cash flows', () => {
    expect(xirrMonthly([1, 2, 3])).toBeNull()
    expect(xirrMonthly([-1, -2])).toBeNull()
    // 1% a month for 12 months.
    expect(xirrMonthly([-100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100 * 1.01 ** 12])!).toBeCloseTo(1.01 ** 12 - 1, 8)
    // A total loss drives Newton below -99%; no root in the bisection bracket.
    expect(xirrMonthly([-100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1e-9])).toBeNull()
    // Steep loss: Newton overshoots, bisection finds the root.
    const steep = xirrMonthly([-100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.5])
    expect(steep === null || steep < 0).toBe(true)
  })

  it('works with injected params (no constants inside the engine)', () => {
    const custom: StatutoryParams = { ...P, pfCeiling: [{ from: '1900-01-01', to: null, v: 10000 }] }
    const r = project({ ...BASE, basic: 20000 }, custom)
    expect(r.first!.ee).toBe(1200)
  })
})

describe('EPF input validation', () => {
  const valid = { ...BASE, age: 28, retirementAge: 58, basic: 40000, scenario: 'base' }

  it('accepts a valid input and applies defaults', () => {
    const v = validateInput({ ...valid, allowances: undefined, opening: undefined })
    expect(v.ok).toBe(true)
    if (v.ok) {
      expect(v.value.allowances).toBe(0)
      expect(v.value.opening).toBe(0)
    }
  })

  it('returns typed codes with the prototype messages', () => {
    const v = validateInput({ ...valid, age: 17, retirementAge: 61, basic: 0, scenario: 'custom', customRate: 13 })
    expect(v.ok).toBe(false)
    if (!v.ok) {
      const byField = Object.fromEntries(v.errors.map((e) => [e.field, e]))
      expect(byField.age.code).toBe('INVALID_AGE')
      expect(byField.age.message).toBe('Enter an age between 18 and 57.')
      expect(byField.retirementAge.code).toBe('INVALID_RETIREMENT_AGE')
      expect(byField.basic.code).toBe('INVALID_BASIC')
      expect(byField.customRate.code).toBe('INVALID_CUSTOM_RATE')
    }
  })

  it('maps structural errors to INVALID_INPUT', () => {
    const v = validateInput({ ...valid, basis: 'nope' })
    expect(v.ok).toBe(false)
    if (!v.ok) expect(v.errors[0]).toMatchObject({ code: 'INVALID_INPUT', field: 'basis' })
    const w = validateInput(null)
    expect(w.ok).toBe(false)
    if (!w.ok) expect(w.errors[0].field).toBe('input')
  })
})
