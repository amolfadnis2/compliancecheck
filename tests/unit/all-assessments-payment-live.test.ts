import { describe, it, expect, vi, beforeEach } from 'vitest'

// The DB row and entitlement seen by the server PDF generator, per test.
const mock = vi.hoisted(() => ({
  state: {
    row: null as null | Record<string, unknown>,
    entitlement: 'none' as 'none' | 'paid' | 'waived',
  },
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: mock.state.row,
            error: mock.state.row ? null : { message: 'not found' },
          }),
        }),
      }),
    }),
  }),
}))

vi.mock('@/lib/payment/entitlement', () => ({
  getEntitlement: async () => mock.state.entitlement,
  isEntitled: async () => mock.state.entitlement !== 'none',
}))

import {
  ASSESSMENT_TYPES,
  ASSESSMENT_PRICES,
  isPaymentLive,
  isPaidAssessment,
  type AssessmentType,
} from '@/lib/constants/assessment-types'
import { buildSummaryData } from '@/lib/payment/summary-registry'
import { generateAssessmentPdf } from '@/lib/pdf/server-report'
import { buildSampleReport } from '@/lib/pdf/sample-report-fixtures'

const EXPECTED_PRICES_INR: Record<AssessmentType, number> = {
  [ASSESSMENT_TYPES.STATUTORY_HEALTH]: 499,
  [ASSESSMENT_TYPES.LABOUR_CODE]: 999,
  [ASSESSMENT_TYPES.DPDP]: 2499,
  [ASSESSMENT_TYPES.STATE_WISE_COMPLIANCE]: 499,
  [ASSESSMENT_TYPES.FOOD_BUSINESS]: 999,
  [ASSESSMENT_TYPES.POSH]: 1999,
  [ASSESSMENT_TYPES.AUTO_DEALER]: 2999,
}

describe('every assessment is paid and live', () => {
  it.each(Object.entries(EXPECTED_PRICES_INR))('%s is live at Rs %i', (type, inr) => {
    const t = type as AssessmentType
    expect(isPaymentLive(t)).toBe(true)
    expect(isPaidAssessment(t)).toBe(true)
    expect(ASSESSMENT_PRICES[t].amountPaise).toBe(inr * 100)
  })
})

// Rows in the exact shape each submit route stores, built from the real sample
// answers so the adapters produce genuine gaps.
const OWNER = 'owner@example.com'
const userDetails = { fullName: 'Jane Doe', email: OWNER, companyName: 'Acme Pvt Ltd' }

function rowFor(type: AssessmentType): Record<string, unknown> {
  const sample = buildSampleReport(type)
  if (!sample) throw new Error(`no sample for ${type}`)
  const answers: Record<string, string> = {}
  sample.actionItems.forEach((a) => { if (a.questionId) answers[a.questionId] = 'no' })
  sample.compliantItems.forEach((c) => { if (c.questionId) answers[c.questionId] = 'yes' })
  const responses =
    type === ASSESSMENT_TYPES.STATE_WISE_COMPLIANCE
      ? { phase1: {}, phase2: answers, answers, userDetails } // state-wise-submit shape
      : { answers, userDetails }
  return {
    id: `row-${type}`,
    assessment_type: type,
    status: 'completed',
    overall_score: sample.overallScore,
    category_scores: {},
    action_items: [],
    responses,
  }
}

const DB_BACKED_NEW = [
  ASSESSMENT_TYPES.LABOUR_CODE,
  ASSESSMENT_TYPES.STATE_WISE_COMPLIANCE,
  ASSESSMENT_TYPES.FOOD_BUSINESS,
] as const

describe('newly-paid DB-backed assessments', () => {
  beforeEach(() => {
    mock.state.row = null
    mock.state.entitlement = 'none'
  })

  it.each(DB_BACKED_NEW)('%s teaser shows real gaps but no remediation', (type) => {
    const row = rowFor(type)
    const summary = buildSummaryData(type, row as never)
    expect(summary.priceINR).toBe(EXPECTED_PRICES_INR[type])
    expect(summary.gapsCount).toBeGreaterThan(0)
    // The teaser must never carry the paid remediation text.
    const sample = buildSampleReport(type)!
    const serialized = JSON.stringify(summary)
    sample.actionItems.forEach((a) => {
      if (a.remediation) expect(serialized).not.toContain(a.remediation)
    })
  })

  it.each(DB_BACKED_NEW)('%s PDF is refused until paid', async (type) => {
    mock.state.row = rowFor(type)
    mock.state.entitlement = 'none'
    expect(await generateAssessmentPdf(`row-${type}`, OWNER)).toEqual({ error: 'payment_required' })
  })

  it.each(DB_BACKED_NEW)('%s PDF renders once paid or waived', async (type) => {
    mock.state.row = rowFor(type)
    for (const status of ['paid', 'waived'] as const) {
      mock.state.entitlement = status
      const result = await generateAssessmentPdf(`row-${type}`, OWNER)
      expect('bytes' in result && result.bytes.length).toBeGreaterThan(10_000)
    }
  })
})
