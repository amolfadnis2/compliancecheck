import { describe, it, expect } from 'vitest'
import { ASSESSMENT_TYPES, isPaymentLive, isPaidAssessment, getAssessmentPricePaise } from '@/lib/constants/assessment-types'
import { buildSummaryData } from '@/lib/payment/summary-registry'

describe('DPDP payment go-live', () => {
  it('is flagged live at Rs 2,499', () => {
    expect(isPaymentLive(ASSESSMENT_TYPES.DPDP)).toBe(true)
    expect(isPaidAssessment(ASSESSMENT_TYPES.DPDP)).toBe(true)
    expect(getAssessmentPricePaise(ASSESSMENT_TYPES.DPDP)).toBe(249900)
  })

  it('builds a teaser summary via the registered adapter without throwing', () => {
    const summary = buildSummaryData(ASSESSMENT_TYPES.DPDP, {
      id: 'test-1',
      assessment_type: ASSESSMENT_TYPES.DPDP,
      overall_score: 42,
      category_scores: {},
      responses: { answers: {} },
      user_details: {},
    })
    expect(summary.assessmentType).toBe(ASSESSMENT_TYPES.DPDP)
    expect(summary.priceINR).toBe(2499)
  })
})
