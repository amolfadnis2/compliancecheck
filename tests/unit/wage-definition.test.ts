import { describe, it, expect } from 'vitest'
import { statutoryWages } from '@/lib/calculators/wage-definition'
import { calculateGratuity } from '@/lib/calculators/gratuity-calculator'
import { calculateCTCBreakdown } from '@/lib/calculators/ctc-calculator'

/**
 * Code on Wages "wages" definition: if excluded components exceed 50% of total
 * pay, the excess is added back to wages (Maharashtra Wage Rules, 2026 restate
 * it). Worked cases, total pay Rs.1,00,000/month:
 *
 *   Basic+DA   Excluded   Excluded %   Add-back   Wages
 *   60,000     40,000     40%          0          60,000   (under 50%)
 *   50,000     50,000     50%          0          50,000   (exactly 50%)
 *   30,000     70,000     70%          20,000     50,000   (over 50%)
 */
describe('statutoryWages — 50% add-back', () => {
  it('under 50% excluded: no add-back', () => {
    expect(statutoryWages(60_000, 100_000)).toEqual({
      wageComponents: 60_000, totalRemuneration: 100_000, addBack: 0, wages: 60_000,
    })
  })

  it('exactly 50% excluded: no add-back', () => {
    expect(statutoryWages(50_000, 100_000)).toMatchObject({ addBack: 0, wages: 50_000 })
  })

  it('over 50% excluded: excess added back', () => {
    expect(statutoryWages(30_000, 100_000)).toMatchObject({ addBack: 20_000, wages: 50_000 })
  })

  it('no total pay, or total below Basic+DA: Basic+DA unchanged', () => {
    expect(statutoryWages(30_000)).toMatchObject({ addBack: 0, wages: 30_000 })
    expect(statutoryWages(30_000, 0)).toMatchObject({ addBack: 0, wages: 30_000 })
    expect(statutoryWages(30_000, 20_000)).toMatchObject({ addBack: 0, wages: 30_000, totalRemuneration: 0 })
  })
})

describe('calculateGratuity — uses wages after the add-back', () => {
  // 10 completed years (no month rounding): 15 x wages x 10 / 26
  const base = {
    employmentType: 'regular' as const,
    dateOfJoining: new Date('2016-01-01'),
    lastWorkingDate: new Date('2026-01-01'),
  }

  it('under 50%: Rs.60,000 wages -> Rs.3,46,154', () => {
    const r = calculateGratuity({ ...base, lastDrawnBasicDA: 60_000, monthlyTotalRemuneration: 100_000 })
    expect(r.breakdown).toMatchObject({ basicDA: 60_000, addBack: 0, wages: 60_000 })
    expect(r.breakdown.grossAmount).toBe(346_154)
  })

  it('exactly 50%: Rs.50,000 wages -> Rs.2,88,462', () => {
    const r = calculateGratuity({ ...base, lastDrawnBasicDA: 50_000, monthlyTotalRemuneration: 100_000 })
    expect(r.breakdown).toMatchObject({ addBack: 0, wages: 50_000 })
    expect(r.breakdown.grossAmount).toBe(288_462)
  })

  it('over 50%: Basic+DA Rs.30,000 + Rs.20,000 add-back -> Rs.2,88,462 (not Rs.1,73,077)', () => {
    const r = calculateGratuity({ ...base, lastDrawnBasicDA: 30_000, monthlyTotalRemuneration: 100_000 })
    expect(r.breakdown).toMatchObject({ basicDA: 30_000, addBack: 20_000, wages: 50_000 })
    expect(r.breakdown.grossAmount).toBe(288_462)
    expect(r.formula).toContain('50,000')

    const withoutTotal = calculateGratuity({ ...base, lastDrawnBasicDA: 30_000 })
    expect(withoutTotal.breakdown.grossAmount).toBe(173_077)
  })
})

describe('CTC calculator — already satisfies the 50% rule', () => {
  // Basic is fixed at 50% of CTC, and gross pay is CTC minus employer PF, ESI
  // and gratuity, so allowances can never exceed 50% of gross: no add-back is
  // ever due, and PF / gratuity on basic are already "wages".
  it.each([300_000, 600_000, 1_200_000, 2_500_000, 6_000_000])('CTC Rs.%i', (annualCTC) => {
    const b = calculateCTCBreakdown({ annualCTC, isMetroCity: true, state: 'Maharashtra', taxRegime: 'new' })
    const gross = b.monthlyGross
    expect(statutoryWages(b.monthlyBasic, gross).addBack).toBe(0)
  })
})
