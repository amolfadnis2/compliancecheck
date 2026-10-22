/**
 * EPF forecast engine — pure TypeScript port of the approved prototype
 * (docs/prototypes/pf-calculator.html, "EPF forecast engine").
 *
 * No React, DOM or Supabase imports. Every statutory number comes from the
 * injected StatutoryParams; nothing statutory is declared in this file.
 */

import {
  EpfEngineError,
  type CeilingSegment,
  type EpsPensionResult,
  type FirstMonth,
  type ProjectInput,
  type ProjectionFlags,
  type ProjectionResult,
  type StatutoryParams,
  type YearRow,
} from './types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Round to paise (half away from zero, with float nudge). */
export const r2 = (x: number): number => Math.round(x * 100 + (x >= 0 ? 1e-7 : -1e-7)) / 100
/** Round to whole rupees (ECR practice). */
export const r0 = (x: number): number => Math.round(x + (x >= 0 ? 1e-9 : -1e-9))

/** Financial year label for a calendar month: Apr 2026 → '2026-27', Mar 2027 → '2026-27'. */
export function fyOf(y: number, m: number): string {
  return m >= 4
    ? `${y}-${String((y + 1) % 100).padStart(2, '0')}`
    : `${y - 1}-${String(y % 100).padStart(2, '0')}`
}

const daysIn = (y: number, m: number): number => new Date(Date.UTC(y, m, 0)).getUTCDate()
const iso = (y: number, m: number, d: number): string =>
  `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`

function segmentOn(day: string, schedule: CeilingSegment[]): CeilingSegment {
  const seg = schedule.find((s) => day >= s.from && (!s.to || day <= s.to))
  if (!seg) throw new EpfEngineError('NO_CEILING_FOR_DATE', `No wage ceiling in force on ${day}`)
  return seg
}

/** Wage subject to a date-effective ceiling, prorated by days within the month. */
export function cappedWage(wage: number, y: number, m: number, schedule: CeilingSegment[]): number {
  const dim = daysIn(y, m)
  let total = 0
  const first = segmentOn(iso(y, m, 1), schedule)
  if (first === segmentOn(iso(y, m, dim), schedule)) {
    // One ceiling all month (segments are contiguous): same per-day sum, without a lookup per day.
    const v = Math.min(wage, first.v)
    for (let d = 1; d <= dim; d++) total += v
    return total / dim
  }
  for (let d = 1; d <= dim; d++) {
    total += Math.min(wage, segmentOn(iso(y, m, d), schedule).v)
  }
  return total / dim
}

/** Ceiling in force on the last day of the month. */
export function ceilingOn(y: number, m: number, schedule: CeilingSegment[]): number {
  return segmentOn(iso(y, m, daysIn(y, m)), schedule).v
}

/** Interest rate (percent) for a FY: explicit path → declared rate → chosen scenario. */
export function rateFor(fy: string, inp: ProjectInput, params: StatutoryParams): number {
  if (inp.ratePath && inp.ratePath[fy] != null) return inp.ratePath[fy]
  if (inp.useHistorical !== false && params.rates[fy] != null) return params.rates[fy]
  const scenario = inp.scenario || 'base'
  const rate = scenario === 'custom' ? inp.customRate : params.scenarios[scenario]
  if (rate == null || !Number.isFinite(rate)) {
    throw new EpfEngineError('NO_RATE_FOR_FY', `No interest rate for FY ${fy}`)
  }
  return rate
}

/** PF wage, with the Labour Code 50% rule adding back allowances above half of pay. */
export function pfWageOf(basic: number, allow: number, labourCode: boolean): number {
  if (!labourCode) return basic
  const total = basic + allow
  return basic + Math.max(0, allow - 0.5 * total)
}

const now = (): number => (typeof performance !== 'undefined' ? performance.now() : Date.now())

// ---------------------------------------------------------------------------
// Projection
// ---------------------------------------------------------------------------

export function project(inp: ProjectInput, params: StatutoryParams): ProjectionResult {
  const t0 = now()
  const pfSched = params.pfCeiling
  const epsSched = inp.epsCeilingReading === '15000' ? params.epsCeilingAlt : params.epsCeiling
  const rnd = inp.rounding === 'paise' ? r2 : r0
  const rate = inp.contributionRate || 0.12
  const months = Math.max(0, Math.round((inp.retirementAge - inp.age) * 12))
  let y = inp.startY
  let m = inp.startM
  let basic = inp.basic
  let allow = inp.allowances || 0
  let bal = inp.opening || 0
  let taxBal = 0
  let baseSum = 0
  let taxBaseSum = 0
  let fyEE = 0
  let fyEe = 0
  let fyVpf = 0
  let fyEr = 0
  let fyEps = 0
  let fyEmpCost = 0
  let taxOnInterest = 0
  const rows: YearRow[] = []
  const cfCorpus = new Array<number>(months + 1).fill(0)
  const cfOwn = new Array<number>(months + 1).fill(0)
  cfCorpus[0] -= bal
  cfOwn[0] -= bal
  let totEE = 0
  let totVpf = 0
  let totEr = 0
  let totEps = 0
  let totInt = 0
  const epsWageHist: { y: number; m: number; w: number }[] = []
  const flags: ProjectionFlags = { capFreeze: false, taxThresholdFY: null, employerCapFY: null, notEpsEligible: false }
  let first: FirstMonth | null = null
  let edliWageSum = 0
  let edliBalSum = 0
  let edliN = 0
  let cumOwn = inp.opening || 0
  let cumEr = 0
  let cumInt = 0
  const slab = (inp.slabPct || 0) / 100

  for (let i = 0; i < months; i++) {
    if (i > 0 && m === inp.stepUpMonth) {
      basic *= 1 + inp.hikePct / 100
      allow *= 1 + inp.hikePct / 100
    }
    const ageNow = inp.age + i / 12
    const pfWage = pfWageOf(basic, allow, !!inp.labourCode)
    const cw = inp.basis === 'actual' ? pfWage : cappedWage(pfWage, y, m, pfSched)
    if (inp.basis !== 'actual' && pfWage > ceilingOn(y, m, pfSched)) flags.capFreeze = true
    const ee = rnd(rate * cw)
    const vpf = rnd(((inp.vpfPct || 0) / 100) * pfWage)
    const inEps = inp.epsMember && ageNow < 58
    const eps = inEps ? rnd(params.epsRate * cappedWage(pfWage, y, m, epsSched)) : 0
    const erTot = rnd(rate * cw)
    const erEpf = r2(Math.max(0, erTot - eps))
    const edli = r2(params.edliRate * cappedWage(pfWage, y, m, pfSched))
    const admin = r2(params.adminRate * cw)
    if (inEps) epsWageHist.push({ y, m, w: pfWage })
    if (!first) first = { pfWage, cw, ee, vpf, eps, erTot, erEpf, edli, admin, empCost: r2(erTot + edli + admin) }
    const fy = fyOf(y, m)
    const r = rateFor(fy, inp, params) / 100
    const contribEE = ee + vpf
    const prev = fyEE
    fyEE += contribEE
    const taxable = Math.max(0, fyEE - params.taxThreshold) - Math.max(0, prev - params.taxThreshold)
    const saving80C =
      inp.taxRegime === 'old' ? slab * (Math.min(fyEE, params.sec80C) - Math.min(prev, params.sec80C)) : 0
    if (inp.interestTiming === 'same_month') {
      bal += contribEE + erEpf
      taxBal += taxable
      baseSum += bal
      taxBaseSum += taxBal
    } else {
      baseSum += bal
      taxBaseSum += taxBal
      bal += contribEE + erEpf
      taxBal += taxable
    }
    cfCorpus[i] -= contribEE + erEpf
    cfOwn[i] -= contribEE - saving80C
    fyEe += ee
    fyVpf += vpf
    fyEr += erEpf
    fyEps += eps
    fyEmpCost += erTot + edli + admin
    cumOwn += contribEE
    cumEr += erEpf
    if (i < 12) {
      edliWageSum += Math.min(pfWage, ceilingOn(y, m, pfSched))
      edliBalSum += bal
      edliN++
    }
    const last = i === months - 1
    if (m === 3 || last) {
      // Interest accrues monthly on the running balance, credited on 31 March.
      const intr = r2((baseSum * r) / 12)
      const tInt = r2((taxBaseSum * r) / 12)
      bal = r2(bal + intr)
      taxBal += tInt
      taxOnInterest += tInt * slab
      cumInt += intr
      totInt += intr
      if (fyEE > params.taxThreshold && !flags.taxThresholdFY) flags.taxThresholdFY = fy
      if (fyEr + fyEps > params.employerCap && !flags.employerCapFY) flags.employerCapFY = fy
      const yrs = (i + 1) / 12
      const defl = Math.pow(1 + (inp.inflationPct || 0) / 100, yrs)
      rows.push({
        fy,
        age: Math.floor(ageNow),
        pfWage,
        ee: fyEe,
        vpf: fyVpf,
        erEpf: fyEr,
        eps: fyEps,
        interest: intr,
        rate: r * 100,
        closing: bal,
        real: bal / defl,
        cumOwn,
        cumEr,
        cumInt,
        taxableInt: tInt,
        empCost: fyEmpCost,
      })
      totEE += fyEe
      totVpf += fyVpf
      totEr += fyEr
      totEps += fyEps
      baseSum = 0
      taxBaseSum = 0
      fyEE = 0
      fyEe = 0
      fyVpf = 0
      fyEr = 0
      fyEps = 0
      fyEmpCost = 0
    }
    m++
    if (m > 12) {
      m = 1
      y++
    }
  }

  cfCorpus[months] += bal
  cfOwn[months] += bal
  const years = months / 12
  const defl = Math.pow(1 + (inp.inflationPct || 0) / 100, years)
  const xirrCorpus = xirrMonthly(cfCorpus)
  const xirrOwn = xirrMonthly(cfOwn)
  const infl = (inp.inflationPct || 0) / 100
  const ownIn = (inp.opening || 0) + totEE + totVpf

  let pension: number | null = null
  let pensionNote = ''
  if (!inp.epsMember) {
    pensionNote = 'Not an EPS member, so no pension. The full employer 12% goes to your PF.'
    flags.notEpsEligible = true
  } else {
    const last60 = epsWageHist.slice(-60)
    const avg60 = last60.length ? last60.reduce((a, b) => a + b.w, 0) / last60.length : 0
    const periods: Record<number, number> = {}
    const pastYrs = inp.pastEpsYears || 0
    // Past service predates the projection; it is pensionable at the ceiling
    // that applied before the current schedule's change (first segment).
    const pastCeiling = epsSched[0].v
    if (pastYrs > 0) periods[pastCeiling] = (periods[pastCeiling] || 0) + pastYrs
    for (const h of epsWageHist) {
      const c = ceilingOn(h.y, h.m, epsSched)
      periods[c] = (periods[c] || 0) + 1 / 12
    }
    const res = epsPension({ periods, avg60, atSuperannuation: inp.retirementAge >= 58 }, params)
    pension = res.pension
    pensionNote = res.note
  }
  const edliCover = edliN ? edliBenefit(edliWageSum / edliN, edliBalSum / edliN, params) : null
  const engineMs = now() - t0

  return {
    rows,
    months,
    years,
    corpus: bal,
    realCorpus: bal / defl,
    postTax: bal - taxOnInterest,
    taxOnInterest,
    totals: { ee: totEE, vpf: totVpf, erEpf: totEr, eps: totEps, interest: totInt, own: ownIn },
    xirrCorpus,
    xirrOwn,
    realXirr: xirrOwn == null ? null : (1 + xirrOwn) / (1 + infl) - 1,
    moneyMultiple: ownIn > 0 ? bal / ownIn : null,
    pension,
    pensionNote,
    edliCover,
    first,
    flags,
    engineMs,
  }
}

// ---------------------------------------------------------------------------
// EPS / EDLI / XIRR
// ---------------------------------------------------------------------------

/**
 * EPS pension = Σ min(avg60, ceiling) × service-in-period ÷ 70, with 2 bonus
 * years (on the latest period) for 20+ years to superannuation. Minimum
 * pension applies. Below 9.5 years (rounds to 10) there is no pension.
 */
export function epsPension(
  {
    periods,
    avg60,
    atSuperannuation,
  }: { periods: Record<number, number>; avg60: number; atSuperannuation: boolean },
  params: StatutoryParams
): EpsPensionResult {
  const service = Object.values(periods).reduce((a, b) => a + b, 0)
  if (service < 9.5) {
    return {
      pension: null,
      note: `${service.toFixed(1)} years of EPS service. You need 10 for a pension; below that you get a lump-sum withdrawal benefit instead.`,
    }
  }
  const keys = Object.keys(periods)
    .map(Number)
    .sort((a, b) => a - b)
  const bonus = atSuperannuation && service >= 20 ? 2 : 0
  let sum = 0
  keys.forEach((c, idx) => {
    let s = periods[c]
    if (idx === keys.length - 1) s += bonus
    sum += Math.min(avg60, c) * s
  })
  let p = r2(sum / 70)
  if (p < params.epsMinPension) p = params.epsMinPension
  return {
    pension: p,
    note: `${service.toFixed(1)} years of service${bonus ? ' + 2 bonus years' : ''}, pensionable salary capped per ceiling period. Payable from age 58.`,
  }
}

/** EDLI assurance = 35 × avg wage + min(50% of avg balance, bonus cap), within [min, max]. */
export function edliBenefit(avgWage: number, avgBal: number, params: StatutoryParams): number {
  const v = 35 * avgWage + Math.min(0.5 * avgBal, params.edliBonusCap)
  return Math.min(params.edliMax, Math.max(params.edliMin, v))
}

/** Annualised IRR of monthly cash flows (Newton, bisection fallback). Null if undefined. */
export function xirrMonthly(cf: number[]): number | null {
  const npv = (r: number) => cf.reduce((a, c, t) => a + c / Math.pow(1 + r, t), 0)
  const d = (r: number) => cf.reduce((a, c, t) => a - (t * c) / Math.pow(1 + r, t + 1), 0)
  const pos = cf.some((c) => c > 0)
  const neg = cf.some((c) => c < 0)
  if (!pos || !neg) return null
  let r = 0.007
  for (let k = 0; k < 50; k++) {
    const f = npv(r)
    const g = d(r)
    if (!isFinite(f) || !isFinite(g) || g === 0) break
    const nr = r - f / g
    if (Math.abs(nr - r) < 1e-12) {
      r = nr
      return Math.pow(1 + r, 12) - 1
    }
    r = nr
    if (r <= -0.99) break
  }
  let lo = -0.5
  let hi = 0.5
  if (npv(lo) * npv(hi) > 0) return null
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2
    if (npv(lo) * npv(mid) <= 0) hi = mid
    else lo = mid
  }
  return Math.pow(1 + (lo + hi) / 2, 12) - 1
}
