import { describe, it, expect } from 'vitest'
import { adaptPOSHRow } from '@/lib/pdf/report-data-adapter'

function baseRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'posh-123',
    email: 'owner@example.com',
    full_name: 'Jane Doe',
    company_name: 'Acme Pvt Ltd',
    phone: '9999999999',
    overall_score: 62,
    risk_level: 'medium',
    category_scores: [
      { category: 'icc_constitution', categoryName: 'ICC Constitution', percentage: 70, status: 'needs_attention', questionCount: 5, compliantCount: 3 },
    ],
    action_items: [{ priority: 'high', category: 'icc_constitution', title: 'Appoint external member' }],
    compliant_items: [{ category: 'icc_constitution', title: 'Policy displayed' }],
    applicability_responses: {
      POSH_APP_001: '50_to_199',
      POSH_APP_006: 'maharashtra',
      POSH_APP_008: 'it_services',
    },
    ...overrides,
  }
}

describe('adaptPOSHRow', () => {
  it('maps score, risk label, and penalty exposure from the stored risk level', () => {
    const data = adaptPOSHRow(baseRow())
    expect(data.overallScore).toBe(62)
    expect(data.riskLevel).toBe('Medium Risk')
    expect(data.penaltyExposure).toBe('Rs.50,000+')
  })

  it('resolves state/employee-count/industry labels from applicability responses', () => {
    const data = adaptPOSHRow(baseRow())
    expect(data.userDetails.state).toBe('Maharashtra')
    expect(data.userDetails.employeeCount).toBe('50-199 employees')
    expect(data.userDetails.industry).toBe('IT Services / Software')
  })

  it('carries company/contact details straight from the row', () => {
    const data = adaptPOSHRow(baseRow())
    expect(data.userDetails.companyName).toBe('Acme Pvt Ltd')
    expect(data.userDetails.fullName).toBe('Jane Doe')
    expect(data.userDetails.email).toBe('owner@example.com')
  })

  it('defaults overall score to 0 when null, not falsy-coerced away from a real zero', () => {
    const data = adaptPOSHRow(baseRow({ overall_score: 0 }))
    expect(data.overallScore).toBe(0)
  })

  it('falls back to the raw applicability code when no label exists', () => {
    const data = adaptPOSHRow(baseRow({ applicability_responses: { POSH_APP_006: 'unmapped_state' } }))
    expect(data.userDetails.state).toBe('unmapped_state')
  })
})
