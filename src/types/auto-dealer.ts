// ============================================================================
// Auto Dealer Compliance Assessment — TypeScript Types
// Strict mode; no `any`.
// ============================================================================

// ----------------------------------------------------------------------------
// Applicability Profile (produced by Phase-1 answers)
// ----------------------------------------------------------------------------

export type LegalForm =
  | 'proprietorship'
  | 'partnership'
  | 'llp'
  | 'pvt_ltd'
  | 'public_ltd'
  | 'opc'

export type EmployeeCountBand =
  | 'lt_10'       // <10
  | '10_19'
  | '20_49'
  | '50_99'
  | '100_299'
  | '300_499'
  | 'gte_500'

export type TurnoverBracket =
  | 'lt_1cr'
  | '1cr_5cr'
  | '5cr_10cr'
  | '10cr_40cr'
  | '40cr_100cr'
  | 'gt_100cr'

export type VehicleType =
  | '2w_only'
  | '4w_only'
  | 'both_2w_4w'
  | 'commercial'
  | 'ev_only'
  | 'mixed'

export type WorkshopService =
  | 'general_service'
  | 'body_shop_paint'
  | 'engine_overhaul'
  | 'ev_repair'
  | 'tyres'
  | 'glass'
  | 'electricals'

export type LabourRegime = 'new' | 'legacy'

// States that levy Professional Tax
export type PTState =
  | 'MH' | 'KA' | 'WB' | 'TN' | 'AP' | 'TS' | 'GJ' | 'OD' | 'AS'
  | 'MG' | 'SK' | 'JH' | 'BR'  // Meghalaya, Sikkim, Jharkhand, Bihar

export interface ApplicabilityProfile {
  // Entity / scale
  legalForm: LegalForm
  hasPAN: boolean
  hasGSTIN: boolean
  hasCIN: boolean
  employeeCount: EmployeeCountBand
  womenEmployeeCount: 'lt_10' | '10_29' | '30_49' | 'gte_50'
  turnoverBracket: TurnoverBracket
  statesOfOperation: string[]          // ISO 3166-2:IN state codes e.g. ['MH','KA']
  outletCount: number

  // Vehicle type & business mix
  vehicleType: VehicleType
  oems: string[]                       // e.g. ['Maruti','Honda','Tata']
  hasTestDrives: boolean               // test rides / test drives on public roads
  hasWorkshop: boolean
  workshopServices: WorkshopService[]
  hasPUCCentre: boolean
  sellsAccessories: boolean
  hasRVSF: boolean                     // scrapping / collection centre

  // Premises
  showroomAreaSqft: number | null
  workshopAreaSqft: number | null
  hasLiftsOrHoists: boolean
  hasPaintBooth: boolean
  hasCNGDispenser: boolean
  hasEVCharger: boolean
  dieselStorageLitres: number          // 0 if none
  premisesOwned: boolean               // false = leased

  // Workforce
  hasContractLabour: boolean
  contractWorkerCount: number
  hasApprentices: boolean
  hasHazardousProcessWorkers: boolean  // paint-booth, welding, battery handling

  // Cross-sell
  sellsMotorInsurance: boolean
  misp: boolean                        // operates as MISP under one insurer/intermediary
  facilitatesVehicleFinance: boolean   // as DSA
  processesPersonalData: boolean       // always true for any dealership

  // Regime toggle
  labourRegime: LabourRegime
}

// ----------------------------------------------------------------------------
// Question
// ----------------------------------------------------------------------------

export type QuestionType = 'yes_no' | 'single_choice' | 'multi_choice' | 'number' | 'text'

export type ComplianceArea =
  | 'trade_certificate'
  | 'hsrp'
  | 'bncap_bis'
  | 'misp'
  | 'dsa'
  | 'epf'
  | 'esi'
  | 'professional_tax'
  | 'posh'
  | 'maternity'
  | 'bonus'
  | 'gratuity'
  | 'wages'
  | 's_and_e'
  | 'gst'
  | 'tds_tcs'
  | 'factories_osh'
  | 'contract_labour'
  | 'spcb'
  | 'hazardous_waste'
  | 'peso_fire'
  | 'battery_waste'
  | 'e_waste'
  | 'elv'
  | 'dpdp'
  | 'consumer_protection'
  | 'companies_act'
  | 'csr'
  | 'lease'

export interface QuestionOption {
  value: string
  label: string
}

export interface GapTemplate {
  finding: string
  recommendation: string
  timeline: '30_days' | '90_days' | '365_days' | 'prepare_by_2027' | 'ongoing'
  penaltyExposure: string   // ASCII-safe description e.g. "Rs.5,000 to Rs.10,000 under MV Act s.192"
}

export interface AutoDealerQuestion {
  id: string
  phase: 1 | 2 | 3 | 4 | 5 | 6
  text: string
  helpText: string
  type: QuestionType
  options?: QuestionOption[]
  weight: number                       // 3–10 per PRD §5.3
  complianceArea: ComplianceArea
  source: string                       // citation e.g. "Research §4.1, CMVR Rule 33-43A"
  gapTemplate: GapTemplate             // used when answer is non-compliant
  compliantAnswers: string[]           // answer values that count as fully compliant
  partiallyCompliantAnswers?: string[] // answer values that score 50%
  // Predicate — pure function evaluated against ApplicabilityProfile
  // Returns true if this question should be shown for the given profile
  appliesWhen: (profile: ApplicabilityProfile) => boolean
}

// ----------------------------------------------------------------------------
// Responses
// ----------------------------------------------------------------------------

export type ResponseValue = string | string[] | number | null

export type Responses = Record<string, ResponseValue>

// ----------------------------------------------------------------------------
// Scoring
// ----------------------------------------------------------------------------

export type ComplianceStatus = 'green' | 'yellow' | 'red'

export interface PhaseScore {
  phase: 1 | 2 | 3 | 4 | 5 | 6
  phaseName: string
  earnedPoints: number
  maxPoints: number
  score: number               // 0–100
  status: ComplianceStatus
  questionCount: number
  compliantCount: number
}

export interface OverallScore {
  score: number
  status: ComplianceStatus
  totalEarned: number
  totalMax: number
}

// ----------------------------------------------------------------------------
// Gap Analysis
// ----------------------------------------------------------------------------

export type GapSeverity = 'critical' | 'high' | 'medium' | 'low'

export interface GapItem {
  questionId: string
  phase: 1 | 2 | 3 | 4 | 5 | 6
  phaseName: string
  complianceArea: ComplianceArea
  title: string
  finding: string
  recommendation: string
  timeline: GapTemplate['timeline']
  penaltyExposure: string
  severity: GapSeverity
  weight: number
  source: string
}

// ----------------------------------------------------------------------------
// Compliance Calendar
// ----------------------------------------------------------------------------

export type CalendarFrequency =
  | 'monthly'
  | 'quarterly'
  | 'half_yearly'
  | 'annual'
  | 'once'
  | 'on_renewal'

export interface ComplianceCalendarEntry {
  id: string
  title: string
  description: string
  dueDate: string             // ISO date string or relative e.g. '2026-01-31'
  recurring: CalendarFrequency
  complianceArea: ComplianceArea
  phase: 1 | 2 | 3 | 4 | 5 | 6
  authority: string           // e.g. "EPFO", "ESIC", "SPCB"
  appliesWhen: (profile: ApplicabilityProfile) => boolean
}

// ----------------------------------------------------------------------------
// State Reference Tables (from DB)
// ----------------------------------------------------------------------------

export interface PTSlab {
  stateCode: string
  slabMin: number
  slabMax: number | null
  monthlyTax: number
  effectiveFrom: string
  notes: string | null
}

export interface StateAndE {
  stateCode: string
  stateName: string
  registrationWindowDays: number | null
  maxHoursPerDay: number | null
  weeklyOff: string | null
  womenClosingTime: string | null
  portalUrl: string | null
}

export interface GSTRate {
  hsn: string
  description: string
  vehicleCategory: string
  rate: number
  cess: number
  totalRate: number
  effectiveFrom: string
  notes: string | null
}

// ----------------------------------------------------------------------------
// Assessment record (mirrors DB row)
// ----------------------------------------------------------------------------

export interface AutoDealerAssessment {
  id: string
  userEmail: string
  emailVerified: boolean
  fullName: string | null
  phone: string | null
  companyName: string | null
  applicabilityProfile: ApplicabilityProfile | null
  responses: Responses
  phaseScores: PhaseScore[] | null
  gapAnalysis: GapItem[] | null
  overallScore: number | null
  complianceStatus: ComplianceStatus | null
  paymentStatus: 'pending' | 'initiated' | 'paid' | 'failed' | 'refunded'
  razorpayOrderId: string | null
  razorpayPaymentId: string | null
  priceTier: 'basic' | 'standard' | 'premium' | null
  pdfGeneratedAt: string | null
  labourRegime: LabourRegime
  createdAt: string
  updatedAt: string
}

// ----------------------------------------------------------------------------
// Applicability check result (for display in report table)
// ----------------------------------------------------------------------------

export interface ApplicabilityCheckResult {
  complianceArea: ComplianceArea
  label: string
  applies: boolean
  triggerReason: string
  phase: 2 | 3 | 4 | 5 | 6
}

// ----------------------------------------------------------------------------
// Price tiers
// ----------------------------------------------------------------------------

export interface PriceTier {
  id: 'basic' | 'standard' | 'premium'
  label: string
  priceINR: number
  description: string
  maxQuestions: number
}

export const PRICE_TIERS: PriceTier[] = [
  {
    id: 'basic',
    label: 'Basic',
    priceINR: 999,
    description: 'Single 2-Wheeler outlet, up to 30 questions',
    maxQuestions: 30,
  },
  {
    id: 'standard',
    label: 'Standard',
    priceINR: 2499,
    description: '1-3 outlets, full workshop, up to 65 questions',
    maxQuestions: 65,
  },
  {
    id: 'premium',
    label: 'Premium',
    priceINR: 4999,
    description: 'Multi-state dealer group, up to 100 questions',
    maxQuestions: 100,
  },
]

// ----------------------------------------------------------------------------
// Phase metadata
// ----------------------------------------------------------------------------

export interface PhaseMetadata {
  phase: 1 | 2 | 3 | 4 | 5 | 6
  name: string
  description: string
  icon: string   // lucide icon name
}

export const PHASE_METADATA: PhaseMetadata[] = [
  { phase: 1, name: 'Applicability Profile', description: 'Establish what regulations apply to your dealership', icon: 'ClipboardList' },
  { phase: 2, name: 'Statutory Compliance', description: 'Labour Codes, EPF, ESI, POSH, GST, TDS', icon: 'Scale' },
  { phase: 3, name: 'Workshop EHS', description: 'Factories Act / OSH Code, SPCB, Hazardous Waste, PESO, Fire', icon: 'AlertTriangle' },
  { phase: 4, name: 'Auto-Dealer Specific', description: 'Trade Certificate, HSRP, BNCAP, MISP, DSA, Right to Repair', icon: 'Car' },
  { phase: 5, name: 'EPR & Circular Economy', description: 'Battery Waste, E-Waste, ELV Rules 2025', icon: 'Recycle' },
  { phase: 6, name: 'Data & Corporate', description: 'DPDP Act 2023, Companies Act, CSR, Lease', icon: 'Shield' },
]
