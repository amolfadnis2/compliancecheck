import { describe, it, expect, vi, beforeEach } from 'vitest'

// Controls the DB row, entitlement status, and payment-live flag seen by the
// module under test without touching real Supabase/env state.
const mock = vi.hoisted(() => ({
  state: {
    row: null as null | Record<string, unknown>,
    entitlement: 'none' as 'none' | 'paid' | 'waived',
    live: false,
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
}))

vi.mock('@/lib/constants/assessment-types', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/constants/assessment-types')>()
  return {
    ...actual,
    isPaymentLive: (type: string) =>
      type === actual.ASSESSMENT_TYPES.POSH ? mock.state.live : actual.isPaymentLive(type),
  }
})

import { generatePoshAssessmentPdf } from '@/lib/pdf/server-posh-report'

function baseRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'posh-1',
    email: 'owner@example.com',
    full_name: 'Jane Doe',
    company_name: 'Acme Pvt Ltd',
    phone: '9999999999',
    overall_score: 62,
    risk_level: 'medium',
    category_scores: [
      { category: 'icc_constitution', categoryName: 'ICC Constitution', percentage: 70, status: 'needs_attention', questionCount: 5, compliantCount: 3 },
    ],
    action_items: [],
    compliant_items: [],
    applicability_responses: { POSH_APP_001: '50_to_199', POSH_APP_006: 'maharashtra', POSH_APP_008: 'it_services' },
    ...overrides,
  }
}

describe('generatePoshAssessmentPdf', () => {
  beforeEach(() => {
    mock.state.row = null
    mock.state.entitlement = 'none'
    mock.state.live = false
  })

  it('returns not_found when the assessment row does not exist', async () => {
    const result = await generatePoshAssessmentPdf('missing-id', 'owner@example.com')
    expect(result).toEqual({ error: 'not_found' })
  })

  it('returns unauthorized when the requesting email does not match the stored owner', async () => {
    mock.state.row = baseRow()
    const result = await generatePoshAssessmentPdf('posh-1', 'someone-else@example.com')
    expect(result).toEqual({ error: 'unauthorized' })
  })

  it('returns unauthorized when no email is supplied at all', async () => {
    mock.state.row = baseRow()
    const result = await generatePoshAssessmentPdf('posh-1', null)
    expect(result).toEqual({ error: 'unauthorized' })
  })

  it('returns payment_required when payment is live and the assessment is unpaid', async () => {
    mock.state.row = baseRow()
    mock.state.live = true
    mock.state.entitlement = 'none'
    const result = await generatePoshAssessmentPdf('posh-1', 'owner@example.com')
    expect(result).toEqual({ error: 'payment_required' })
  })

  it('generates PDF bytes when payment is live and the assessment is paid', async () => {
    mock.state.row = baseRow()
    mock.state.live = true
    mock.state.entitlement = 'paid'
    const result = await generatePoshAssessmentPdf('posh-1', 'owner@example.com')
    if ('error' in result) throw new Error(`expected success, got error: ${result.error}`)
    expect(result.bytes.length).toBeGreaterThan(0)
    expect(result.companyName).toBe('Acme Pvt Ltd')
    expect(result.score).toBe(62)
    expect(result.filename).toMatch(/^POSH-Compliance-Report-\d{4}-\d{2}-\d{2}\.pdf$/)
  })

  it('skips the entitlement gate while payment is not live, matching current behaviour', async () => {
    mock.state.row = baseRow()
    mock.state.live = false
    mock.state.entitlement = 'none'
    const result = await generatePoshAssessmentPdf('posh-1', 'owner@example.com')
    expect('error' in result).toBe(false)
  })

  it('matches the owner email case-insensitively', async () => {
    mock.state.row = baseRow({ email: 'Owner@Example.com' })
    const result = await generatePoshAssessmentPdf('posh-1', 'owner@example.com')
    expect('error' in result).toBe(false)
  })
})
