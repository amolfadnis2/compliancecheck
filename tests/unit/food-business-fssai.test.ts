import { describe, it, expect } from 'vitest'
import {
  getFssaiType,
  isGstRequired,
  calculateApplicability,
  FOOD_BUSINESS_APPLICABILITY_QUESTIONS,
} from '@/lib/assessments/food-business-applicability'

describe('food-business FSSAI tiers (2026 amendment)', () => {
  it('uses Registration up to Rs.1.5 crore', () => {
    expect(getFssaiType('below_20_lakh')).toBe('Basic Registration')
    expect(getFssaiType('20_lakh_to_1_5_cr')).toBe('Basic Registration')
  })

  it('uses State Licence from Rs.1.5 crore to Rs.50 crore', () => {
    expect(getFssaiType('1_5_cr_to_5_cr')).toBe('State Licence')
    expect(getFssaiType('5_cr_to_50_cr')).toBe('State Licence')
  })

  it('uses Central Licence above Rs.50 crore', () => {
    expect(getFssaiType('above_50_cr')).toBe('Central Licence')
  })

  it('still resolves legacy band values from saved progress', () => {
    expect(getFssaiType('below_12_lakh')).toBe('Basic Registration')
    expect(getFssaiType('20_lakh_to_1_cr')).toBe('Basic Registration')
    expect(getFssaiType('5_cr_to_20_cr')).toBe('State Licence')
  })

  it('offers turnover options aligned to the new thresholds', () => {
    const q = FOOD_BUSINESS_APPLICABILITY_QUESTIONS.find(x => x.id === 'annual_turnover')
    expect(q?.options?.map(o => o.value)).toEqual([
      'below_20_lakh', '20_lakh_to_1_5_cr', '1_5_cr_to_5_cr', '5_cr_to_50_cr', 'above_50_cr',
    ])
  })

  it('requires GST above Rs.20 lakh or with aggregator listing', () => {
    expect(isGstRequired('below_20_lakh', false)).toBe(false)
    expect(isGstRequired('below_20_lakh', true)).toBe(true)
    expect(isGstRequired('20_lakh_to_1_5_cr', false)).toBe(true)
  })

  it('names the tier in the FSSAI applicability result', () => {
    const fssai = calculateApplicability({ annual_turnover: '20_lakh_to_1_5_cr' }).find(r => r.code === 'FSSAI')
    expect(fssai?.reason).toContain('Basic Registration')
  })
})
