import { describe, it, expect } from 'vitest'
import {
  getFilteredPhase2Questions,
  PHASE2_QUESTIONS,
} from '@/lib/assessments/state-wise-compliance-questions'
import { STATE_WISE_COMPLIANCE_RULES } from '@/lib/pdf/state-wise-compliance-rules'

/**
 * Regulatory update Nov 2026: state-only questions (Maharashtra Wage Rules,
 * 2026) must reach only businesses operating in that state.
 */
function idsFor(state: string, employees = '10-19'): string[] {
  const responses = { APP_02: state, APP_03: 'same_as_registered', APP_04: 'it_software', APP_06: employees }
  return getFilteredPhase2Questions([], responses).map((q) => q.id)
}

const MH_IDS = ['MH_WAGE_01', 'MH_WAGE_02', 'MH_WAGE_03', 'MH_WAGE_04', 'MH_WAGE_05']

describe('state-wise: Maharashtra Wage Rules, 2026', () => {
  it('shows all five Maharashtra wage questions to a Maharashtra employer', () => {
    expect(idsFor('maharashtra')).toEqual(expect.arrayContaining(MH_IDS))
  })

  it('hides them in other states', () => {
    for (const state of ['karnataka', 'kerala', 'delhi']) {
      expect(idsFor(state).filter((id) => id.startsWith('MH_'))).toEqual([])
    }
  })

  it('has a rule for each question, citing the 2026 rules', () => {
    for (const id of MH_IDS) {
      expect(PHASE2_QUESTIONS.find((q) => q.id === id)?.states).toEqual(['maharashtra'])
      expect(STATE_WISE_COMPLIANCE_RULES[id].governmentRef).toMatch(/Maharashtra Wage Rules, 2026/)
    }
  })

  it('register retention is 5 years in Maharashtra', () => {
    expect(STATE_WISE_COMPLIANCE_RULES.MH_WAGE_05.actionIfNonCompliant.join(' ')).toMatch(/5 years from the date of its last entry/)
  })
})

describe('DPDP phased timeline', () => {
  it('report deadlines: Consent Manager registration is not framed as an SME duty', async () => {
    const { DPDP_CONFIG } = await import('@/lib/pdf/report-configs')
    const cm = DPDP_CONFIG.deadlines.find((d) => /consent manager/i.test(d.item))
    expect(cm?.item).toMatch(/only for would-be Consent Managers/)
    expect(cm?.date).toMatch(/13 Nov 2026/)
    expect(DPDP_CONFIG.deadlines.map((d) => d.date)).toContain('13 May 2027')
    expect(JSON.stringify(DPDP_CONFIG)).not.toMatch(/Before processing personal data/)
  })

  it('countdown still targets 13 May 2027', async () => {
    const { getDaysUntilDeadline } = await import('@/lib/assessments/dpdp-questions')
    const days = getDaysUntilDeadline()
    const expected = Math.ceil((new Date('2027-05-13').getTime() - Date.now()) / 86_400_000)
    expect(days).toBe(Math.max(0, expected))
  })

  it('penalty FAQ no longer says the rules are not yet notified', async () => {
    const { FAQ_ITEMS } = await import('@/lib/calculators/penalty-exposure/faq-content')
    const text = JSON.stringify(FAQ_ITEMS)
    expect(text).not.toMatch(/remaining rules are notified|target for full rule notification/)
    expect(text).toMatch(/Consent Manager registration opened on November 13, 2026/)
  })
})
