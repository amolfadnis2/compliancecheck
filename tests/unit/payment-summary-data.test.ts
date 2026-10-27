import { describe, it, expect } from 'vitest'
import { toSummary, withPeerAverages } from '@/lib/payment/summary-data'

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

  it('shows the top three actions as headlines only — never remediation', () => {
    const summary = toSummary(source, { assessmentType: 'statutory_health', priceINR: 499 })
    expect(summary.topActions).toHaveLength(3)
    // Most urgent first
    expect(summary.topActions.map((a) => a.priority)).toEqual(['critical', 'high', 'medium'])
    expect(summary.topActions[1]).toEqual({ priority: 'high', category: 'ESI', headline: 'Register with ESIC' })
    for (const action of summary.topActions) {
      expect(Object.keys(action).sort()).toEqual(['category', 'headline', 'priority'])
    }
    expect(JSON.stringify(summary)).not.toContain('do x')
  })

  it('truncates long headlines', () => {
    const long = 'A'.repeat(200)
    const summary = toSummary(
      { ...source, actionItems: [{ priority: 'high', category: 'X', title: long }] },
      { assessmentType: 'statutory_health', priceINR: 499 }
    )
    expect(summary.topActions[0].headline.length).toBeLessThanOrEqual(90)
    expect(summary.topActions[0].headline.endsWith('...')).toBe(true)
  })

  it('carries the Acts covered as legal references', () => {
    const summary = toSummary(
      { ...source, legislation: ['EPF Act 1952', 'ESI Act 1948'] },
      { assessmentType: 'statutory_health', priceINR: 499 }
    )
    expect(summary.legalReferences).toEqual(['EPF Act 1952', 'ESI Act 1948'])
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

describe('withPeerAverages', () => {
  const base = toSummary(
    {
      overallScore: 50,
      categoryScores: [
        { category: 'Provident Fund', score: 80, key: 'pf' },
        { category: 'ESI', score: 30, key: 'esi' },
      ],
      actionItems: [],
    },
    { assessmentType: 'statutory_health', priceINR: 499 }
  )

  it('leaves the summary unchanged without peer data', () => {
    expect(withPeerAverages(base, null)).toBe(base)
  })

  it('overlays category averages by key and records the peer group', () => {
    const out = withPeerAverages(base, {
      sampleSize: 25, scope: 'all', overallAverage: 61, categories: { pf: 70 },
    })
    expect(out.categoryScores.find((c) => c.key === 'pf')?.peerAverage).toBe(70)
    expect(out.categoryScores.find((c) => c.key === 'esi')?.peerAverage).toBeUndefined()
    expect(out.peers).toEqual({ sampleSize: 25, scope: 'all', industry: undefined, overallAverage: 61 })
  })
})

describe('toAutoDealerSummary', () => {
  it('maps phases to categories (keyed by phase), severity to priority, applicable areas to legal refs', async () => {
    const { toAutoDealerSummary } = await import('@/lib/payment/auto-dealer-summary')
    const summary = toAutoDealerSummary({
      overallScore: 55,
      phaseScores: [
        { phase: 2, phaseName: 'x', earnedPoints: 1, maxPoints: 2, score: 50, status: 'yellow', questionCount: 2, compliantCount: 1 },
      ],
      gapAnalysis: [
        { questionId: 'q', phase: 2, phaseName: 'x', complianceArea: 'epf', title: 'Deposit EPF by the 15th', finding: 'secret finding',
          recommendation: 'secret fix', timeline: '30_days', penaltyExposure: 'secret penalty', severity: 'critical', weight: 5, source: 'EPF Act' },
      ],
      applicabilityChecks: [
        { complianceArea: 'epf', label: 'EPF & MP Act', applies: true, triggerReason: '', phase: 2 },
        { complianceArea: 'csr', label: 'CSR', applies: false, triggerReason: '', phase: 6 },
      ],
      companyName: 'Demo Motors',
    })
    expect(summary.categoryScores[0]).toMatchObject({ key: '2', name: 'Statutory Compliance', percentage: 50 })
    expect(summary.topActions[0]).toEqual({ priority: 'critical', category: 'Statutory Compliance', headline: 'Deposit EPF by the 15th' })
    expect(summary.highPriorityCount).toBe(1)
    expect(summary.legalReferences).toEqual(['EPF & MP Act'])
    expect(JSON.stringify(summary)).not.toMatch(/secret/)
  })
})
