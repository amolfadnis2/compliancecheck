// ============================================================================
// Auto Dealer Compliance Assessment — Rules Engine
// Pure functions; no side effects; fully testable.
// ============================================================================

import type {
  ApplicabilityProfile,
  AutoDealerQuestion,
  PhaseScore,
  OverallScore,
  GapItem,
  GapSeverity,
  ComplianceCalendarEntry,
  ApplicabilityCheckResult,
  ComplianceArea,
  Responses,
  ResponseValue,
} from '@/types/auto-dealer'

// ----------------------------------------------------------------------------
// Employee count helpers
// ----------------------------------------------------------------------------

const EMP_ORDER: Record<string, number> = {
  lt_10: 5,
  '10_19': 14,
  '20_49': 34,
  '50_99': 74,
  '100_299': 199,
  '300_499': 399,
  gte_500: 500,
}

export function minEmployees(profile: ApplicabilityProfile): number {
  return EMP_ORDER[profile.employeeCount] ?? 0
}

export function employeeGte(profile: ApplicabilityProfile, n: number): boolean {
  return minEmployees(profile) >= n
}

// States that levy Professional Tax
const PT_STATES = new Set(['MH', 'KA', 'WB', 'TN', 'AP', 'TS', 'GJ', 'OD', 'AS', 'MG', 'SK', 'JH', 'BR'])

export function operatesInPTState(profile: ApplicabilityProfile): boolean {
  return profile.statesOfOperation.some(s => PT_STATES.has(s))
}

// Turnover helpers
const TURNOVER_ORDER: Record<string, number> = {
  lt_1cr: 0.5,
  '1cr_5cr': 2,
  '5cr_10cr': 7,
  '10cr_40cr': 25,
  '40cr_100cr': 70,
  gt_100cr: 200,
}

export function turnoverCrore(profile: ApplicabilityProfile): number {
  return TURNOVER_ORDER[profile.turnoverBracket] ?? 0
}

export function turnoverGte(profile: ApplicabilityProfile, crore: number): boolean {
  return turnoverCrore(profile) >= crore
}

// ----------------------------------------------------------------------------
// getApplicableQuestions
// Returns the ordered subset of allQuestions that apply to this profile.
// Questions are sorted by phase then by their natural array order.
// ----------------------------------------------------------------------------

export function getApplicableQuestions(
  profile: ApplicabilityProfile,
  allQuestions: AutoDealerQuestion[]
): AutoDealerQuestion[] {
  return allQuestions.filter(q => q.appliesWhen(profile))
}

// ----------------------------------------------------------------------------
// getApplicableQuestionsByPhase
// Returns applicable questions for a specific phase.
// ----------------------------------------------------------------------------

export function getApplicableQuestionsByPhase(
  profile: ApplicabilityProfile,
  allQuestions: AutoDealerQuestion[],
  phase: 1 | 2 | 3 | 4 | 5 | 6
): AutoDealerQuestion[] {
  return allQuestions.filter(q => q.phase === phase && q.appliesWhen(profile))
}

// ----------------------------------------------------------------------------
// computePhaseScores
// Pure scoring of a single phase.
// ----------------------------------------------------------------------------

const PHASE_NAMES: Record<number, string> = {
  1: 'Applicability Profile',
  2: 'Statutory Compliance',
  3: 'Workshop EHS',
  4: 'Auto-Dealer Specific',
  5: 'EPR & Circular Economy',
  6: 'Data & Corporate',
}

function getResponseStr(responses: Responses, id: string): string {
  const v: ResponseValue = responses[id]
  if (v === null || v === undefined) return ''
  return String(v)
}

export function computePhaseScores(
  profile: ApplicabilityProfile,
  allQuestions: AutoDealerQuestion[],
  responses: Responses
): PhaseScore[] {
  const phases: Array<1 | 2 | 3 | 4 | 5 | 6> = [2, 3, 4, 5, 6]

  return phases.map(phase => {
    const questions = getApplicableQuestionsByPhase(profile, allQuestions, phase)

    let earnedPoints = 0
    let maxPoints = 0
    let compliantCount = 0

    for (const q of questions) {
      const answer = getResponseStr(responses, q.id)
      maxPoints += q.weight

      if (q.compliantAnswers.includes(answer)) {
        earnedPoints += q.weight
        compliantCount++
      } else if (q.partiallyCompliantAnswers?.includes(answer)) {
        earnedPoints += q.weight * 0.5
      }
    }

    const score = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 100
    const status = score >= 90 ? 'green' : score >= 70 ? 'yellow' : 'red'

    return {
      phase,
      phaseName: PHASE_NAMES[phase] ?? `Phase ${phase}`,
      earnedPoints,
      maxPoints,
      score,
      status,
      questionCount: questions.length,
      compliantCount,
    } satisfies PhaseScore
  })
}

// ----------------------------------------------------------------------------
// computeOverallScore
// Weighted by total max points across phases.
// ----------------------------------------------------------------------------

export function computeOverallScore(phaseScores: PhaseScore[]): OverallScore {
  const totalEarned = phaseScores.reduce((s, p) => s + p.earnedPoints, 0)
  const totalMax = phaseScores.reduce((s, p) => s + p.maxPoints, 0)
  const score = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 100
  const status = score >= 90 ? 'green' : score >= 70 ? 'yellow' : 'red'

  return { score, status, totalEarned, totalMax }
}

// ----------------------------------------------------------------------------
// generateGapAnalysis
// Produces GapItem[] for every non-compliant answered question.
// Skips unanswered questions (deferred, not gaps).
// ----------------------------------------------------------------------------

function weightToSeverity(weight: number, answer: string, compliantAnswers: string[]): GapSeverity {
  if (!answer || answer === '') return 'low'
  const isNonCompliant = !compliantAnswers.includes(answer)
  if (!isNonCompliant) return 'low'
  if (weight >= 9) return 'critical'
  if (weight >= 7) return 'high'
  if (weight >= 5) return 'medium'
  return 'low'
}

export function generateGapAnalysis(
  profile: ApplicabilityProfile,
  allQuestions: AutoDealerQuestion[],
  responses: Responses
): GapItem[] {
  const gaps: GapItem[] = []
  const applicable = getApplicableQuestions(profile, allQuestions).filter(q => q.phase !== 1)

  for (const q of applicable) {
    const answer = getResponseStr(responses, q.id)
    if (!answer) continue  // unanswered — not a gap yet

    const isCompliant = q.compliantAnswers.includes(answer)
    const isPartial = q.partiallyCompliantAnswers?.includes(answer) ?? false
    if (isCompliant) continue

    const severity = weightToSeverity(q.weight, answer, q.compliantAnswers)

    gaps.push({
      questionId: q.id,
      phase: q.phase,
      phaseName: PHASE_NAMES[q.phase] ?? `Phase ${q.phase}`,
      complianceArea: q.complianceArea,
      title: `${isPartial ? '[Partial] ' : ''}${q.text.slice(0, 80)}`,
      finding: q.gapTemplate.finding,
      recommendation: q.gapTemplate.recommendation,
      timeline: q.gapTemplate.timeline,
      penaltyExposure: q.gapTemplate.penaltyExposure,
      severity,
      weight: q.weight,
      source: q.source,
    })
  }

  // Sort: critical → high → medium → low; within same severity by weight desc
  const severityOrder: Record<GapSeverity, number> = { critical: 0, high: 1, medium: 2, low: 3 }
  gaps.sort((a, b) =>
    severityOrder[a.severity] - severityOrder[b.severity] ||
    b.weight - a.weight
  )

  return gaps
}

// ----------------------------------------------------------------------------
// generateApplicabilityChecks
// Builds the report's applicability overview table.
// ----------------------------------------------------------------------------

interface AreaRule {
  area: ComplianceArea
  label: string
  phase: 2 | 3 | 4 | 5 | 6
  triggerFn: (p: ApplicabilityProfile) => boolean
  triggerReason: string
}

const AREA_RULES: AreaRule[] = [
  { area: 'epf',              label: 'EPF (Provident Fund)',            phase: 2, triggerFn: p => employeeGte(p, 20),        triggerReason: '>=20 employees' },
  { area: 'esi',              label: 'ESI',                             phase: 2, triggerFn: p => employeeGte(p, 10),        triggerReason: '>=10 employees' },
  { area: 'professional_tax', label: 'Professional Tax',                phase: 2, triggerFn: p => operatesInPTState(p),     triggerReason: 'Operating in PT state' },
  { area: 'posh',             label: 'POSH Act 2013',                   phase: 2, triggerFn: p => employeeGte(p, 10),        triggerReason: '>=10 employees' },
  { area: 'maternity',        label: 'Maternity Benefit Act',           phase: 2, triggerFn: p => employeeGte(p, 10),        triggerReason: '>=10 employees' },
  { area: 'bonus',            label: 'Payment of Bonus',                phase: 2, triggerFn: p => employeeGte(p, 20),        triggerReason: '>=20 employees' },
  { area: 'gratuity',         label: 'Payment of Gratuity',             phase: 2, triggerFn: p => employeeGte(p, 10),        triggerReason: '>=10 employees' },
  { area: 'wages',            label: 'Code on Wages / Min Wages',       phase: 2, triggerFn: _p => true,                     triggerReason: 'All employers' },
  { area: 's_and_e',          label: 'Shops & Establishments',          phase: 2, triggerFn: _p => true,                     triggerReason: 'All commercial premises' },
  { area: 'gst',              label: 'GST 2.0',                         phase: 2, triggerFn: _p => true,                     triggerReason: 'All dealers' },
  { area: 'tds_tcs',          label: 'TDS / TCS (Income Tax)',          phase: 2, triggerFn: _p => true,                     triggerReason: 'All dealers' },
  { area: 'factories_osh',    label: 'Factories Act / OSH Code',        phase: 3, triggerFn: p => p.hasWorkshop,             triggerReason: 'Workshop on premises' },
  { area: 'contract_labour',  label: 'Contract Labour (R&A) Act',       phase: 3, triggerFn: p => p.hasContractLabour && p.contractWorkerCount >= 20, triggerReason: '>=20 contract workers' },
  { area: 'spcb',             label: 'SPCB Consents (CTE / CTO)',       phase: 3, triggerFn: p => p.hasWorkshop,             triggerReason: 'Workshop on premises' },
  { area: 'hazardous_waste',  label: 'Hazardous Waste Rules',           phase: 3, triggerFn: p => p.hasWorkshop,             triggerReason: 'Workshop generates HW' },
  { area: 'peso_fire',        label: 'PESO / Fire NOC',                 phase: 3, triggerFn: p => p.dieselStorageLitres > 0 || p.hasWorkshop, triggerReason: 'Fuel storage or workshop' },
  { area: 'trade_certificate', label: 'Trade Certificate (CMVR)',       phase: 4, triggerFn: _p => true,                     triggerReason: 'All motor vehicle dealers' },
  { area: 'hsrp',             label: 'HSRP',                            phase: 4, triggerFn: _p => true,                     triggerReason: 'All new vehicle dealers' },
  { area: 'bncap_bis',        label: 'Bharat NCAP / BIS',               phase: 4, triggerFn: p => ['4w_only','both_2w_4w','mixed'].includes(p.vehicleType), triggerReason: '4W dealer' },
  { area: 'misp',             label: 'IRDAI MISP',                      phase: 4, triggerFn: p => p.misp,                    triggerReason: 'Sells motor insurance as MISP' },
  { area: 'dsa',              label: 'RBI DSA Norms',                   phase: 4, triggerFn: p => p.facilitatesVehicleFinance, triggerReason: 'DSA for vehicle finance' },
  { area: 'consumer_protection', label: 'Consumer Protection Act',      phase: 4, triggerFn: _p => true,                     triggerReason: 'All dealers' },
  { area: 'battery_waste',    label: 'Battery Waste Management Rules',  phase: 5, triggerFn: p => p.hasWorkshop || ['ev_only','both_2w_4w','mixed'].includes(p.vehicleType), triggerReason: 'Workshop or EV/battery sales' },
  { area: 'e_waste',          label: 'E-Waste Management Rules',        phase: 5, triggerFn: p => p.hasWorkshop,             triggerReason: 'Workshop e-waste generated' },
  { area: 'elv',              label: 'ELV Rules 2025',                  phase: 5, triggerFn: _p => true,                     triggerReason: 'All motor vehicle dealers (eff. 1 Apr 2025)' },
  { area: 'dpdp',             label: 'DPDP Act 2023 / Rules 2025',      phase: 6, triggerFn: p => p.processesPersonalData,   triggerReason: 'Processes customer personal data (auto)' },
  { area: 'companies_act',    label: 'Companies Act 2013',              phase: 6, triggerFn: p => ['pvt_ltd','public_ltd','opc'].includes(p.legalForm), triggerReason: 'Incorporated company' },
  { area: 'csr',              label: 'CSR (Companies Act)',             phase: 6, triggerFn: p => ['pvt_ltd','public_ltd'].includes(p.legalForm) && turnoverGte(p, 100), triggerReason: 'Company with turnover >=Rs.100cr' },
  { area: 'lease',            label: 'Lease Registration',             phase: 6, triggerFn: p => !p.premisesOwned,           triggerReason: 'Leased premises' },
]

export function generateApplicabilityChecks(profile: ApplicabilityProfile): ApplicabilityCheckResult[] {
  return AREA_RULES.map(rule => ({
    complianceArea: rule.area,
    label: rule.label,
    applies: rule.triggerFn(profile),
    triggerReason: rule.triggerReason,
    phase: rule.phase,
  }))
}

// ----------------------------------------------------------------------------
// generateComplianceCalendar
// Returns upcoming compliance due-dates based on profile.
// Dates are generated relative to current year; recurring entries show next due.
// ----------------------------------------------------------------------------

export function generateComplianceCalendar(
  profile: ApplicabilityProfile
): ComplianceCalendarEntry[] {
  const year = new Date().getFullYear()
  const nextYear = year + 1

  const all: ComplianceCalendarEntry[] = [
    {
      id: 'cal_epf_monthly',
      title: 'EPF Contribution Deposit',
      description: 'Deposit employer + employee PF contributions via ECR on EPFO Unified Portal',
      dueDate: '15th of every month',
      recurring: 'monthly',
      complianceArea: 'epf',
      phase: 2,
      authority: 'EPFO',
      appliesWhen: p => employeeGte(p, 20),
    },
    {
      id: 'cal_esi_monthly',
      title: 'ESI Contribution Deposit',
      description: 'Deposit employee + employer ESI contributions via ESIC portal',
      dueDate: '15th of every month',
      recurring: 'monthly',
      complianceArea: 'esi',
      phase: 2,
      authority: 'ESIC',
      appliesWhen: p => employeeGte(p, 10),
    },
    {
      id: 'cal_gstr3b',
      title: 'GSTR-3B Filing',
      description: 'Monthly GST return — tax payment + ITC reconciliation',
      dueDate: '20th of every month',
      recurring: 'monthly',
      complianceArea: 'gst',
      phase: 2,
      authority: 'GST Network (GSTN)',
      appliesWhen: _p => true,
    },
    {
      id: 'cal_gstr1',
      title: 'GSTR-1 (Outward Supplies)',
      description: 'Monthly GSTR-1 for dealers with AATO >Rs.5 cr; quarterly (QRMP) otherwise',
      dueDate: '11th of every month (or 13th QRMP)',
      recurring: 'monthly',
      complianceArea: 'gst',
      phase: 2,
      authority: 'GSTN',
      appliesWhen: _p => true,
    },
    {
      id: 'cal_tds_deposit',
      title: 'TDS / TCS Deposit',
      description: 'Deposit TDS u/s 192/194C/194H/194I and TCS u/s 206C(1F) by 7th',
      dueDate: '7th of every month',
      recurring: 'monthly',
      complianceArea: 'tds_tcs',
      phase: 2,
      authority: 'Income Tax Department',
      appliesWhen: _p => true,
    },
    {
      id: 'cal_posh_annual',
      title: 'POSH Annual Report to District Officer',
      description: 'Submit IC annual report to District Officer (Form prescribed by state)',
      dueDate: `31 Jan ${nextYear}`,
      recurring: 'annual',
      complianceArea: 'posh',
      phase: 2,
      authority: 'District Officer (POSH)',
      appliesWhen: p => employeeGte(p, 10),
    },
    {
      id: 'cal_bonus',
      title: 'Statutory Bonus Payment',
      description: 'Pay minimum 8.33% bonus to eligible employees (salary <=Rs.21,000/m)',
      dueDate: '30 Nov each year (March year-end companies)',
      recurring: 'annual',
      complianceArea: 'bonus',
      phase: 2,
      authority: 'Labour Commissioner',
      appliesWhen: p => employeeGte(p, 20),
    },
    {
      id: 'cal_hw_form4',
      title: 'Hazardous Waste Annual Return (Form 4)',
      description: 'File Form 4 annual HW return to SPCB',
      dueDate: `30 Jun ${nextYear}`,
      recurring: 'annual',
      complianceArea: 'hazardous_waste',
      phase: 3,
      authority: 'State Pollution Control Board',
      appliesWhen: p => p.hasWorkshop,
    },
    {
      id: 'cal_factory_form22',
      title: 'Factories Annual Return (Form 22)',
      description: 'File annual return to Inspector of Factories',
      dueDate: `31 Jan ${nextYear}`,
      recurring: 'annual',
      complianceArea: 'factories_osh',
      phase: 3,
      authority: 'Inspector of Factories',
      appliesWhen: p => p.hasWorkshop && employeeGte(p, 10),
    },
    {
      id: 'cal_factory_form21',
      title: 'Factories Half-Yearly Return (Form 21)',
      description: 'File half-yearly return (15 Jul + 15 Jan)',
      dueDate: '15 Jul / 15 Jan',
      recurring: 'half_yearly',
      complianceArea: 'factories_osh',
      phase: 3,
      authority: 'Inspector of Factories',
      appliesWhen: p => p.hasWorkshop && employeeGte(p, 10),
    },
    {
      id: 'cal_elv_producer',
      title: 'ELV Producer Declaration (Form 1)',
      description: 'Annual producer declaration for vehicles sold in preceding FY (ELV Rules 2025)',
      dueDate: `30 Apr ${nextYear}`,
      recurring: 'annual',
      complianceArea: 'elv',
      phase: 5,
      authority: 'CPCB / SPCB',
      appliesWhen: _p => true,
    },
    {
      id: 'cal_gstr9',
      title: 'GSTR-9 Annual Return',
      description: 'Annual GST reconciliation return',
      dueDate: `31 Dec ${nextYear}`,
      recurring: 'annual',
      complianceArea: 'gst',
      phase: 2,
      authority: 'GSTN',
      appliesWhen: _p => true,
    },
    {
      id: 'cal_mgt7_aoc4',
      title: 'Companies Act Annual Filings (AOC-4 + MGT-7)',
      description: 'Financial statements (AOC-4) within 30 days of AGM; Annual Return (MGT-7) within 60 days',
      dueDate: 'Within 30/60 days of AGM',
      recurring: 'annual',
      complianceArea: 'companies_act',
      phase: 6,
      authority: 'MCA / ROC',
      appliesWhen: p => ['pvt_ltd', 'public_ltd', 'opc'].includes(p.legalForm),
    },
    {
      id: 'cal_tcs_27eq',
      title: 'TCS Quarterly Return (Form 27EQ)',
      description: 'Quarterly TCS return for vehicle sales >Rs.10 lakh and luxury goods',
      dueDate: '15 Jul / 15 Oct / 15 Jan / 15 May',
      recurring: 'quarterly',
      complianceArea: 'tds_tcs',
      phase: 2,
      authority: 'Income Tax Department',
      appliesWhen: _p => true,
    },
    {
      id: 'cal_esi_return',
      title: 'ESI Half-Yearly Return (Form 6)',
      description: 'Half-yearly ESI contribution return: 11 May + 11 Nov',
      dueDate: '11 May / 11 Nov',
      recurring: 'half_yearly',
      complianceArea: 'esi',
      phase: 2,
      authority: 'ESIC',
      appliesWhen: p => employeeGte(p, 10),
    },
    {
      id: 'cal_trade_cert_renewal',
      title: 'Trade Certificate Renewal',
      description: 'Renew Form 17 Trade Certificate >=30 days before expiry (CMVR Rule 43A)',
      dueDate: '>=30 days before expiry date',
      recurring: 'on_renewal',
      complianceArea: 'trade_certificate',
      phase: 4,
      authority: 'Registering Authority (VAHAN)',
      appliesWhen: _p => true,
    },
    {
      id: 'cal_cto_renewal',
      title: 'SPCB CTO Renewal',
      description: 'Renew Consent to Operate (Air + Water Acts) before expiry',
      dueDate: '>=60 days before expiry',
      recurring: 'on_renewal',
      complianceArea: 'spcb',
      phase: 3,
      authority: 'State Pollution Control Board',
      appliesWhen: p => p.hasWorkshop,
    },
    {
      id: 'cal_peso_renewal',
      title: 'PESO Licence Renewal (Form XV)',
      description: 'Renew petroleum storage licence before expiry',
      dueDate: '>=30 days before expiry',
      recurring: 'on_renewal',
      complianceArea: 'peso_fire',
      phase: 3,
      authority: 'PESO',
      appliesWhen: p => p.dieselStorageLitres > 5000,
    },
    {
      id: 'cal_fire_noc',
      title: 'Fire NOC Renewal',
      description: 'Renew Fire NOC from State Fire Services Department',
      dueDate: 'Annual (as per state)',
      recurring: 'annual',
      complianceArea: 'peso_fire',
      phase: 3,
      authority: 'State Fire Services',
      appliesWhen: p => p.hasWorkshop || (p.showroomAreaSqft ?? 0) > 500,
    },
    {
      id: 'cal_income_tax_audit',
      title: 'Tax Audit Report (Form 3CD)',
      description: 'File tax audit u/s 44AB if turnover >Rs.1 cr (or Rs.10 cr if >=95% digital receipts)',
      dueDate: `30 Sep ${nextYear}`,
      recurring: 'annual',
      complianceArea: 'tds_tcs',
      phase: 2,
      authority: 'Income Tax Department',
      appliesWhen: p => turnoverGte(p, 1),
    },
  ]

  return all.filter(entry => entry.appliesWhen(profile))
}

// ----------------------------------------------------------------------------
// computePriceTier
// Determines price tier based on question count and profile.
// ----------------------------------------------------------------------------

export function computePriceTier(
  profile: ApplicabilityProfile,
  allQuestions: AutoDealerQuestion[]
): 'basic' | 'standard' | 'premium' {
  const qCount = getApplicableQuestions(profile, allQuestions).length
  if (qCount <= 35) return 'basic'
  if (qCount <= 70) return 'standard'
  return 'premium'
}

// ----------------------------------------------------------------------------
// buildApplicabilityProfileFromResponses
// Converts raw Phase-1 Responses (string values) into a typed ApplicabilityProfile.
// ----------------------------------------------------------------------------

export function buildApplicabilityProfileFromResponses(
  responses: Responses
): ApplicabilityProfile {
  const r = (id: string): string => String(responses[id] ?? '')
  const b = (id: string): boolean => r(id) === 'yes'
  const n = (id: string): number => {
    const v = responses[id]
    return typeof v === 'number' ? v : parseInt(String(v ?? '0'), 10) || 0
  }
  const arr = (id: string): string[] => {
    const v = responses[id]
    if (Array.isArray(v)) return v as string[]
    if (typeof v === 'string' && v) return v.split(',').map(s => s.trim()).filter(Boolean)
    return []
  }

  const workshopServices = arr('AD_APP_012') as ApplicabilityProfile['workshopServices']
  const hasWorkshop = b('AD_APP_011') || workshopServices.length > 0

  return {
    legalForm: (r('AD_APP_001') as ApplicabilityProfile['legalForm']) || 'pvt_ltd',
    hasPAN: b('AD_APP_002a'),
    hasGSTIN: b('AD_APP_002b'),
    hasCIN: b('AD_APP_002c'),
    employeeCount: (r('AD_APP_003') as ApplicabilityProfile['employeeCount']) || 'lt_10',
    womenEmployeeCount: (r('AD_APP_004') as ApplicabilityProfile['womenEmployeeCount']) || 'lt_10',
    turnoverBracket: (r('AD_APP_005') as ApplicabilityProfile['turnoverBracket']) || 'lt_1cr',
    statesOfOperation: arr('AD_APP_006'),
    outletCount: n('AD_APP_007'),
    vehicleType: (r('AD_APP_008') as ApplicabilityProfile['vehicleType']) || '4w_only',
    oems: arr('AD_APP_009'),
    hasTestDrives: b('AD_APP_010'),
    hasWorkshop,
    workshopServices,
    hasPUCCentre: b('AD_APP_013'),
    sellsAccessories: b('AD_APP_014'),
    hasRVSF: b('AD_APP_015'),
    showroomAreaSqft: n('AD_APP_016a') || null,
    workshopAreaSqft: n('AD_APP_016b') || null,
    hasLiftsOrHoists: b('AD_APP_017a'),
    hasPaintBooth: b('AD_APP_017b'),
    hasCNGDispenser: b('AD_APP_017c'),
    hasEVCharger: b('AD_APP_017d'),
    dieselStorageLitres: n('AD_APP_018'),
    premisesOwned: r('AD_APP_019') === 'owned',
    hasContractLabour: b('AD_APP_020'),
    contractWorkerCount: n('AD_APP_020b'),
    hasApprentices: b('AD_APP_021'),
    hasHazardousProcessWorkers: b('AD_APP_022'),
    sellsMotorInsurance: b('AD_APP_023'),
    misp: r('AD_APP_023') === 'yes_misp' || r('AD_APP_023b') === 'yes',
    facilitatesVehicleFinance: b('AD_APP_024'),
    processesPersonalData: true,  // always true for any dealership
    labourRegime: (r('AD_APP_labour_regime') as 'new' | 'legacy') || 'new',
  }
}
