import { describe, it, expect } from 'vitest'
import {
  determineApplicability,
  getFilteredPhase2Questions,
  shouldSkipPhase1Question,
  getNextPhase1Index,
  getPreviousPhase1Index,
  getFssaiTier,
  getOperatingStates,
  PHASE1_QUESTIONS,
  PHASE2_QUESTIONS,
  type ApplicabilityResponses,
} from '@/lib/assessments/state-wise-compliance-questions'
import { STATE_WISE_COMPLIANCE_RULES } from '@/lib/pdf/state-wise-compliance-rules'

const base: ApplicabilityResponses = {
  APP_01: 'pvt_ltd',
  APP_02: 'maharashtra',
  APP_03: 'same_as_registered',
  APP_04: 'it_software',
  APP_05: 'no',
  APP_06: '20-49',
  APP_07: 'no',
  APP_09: 'no',
  APP_10: 'yes',
  APP_11: '15k_21k',
  APP_12: '1Cr_5Cr',
  APP_13: 'yes',
  APP_14: 'no',
  APP_15: 'no',
  APP_16: 'yes',
  APP_17: 'no',
  APP_18: 'minimal',
  APP_19: 'yes',
  APP_20: 'no',
  APP_21: 'ground_standalone',
}

const find = (responses: ApplicabilityResponses, code: string) =>
  determineApplicability(responses).find(r => r.code === code)!

describe('state-wise premises licences', () => {
  const restaurant = { ...base, APP_04: 'food_beverage', APP_21: 'above_15m', APP_22: 'yes', APP_12: '5Cr_10Cr' }

  it('flags fire NOC, trade licence, liquor and the FSSAI tier for a high-rise restaurant', () => {
    expect(find(restaurant, 'FIRE_NOC').applies).toBe(true)
    expect(find(restaurant, 'FIRE_NOC').reason).toContain('15 m')
    expect(find(restaurant, 'TRADE_LICENCE').applies).toBe(true)
    expect(find(restaurant, 'LIQUOR_LICENCE').applies).toBe(true)
    expect(find(restaurant, 'FSSAI').reason).toContain('State Licence')
  })

  it('marks liquor as not permitted in Gujarat', () => {
    // The page stores the multi-select answer as an array
    const r = find({ ...restaurant, APP_02: 'gujarat', APP_03: ['same_as_registered'] }, 'LIQUOR_LICENCE')
    expect(r.applies).toBe(false)
    expect(r.reason).toContain('Gujarat')
  })

  it('ignores a stale alcohol answer after switching to a non-food industry', () => {
    expect(find({ ...base, APP_22: 'yes' }, 'LIQUOR_LICENCE').applies).toBe(false)
  })

  it('flags clinic registrations and PC-PNDT for a clinic with ultrasound', () => {
    const clinic = { ...base, APP_04: 'clinic', APP_23: 'ultrasound' }
    expect(find(clinic, 'CLINICAL_ESTABLISHMENT').applies).toBe(true)
    expect(find(clinic, 'BIOMEDICAL_WASTE').applies).toBe(true)
    expect(find(clinic, 'PCPNDT').applies).toBe(true)
    expect(find(clinic, 'AERB').applies).toBe(false)
    expect(find(clinic, 'FIRE_NOC').applies).toBe(true)
  })

  it('flags AERB for a hospital with X-ray', () => {
    const hospital = { ...base, APP_04: 'hospital', APP_23: 'xray' }
    expect(find(hospital, 'AERB').applies).toBe(true)
    expect(find(hospital, 'PCPNDT').applies).toBe(false)
  })

  it('never says a ground-floor office flatly does not need a fire NOC', () => {
    const r = find(base, 'FIRE_NOC')
    expect(r.applies).toBe(false)
    expect(r.reason).toContain('confirm')
  })

  it('flags fire NOC for any business in a mall', () => {
    expect(find({ ...base, APP_21: 'mall_complex' }, 'FIRE_NOC').applies).toBe(true)
  })

  it('does not flag premises licences without physical premises', () => {
    const remote = { ...base, APP_16: 'no' }
    expect(find(remote, 'FIRE_NOC').applies).toBe(false)
    expect(find(remote, 'TRADE_LICENCE').applies).toBe(false)
  })

  it('uses the OSH Code factory threshold text', () => {
    expect(find(base, 'FACTORY_ACT').threshold).toContain('20 workers')
  })
})

describe('getOperatingStates', () => {
  it('expands "same as registered" whether stored as a string or an array', () => {
    expect(getOperatingStates({ APP_02: 'maharashtra', APP_03: 'same_as_registered' })).toEqual(['maharashtra'])
    expect(getOperatingStates({ APP_02: 'maharashtra', APP_03: ['same_as_registered'] })).toEqual(['maharashtra'])
    expect(getOperatingStates({ APP_02: 'maharashtra', APP_03: ['karnataka', 'delhi'] })).toEqual(['karnataka', 'delhi'])
  })

  it('applies Professional Tax for a Maharashtra business answering "same as registered"', () => {
    expect(find({ ...base, APP_03: ['same_as_registered'] }, 'PROFESSIONAL_TAX').applies).toBe(true)
  })
})

describe('getFssaiTier (2026 thresholds)', () => {
  it('maps turnover bands to tiers', () => {
    expect(getFssaiTier('40L_1Cr')).toContain('Registration')
    expect(getFssaiTier('1Cr_5Cr')).toContain('Rs.1.5 crore')
    expect(getFssaiTier('10Cr_50Cr')).toContain('State Licence')
    expect(getFssaiTier('50Cr_plus')).toContain('Central Licence')
  })
})

describe('phase 2 filtering', () => {
  it('shows fire, trade and liquor questions to a restaurant but no clinic questions', () => {
    const responses = { ...base, APP_04: 'food_beverage', APP_22: 'yes' }
    const ids = getFilteredPhase2Questions(determineApplicability(responses), responses).map(q => q.id)
    expect(ids).toEqual(expect.arrayContaining(['FIRE_01', 'FIRE_02', 'TRADE_01', 'LIQUOR_01']))
    expect(ids).not.toContain('CLINIC_01')
    expect(ids).not.toContain('AERB_01')
  })

  it('has a PDF rule for every phase 2 question, and every new question is yes/no', () => {
    for (const q of PHASE2_QUESTIONS) {
      expect(STATE_WISE_COMPLIANCE_RULES[q.id], q.id).toBeDefined()
    }
    const newIds = ['FIRE_01', 'FIRE_02', 'TRADE_01', 'LIQUOR_01', 'CLINIC_01', 'CLINIC_02', 'PCPNDT_01', 'AERB_01']
    for (const id of newIds) {
      expect(PHASE2_QUESTIONS.find(q => q.id === id)?.type, id).toBe('yes_no')
    }
  })
})

describe('conditional phase 1 navigation', () => {
  const idx = (id: string) => PHASE1_QUESTIONS.findIndex(q => q.id === id)

  it('skips each conditional question when its condition is not met', () => {
    expect(shouldSkipPhase1Question('APP_08', { APP_07: 'no' })).toBe(true)
    expect(shouldSkipPhase1Question('APP_21', { APP_16: 'no' })).toBe(true)
    expect(shouldSkipPhase1Question('APP_22', { APP_04: 'it_software' })).toBe(true)
    expect(shouldSkipPhase1Question('APP_22', { APP_04: 'hospitality' })).toBe(false)
    expect(shouldSkipPhase1Question('APP_23', { APP_04: 'clinic' })).toBe(false)
  })

  it('finishes phase 1 when the remaining questions are all skipped', () => {
    expect(getNextPhase1Index(idx('APP_21'), base)).toBe(-1)
  })

  it('moves past a skipped question in both directions', () => {
    const r = { ...base, APP_07: 'no' }
    expect(getNextPhase1Index(idx('APP_07'), r)).toBe(idx('APP_09'))
    expect(getPreviousPhase1Index(idx('APP_09'), r)).toBe(idx('APP_07'))
    expect(getPreviousPhase1Index(0, r)).toBe(-1)
  })

  it('shows the imaging question to a clinic as the last question', () => {
    const clinic = { ...base, APP_04: 'clinic' }
    expect(getNextPhase1Index(idx('APP_21'), clinic)).toBe(idx('APP_23'))
    expect(getNextPhase1Index(idx('APP_23'), clinic)).toBe(-1)
  })
})
