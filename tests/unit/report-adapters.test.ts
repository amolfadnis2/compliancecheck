import { describe, it, expect } from 'vitest'
import {
  adaptDPDP,
  adaptFoodBusiness,
  adaptStateWise,
  adaptStatutoryHealth,
} from '@/lib/pdf/report-data-adapter'
import { FOOD_COMPLIANCE_RULES } from '@/lib/pdf/food-business-compliance-rules'
import { DPDP_COMPLIANCE_RULES } from '@/lib/pdf/dpdp-compliance-rules'
import { STATE_WISE_COMPLIANCE_RULES } from '@/lib/pdf/state-wise-compliance-rules'
import { STATUTORY_HEALTH_COMPLIANCE_RULES } from '@/lib/pdf/statutory-health-compliance-rules'
import { LABOUR_CODE_RULES } from '@/lib/assessments/labour-code-rules'
import { ALL_FOOD_BUSINESS_QUESTIONS } from '@/lib/assessments/food-business-questions'
import { ALL_DPDP_QUESTIONS } from '@/lib/assessments/dpdp-questions'
import { PHASE2_QUESTIONS } from '@/lib/assessments/state-wise-compliance-questions'
import { STATUTORY_HEALTH_QUESTIONS } from '@/lib/assessments/statutory-health-questions'
import { LABOUR_CODE_QUESTIONS } from '@/lib/assessments/labour-code-questions'
import { AREA_OFFICIAL_LINKS } from '@/lib/assessments/auto-dealer/rules-engine'
import type { ComplianceRule } from '@/types/compliance'

/**
 * The paid PDF promises an action plan with legal references and links for
 * every gap. These tests stop a new question shipping without its rule (the
 * gap would print with no remediation, reference or link) and pin the answer
 * classification that decides what becomes an action item.
 */
describe('compliance rule coverage', () => {
  const banks: Array<[string, Array<{ id: string }>, Record<string, ComplianceRule>]> = [
    ['statutory_health', STATUTORY_HEALTH_QUESTIONS, STATUTORY_HEALTH_COMPLIANCE_RULES],
    ['labour_code', LABOUR_CODE_QUESTIONS, LABOUR_CODE_RULES],
    ['dpdp', ALL_DPDP_QUESTIONS, DPDP_COMPLIANCE_RULES],
    ['state_wise_compliance', PHASE2_QUESTIONS, STATE_WISE_COMPLIANCE_RULES],
    ['food_business', ALL_FOOD_BUSINESS_QUESTIONS, FOOD_COMPLIANCE_RULES],
  ]

  it.each(banks)('%s: every compliance question has a rule', (_type, questions, rules) => {
    const missing = questions.map((q) => q.id).filter((id) => !rules[id])
    expect(missing).toEqual([])
  })

  it.each(banks)('%s: every rule has a reference, remediation and a place to act', (_type, questions, rules) => {
    for (const q of questions) {
      const rule = rules[q.id]
      expect(rule.governmentRef, q.id).toBeTruthy()
      expect(rule.actionIfNonCompliant.length, q.id).toBeGreaterThan(0)
      expect(rule.officialLink.trim(), q.id).not.toBe('')
      // A URL must be a single, well-formed link — the PDF makes it clickable.
      if (/^https?:/.test(rule.officialLink)) {
        expect(rule.officialLink, q.id).toMatch(/^https?:\/\/[^\s,]+$/)
      }
    }
  })

  it('auto-dealer: every compliance area has somewhere to act', () => {
    for (const [area, link] of Object.entries(AREA_OFFICIAL_LINKS)) {
      expect(link.trim(), area).not.toBe('')
    }
  })
})

describe('report adapters', () => {
  it('counts questions and compliant answers per category (no more 0/0)', () => {
    const report = adaptStatutoryHealth({
      overall_score: 50,
      category_scores: { pf: { score: 10, max: 18, percentage: 56 } },
      responses: { answers: { pf_1: 'yes', pf_2: 'no' } },
    })
    const pf = report.categoryScores.find((c) => c.category === 'Provident Fund')
    expect(pf).toMatchObject({ score: 56, questionCount: 2, compliantCount: 1 })
    expect(report.actionItems.map((a) => a.questionId)).toEqual(['pf_2'])
    expect(report.actionItems[0].officialLink).toMatch(/^https:/)
  })

  it('a 0% overall score stays 0, not a default', () => {
    const report = adaptStatutoryHealth({ overall_score: 0, responses: { answers: {} } })
    expect(report.overallScore).toBe(0)
  })

  it('DPDP multiple-choice answers become action items (second option is partial)', () => {
    const q = ALL_DPDP_QUESTIONS.find((x) => x.type === 'multiple_choice' && x.options && x.options.length > 2)!
    const report = adaptDPDP({
      overall_score: 30,
      category_scores: { [q.phase]: { score: 0, maxScore: 10, percentage: 30 } },
      responses: { main: { [q.id]: q.options![1] } },
    })
    expect(report.actionItems).toHaveLength(1)
    // Category at 30% is high priority; a partial answer is one step lower.
    expect(report.actionItems[0].priority).toBe('medium')

    const gap = adaptDPDP({
      overall_score: 30,
      category_scores: { [q.phase]: { percentage: 30 } },
      responses: { main: { [q.id]: q.options![q.options!.length - 1] } },
    })
    expect(gap.actionItems[0].priority).toBe('high')
  })

  it('state-wise: "na" is skipped, "sometimes" is a partial, "unsure" asks to verify', () => {
    const singles = PHASE2_QUESTIONS.filter((q) => q.type === 'single_choice')
    const answers: Record<string, string> = {}
    const [a, b, c] = singles
    answers[a.id] = 'na'
    answers[b.id] = 'sometimes'
    answers[c.id] = 'unsure'
    const report = adaptStateWise({ overall_score: 60, responses: { answers } })
    const ids = report.actionItems.map((i) => i.questionId)
    expect(ids).not.toContain(a.id)
    expect(ids).toEqual(expect.arrayContaining([b.id, c.id]))
    expect(report.actionItems.find((i) => i.questionId === c.id)!.description).toMatch(/not sure/i)
  })

  it('food business: every non-compliant answer reaches the action plan with a reference', () => {
    const answers: Record<string, string> = {}
    for (const q of ALL_FOOD_BUSINESS_QUESTIONS) {
      answers[q.id] = q.type === 'multiple_choice' ? q.options![q.options!.length - 1] : 'no'
    }
    const report = adaptFoodBusiness({ overall_score: 10, responses: { answers } })
    // Multiple-choice "not required" options are not applicable, everything else is a gap.
    const notApplicable = ALL_FOOD_BUSINESS_QUESTIONS.filter(
      (q) => q.type === 'multiple_choice' && /not required/i.test(q.options![q.options!.length - 1])
    ).length
    expect(report.actionItems).toHaveLength(ALL_FOOD_BUSINESS_QUESTIONS.length - notApplicable)
    expect(report.actionItems.every((i) => !!i.governmentRef)).toBe(true)
    // Category labels come from the question bank, not raw keys.
    expect(report.actionItems.map((i) => i.category)).not.toContain('LABOR')
  })
})

describe('auto-dealer report', () => {
  it('renders a PDF with an action plan for a row with gaps', async () => {
    const { generateAutoDealerPdfForRow, computeAutoDealerResults, AUTO_DEALER_ALL_QUESTIONS } =
      await import('@/lib/pdf/auto-dealer-report')
    const { buildApplicabilityProfileFromResponses } = await import('@/lib/assessments/auto-dealer/rules-engine')
    const responses: Record<string, string> = {
      AD_APP_001: 'pvt_ltd', AD_APP_003: '20_49', AD_APP_008: '4w_only', AD_APP_011: 'yes',
    }
    const profile = buildApplicabilityProfileFromResponses(responses)
    for (const q of AUTO_DEALER_ALL_QUESTIONS) {
      if (q.phase !== 1 && q.appliesWhen(profile)) responses[q.id] = 'no'
    }
    const row = {
      id: 'abcdef12-0000', user_email: 'a@b.c', email_verified: true, full_name: null,
      company_name: 'Demo Motors', phone: null, responses, price_tier: null,
      labour_regime: 'new', payment_status: 'paid',
    }
    expect(computeAutoDealerResults(row).gapAnalysis.length).toBeGreaterThan(0)
    const bytes = generateAutoDealerPdfForRow(row)
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe('%PDF-')
  })
})
