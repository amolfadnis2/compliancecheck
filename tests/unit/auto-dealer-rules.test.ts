/**
 * Vitest unit tests for Auto Dealer rules engine.
 *
 * Run with:  npx vitest run tests/unit/auto-dealer-rules.test.ts
 *
 * Covers:
 *   - minEmployees / employeeGte
 *   - operatesInPTState
 *   - turnoverGte
 *   - buildApplicabilityProfileFromResponses
 *   - getApplicableQuestions / getApplicableQuestionsByPhase
 *   - computePhaseScores + computeOverallScore
 *   - generateGapAnalysis
 *   - computePriceTier
 *   - generateApplicabilityChecks
 *   - generateComplianceCalendar
 *   - appliesWhen predicates for key questions
 */

import { describe, it, expect } from 'vitest'

import type { ApplicabilityProfile, Responses } from '../../src/types/auto-dealer'
import {
  minEmployees,
  employeeGte,
  operatesInPTState,
  turnoverGte,
  buildApplicabilityProfileFromResponses,
  getApplicableQuestions,
  getApplicableQuestionsByPhase,
  computePhaseScores,
  computeOverallScore,
  generateGapAnalysis,
  computePriceTier,
  generateApplicabilityChecks,
  generateComplianceCalendar,
} from '../../src/lib/assessments/auto-dealer/rules-engine'

import { APPLICABILITY_QUESTIONS } from '../../src/lib/assessments/auto-dealer/applicability-questions'
import { PHASE2_STATUTORY_QUESTIONS as PHASE_2_QUESTIONS } from '../../src/lib/assessments/auto-dealer/phase-2-statutory'
import { PHASE3_WORKSHOP_EHS_QUESTIONS as PHASE_3_QUESTIONS } from '../../src/lib/assessments/auto-dealer/phase-3-workshop-ehs'
import { PHASE4_DEALER_SPECIFIC_QUESTIONS as PHASE_4_QUESTIONS } from '../../src/lib/assessments/auto-dealer/phase-4-dealer-specific'
import { PHASE5_EPR_QUESTIONS as PHASE_5_QUESTIONS } from '../../src/lib/assessments/auto-dealer/phase-5-epr'
import { PHASE6_DATA_CORPORATE_QUESTIONS as PHASE_6_QUESTIONS } from '../../src/lib/assessments/auto-dealer/phase-6-data-corporate'

const ALL_QUESTIONS = [
  ...APPLICABILITY_QUESTIONS,
  ...PHASE_2_QUESTIONS,
  ...PHASE_3_QUESTIONS,
  ...PHASE_4_QUESTIONS,
  ...PHASE_5_QUESTIONS,
  ...PHASE_6_QUESTIONS,
]

// ---------------------------------------------------------------------------
// Fixture profiles
// ---------------------------------------------------------------------------

const SOLO_2W: ApplicabilityProfile = {
  legalForm: 'proprietorship',
  hasPAN: true,
  hasGSTIN: true,
  hasCIN: false,
  employeeCount: 'lt_10',
  womenEmployeeCount: 'lt_10',
  turnoverBracket: 'lt_1cr',
  statesOfOperation: ['RJ'],
  outletCount: 1,
  vehicleType: '2w_only',
  oems: ['Hero'],
  hasTestDrives: true,
  hasWorkshop: false,
  workshopServices: [],
  hasPUCCentre: false,
  sellsAccessories: false,
  hasRVSF: false,
  showroomAreaSqft: 300,
  workshopAreaSqft: null,
  hasLiftsOrHoists: false,
  hasPaintBooth: false,
  hasCNGDispenser: false,
  hasEVCharger: false,
  dieselStorageLitres: 0,
  premisesOwned: true,
  hasContractLabour: false,
  contractWorkerCount: 0,
  hasApprentices: false,
  hasHazardousProcessWorkers: false,
  sellsMotorInsurance: false,
  misp: false,
  facilitatesVehicleFinance: false,
  processesPersonalData: true,
  labourRegime: 'new',
}

const MID_4W: ApplicabilityProfile = {
  legalForm: 'pvt_ltd',
  hasPAN: true,
  hasGSTIN: true,
  hasCIN: true,
  employeeCount: '20_49',
  womenEmployeeCount: '10_29',
  turnoverBracket: '5cr_10cr',
  statesOfOperation: ['MH', 'GJ'],
  outletCount: 2,
  vehicleType: '4w_only',
  oems: ['Maruti', 'Hyundai'],
  hasTestDrives: true,
  hasWorkshop: true,
  workshopServices: ['general_service', 'body_shop_paint'],
  hasPUCCentre: true,
  sellsAccessories: true,
  hasRVSF: false,
  showroomAreaSqft: 2000,
  workshopAreaSqft: 800,
  hasLiftsOrHoists: true,
  hasPaintBooth: true,
  hasCNGDispenser: false,
  hasEVCharger: true,
  dieselStorageLitres: 0,
  premisesOwned: false,
  hasContractLabour: true,
  contractWorkerCount: 5,
  hasApprentices: true,
  hasHazardousProcessWorkers: true,
  sellsMotorInsurance: true,
  misp: true,
  facilitatesVehicleFinance: true,
  processesPersonalData: true,
  labourRegime: 'new',
}

const MULTI_STATE: ApplicabilityProfile = {
  legalForm: 'pvt_ltd',
  hasPAN: true,
  hasGSTIN: true,
  hasCIN: true,
  employeeCount: '100_299',
  womenEmployeeCount: '10_29',
  turnoverBracket: '40cr_100cr',
  statesOfOperation: ['MH', 'KA', 'TN'],
  outletCount: 6,
  vehicleType: 'both_2w_4w',
  oems: ['Maruti', 'Honda', 'Hero', 'TVS'],
  hasTestDrives: true,
  hasWorkshop: true,
  workshopServices: ['general_service', 'body_shop_paint', 'engine_overhaul', 'ev_repair'],
  hasPUCCentre: true,
  sellsAccessories: true,
  hasRVSF: true,
  showroomAreaSqft: 5000,
  workshopAreaSqft: 3000,
  hasLiftsOrHoists: true,
  hasPaintBooth: true,
  hasCNGDispenser: false,
  hasEVCharger: true,
  dieselStorageLitres: 5000,
  premisesOwned: false,
  hasContractLabour: true,
  contractWorkerCount: 30,
  hasApprentices: true,
  hasHazardousProcessWorkers: true,
  sellsMotorInsurance: true,
  misp: true,
  facilitatesVehicleFinance: true,
  processesPersonalData: true,
  labourRegime: 'new',
}

// ---------------------------------------------------------------------------
// minEmployees / employeeGte
// ---------------------------------------------------------------------------

describe('minEmployees', () => {
  it('returns 5 for lt_10', () => expect(minEmployees(SOLO_2W)).toBe(5))
  it('returns 34 for 20_49', () => expect(minEmployees(MID_4W)).toBe(34))
  it('returns 199 for 100_299', () => expect(minEmployees(MULTI_STATE)).toBe(199))
})

describe('employeeGte', () => {
  it('lt_10 is not >= 10', () => expect(employeeGte(SOLO_2W, 10)).toBe(false))
  it('lt_10 is not >= 20', () => expect(employeeGte(SOLO_2W, 20)).toBe(false))
  it('20_49 is >= 20', () => expect(employeeGte(MID_4W, 20)).toBe(true))
  it('20_49 is not >= 50', () => expect(employeeGte(MID_4W, 50)).toBe(false))
  it('100_299 is >= 100', () => expect(employeeGte(MULTI_STATE, 100)).toBe(true))
})

// ---------------------------------------------------------------------------
// operatesInPTState
// ---------------------------------------------------------------------------

describe('operatesInPTState', () => {
  it('RJ only — no PT state', () => expect(operatesInPTState(SOLO_2W)).toBe(false))
  it('MH + GJ — PT applies', () => expect(operatesInPTState(MID_4W)).toBe(true))
  it('MH + KA + TN — PT applies', () => expect(operatesInPTState(MULTI_STATE)).toBe(true))
})

// ---------------------------------------------------------------------------
// turnoverGte
// ---------------------------------------------------------------------------

describe('turnoverGte', () => {
  it('lt_1cr is not >= 1', () => expect(turnoverGte(SOLO_2W, 1)).toBe(false))
  it('5cr_10cr is >= 5', () => expect(turnoverGte(MID_4W, 5)).toBe(true))
  it('5cr_10cr is not >= 10', () => expect(turnoverGte(MID_4W, 10)).toBe(false))
  it('40cr_100cr is >= 40', () => expect(turnoverGte(MULTI_STATE, 40)).toBe(true))
})

// ---------------------------------------------------------------------------
// buildApplicabilityProfileFromResponses
// ---------------------------------------------------------------------------

describe('buildApplicabilityProfileFromResponses', () => {
  it('correctly parses pvt_ltd and workshop from responses', () => {
    const responses: Responses = {
      AD_APP_001: 'pvt_ltd',
      AD_APP_003: '20_49',
      AD_APP_008: '4w_only',
      AD_APP_011: 'yes',
      AD_APP_012: 'general_service,body_shop_paint',
      AD_APP_labour_regime: 'new',
    }
    const profile = buildApplicabilityProfileFromResponses(responses)
    expect(profile.legalForm).toBe('pvt_ltd')
    expect(profile.employeeCount).toBe('20_49')
    expect(profile.hasWorkshop).toBe(true)
    expect(profile.labourRegime).toBe('new')
  })

  it('defaults labour regime to new when not specified', () => {
    const profile = buildApplicabilityProfileFromResponses({})
    expect(profile.labourRegime).toBe('new')
  })

  it('always sets processesPersonalData to true', () => {
    const profile = buildApplicabilityProfileFromResponses({})
    expect(profile.processesPersonalData).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// getApplicableQuestions / getApplicableQuestionsByPhase
// ---------------------------------------------------------------------------

describe('getApplicableQuestions', () => {
  it('solo 2W gets fewer questions than multi-state group', () => {
    const solo = getApplicableQuestions(SOLO_2W, ALL_QUESTIONS)
    const multi = getApplicableQuestions(MULTI_STATE, ALL_QUESTIONS)
    expect(solo.length).toBeLessThan(multi.length)
  })

  it('solo 2W without workshop has no Phase 3 questions', () => {
    const phase3 = getApplicableQuestionsByPhase(SOLO_2W, ALL_QUESTIONS, 3)
    expect(phase3.length).toBe(0)
  })

  it('mid 4W with workshop has Phase 3 questions', () => {
    const phase3 = getApplicableQuestionsByPhase(MID_4W, ALL_QUESTIONS, 3)
    expect(phase3.length).toBeGreaterThan(0)
  })

  it('MISP questions only appear when misp = true', () => {
    const withMISP = getApplicableQuestionsByPhase(MID_4W, ALL_QUESTIONS, 4)
    const withoutMISP = getApplicableQuestionsByPhase(SOLO_2W, ALL_QUESTIONS, 4)
    const mispQsWithMISP = withMISP.filter(q => q.complianceArea === 'misp')
    const mispQsWithout = withoutMISP.filter(q => q.complianceArea === 'misp')
    expect(mispQsWithMISP.length).toBeGreaterThan(0)
    expect(mispQsWithout.length).toBe(0)
  })

  it('EPF questions only appear when employeeCount >= 20', () => {
    const soloP2 = getApplicableQuestionsByPhase(SOLO_2W, ALL_QUESTIONS, 2)
    const midP2 = getApplicableQuestionsByPhase(MID_4W, ALL_QUESTIONS, 2)
    const soloEPF = soloP2.filter(q => q.complianceArea === 'epf')
    const midEPF = midP2.filter(q => q.complianceArea === 'epf')
    expect(soloEPF.length).toBe(0)
    expect(midEPF.length).toBeGreaterThan(0)
  })

  it('ELV questions appear for all profiles (universal obligation)', () => {
    const soloP5 = getApplicableQuestionsByPhase(SOLO_2W, ALL_QUESTIONS, 5)
    const elvQs = soloP5.filter(q => q.complianceArea === 'elv')
    expect(elvQs.length).toBeGreaterThan(0)
  })

  it('all questions have required fields', () => {
    for (const q of ALL_QUESTIONS) {
      expect(q.id).toBeTruthy()
      expect(q.text).toBeTruthy()
      expect(q.weight).toBeGreaterThanOrEqual(3)
      expect(q.weight).toBeLessThanOrEqual(10)
      expect(typeof q.appliesWhen).toBe('function')
      expect(Array.isArray(q.compliantAnswers)).toBe(true)
      expect(q.compliantAnswers.length).toBeGreaterThan(0)
    }
  })

  it('all question IDs are unique', () => {
    const ids = ALL_QUESTIONS.map(q => q.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })
})

// ---------------------------------------------------------------------------
// computePhaseScores + computeOverallScore
// ---------------------------------------------------------------------------

describe('computePhaseScores', () => {
  it('returns 5 phase score entries', () => {
    const scores = computePhaseScores(MID_4W, ALL_QUESTIONS, {})
    expect(scores).toHaveLength(5)
    expect(scores.map(s => s.phase)).toEqual([2, 3, 4, 5, 6])
  })

  it('all-yes responses produce score of 100', () => {
    const questions = getApplicableQuestions(SOLO_2W, ALL_QUESTIONS).filter(q => q.phase !== 1)
    const allYes: Responses = {}
    for (const q of questions) {
      allYes[q.id] = q.compliantAnswers[0]
    }
    const scores = computePhaseScores(SOLO_2W, ALL_QUESTIONS, allYes)
    const overall = computeOverallScore(scores)
    expect(overall.score).toBe(100)
    expect(overall.status).toBe('green')
  })

  it('empty responses produce score of 0 (no answers = no points)', () => {
    const scores = computePhaseScores(MID_4W, ALL_QUESTIONS, {})
    const overall = computeOverallScore(scores)
    expect(overall.score).toBe(0)
    expect(overall.status).toBe('red')
  })
})

// ---------------------------------------------------------------------------
// generateGapAnalysis
// ---------------------------------------------------------------------------

describe('generateGapAnalysis', () => {
  it('all-yes responses produce zero gaps', () => {
    const questions = getApplicableQuestions(MID_4W, ALL_QUESTIONS).filter(q => q.phase !== 1)
    const allYes: Responses = {}
    for (const q of questions) allYes[q.id] = q.compliantAnswers[0]
    const gaps = generateGapAnalysis(MID_4W, ALL_QUESTIONS, allYes)
    expect(gaps).toHaveLength(0)
  })

  it('all-no responses produce gaps for all applicable questions', () => {
    const questions = getApplicableQuestions(MID_4W, ALL_QUESTIONS).filter(q => q.phase !== 1)
    const allNo: Responses = {}
    for (const q of questions) allNo[q.id] = 'no'
    const gaps = generateGapAnalysis(MID_4W, ALL_QUESTIONS, allNo)
    expect(gaps.length).toBeGreaterThan(0)
  })

  it('gaps are sorted critical → high → medium → low', () => {
    const questions = getApplicableQuestions(MID_4W, ALL_QUESTIONS).filter(q => q.phase !== 1)
    const allNo: Responses = {}
    for (const q of questions) allNo[q.id] = 'no'
    const gaps = generateGapAnalysis(MID_4W, ALL_QUESTIONS, allNo)
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    for (let i = 1; i < gaps.length; i++) {
      expect(severityOrder[gaps[i].severity]).toBeGreaterThanOrEqual(severityOrder[gaps[i - 1].severity])
    }
  })

  it('unanswered questions do not produce gaps', () => {
    const gaps = generateGapAnalysis(SOLO_2W, ALL_QUESTIONS, {})
    expect(gaps).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// computePriceTier
// ---------------------------------------------------------------------------

describe('computePriceTier', () => {
  it('solo 2W (few questions) returns basic or standard', () => {
    const tier = computePriceTier(SOLO_2W, ALL_QUESTIONS)
    expect(['basic', 'standard']).toContain(tier)
  })

  it('multi-state group (many questions) returns premium', () => {
    const tier = computePriceTier(MULTI_STATE, ALL_QUESTIONS)
    expect(tier).toBe('premium')
  })
})

// ---------------------------------------------------------------------------
// generateApplicabilityChecks
// ---------------------------------------------------------------------------

describe('generateApplicabilityChecks', () => {
  it('returns 29 applicability check results', () => {
    const checks = generateApplicabilityChecks(MID_4W)
    expect(checks.length).toBe(29)
  })

  it('EPF applies for 20_49 employees, not for lt_10', () => {
    const midChecks = generateApplicabilityChecks(MID_4W)
    const soloChecks = generateApplicabilityChecks(SOLO_2W)
    const midEPF = midChecks.find(c => c.complianceArea === 'epf')
    const soloEPF = soloChecks.find(c => c.complianceArea === 'epf')
    expect(midEPF?.applies).toBe(true)
    expect(soloEPF?.applies).toBe(false)
  })

  it('factories_osh applies when hasWorkshop = true', () => {
    const midChecks = generateApplicabilityChecks(MID_4W)
    const factories = midChecks.find(c => c.complianceArea === 'factories_osh')
    expect(factories?.applies).toBe(true)
  })

  it('factories_osh does not apply when hasWorkshop = false', () => {
    const soloChecks = generateApplicabilityChecks(SOLO_2W)
    const factories = soloChecks.find(c => c.complianceArea === 'factories_osh')
    expect(factories?.applies).toBe(false)
  })

  it('misp applies when misp = true, not when false', () => {
    const midChecks = generateApplicabilityChecks(MID_4W)
    const soloChecks = generateApplicabilityChecks(SOLO_2W)
    expect(midChecks.find(c => c.complianceArea === 'misp')?.applies).toBe(true)
    expect(soloChecks.find(c => c.complianceArea === 'misp')?.applies).toBe(false)
  })

  it('elv applies to all profiles', () => {
    expect(generateApplicabilityChecks(SOLO_2W).find(c => c.complianceArea === 'elv')?.applies).toBe(true)
    expect(generateApplicabilityChecks(MID_4W).find(c => c.complianceArea === 'elv')?.applies).toBe(true)
    expect(generateApplicabilityChecks(MULTI_STATE).find(c => c.complianceArea === 'elv')?.applies).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// generateComplianceCalendar
// ---------------------------------------------------------------------------

describe('generateComplianceCalendar', () => {
  it('returns at least 5 entries for any profile', () => {
    expect(generateComplianceCalendar(SOLO_2W).length).toBeGreaterThanOrEqual(5)
  })

  it('ELV producer declaration appears for all profiles', () => {
    const cal = generateComplianceCalendar(SOLO_2W)
    const elv = cal.find(e => e.id === 'cal_elv_producer')
    expect(elv).toBeDefined()
  })

  it('EPF monthly deposit does not appear when employees < 20', () => {
    const cal = generateComplianceCalendar(SOLO_2W)
    const epf = cal.find(e => e.id === 'cal_epf_monthly')
    expect(epf).toBeUndefined()
  })

  it('EPF monthly deposit appears when employees >= 20', () => {
    const cal = generateComplianceCalendar(MID_4W)
    const epf = cal.find(e => e.id === 'cal_epf_monthly')
    expect(epf).toBeDefined()
  })

  it('SPCB CTO renewal only appears when hasWorkshop = true', () => {
    const soloCAL = generateComplianceCalendar(SOLO_2W)
    const midCAL = generateComplianceCalendar(MID_4W)
    expect(soloCAL.find(e => e.id === 'cal_cto_renewal')).toBeUndefined()
    expect(midCAL.find(e => e.id === 'cal_cto_renewal')).toBeDefined()
  })

  it('all calendar entries have required fields', () => {
    const cal = generateComplianceCalendar(MULTI_STATE)
    for (const entry of cal) {
      expect(entry.id).toBeTruthy()
      expect(entry.title).toBeTruthy()
      expect(entry.dueDate).toBeTruthy()
      expect(entry.authority).toBeTruthy()
    }
  })
})
