import { describe, it, expect } from 'vitest'
import { toSummary } from '@/lib/payment/summary-data'

describe('toSummary', () => {
  const source = {
    overallScore: 42.6,
    companyName: 'Acme Pvt Ltd',
    categoryScores: [
      { category: 'Provident Fund', score: 80 },
      { category: 'ESI', score: 30 },
      { category: 'Gratuity', score: 55 },
    ],
    actionItems: [
      { priority: 'high', category: 'ESI', title: 'Register with ESIC', remediation: ['do x', 'do y'] },
      { priority: 'critical', category: 'PF', title: 'Deposit PF' },
      { priority: 'medium', category: 'Gratuity', title: 'Maintain records' },
      { priority: 'low', category: 'Bonus', title: 'Pay bonus' },
    ],
  }

  it('rounds the score and derives the risk band', () => {
    const summary = toSummary(source, { assessmentType: 'statutory_health', priceINR: 499 })
    expect(summary.overallScore).toBe(43)
    expect(summary.riskColor).toBe('amber')
    expect(summary.riskLabel).toBe('Needs Attention')
  })

  it('drops remediation text — only priority + category reach topIssues', () => {
    const summary = toSummary(source, { assessmentType: 'statutory_health', priceINR: 499 })
    expect(summary.topIssues).toHaveLength(3)
    for (const issue of summary.topIssues) {
      expect(Object.keys(issue).sort()).toEqual(['category', 'priority'])
    }
    // No remediation/title leaks through anywhere on the summary
    expect(JSON.stringify(summary)).not.toContain('Register with ESIC')
    expect(JSON.stringify(summary)).not.toContain('do x')
  })

  it('counts gaps and high-priority items (high + critical)', () => {
    const summary = toSummary(source, { assessmentType: 'statutory_health', priceINR: 499 })
    expect(summary.gapsCount).toBe(4)
    expect(summary.highPriorityCount).toBe(2)
  })

  it('maps category status by 70/40 bands and carries price + display name', () => {
    const summary = toSummary(source, { assessmentType: 'statutory_health', priceINR: 499 })
    expect(summary.categoryScores.map((c) => c.status)).toEqual([
      'compliant',
      'non-compliant',
      'needs-attention',
    ])
    expect(summary.priceINR).toBe(499)
    expect(summary.displayName).toBe('Statutory Health Check')
    expect(summary.companyName).toBe('Acme Pvt Ltd')
  })

  it("treats the adapter placeholder 'Not specified' as empty company name", () => {
    const summary = toSummary(
      { ...source, companyName: 'Not specified' },
      { assessmentType: 'dpdp', priceINR: 2499 }
    )
    expect(summary.companyName).toBe('')
  })
})
