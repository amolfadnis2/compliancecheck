/**
 * ComplianceCheck - State-Wise Comprehensive Compliance Check
 * 
 * Two-Phase Assessment:
 * - Phase 1: Applicability Questions (20 questions) - Determines what applies
 * - Phase 2: Compliance Questions (variable, 20-60) - Assesses compliance status
 * 
 * @version 1.0
 * @assessment state_wise_compliance
 */

// ============================================================================
// TYPES
// ============================================================================

export type QuestionType = 'single_choice' | 'multiple_choice' | 'yes_no' | 'text';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: { value: string; label: string }[];
  helpText?: string;
  required: boolean;
  category: string;
  weight?: number;
  complianceAnswer?: string;
  phase: 1 | 2;
  applicabilityCodes?: string[];
  minEmployees?: number;
  states?: string[];
  industries?: string[];
}

export interface ApplicabilityResult {
  code: string;
  name: string;
  category: 'central_labour' | 'state_specific' | 'tax_business' | 'industry_specific';
  applies: boolean;
  reason: string;
  threshold?: string;
  keyRequirements?: string[];
  penaltyRange?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface UserDetails {
  fullName: string;
  email: string;
  phoneNumber?: string;
  companyName: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const TOP_10_STATES = [
  { value: 'maharashtra', label: 'Maharashtra' },
  { value: 'karnataka', label: 'Karnataka' },
  { value: 'delhi', label: 'Delhi' },
  { value: 'uttar_pradesh', label: 'Uttar Pradesh' },
  { value: 'gujarat', label: 'Gujarat' },
  { value: 'tamil_nadu', label: 'Tamil Nadu' },
  { value: 'telangana', label: 'Telangana' },
  { value: 'haryana', label: 'Haryana' },
  { value: 'kerala', label: 'Kerala' },
  { value: 'rajasthan', label: 'Rajasthan' },
  { value: 'west_bengal', label: 'West Bengal' },
  { value: 'andhra_pradesh', label: 'Andhra Pradesh' },
  { value: 'madhya_pradesh', label: 'Madhya Pradesh' },
  { value: 'punjab', label: 'Punjab' },
  { value: 'other', label: 'Other State' },
];

export const INDUSTRY_TYPES = [
  { value: 'it_software', label: 'IT / Software / SaaS' },
  { value: 'ecommerce', label: 'E-commerce / D2C' },
  { value: 'fintech', label: 'Fintech / Payments' },
  { value: 'healthtech', label: 'Healthtech / Medtech' },
  { value: 'edtech', label: 'Edtech' },
  { value: 'food_beverage', label: 'Food & Beverage / Cloud Kitchen' },
  { value: 'manufacturing', label: 'Manufacturing / Hardware' },
  { value: 'logistics', label: 'Logistics / Delivery' },
  { value: 'retail', label: 'Retail / Offline Stores' },
  { value: 'professional_services', label: 'Professional Services / Consulting' },
  { value: 'media_entertainment', label: 'Media / Entertainment / Gaming' },
  { value: 'real_estate', label: 'Real Estate / Construction' },
  { value: 'agritech', label: 'Agritech / Farming' },
  { value: 'cleantech', label: 'Cleantech / Renewable Energy' },
  { value: 'other', label: 'Other' },
];

export const EMPLOYEE_RANGES = [
  { value: '1-9', label: '1-9 employees', midpoint: 5 },
  { value: '10-19', label: '10-19 employees', midpoint: 15 },
  { value: '20-49', label: '20-49 employees', midpoint: 35 },
  { value: '50-99', label: '50-99 employees', midpoint: 75 },
  { value: '100-299', label: '100-299 employees', midpoint: 200 },
  { value: '300-499', label: '300-499 employees', midpoint: 400 },
  { value: '500+', label: '500+ employees', midpoint: 600 },
];

export const TURNOVER_RANGES = [
  { value: 'under_20L', label: 'Under Rs.20 lakh' },
  { value: '20L_40L', label: 'Rs.20 lakh - Rs.40 lakh' },
  { value: '40L_1Cr', label: 'Rs.40 lakh - Rs.1 crore' },
  { value: '1Cr_5Cr', label: 'Rs.1 crore - Rs.5 crore' },
  { value: '5Cr_10Cr', label: 'Rs.5 crore - Rs.10 crore' },
  { value: '10Cr_50Cr', label: 'Rs.10 crore - Rs.50 crore' },
  { value: '50Cr_plus', label: 'Above Rs.50 crore' },
];

export const PT_APPLICABLE_STATES = ['maharashtra', 'karnataka', 'tamil_nadu', 'telangana', 'gujarat', 'kerala', 'west_bengal'];
export const PT_EXEMPT_STATES = ['delhi', 'haryana', 'uttar_pradesh', 'rajasthan'];
export const LWF_APPLICABLE_STATES = ['maharashtra', 'karnataka', 'gujarat', 'kerala', 'telangana', 'uttar_pradesh', 'west_bengal'];

// ============================================================================
// PHASE 1: APPLICABILITY QUESTIONS (20 Questions)
// ============================================================================

export const PHASE1_QUESTIONS: Question[] = [
  {
    id: 'APP_01',
    text: 'What is your business entity type?',
    type: 'single_choice',
    category: 'Business Basics',
    required: true,
    phase: 1,
    options: [
      { value: 'pvt_ltd', label: 'Private Limited Company' },
      { value: 'llp', label: 'Limited Liability Partnership (LLP)' },
      { value: 'opc', label: 'One Person Company (OPC)' },
      { value: 'partnership', label: 'Partnership Firm' },
      { value: 'proprietorship', label: 'Proprietorship' },
      { value: 'public_ltd', label: 'Public Limited Company' },
    ],
    helpText: 'This determines Companies Act compliance requirements.',
  },
  {
    id: 'APP_02',
    text: 'Which state is your business registered in?',
    type: 'single_choice',
    category: 'Business Basics',
    required: true,
    phase: 1,
    options: TOP_10_STATES,
    helpText: 'State determines Professional Tax, LWF, and Shops & Establishments requirements.',
  },
  {
    id: 'APP_03',
    text: 'In which states do you have offices or employees?',
    type: 'multiple_choice',
    category: 'Business Basics',
    required: true,
    phase: 1,
    options: [
      { value: 'same_as_registered', label: 'Same as registered state only' },
      ...TOP_10_STATES,
    ],
    helpText: 'Multi-state operations may trigger additional compliance in each state.',
  },
  {
    id: 'APP_04',
    text: 'What is your primary industry?',
    type: 'single_choice',
    category: 'Business Basics',
    required: true,
    phase: 1,
    options: INDUSTRY_TYPES,
    helpText: 'Industry determines specific regulatory requirements (FSSAI, RBI, CDSCO, etc.).',
  },
  {
    id: 'APP_05',
    text: 'Is your company recognized under Startup India (DPIIT)?',
    type: 'yes_no',
    category: 'Business Basics',
    required: true,
    phase: 1,
    helpText: 'DPIIT recognition unlocks tax benefits under Section 80-IAC and self-certification benefits.',
  },
  {
    id: 'APP_06',
    text: 'What is your total employee count (including contract workers)?',
    type: 'single_choice',
    category: 'Workforce',
    required: true,
    phase: 1,
    options: EMPLOYEE_RANGES,
    helpText: 'Employee count determines EPF (20+), ESI (10+), Gratuity (10+), and other thresholds.',
  },
  {
    id: 'APP_07',
    text: 'Do you employ contract workers or workers through staffing agencies?',
    type: 'yes_no',
    category: 'Workforce',
    required: true,
    phase: 1,
    helpText: 'Contract labour above 50 requires registration under OSH Code.',
  },
  {
    id: 'APP_08',
    text: 'If yes, how many contract workers do you engage?',
    type: 'single_choice',
    category: 'Workforce',
    required: false,
    phase: 1,
    options: [
      { value: '0', label: 'None' },
      { value: '1-19', label: '1-19 contract workers' },
      { value: '20-49', label: '20-49 contract workers' },
      { value: '50+', label: '50 or more contract workers' },
    ],
    helpText: 'Contract labour registration threshold is 50+ workers under new codes.',
  },
  {
    id: 'APP_09',
    text: 'Do you engage gig workers or platform workers (delivery, drivers, freelancers)?',
    type: 'yes_no',
    category: 'Workforce',
    required: true,
    phase: 1,
    helpText: 'Social Security Code mandates welfare fund contributions for aggregators.',
  },
  {
    id: 'APP_10',
    text: 'Do you employ women in your organization?',
    type: 'yes_no',
    category: 'Workforce',
    required: true,
    phase: 1,
    helpText: 'Triggers Maternity Benefit Act and POSH (Internal Complaints Committee) requirements.',
  },
  {
    id: 'APP_11',
    text: 'What is the salary range of most of your employees?',
    type: 'single_choice',
    category: 'Workforce',
    required: true,
    phase: 1,
    options: [
      { value: 'under_15k', label: 'Under Rs.15,000/month' },
      { value: '15k_21k', label: 'Rs.15,000 - Rs.21,000/month' },
      { value: '21k_25k', label: 'Rs.21,000 - Rs.25,000/month' },
      { value: 'above_25k', label: 'Above Rs.25,000/month' },
    ],
    helpText: 'ESI applies to employees earning up to Rs.21,000/month. EPF has Rs.15,000 ceiling for mandatory coverage.',
  },
  {
    id: 'APP_12',
    text: 'What is your annual turnover?',
    type: 'single_choice',
    category: 'Financial',
    required: true,
    phase: 1,
    options: TURNOVER_RANGES,
    helpText: 'Determines GST registration, e-invoicing, and MSME classification.',
  },
  {
    id: 'APP_13',
    text: 'Are you registered under GST?',
    type: 'yes_no',
    category: 'Financial',
    required: true,
    phase: 1,
    helpText: 'Mandatory for turnover above Rs.20L (services) / Rs.40L (goods) in most states.',
  },
  {
    id: 'APP_14',
    text: 'Do you purchase goods/services from MSME-registered suppliers?',
    type: 'yes_no',
    category: 'Financial',
    required: true,
    phase: 1,
    helpText: 'Section 43B(h) requires payment within 45 days to MSME suppliers.',
  },
  {
    id: 'APP_15',
    text: 'Is your company MSME-registered (Udyam)?',
    type: 'yes_no',
    category: 'Financial',
    required: true,
    phase: 1,
    helpText: 'MSME registration provides procurement benefits and payment protection.',
  },
  {
    id: 'APP_16',
    text: 'Do you operate from a physical office/shop/commercial establishment?',
    type: 'yes_no',
    category: 'Operations',
    required: true,
    phase: 1,
    helpText: 'Triggers Shops & Establishments registration in your state.',
  },
  {
    id: 'APP_17',
    text: 'Do you have a manufacturing facility or factory?',
    type: 'yes_no',
    category: 'Operations',
    required: true,
    phase: 1,
    helpText: 'Factory Act applies to units with 10+ workers (with power) or 20+ (without power).',
  },
  {
    id: 'APP_18',
    text: 'Does your business generate any industrial waste, emissions, or effluents?',
    type: 'single_choice',
    category: 'Operations',
    required: true,
    phase: 1,
    options: [
      { value: 'none', label: 'No - Pure IT/Services (White category)' },
      { value: 'minimal', label: 'Minimal - Office waste only' },
      { value: 'moderate', label: 'Some - Food processing, printing, etc.' },
      { value: 'significant', label: 'Significant - Manufacturing, chemicals' },
    ],
    helpText: 'Determines Pollution Control Board consent requirements.',
  },
  {
    id: 'APP_19',
    text: 'Do you collect, store, or process personal data of customers/users?',
    type: 'yes_no',
    category: 'Operations',
    required: true,
    phase: 1,
    helpText: 'DPDP Act 2023 applies to all digital personal data processing.',
  },
  {
    id: 'APP_20',
    text: 'Do you transport goods valued above Rs.50,000?',
    type: 'yes_no',
    category: 'Operations',
    required: true,
    phase: 1,
    helpText: 'E-Way Bill mandatory for goods movement above Rs.50,000.',
  },
];

// ============================================================================
// PHASE 2: COMPLIANCE QUESTIONS (39 Questions - filtered by applicability)
// ============================================================================

export const PHASE2_QUESTIONS: Question[] = [
  // EPF QUESTIONS (3 questions)
  {
    id: 'EPF_01',
    text: 'Is your organization registered with EPFO and do you have an active Establishment Code?',
    type: 'yes_no',
    category: 'EPF',
    required: true,
    weight: 10,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['EPF'],
    minEmployees: 20,
    helpText: 'Registration is mandatory within 1 month of crossing 20 employees.',
  },
  {
    id: 'EPF_02',
    text: 'Do you file ECR (Electronic Challan-cum-Return) by the 15th of each month?',
    type: 'yes_no',
    category: 'EPF',
    required: true,
    weight: 8,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['EPF'],
    minEmployees: 20,
    helpText: 'Late filing attracts 1% monthly damage plus 12% annual interest.',
  },
  {
    id: 'EPF_03',
    text: 'Are you contributing at the correct rate (12% employee + 12% employer + 0.5% admin)?',
    type: 'yes_no',
    category: 'EPF',
    required: true,
    weight: 8,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['EPF'],
    minEmployees: 20,
    helpText: 'Rate is 12% each on Basic + DA, capped at Rs.15,000 for voluntary above.',
  },
  // ESI QUESTIONS (3 questions)
  {
    id: 'ESI_01',
    text: 'Is your organization registered with ESIC?',
    type: 'yes_no',
    category: 'ESI',
    required: true,
    weight: 10,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['ESI'],
    minEmployees: 10,
    helpText: 'Registration required within 15 days of applicability.',
  },
  {
    id: 'ESI_02',
    text: 'Are you filing ESI contributions by the 15th of each month?',
    type: 'yes_no',
    category: 'ESI',
    required: true,
    weight: 8,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['ESI'],
    minEmployees: 10,
    helpText: 'Employee: 0.75%, Employer: 3.25% of gross salary.',
  },
  {
    id: 'ESI_03',
    text: 'Are all eligible employees (earning up to Rs.21,000/month) enrolled in ESI?',
    type: 'yes_no',
    category: 'ESI',
    required: true,
    weight: 7,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['ESI'],
    minEmployees: 10,
    helpText: 'ESI wage ceiling is Rs.21,000/month (Rs.25,000 for disabled employees).',
  },
  // GRATUITY QUESTIONS (2 questions)
  {
    id: 'GRATUITY_01',
    text: 'Do you maintain a gratuity provision/fund for employees?',
    type: 'yes_no',
    category: 'Gratuity',
    required: true,
    weight: 8,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['GRATUITY'],
    minEmployees: 10,
    helpText: 'Provision approximately 4.81% of salary annually for gratuity liability.',
  },
  {
    id: 'GRATUITY_02',
    text: 'Do your employment contracts clearly state gratuity entitlement?',
    type: 'yes_no',
    category: 'Gratuity',
    required: true,
    weight: 6,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['GRATUITY'],
    minEmployees: 10,
    helpText: 'Under new codes, gratuity applies after 1 year for fixed-term (vs 5 years currently).',
  },
  // PROFESSIONAL TAX QUESTIONS (3 questions)
  {
    id: 'PT_01',
    text: 'Are you registered for Professional Tax in all applicable states?',
    type: 'yes_no',
    category: 'Professional Tax',
    required: true,
    weight: 8,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['PROFESSIONAL_TAX'],
    states: PT_APPLICABLE_STATES,
    helpText: 'PT applies in MH, KA, TN, TS, GJ, KL, WB. Delhi, UP, HR, RJ are exempt.',
  },
  {
    id: 'PT_02',
    text: 'Are you deducting PT from employee salaries as per state slabs?',
    type: 'yes_no',
    category: 'Professional Tax',
    required: true,
    weight: 7,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['PROFESSIONAL_TAX'],
    states: PT_APPLICABLE_STATES,
    helpText: 'Maximum Rs.2,500/year per employee across all states.',
  },
  {
    id: 'PT_03',
    text: 'Are you filing PT returns on time (monthly/quarterly as per state)?',
    type: 'yes_no',
    category: 'Professional Tax',
    required: true,
    weight: 7,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['PROFESSIONAL_TAX'],
    states: PT_APPLICABLE_STATES,
    helpText: 'Filing frequency varies: monthly (KA), quarterly (GJ), annual (others).',
  },
  // SHOPS & ESTABLISHMENTS QUESTIONS (3 questions)
  {
    id: 'SE_01',
    text: 'Is your establishment registered under the state Shops & Establishments Act?',
    type: 'yes_no',
    category: 'Shops & Establishments',
    required: true,
    weight: 8,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['SHOPS_ESTABLISHMENTS'],
    helpText: 'Registration required within 30-60 days of starting business.',
  },
  {
    id: 'SE_02',
    text: 'Is the registration certificate displayed prominently at your workplace?',
    type: 'yes_no',
    category: 'Shops & Establishments',
    required: true,
    weight: 5,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['SHOPS_ESTABLISHMENTS'],
    helpText: 'Display is mandatory near the main entrance.',
  },
  {
    id: 'SE_03',
    text: 'Do you maintain attendance registers and wage records as required?',
    type: 'yes_no',
    category: 'Shops & Establishments',
    required: true,
    weight: 6,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['SHOPS_ESTABLISHMENTS'],
    helpText: 'Records must be maintained for at least 3 years.',
  },
  // POSH QUESTIONS (3 questions)
  {
    id: 'POSH_01',
    text: 'Have you constituted an Internal Complaints Committee (ICC) with an external member?',
    type: 'yes_no',
    category: 'POSH',
    required: true,
    weight: 10,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['POSH'],
    minEmployees: 10,
    helpText: 'ICC must have presiding officer (woman), 2+ employee members, 1 external member.',
  },
  {
    id: 'POSH_02',
    text: 'Do you conduct annual POSH awareness training for all employees?',
    type: 'yes_no',
    category: 'POSH',
    required: true,
    weight: 7,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['POSH'],
    minEmployees: 10,
    helpText: 'Training should cover what constitutes harassment, complaint process, consequences.',
  },
  {
    id: 'POSH_03',
    text: 'Do you file the annual POSH report to the District Officer?',
    type: 'yes_no',
    category: 'POSH',
    required: true,
    weight: 8,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['POSH'],
    minEmployees: 10,
    helpText: 'Annual report due by January 31 for previous calendar year.',
  },
  // MATERNITY BENEFIT QUESTIONS (2 questions)
  {
    id: 'MATERNITY_01',
    text: 'Does your maternity leave policy provide 26 weeks of paid leave?',
    type: 'yes_no',
    category: 'Maternity',
    required: true,
    weight: 8,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['MATERNITY'],
    minEmployees: 10,
    helpText: '26 weeks for first two children, 12 weeks thereafter.',
  },
  {
    id: 'MATERNITY_02',
    text: 'If you have 50+ employees, do you have a creche facility?',
    type: 'single_choice',
    category: 'Maternity',
    required: true,
    weight: 7,
    phase: 2,
    applicabilityCodes: ['MATERNITY', 'CRECHE'],
    minEmployees: 50,
    options: [
      { value: 'yes', label: 'Yes, we have creche facility' },
      { value: 'no', label: 'No creche facility' },
      { value: 'na', label: 'N/A - Less than 50 employees' },
    ],
    complianceAnswer: 'yes',
    helpText: 'Creche mandatory for organizations with 50+ employees.',
  },
  // GST QUESTIONS (3 questions)
  {
    id: 'GST_01',
    text: 'Do you file GSTR-1 and GSTR-3B on time every month?',
    type: 'yes_no',
    category: 'GST',
    required: true,
    weight: 9,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['GST'],
    helpText: 'GSTR-1 by 11th, GSTR-3B by 20th of following month.',
  },
  {
    id: 'GST_02',
    text: 'Do you reconcile Input Tax Credit (ITC) claims with GSTR-2B?',
    type: 'yes_no',
    category: 'GST',
    required: true,
    weight: 7,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['GST'],
    helpText: 'ITC mismatch can result in denial of credits during assessment.',
  },
  {
    id: 'GST_03',
    text: 'Do you generate e-invoices for B2B transactions (if turnover above Rs.5 crore)?',
    type: 'single_choice',
    category: 'GST',
    required: true,
    weight: 8,
    phase: 2,
    applicabilityCodes: ['GST', 'E_INVOICING'],
    options: [
      { value: 'yes', label: 'Yes, we generate e-invoices' },
      { value: 'no', label: 'No, we do not generate e-invoices' },
      { value: 'na', label: 'N/A - Turnover below Rs.5 crore' },
    ],
    complianceAnswer: 'yes',
    helpText: 'E-invoicing mandatory for turnover above Rs.5 crore.',
  },
  // MSME PAYMENT QUESTIONS (2 questions)
  {
    id: 'MSME_01',
    text: 'Do you verify MSME registration status of your suppliers?',
    type: 'yes_no',
    category: 'MSME Payment',
    required: true,
    weight: 7,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['MSME_PAYMENT'],
    helpText: 'Check on Udyam portal: udyamregistration.gov.in',
  },
  {
    id: 'MSME_02',
    text: 'Do you pay MSME suppliers within 45 days of acceptance of goods/services?',
    type: 'yes_no',
    category: 'MSME Payment',
    required: true,
    weight: 9,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['MSME_PAYMENT'],
    helpText: 'Under Section 43B(h), delayed payments lose tax deductibility.',
  },
  // DPDP QUESTIONS (3 questions)
  {
    id: 'DPDP_01',
    text: 'Do you obtain clear, specific consent before collecting personal data?',
    type: 'yes_no',
    category: 'DPDP',
    required: true,
    weight: 9,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['DPDP'],
    helpText: 'Consent must be free, specific, informed, and unconditional.',
  },
  {
    id: 'DPDP_02',
    text: 'Have you published a privacy notice in simple, clear language?',
    type: 'yes_no',
    category: 'DPDP',
    required: true,
    weight: 8,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['DPDP'],
    helpText: 'Notice must explain what data is collected, why, and how to exercise rights.',
  },
  {
    id: 'DPDP_03',
    text: 'Can users request access, correction, or deletion of their personal data?',
    type: 'yes_no',
    category: 'DPDP',
    required: true,
    weight: 8,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['DPDP'],
    helpText: 'Data principal rights must be enabled within reasonable timeframes.',
  },
  // LABOUR CODE READINESS (4 questions)
  {
    id: 'LC_01',
    text: 'Is your wage structure compliant with the 50% Basic + DA rule?',
    type: 'single_choice',
    category: 'Labour Codes',
    required: true,
    weight: 8,
    phase: 2,
    minEmployees: 1,
    applicabilityCodes: ['EPF', 'ESI', 'GRATUITY', 'MATERNITY', 'POSH'],
    options: [
      { value: 'yes', label: 'Yes, Basic + DA is at least 50% of total salary' },
      { value: 'no', label: 'No, Basic + DA is less than 50% of total salary' },
      { value: 'unsure', label: 'Not sure' },
    ],
    complianceAnswer: 'yes',
    helpText: 'Under Code on Wages, Basic + DA must be at least 50% of CTC.',
  },
  {
    id: 'LC_02',
    text: 'Do you have a documented grievance redressal mechanism?',
    type: 'yes_no',
    category: 'Labour Codes',
    required: true,
    weight: 7,
    complianceAnswer: 'yes',
    phase: 2,
    minEmployees: 20,
    applicabilityCodes: ['EPF', 'ESI', 'GRATUITY', 'MATERNITY', 'POSH'],
    helpText: 'Grievance Redressal Committee mandatory for 20+ employees under IR Code.',
  },
  {
    id: 'LC_03',
    text: 'Are your employment contracts updated to reflect new Labour Code definitions?',
    type: 'yes_no',
    category: 'Labour Codes',
    required: true,
    weight: 7,
    complianceAnswer: 'yes',
    phase: 2,
    minEmployees: 1,
    applicabilityCodes: ['EPF', 'ESI', 'GRATUITY', 'MATERNITY', 'POSH'],
    helpText: 'Review definitions of wages, worker, employee, and working hours.',
  },
  {
    id: 'LC_04',
    text: 'Do you maintain a unified register as per new simplified compliance?',
    type: 'yes_no',
    category: 'Labour Codes',
    required: true,
    weight: 6,
    complianceAnswer: 'yes',
    phase: 2,
    minEmployees: 1,
    applicabilityCodes: ['EPF', 'ESI', 'GRATUITY', 'MATERNITY', 'POSH'],
    helpText: 'Labour Codes allow single register instead of multiple separate registers.',
  },
  // FSSAI (2 questions)
  {
    id: 'FSSAI_01',
    text: 'Do you have a valid FSSAI license/registration appropriate to your turnover?',
    type: 'yes_no',
    category: 'FSSAI',
    required: true,
    weight: 10,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['FSSAI'],
    industries: ['food_beverage'],
    helpText: 'Basic (<Rs.12L), State (Rs.12L-20Cr), Central (>Rs.20Cr or multi-state).',
  },
  {
    id: 'FSSAI_02',
    text: 'Is your FSSAI license number displayed on all products and premises?',
    type: 'yes_no',
    category: 'FSSAI',
    required: true,
    weight: 8,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['FSSAI'],
    industries: ['food_beverage'],
    helpText: '14-digit license number must be visible on packaging and signage.',
  },
  // FINTECH (2 questions)
  {
    id: 'FINTECH_01',
    text: 'Do you have the appropriate RBI license for your financial services?',
    type: 'single_choice',
    category: 'Fintech',
    required: true,
    weight: 10,
    phase: 2,
    applicabilityCodes: ['RBI_REGISTRATION'],
    industries: ['fintech'],
    options: [
      { value: 'yes', label: 'Yes, we have valid RBI license' },
      { value: 'applied', label: 'Application pending' },
      { value: 'no', label: 'No license obtained' },
      { value: 'na', label: 'N/A - We do not need RBI license' },
    ],
    complianceAnswer: 'yes',
    helpText: 'NBFC, PA, AA licenses have specific net worth requirements.',
  },
  {
    id: 'FINTECH_02',
    text: 'Do you comply with RBI Digital Lending Guidelines (2022)?',
    type: 'yes_no',
    category: 'Fintech',
    required: true,
    weight: 9,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['RBI_REGISTRATION'],
    industries: ['fintech'],
    helpText: 'Key requirements: direct disbursement, KFS, no automatic increases.',
  },
  // FACTORY ACT (2 questions)
  {
    id: 'FACTORY_01',
    text: 'Do you have a valid factory license and appointed Occupier/Manager?',
    type: 'yes_no',
    category: 'Factory Act',
    required: true,
    weight: 10,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['FACTORY_ACT'],
    helpText: 'License required for 10+ workers (with power) or 20+ (without power).',
  },
  {
    id: 'FACTORY_02',
    text: 'Are you compliant with working hours (48 hrs/week, 9 hrs/day max)?',
    type: 'yes_no',
    category: 'Factory Act',
    required: true,
    weight: 8,
    complianceAnswer: 'yes',
    phase: 2,
    applicabilityCodes: ['FACTORY_ACT'],
    helpText: 'Overtime must be paid at double the normal rate.',
  },
  // POLLUTION CONTROL (2 questions)
  {
    id: 'PCB_01',
    text: 'Do you have valid Consent to Operate (CTO) from State Pollution Control Board?',
    type: 'single_choice',
    category: 'Pollution Control',
    required: true,
    weight: 10,
    phase: 2,
    applicabilityCodes: ['POLLUTION_CONTROL'],
    options: [
      { value: 'yes', label: 'Yes, valid CTO' },
      { value: 'expired', label: 'CTO expired/renewal pending' },
      { value: 'no', label: 'No CTO obtained' },
      { value: 'na', label: 'N/A - White category (IT/Services)' },
    ],
    complianceAnswer: 'yes',
    helpText: 'IT/Software classified as White category - only self-declaration needed.',
  },
  {
    id: 'PCB_02',
    text: 'Do you submit environmental compliance reports as required?',
    type: 'single_choice',
    category: 'Pollution Control',
    required: true,
    weight: 7,
    phase: 2,
    applicabilityCodes: ['POLLUTION_CONTROL'],
    options: [
      { value: 'yes', label: 'Yes, regular submissions' },
      { value: 'sometimes', label: 'Sometimes delayed' },
      { value: 'no', label: 'No submissions' },
      { value: 'na', label: 'N/A - Exempt category' },
    ],
    complianceAnswer: 'yes',
    helpText: 'Frequency depends on pollution category: Red (monthly), Orange (quarterly).',
  },
];

// ============================================================================
// APPLICABILITY DETERMINATION LOGIC
// ============================================================================

export interface ApplicabilityResponses {
  [key: string]: string | string[] | boolean;
}

// Helper function to convert state value to proper label
function getStateLabelInternal(stateValue: string): string {
  const state = TOP_10_STATES.find(s => s.value === stateValue);
  return state ? state.label : stateValue.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

// Helper to format multiple state values to labels
function formatStateList(states: string[]): string {
  return states.map(s => getStateLabelInternal(s)).join(', ');
}

export function determineApplicability(responses: ApplicabilityResponses): ApplicabilityResult[] {
  const results: ApplicabilityResult[] = [];
  
  const state = responses.APP_02 as string;
  const operatingStatesRaw = responses.APP_03 as string | string[];
  const operatingStates = Array.isArray(operatingStatesRaw) 
    ? operatingStatesRaw 
    : operatingStatesRaw?.includes('same_as_registered') 
      ? [state] 
      : [operatingStatesRaw || state];
  const industry = responses.APP_04 as string;
  const isDPIIT = responses.APP_05 === 'yes';
  const employeeRange = responses.APP_06 as string;
  const hasContractWorkers = responses.APP_07 === 'yes';
  const contractWorkerCount = responses.APP_08 as string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _hasGigWorkers = responses.APP_09 === 'yes'; // Reserved for future gig worker compliance
  const hasWomenEmployees = responses.APP_10 === 'yes';
  const salaryRange = responses.APP_11 as string;
  const turnoverRange = responses.APP_12 as string;
  const isGSTRegistered = responses.APP_13 === 'yes';
  const hasMSMESuppliers = responses.APP_14 === 'yes';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _isMSMERegistered = responses.APP_15 === 'yes'; // Reserved for future MSME benefits check
  const hasPhysicalOffice = responses.APP_16 === 'yes';
  const hasFactory = responses.APP_17 === 'yes';
  const pollutionCategory = responses.APP_18 as string;
  const processesPersonalData = responses.APP_19 === 'yes';
  const transportsGoods = responses.APP_20 === 'yes';

  const getEmployeeCount = (range: string): number => {
    const found = EMPLOYEE_RANGES.find(r => r.value === range);
    return found?.midpoint || 0;
  };
  
  const employeeCount = getEmployeeCount(employeeRange);

  const getTurnoverValue = (range: string): number => {
    const turnoverMap: Record<string, number> = {
      'under_20L': 10_00_000,
      '20L_40L': 30_00_000,
      '40L_1Cr': 70_00_000,
      '1Cr_5Cr': 3_00_00_000,
      '5Cr_10Cr': 7_50_00_000,
      '10Cr_50Cr': 30_00_00_000,
      '50Cr_plus': 100_00_00_000,
    };
    return turnoverMap[range] || 0;
  };
  
  const turnover = getTurnoverValue(turnoverRange);
  const hasESIEligibleEmployees = ['under_15k', '15k_21k'].includes(salaryRange);

  // EPF - 20+ employees
  results.push({
    code: 'EPF',
    name: 'Employees Provident Fund',
    category: 'central_labour',
    applies: employeeCount >= 20,
    reason: employeeCount >= 20 
      ? `Applicable - You have ${employeeRange} employees (threshold: 20)`
      : `Not applicable - You have ${employeeRange} employees (need 20+)`,
    threshold: '20 employees',
    keyRequirements: ['Register on EPFO Unified Portal', 'Deduct 12% from employee salary', 'File ECR by 15th'],
    penaltyRange: '1% monthly damage + 12% annual interest',
    priority: employeeCount >= 20 ? 'critical' : 'low',
  });

  // ESI - 10+ employees with wage ceiling
  results.push({
    code: 'ESI',
    name: 'Employees State Insurance',
    category: 'central_labour',
    applies: employeeCount >= 10 && hasESIEligibleEmployees,
    reason: employeeCount >= 10 && hasESIEligibleEmployees
      ? `Applicable - ${employeeRange} employees with salaries up to Rs.21,000/month`
      : employeeCount < 10 
        ? `Not applicable - Need 10+ employees`
        : `Not applicable - All employees earn above Rs.21,000/month`,
    threshold: '10 employees earning up to Rs.21,000/month',
    keyRequirements: ['Register on ESIC portal', 'Deduct 0.75% from employee', 'Contribute 3.25% employer'],
    penaltyRange: '12% annual interest + 5-25% damages',
    priority: employeeCount >= 10 && hasESIEligibleEmployees ? 'critical' : 'low',
  });

  // Gratuity - 10+ employees
  results.push({
    code: 'GRATUITY',
    name: 'Payment of Gratuity Act',
    category: 'central_labour',
    applies: employeeCount >= 10,
    reason: employeeCount >= 10 ? `Applicable - You have ${employeeRange} employees (threshold: 10)` : `Not applicable - Need 10+ employees`,
    threshold: '10 employees',
    keyRequirements: ['Provision 4.81% annually', 'Pay on exit after 5 years', 'Maximum Rs.20 lakh'],
    penaltyRange: 'Up to Rs.20,000 fine or 6 months imprisonment',
    priority: employeeCount >= 10 ? 'high' : 'low',
  });

  // Maternity Benefit
  results.push({
    code: 'MATERNITY',
    name: 'Maternity Benefit Act',
    category: 'central_labour',
    applies: hasWomenEmployees && employeeCount >= 10,
    reason: hasWomenEmployees && employeeCount >= 10 ? 'Applicable - You employ women and have 10+ employees' : !hasWomenEmployees ? 'Not applicable - No women employees' : 'Not applicable - Need 10+ employees',
    threshold: '10 employees + women employed',
    keyRequirements: ['26 weeks paid leave', '12 weeks for adoptive mothers', 'Creche if 50+'],
    penaltyRange: 'Up to Rs.50,000 fine or 3 months imprisonment',
    priority: hasWomenEmployees && employeeCount >= 10 ? 'high' : 'low',
  });

  // Creche - 50+ employees
  results.push({
    code: 'CRECHE',
    name: 'Creche Facility',
    category: 'central_labour',
    applies: employeeCount >= 50,
    reason: employeeCount >= 50 ? `Applicable - You have ${employeeRange} employees (threshold: 50)` : `Not applicable - Need 50+ employees`,
    threshold: '50 employees',
    keyRequirements: ['Provide creche facility', 'Allow visits during work'],
    penaltyRange: 'Fine under OSH Code',
    priority: employeeCount >= 50 ? 'high' : 'low',
  });

  // POSH
  results.push({
    code: 'POSH',
    name: 'Prevention of Sexual Harassment',
    category: 'central_labour',
    applies: employeeCount >= 10,
    reason: employeeCount >= 10 ? `Applicable - You have ${employeeRange} employees (threshold: 10)` : `Not applicable - Need 10+ employees`,
    threshold: '10 employees',
    keyRequirements: ['Constitute ICC', 'File annual report', 'Conduct training'],
    penaltyRange: 'Rs.50,000 fine; license cancellation for repeat offense',
    priority: employeeCount >= 10 ? 'high' : 'low',
  });

  // Contract Labour
  const contractThreshold = hasContractWorkers && contractWorkerCount === '50+';
  results.push({
    code: 'CONTRACT_LABOUR',
    name: 'Contract Labour Regulation',
    category: 'central_labour',
    applies: contractThreshold,
    reason: contractThreshold ? 'Applicable - You engage 50+ contract workers' : hasContractWorkers ? 'Not applicable yet - <50 contract workers' : 'Not applicable - No contract workers',
    threshold: '50 contract workers',
    keyRequirements: ['Register as Principal Employer', 'Ensure contractor license', 'Maintain register'],
    penaltyRange: 'Up to Rs.1 lakh fine',
    priority: contractThreshold ? 'high' : 'low',
  });

  // Standing Orders (300+ employees)
  results.push({
    code: 'STANDING_ORDERS',
    name: 'Standing Orders (IR Code)',
    category: 'central_labour',
    applies: employeeCount >= 300,
    reason: employeeCount >= 300 ? `Applicable - You have ${employeeRange} employees (threshold: 300)` : `Not applicable - Need 300+ employees`,
    threshold: '300 employees',
    keyRequirements: ['Draft and certify standing orders', 'Display prominently'],
    penaltyRange: 'Up to Rs.50,000 fine',
    priority: employeeCount >= 300 ? 'high' : 'low',
  });

  // Professional Tax
  const hasPTState = operatingStates.some(s => PT_APPLICABLE_STATES.includes(s));
  const ptStates = operatingStates.filter(s => PT_APPLICABLE_STATES.includes(s));
  results.push({
    code: 'PROFESSIONAL_TAX',
    name: 'Professional Tax',
    category: 'state_specific',
    applies: hasPTState,
    reason: hasPTState ? `Applicable in: ${formatStateList(ptStates)}` : `Not applicable - Your states are PT-exempt`,
    threshold: 'State-specific thresholds',
    keyRequirements: ['Register for PT', 'Deduct per slabs', 'File returns', 'Max Rs.2,500/year'],
    penaltyRange: 'Interest + penalty varies by state',
    priority: hasPTState ? 'high' : 'low',
  });

  // Labour Welfare Fund
  const hasLWFState = operatingStates.some(s => LWF_APPLICABLE_STATES.includes(s));
  const lwfStates = operatingStates.filter(s => LWF_APPLICABLE_STATES.includes(s));
  results.push({
    code: 'LABOUR_WELFARE_FUND',
    name: 'Labour Welfare Fund',
    category: 'state_specific',
    applies: hasLWFState,
    reason: hasLWFState ? `Applicable in: ${formatStateList(lwfStates)}` : 'Not applicable in your states',
    threshold: 'Varies by state',
    keyRequirements: ['Deduct employee contribution', 'Add employer contribution', 'File returns'],
    penaltyRange: 'Penalty varies by state',
    priority: hasLWFState ? 'medium' : 'low',
  });

  // Shops & Establishments
  results.push({
    code: 'SHOPS_ESTABLISHMENTS',
    name: 'Shops & Establishments Act',
    category: 'state_specific',
    applies: hasPhysicalOffice,
    reason: hasPhysicalOffice ? `Applicable - You operate from physical premises` : 'Not applicable - No physical office',
    threshold: 'Any shop or commercial establishment',
    keyRequirements: ['Register within 30-60 days', 'Display certificate', 'Maintain registers'],
    penaltyRange: 'Rs.1,000-Rs.25,000 depending on state',
    priority: hasPhysicalOffice ? 'high' : 'low',
  });

  // GST
  const gstThreshold = turnover >= 20_00_000;
  results.push({
    code: 'GST',
    name: 'Goods and Services Tax',
    category: 'tax_business',
    applies: gstThreshold || isGSTRegistered,
    reason: gstThreshold ? `Applicable - Turnover exceeds Rs.20 lakh` : isGSTRegistered ? 'Already registered under GST' : 'Not mandatory - Turnover below Rs.20 lakh',
    threshold: 'Rs.20 lakh (services) / Rs.40 lakh (goods)',
    keyRequirements: ['File GSTR-1 by 11th', 'File GSTR-3B by 20th', 'Annual return by Dec 31'],
    penaltyRange: 'Rs.50/day late fee; 18% interest',
    priority: gstThreshold || isGSTRegistered ? 'critical' : 'low',
  });

  // E-invoicing
  const eInvoiceThreshold = turnover >= 5_00_00_000;
  results.push({
    code: 'E_INVOICING',
    name: 'GST E-Invoicing',
    category: 'tax_business',
    applies: eInvoiceThreshold,
    reason: eInvoiceThreshold ? `Applicable - Turnover exceeds Rs.5 crore` : 'Not applicable - Turnover below Rs.5 crore',
    threshold: 'Rs.5 crore annual turnover',
    keyRequirements: ['Generate IRN', 'Include QR code on B2B invoices'],
    penaltyRange: 'Rs.25,000 per invoice or 100% tax amount',
    priority: eInvoiceThreshold ? 'critical' : 'low',
  });

  // MSME Payment Rule
  results.push({
    code: 'MSME_PAYMENT',
    name: 'MSME 45-Day Payment Rule',
    category: 'tax_business',
    applies: hasMSMESuppliers,
    reason: hasMSMESuppliers ? 'Applicable - You purchase from MSME suppliers' : 'Not applicable - No MSME suppliers reported',
    threshold: 'Any purchase from MSME supplier',
    keyRequirements: ['Pay within 45 days', 'Check MSME status on Udyam portal'],
    penaltyRange: 'Expense disallowed for tax purposes',
    priority: hasMSMESuppliers ? 'high' : 'low',
  });

  // Startup India Benefits
  results.push({
    code: 'STARTUP_INDIA',
    name: 'Startup India Benefits',
    category: 'tax_business',
    applies: isDPIIT,
    reason: isDPIIT ? 'Eligible - DPIIT recognized startup' : 'Not applicable - Not DPIIT recognized',
    threshold: 'DPIIT recognition',
    keyRequirements: ['Apply for IMB certification', '100% tax holiday for 3 years'],
    penaltyRange: 'N/A (benefit)',
    priority: isDPIIT ? 'medium' : 'low',
  });

  // DPDP Act
  results.push({
    code: 'DPDP',
    name: 'Digital Personal Data Protection Act 2023',
    category: 'tax_business',
    applies: processesPersonalData,
    reason: processesPersonalData ? 'Applicable - You process personal data' : 'Not applicable - No personal data processing',
    threshold: 'Any processing of digital personal data',
    keyRequirements: ['Obtain consent', 'Publish privacy notice', 'Enable data rights'],
    penaltyRange: 'Up to Rs.250 crore for serious breaches',
    priority: processesPersonalData ? 'critical' : 'low',
  });

  // E-Way Bill
  results.push({
    code: 'EWAY_BILL',
    name: 'E-Way Bill',
    category: 'tax_business',
    applies: transportsGoods,
    reason: transportsGoods ? 'Applicable - You transport goods above Rs.50,000' : 'Not applicable - No goods transport',
    threshold: 'Goods movement above Rs.50,000',
    keyRequirements: ['Generate E-Way Bill before movement', 'Validity: 1 day per 200 km'],
    penaltyRange: 'Tax + penalty equal to tax amount',
    priority: transportsGoods ? 'high' : 'low',
  });

  // FSSAI
  const isFoodIndustry = industry === 'food_beverage';
  results.push({
    code: 'FSSAI',
    name: 'FSSAI Food License',
    category: 'industry_specific',
    applies: isFoodIndustry,
    reason: isFoodIndustry ? 'Applicable - Food & Beverage business' : 'Not applicable - Not a food business',
    threshold: 'Any food business',
    keyRequirements: ['Basic/State/Central license per turnover', 'Display license number'],
    penaltyRange: 'Up to Rs.5 lakh + 6 months imprisonment',
    priority: isFoodIndustry ? 'critical' : 'low',
  });

  // RBI/Fintech
  const isFintech = industry === 'fintech';
  results.push({
    code: 'RBI_REGISTRATION',
    name: 'RBI Fintech Registrations',
    category: 'industry_specific',
    applies: isFintech,
    reason: isFintech ? 'Applicable - Fintech/Payments business' : 'Not applicable - Not a fintech business',
    threshold: 'Any lending/payments/financial services',
    keyRequirements: ['NBFC/PA/AA license', 'Digital Lending Guidelines compliance'],
    penaltyRange: 'License cancellation + criminal prosecution',
    priority: isFintech ? 'critical' : 'low',
  });

  // Factory Act
  results.push({
    code: 'FACTORY_ACT',
    name: 'Factories Act',
    category: 'industry_specific',
    applies: hasFactory,
    reason: hasFactory ? 'Applicable - You have a manufacturing facility' : 'Not applicable - No factory',
    threshold: '10 workers (with power) or 20 (without)',
    keyRequirements: ['Factory registration', 'Occupier/Manager appointment', 'Working hours compliance'],
    penaltyRange: 'Up to Rs.10 lakh + 7 years imprisonment',
    priority: hasFactory ? 'critical' : 'low',
  });

  // Pollution Control
  const needsPCB = pollutionCategory !== 'none' && pollutionCategory !== 'minimal';
  results.push({
    code: 'POLLUTION_CONTROL',
    name: 'Pollution Control Board Consent',
    category: 'industry_specific',
    applies: needsPCB,
    reason: needsPCB ? `Applicable - ${pollutionCategory} pollution category` : 'Not applicable - IT/Services (White category)',
    threshold: 'Industrial activity above White category',
    keyRequirements: ['CTE before starting', 'CTO before production', 'Annual renewal'],
    penaltyRange: 'Closure order + Rs.1 lakh/day fine',
    priority: needsPCB ? 'high' : 'low',
  });

  return results.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}


// ============================================================================
// FILTER PHASE 2 QUESTIONS BASED ON APPLICABILITY
// ============================================================================

export function getFilteredPhase2Questions(
  applicabilityResults: ApplicabilityResult[],
  responses: ApplicabilityResponses
): Question[] {
  const applicableCodes = applicabilityResults
    .filter(r => r.applies)
    .map(r => r.code);

  const state = responses.APP_02 as string;
  const operatingStatesRaw = responses.APP_03 as string | string[];
  const operatingStates = Array.isArray(operatingStatesRaw) 
    ? operatingStatesRaw 
    : operatingStatesRaw?.includes('same_as_registered') 
      ? [state] 
      : [operatingStatesRaw || state];
  const industry = responses.APP_04 as string;
  const employeeRange = responses.APP_06 as string;
  const employeeCount = EMPLOYEE_RANGES.find(r => r.value === employeeRange)?.midpoint || 0;

  return PHASE2_QUESTIONS.filter(q => {
    if (q.applicabilityCodes && q.applicabilityCodes.length > 0) {
      const hasApplicableCode = q.applicabilityCodes.some(code => applicableCodes.includes(code));
      if (!hasApplicableCode) return false;
    }
    if (q.minEmployees && employeeCount < q.minEmployees) return false;
    if (q.states && q.states.length > 0) {
      const hasApplicableState = operatingStates.some(s => q.states!.includes(s));
      if (!hasApplicableState) return false;
    }
    if (q.industries && q.industries.length > 0) {
      if (!q.industries.includes(industry)) return false;
    }
    return true;
  });
}


// ============================================================================
// SCORING ALGORITHM
// ============================================================================

export function calculateComplianceScore(
  responses: Record<string, string>,
  questions: Question[]
): {
  overallScore: number;
  categoryScores: Record<string, { score: number; maxScore: number; percentage: number }>;
  status: 'Compliant' | 'Needs Attention' | 'Non-Compliant';
  gaps: Array<{ question: Question; answer: string; recommendation: string }>;
  compliantItems: Array<{ question: Question; answer: string }>;
} {
  const categoryScores: Record<string, { earned: number; max: number }> = {};
  const gaps: Array<{ question: Question; answer: string; recommendation: string }> = [];
  const compliantItems: Array<{ question: Question; answer: string }> = [];

  questions.forEach(q => {
    if (!categoryScores[q.category]) {
      categoryScores[q.category] = { earned: 0, max: 0 };
    }
    const weight = q.weight || 5;
    categoryScores[q.category].max += weight;
    const answer = responses[q.id];

    if (q.type === 'yes_no') {
      if (!q.complianceAnswer) {
        categoryScores[q.category].earned += weight;
        compliantItems.push({ question: q, answer });
      } else if (answer === q.complianceAnswer) {
        categoryScores[q.category].earned += weight;
        compliantItems.push({ question: q, answer });
      } else {
        gaps.push({ question: q, answer, recommendation: `Action needed: ${q.text.replace(/\?$/, '')}` });
      }
    } else if (q.type === 'single_choice') {
      if (answer === 'na') {
        categoryScores[q.category].earned += weight;
        compliantItems.push({ question: q, answer });
      } else if (answer === q.complianceAnswer || answer === 'yes') {
        categoryScores[q.category].earned += weight;
        compliantItems.push({ question: q, answer });
      } else if (answer === 'sometimes' || answer === 'applied' || answer === 'unsure') {
        categoryScores[q.category].earned += weight * 0.5;
        gaps.push({ question: q, answer, recommendation: `Improvement needed: ${q.text}` });
      } else {
        gaps.push({ question: q, answer, recommendation: `Critical gap: ${q.text}` });
      }
    }
  });

  let totalEarned = 0;
  let totalMax = 0;
  const formattedCategoryScores: Record<string, { score: number; maxScore: number; percentage: number }> = {};

  Object.entries(categoryScores).forEach(([category, scores]) => {
    totalEarned += scores.earned;
    totalMax += scores.max;
    formattedCategoryScores[category] = {
      score: scores.earned,
      maxScore: scores.max,
      percentage: scores.max > 0 ? Math.round((scores.earned / scores.max) * 100) : 100,
    };
  });

  const overallScore = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 100;

  let status: 'Compliant' | 'Needs Attention' | 'Non-Compliant';
  if (overallScore >= 80) {
    status = 'Compliant';
  } else if (overallScore >= 50) {
    status = 'Needs Attention';
  } else {
    status = 'Non-Compliant';
  }

  return {
    overallScore,
    categoryScores: formattedCategoryScores,
    status,
    gaps: gaps.sort((a, b) => (b.question.weight || 5) - (a.question.weight || 5)),
    compliantItems,
  };
}

// ============================================================================
// GENERATE SUMMARY FOR APPLICABILITY RESULTS
// ============================================================================

export function generateApplicabilitySummary(results: ApplicabilityResult[]) {
  const applicable = results.filter(r => r.applies);
  const notApplicable = results.filter(r => !r.applies);

  const byPriority = {
    critical: applicable.filter(r => r.priority === 'critical'),
    high: applicable.filter(r => r.priority === 'high'),
    medium: applicable.filter(r => r.priority === 'medium'),
    low: applicable.filter(r => r.priority === 'low'),
  };

  return {
    applicableCount: applicable.length,
    notApplicableCount: notApplicable.length,
    totalChecked: results.length,
    byPriority,
    criticalCount: byPriority.critical.length,
    highCount: byPriority.high.length,
  };
}


// ============================================================================
// ASSESSMENT METADATA
// ============================================================================

export const ASSESSMENT_METADATA = {
  id: 'state_wise_compliance',
  name: 'State-Wise Comprehensive Compliance Check',
  description: 'Complete compliance assessment covering central labour laws, state-specific requirements, tax compliance, and industry-specific regulations.',
  price: 1499,
  priceFormatted: 'Rs.1,499',
  estimatedTime: '20-30 minutes',
  phase1Questions: PHASE1_QUESTIONS.length,
  phase2QuestionsTotal: PHASE2_QUESTIONS.length,
  categories: [
    'Central Labour Laws (EPF, ESI, Gratuity, POSH, Maternity)',
    'State-Specific (Professional Tax, LWF, Shops & Establishments)',
    'Tax & Business (GST, MSME, DPDP)',
    'Industry-Specific (FSSAI, Fintech, Factory, Pollution)',
    'Labour Code Readiness',
  ],
};
