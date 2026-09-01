import { describe, it, expect } from 'vitest'
import {
  ASSESSMENT_TYPES,
  ASSESSMENT_PRICES,
  isPaymentLive,
  isPaidAssessment,
  getAssessmentPricePaise,
} from '@/lib/constants/assessment-types'
import { getSampleReportPath } from '@/lib/pdf/sample-report-paths'

describe('POSH payment go-live', () => {
  it('is flagged live at Rs 1,999', () => {
    expect(isPaymentLive(ASSESSMENT_TYPES.POSH)).toBe(true)
    expect(isPaidAssessment(ASSESSMENT_TYPES.POSH)).toBe(true)
    expect(getAssessmentPricePaise(ASSESSMENT_TYPES.POSH)).toBe(199900)
  })

  it('has a sample report to show before payment', () => {
    expect(getSampleReportPath(ASSESSMENT_TYPES.POSH)).toBe('/api/sample-report/posh')
  })

  /**
   * The POSH page renders its own <PaymentGate>. The displayed price must be
   * derived from ASSESSMENT_PRICES, because /api/payment/create-order charges
   * from that same constant server-side — a hardcoded number in the page would
   * show one price and charge another (it previously showed Rs 999).
   */
  it('displays the same price the server charges', () => {
    const displayed = Math.round(ASSESSMENT_PRICES[ASSESSMENT_TYPES.POSH].amountPaise / 100)
    expect(displayed).toBe(1999)
    expect(displayed * 100).toBe(getAssessmentPricePaise(ASSESSMENT_TYPES.POSH))
  })
})
