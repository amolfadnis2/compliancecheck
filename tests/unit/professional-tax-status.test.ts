import { describe, it, expect } from 'vitest'
import { INDIAN_STATES, PT_STATUS, getPTStatus, isPTApplicable } from '@/lib/constants/india'
import {
  determineApplicability,
  getFilteredPhase2Questions,
  STATE_OPTIONS,
  toStateValue,
  type ApplicabilityResponses,
} from '@/lib/assessments/state-wise-compliance-questions'
import { calculateApplicability } from '@/lib/assessments/food-business-applicability'
import { getStateCompliance } from '@/lib/content/state-compliance'

describe('PT_STATUS (single source of truth)', () => {
  it('covers every state and UT', () => {
    for (const state of INDIAN_STATES) {
      expect(PT_STATUS[state], state).toBeDefined()
    }
  })

  it('matches the verified status for contested states', () => {
    expect(getPTStatus('Chhattisgarh')).toBe('levied')
    expect(getPTStatus('Mizoram')).toBe('levied')
    expect(getPTStatus('Nagaland')).toBe('levied')
    expect(getPTStatus('Rajasthan')).toBe('not_levied')
    expect(getPTStatus('Goa')).toBe('verify')
  })

  it('treats unknown names as verify, and only levied states as applicable', () => {
    expect(getPTStatus('Atlantis')).toBe('verify')
    expect(isPTApplicable('Goa')).toBe(false)
    expect(isPTApplicable('Odisha')).toBe(true)
  })
})

describe('State-Wise Professional Tax applicability', () => {
  const pt = (states: string[] | string, registered = 'delhi') => {
    const responses: ApplicabilityResponses = {
      APP_02: registered,
      APP_03: states,
      APP_04: 'it_software',
      APP_06: '20-49',
      APP_12: '1Cr_5Cr',
      APP_16: 'yes',
    }
    return determineApplicability(responses).find(r => r.code === 'PROFESSIONAL_TAX')!
  }

  it('offers every state in the picker, keeping snake_case values', () => {
    expect(STATE_OPTIONS).toHaveLength(INDIAN_STATES.length)
    expect(toStateValue('Uttar Pradesh')).toBe('uttar_pradesh')
    expect(toStateValue('Dadra and Nagar Haveli and Daman and Diu')).toBe('dadra_and_nagar_haveli_and_daman_and_diu')
  })

  it('applies PT in states the old 7-state list missed', () => {
    expect(pt(['andhra_pradesh']).applies).toBe(true)
    expect(pt(['odisha']).applies).toBe(true)
    expect(pt(['assam']).applies).toBe(true)
  })

  it('does not apply PT in Delhi or Rajasthan', () => {
    expect(pt(['delhi']).applies).toBe(false)
    expect(pt(['rajasthan']).reason).toContain('do not levy')
  })

  it('lists only the levying states for multi-state businesses', () => {
    const r = pt(['delhi', 'karnataka'])
    expect(r.applies).toBe(true)
    expect(r.reason).toContain('Karnataka')
    expect(r.reason).not.toContain('Delhi')
  })

  it('asks Goa businesses to confirm', () => {
    const r = pt(['same_as_registered'], 'goa')
    expect(r.applies).toBe(false)
    expect(r.reason).toContain('Confirm')
    expect(r.reason).toContain('Goa')
  })

  it('resolves a legacy "other" answer to confirm, not exempt', () => {
    expect(pt(['same_as_registered'], 'other').reason).toContain('Confirm')
  })

  it('shows PT compliance questions for any levying state, not just the old 7', () => {
    const responses: ApplicabilityResponses = { APP_02: 'odisha', APP_03: ['same_as_registered'], APP_04: 'it_software', APP_06: '20-49' }
    const ids = getFilteredPhase2Questions(determineApplicability(responses), responses).map(q => q.id)
    expect(ids).toEqual(expect.arrayContaining(['PT_01', 'PT_02', 'PT_03']))
  })
})

describe('Food-business and state guides use the shared status', () => {
  const labour = (state: string) =>
    calculateApplicability({ primary_state: state, employee_count: '20_49' })
      .find(r => r.keyRequirements?.includes('Professional Tax registration and deduction')) !== undefined

  it('applies PT for Mizoram and Chhattisgarh but not Rajasthan', () => {
    expect(labour('Mizoram')).toBe(true)
    expect(labour('Chhattisgarh')).toBe(true)
    expect(labour('Rajasthan')).toBe(false)
  })

  it('gives Goa cautious guide wording', () => {
    const goa = getStateCompliance('Goa')
    expect(goa.professionalTax.applicable).toBe(false)
    expect(goa.professionalTax.note).toContain('Confirm')
  })
})
