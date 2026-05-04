/**
 * ComplianceCheck - POSH Act 2013 Compliance Applicability Questions
 * 
 * These questions determine WHICH compliance requirements apply to a business
 * based on employee count, locations, industry risk, workforce composition, and operations.
 * 
 * Run these FIRST to filter the compliance assessment to relevant areas only.
 * 
 * Based on:
 * - Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013
 * - POSH Rules, 2013
 * - Supreme Court directive in Aureliano Fernandes v. State of Goa (2023)
 * - State-specific registration requirements (Maharashtra, Telangana, Haryana, Delhi NCT)
 */

// ============================================================================
// TYPES
// ============================================================================

export type QuestionType = 'single_choice' | 'multiple_choice' | 'number' | 'yes_no' | 'text';

export interface ApplicabilityQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options?: { value: string; label: string }[];
  helpText?: string;
  required: boolean;
  category: 
    | 'threshold_check' 
    | 'location_complexity' 
    | 'industry_risk' 
    | 'workforce_composition' 
    | 'night_shift_operations' 
    | 'current_compliance_status';
  conditionalOn?: {
    questionId: string;
    values: string[];
  };
}

export interface ApplicabilityResult {
  code: string;
  name: string;
  applies: boolean;
  reason: string;
  threshold?: string;
  keyRequirements?: string[];
  penaltyRisk?: string;
  timeline?: string;
}

export interface POSHAssessmentProfile {
  requiresFullAssessment: boolean;
  redirectToLCC: boolean;
  questionSetType: 
    | 'lcc_info_only' 
    | 'core_compliance' 
    | 'core_advanced' 
    | 'multi_location' 
    | 'high_risk_industry' 
    | 'full_assessment';
  estimatedQuestionCount: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  stateRegistrationRequired: boolean;
  stateRegistrationPortal?: string;
}

// ============================================================================
// CONSTANTS - STATE CLASSIFICATIONS
// ============================================================================

/**
 * States with mandatory ICC registration portals beyond central Act requirements
 * Reference: State government directives and orders
 */
export const ICC_REGISTRATION_STATES: Record<string, { required: boolean; portal?: string; deadline?: string }> = {
  maharashtra: { 
    required: true, 
    portal: 'District Women & Child Development Officer',
    deadline: 'March 2017 order' 
  },
  telangana: { 
    required: true, 
    portal: 'https://tshebox.telangana.gov.in',
    deadline: 'July 2019 onwards' 
  },
  haryana: { 
    required: true, 
    portal: 'Digital Annual Report submission',
    deadline: 'December 2023 checklist' 
  },
  delhi: { 
    required: true, 
    portal: 'https://shebox.wcd.gov.in',
    deadline: 'June 2025 direction' 
  },
};

/**
 * States with specific night shift requirements for women workers
 * These trigger additional compliance questions
 */
export const NIGHT_SHIFT_REGULATION_STATES = [
  'karnataka',      // Free transport with security
  'haryana',        // GPS tracking, driver verification, minimum batch sizes
  'maharashtra',    // Written consent, GPS tracking, CCTV
  'tamil_nadu',     // Factory Inspector permission, transport arrangements
  'andhra_pradesh', // Prior intimation to police, transport
  'telangana',      // Similar to Andhra Pradesh
];

/**
 * High-risk industries requiring additional POSH safeguards
 * Based on National Medical Commission directive, industry patterns
 */
export const HIGH_RISK_INDUSTRIES = [
  'hospitality',           // Customer-facing, night shifts, accommodation
  'healthcare',            // Patient interactions, night duty, isolated areas
  'bpo_ites',              // Night shifts, transport, client interactions
  'it_services',           // Client visits, offshore teams, extended hours
  'retail',                // Customer-facing roles
  'media_entertainment',   // Industry-specific risks, irregular hours
  'education',             // Student interactions
  'manufacturing',         // Night shifts, isolated work areas
];

// ============================================================================
// APPLICABILITY QUESTIONS - 20 QUESTIONS ACROSS 6 CATEGORIES
// ============================================================================

export const POSH_APPLICABILITY_QUESTIONS: ApplicabilityQuestion[] = [
  // ---------------------------------------------------------------------------
  // SECTION 1: THRESHOLD CHECK (3 questions) - Most Critical
  // ---------------------------------------------------------------------------
  {
    id: 'POSH_APP_001',
    text: 'What is your total employee count across all locations?',
    type: 'single_choice',
    category: 'threshold_check',
    required: true,
    options: [
      { value: 'below_10', label: 'Less than 10 employees' },
      { value: '10_to_49', label: '10-49 employees' },
      { value: '50_to_199', label: '50-199 employees' },
      { value: '200_to_499', label: '200-499 employees' },
      { value: '500_plus', label: '500 or more employees' },
    ],
    helpText: 'Include ALL workers: regular, contract, temporary, interns, trainees, apprentices, consultants, and daily wage workers. POSH Act Section 2(f) has an expansive definition. The 10-employee threshold triggers mandatory ICC constitution.',
  },
  {
    id: 'POSH_APP_002',
    text: 'What type of business entity are you?',
    type: 'single_choice',
    category: 'threshold_check',
    required: true,
    options: [
      { value: 'pvt_ltd', label: 'Private Limited Company' },
      { value: 'public_ltd', label: 'Public Limited Company' },
      { value: 'llp', label: 'Limited Liability Partnership (LLP)' },
      { value: 'partnership', label: 'Partnership Firm' },
      { value: 'proprietorship', label: 'Proprietorship' },
      { value: 'opc', label: 'One Person Company (OPC)' },
      { value: 'society_trust', label: 'Society / Trust / NGO' },
      { value: 'cooperative', label: 'Cooperative Society' },
      { value: 'government', label: 'Government / PSU' },
    ],
    helpText: 'POSH Act applies to ALL types of organizations - private, public, government, NGOs, and any workplace as defined under Section 2(o). Companies must additionally disclose POSH compliance in Board\'s Directors\' Report.',
  },
  {
    id: 'POSH_APP_003',
    text: 'Do you engage any women in your workforce?',
    type: 'yes_no',
    category: 'threshold_check',
    required: true,
    helpText: 'This includes women as employees, contract workers, interns, visitors, or customers. POSH protection extends to "any woman of any age, whether employed or not" per Section 2(a).',
  },

  // ---------------------------------------------------------------------------
  // SECTION 2: LOCATION COMPLEXITY (4 questions)
  // ---------------------------------------------------------------------------
  {
    id: 'POSH_APP_004',
    text: 'How many office/establishment locations does your organization operate?',
    type: 'single_choice',
    category: 'location_complexity',
    required: true,
    options: [
      { value: 'single', label: 'Single location only' },
      { value: '2_to_5', label: '2-5 locations' },
      { value: '6_to_10', label: '6-10 locations' },
      { value: '11_plus', label: 'More than 10 locations' },
    ],
    helpText: 'POSH Act Section 4(1) proviso mandates separate ICCs at EACH office/administrative unit with 10+ employees. A centralized single-ICC model is explicitly non-compliant for multi-location organizations.',
  },
  {
    id: 'POSH_APP_005',
    text: 'How many of your locations have 10 or more employees?',
    type: 'single_choice',
    category: 'location_complexity',
    required: true,
    conditionalOn: {
      questionId: 'POSH_APP_004',
      values: ['2_to_5', '6_to_10', '11_plus'],
    },
    options: [
      { value: 'none', label: 'None (all locations have fewer than 10 employees)' },
      { value: '1_location', label: '1 location' },
      { value: '2_to_3', label: '2-3 locations' },
      { value: '4_to_5', label: '4-5 locations' },
      { value: '6_plus', label: '6 or more locations' },
    ],
    helpText: 'Each location with 10+ employees needs its own ICC. Locations with fewer than 10 employees can direct complaints to the district-level Local Complaints Committee (LCC).',
  },
  {
    id: 'POSH_APP_006',
    text: 'In which state is your primary/registered office located?',
    type: 'single_choice',
    category: 'location_complexity',
    required: true,
    options: [
      { value: 'andhra_pradesh', label: 'Andhra Pradesh' },
      { value: 'assam', label: 'Assam' },
      { value: 'bihar', label: 'Bihar' },
      { value: 'chhattisgarh', label: 'Chhattisgarh' },
      { value: 'delhi', label: 'Delhi NCT' },
      { value: 'goa', label: 'Goa' },
      { value: 'gujarat', label: 'Gujarat' },
      { value: 'haryana', label: 'Haryana' },
      { value: 'himachal_pradesh', label: 'Himachal Pradesh' },
      { value: 'jharkhand', label: 'Jharkhand' },
      { value: 'karnataka', label: 'Karnataka' },
      { value: 'kerala', label: 'Kerala' },
      { value: 'madhya_pradesh', label: 'Madhya Pradesh' },
      { value: 'maharashtra', label: 'Maharashtra' },
      { value: 'manipur', label: 'Manipur' },
      { value: 'meghalaya', label: 'Meghalaya' },
      { value: 'mizoram', label: 'Mizoram' },
      { value: 'nagaland', label: 'Nagaland' },
      { value: 'odisha', label: 'Odisha' },
      { value: 'punjab', label: 'Punjab' },
      { value: 'rajasthan', label: 'Rajasthan' },
      { value: 'sikkim', label: 'Sikkim' },
      { value: 'tamil_nadu', label: 'Tamil Nadu' },
      { value: 'telangana', label: 'Telangana' },
      { value: 'tripura', label: 'Tripura' },
      { value: 'uttar_pradesh', label: 'Uttar Pradesh' },
      { value: 'uttarakhand', label: 'Uttarakhand' },
      { value: 'west_bengal', label: 'West Bengal' },
      { value: 'other_ut', label: 'Other Union Territory' },
    ],
    helpText: 'Some states (Maharashtra, Telangana, Haryana, Delhi) have mandatory ICC registration requirements beyond the central POSH Act. Annual reports are submitted to the District Officer of this state.',
  },
  {
    id: 'POSH_APP_007',
    text: 'Do you have operations in multiple states?',
    type: 'single_choice',
    category: 'location_complexity',
    required: true,
    options: [
      { value: 'single_state', label: 'No, operations in single state only' },
      { value: 'multi_state', label: 'Yes, operations in multiple states' },
    ],
    helpText: 'Multi-state operations require awareness of state-specific ICC registration requirements and night shift regulations. Annual reports may need to be filed in multiple districts.',
  },

  // ---------------------------------------------------------------------------
  // SECTION 3: INDUSTRY RISK CLASSIFICATION (2 questions)
  // ---------------------------------------------------------------------------
  {
    id: 'POSH_APP_008',
    text: 'What is your primary industry/sector?',
    type: 'single_choice',
    category: 'industry_risk',
    required: true,
    options: [
      { value: 'it_services', label: 'IT Services / Software' },
      { value: 'bpo_ites', label: 'BPO / ITES / Call Center' },
      { value: 'manufacturing', label: 'Manufacturing' },
      { value: 'healthcare', label: 'Healthcare / Hospital / Clinic' },
      { value: 'hospitality', label: 'Hospitality / Hotels / Restaurants' },
      { value: 'retail', label: 'Retail / E-commerce' },
      { value: 'education', label: 'Education / Training Institute' },
      { value: 'media_entertainment', label: 'Media / Entertainment' },
      { value: 'banking_finance', label: 'Banking / Financial Services / Insurance' },
      { value: 'construction', label: 'Construction / Real Estate' },
      { value: 'logistics', label: 'Logistics / Transportation' },
      { value: 'professional_services', label: 'Professional Services (Legal, Consulting)' },
      { value: 'agriculture', label: 'Agriculture / Plantation' },
      { value: 'ngo_nonprofit', label: 'NGO / Non-profit' },
      { value: 'other', label: 'Other' },
    ],
    helpText: 'High-risk industries (Hospitality, Healthcare, BPO/IT, Retail, Media) have additional compliance requirements including customer harassment protocols, night shift safeguards, and industry-specific POSH guidelines.',
  },
  {
    id: 'POSH_APP_009',
    text: 'Does your business involve significant customer/client/patient interactions?',
    type: 'single_choice',
    category: 'industry_risk',
    required: true,
    options: [
      { value: 'minimal', label: 'Minimal - mostly internal/backend operations' },
      { value: 'moderate', label: 'Moderate - some customer-facing roles' },
      { value: 'significant', label: 'Significant - many customer-facing employees' },
      { value: 'primary', label: 'Primary - customer service is core business' },
    ],
    helpText: 'Third-party harassment by customers, vendors, or visitors triggers employer liability under Section 19(a). Organizations with significant external interactions need specific protocols for handling such complaints.',
  },

  // ---------------------------------------------------------------------------
  // SECTION 4: WORKFORCE COMPOSITION (5 questions)
  // ---------------------------------------------------------------------------
  {
    id: 'POSH_APP_010',
    text: 'What percentage of your total workforce are women?',
    type: 'single_choice',
    category: 'workforce_composition',
    required: true,
    options: [
      { value: 'below_10', label: 'Less than 10%' },
      { value: '10_to_25', label: '10-25%' },
      { value: '26_to_50', label: '26-50%' },
      { value: 'above_50', label: 'More than 50%' },
    ],
    helpText: 'ICC composition requires at least 50% women members. Organizations with very few women employees may need to consider external women members or nominate Presiding Officer from another office of the same employer.',
  },
  {
    id: 'POSH_APP_011',
    text: 'Do you engage contract workers, consultants, or staffing agency personnel?',
    type: 'yes_no',
    category: 'workforce_composition',
    required: true,
    helpText: 'Contract workers, consultants, trainees, and staffing agency personnel are covered under POSH Act Section 2(f). They must be included in your POSH policy and training programs.',
  },
  {
    id: 'POSH_APP_012',
    text: 'Do you have interns, trainees, or apprentices in your organization?',
    type: 'yes_no',
    category: 'workforce_composition',
    required: true,
    helpText: 'Interns, trainees, and apprentices (even unpaid) are explicitly covered under the "employee" definition in POSH Act Section 2(f). They count towards the 10-employee threshold and must receive POSH orientation.',
  },
  {
    id: 'POSH_APP_013',
    text: 'Do you have employees working remotely or in work-from-home arrangements?',
    type: 'single_choice',
    category: 'workforce_composition',
    required: true,
    options: [
      { value: 'none', label: 'No - all employees work from office' },
      { value: 'some', label: 'Some employees work remotely (hybrid model)' },
      { value: 'majority', label: 'Majority work remotely' },
      { value: 'fully_remote', label: 'Fully remote organization' },
    ],
    helpText: 'Virtual workplace harassment is covered under POSH. The Rajasthan High Court in Sanjeev Mishra v. Bank of Baroda (2021) held that digital platforms constitute a workplace. Your policy must explicitly address harassment via emails, chats, video calls, and digital communications.',
  },
  {
    id: 'POSH_APP_014',
    text: 'Do you engage gig workers or platform workers (e.g., delivery partners, ride-share drivers)?',
    type: 'yes_no',
    category: 'workforce_composition',
    required: true,
    helpText: 'Gig worker coverage under POSH is evolving. Karnataka High Court in Ms. X v. Ola (2024) held platform workers may qualify as employees. Platforms should proactively establish grievance mechanisms pending legislative clarity.',
  },

  // ---------------------------------------------------------------------------
  // SECTION 5: NIGHT SHIFT OPERATIONS (2 questions)
  // ---------------------------------------------------------------------------
  {
    id: 'POSH_APP_015',
    text: 'Do you have women employees working night shifts (8 PM to 6 AM)?',
    type: 'single_choice',
    category: 'night_shift_operations',
    required: true,
    options: [
      { value: 'no', label: 'No - no women work night shifts' },
      { value: 'occasional', label: 'Occasionally (during project deadlines, etc.)' },
      { value: 'regular', label: 'Yes - regular night shift operations with women' },
    ],
    helpText: 'Night shift operations for women trigger state-specific requirements: written consent, GPS-tracked transport, CCTV surveillance, women supervisors, and prior intimation to police. Karnataka, Haryana, Maharashtra, and Tamil Nadu have specific regulations.',
  },
  {
    id: 'POSH_APP_016',
    text: 'Does your organization provide transport for employees working late hours?',
    type: 'single_choice',
    category: 'night_shift_operations',
    required: true,
    conditionalOn: {
      questionId: 'POSH_APP_015',
      values: ['occasional', 'regular'],
    },
    options: [
      { value: 'no_transport', label: 'No company-provided transport' },
      { value: 'own_fleet', label: 'Yes - own vehicle fleet' },
      { value: 'vendor_transport', label: 'Yes - through transport vendor/aggregator' },
      { value: 'reimbursement', label: 'Reimbursement for personal transport only' },
    ],
    helpText: 'Company-provided transport for night shifts requires: driver verification, GPS tracking, minimum batch sizes (Karnataka requires security guard if only 1-2 women), and emergency helpline. Transport vendors must also comply with your POSH policy.',
  },

  // ---------------------------------------------------------------------------
  // SECTION 6: CURRENT COMPLIANCE STATUS - TRIAGE (4 questions)
  // ---------------------------------------------------------------------------
  {
    id: 'POSH_APP_017',
    text: 'Does your organization currently have an Internal Complaints Committee (ICC) constituted?',
    type: 'single_choice',
    category: 'current_compliance_status',
    required: true,
    options: [
      { value: 'yes_complete', label: 'Yes - fully constituted with all required members' },
      { value: 'yes_partial', label: 'Yes - but some positions may be vacant/expired' },
      { value: 'no', label: 'No ICC currently in place' },
      { value: 'not_sure', label: 'Not sure' },
    ],
    helpText: 'ICC must have: 1 senior woman as Presiding Officer, minimum 2 employee members, 1 external member from NGO/women\'s organization. 50%+ must be women. Missing ICC attracts ₹50,000 fine (first offense), ₹1,00,000 (repeat), and potential license cancellation.',
  },
  {
    id: 'POSH_APP_018',
    text: 'When was your ICC last constituted or reconstituted?',
    type: 'single_choice',
    category: 'current_compliance_status',
    required: true,
    conditionalOn: {
      questionId: 'POSH_APP_017',
      values: ['yes_complete', 'yes_partial'],
    },
    options: [
      { value: 'within_1_year', label: 'Within the last 1 year' },
      { value: '1_to_2_years', label: '1-2 years ago' },
      { value: '2_to_3_years', label: '2-3 years ago' },
      { value: 'over_3_years', label: 'More than 3 years ago' },
      { value: 'unknown', label: 'Don\'t know / Records not available' },
    ],
    helpText: 'ICC members have a maximum tenure of 3 years under Section 4(3). After 3 years, the ICC MUST be reconstituted. Members can be re-nominated but a fresh nomination order is required. Expired ICC is treated as no ICC.',
  },
  {
    id: 'POSH_APP_019',
    text: 'Did your organization file the annual POSH report for the previous calendar year?',
    type: 'single_choice',
    category: 'current_compliance_status',
    required: true,
    options: [
      { value: 'yes_filed', label: 'Yes - filed with District Officer by January 31' },
      { value: 'filed_late', label: 'Yes - but filed after the deadline' },
      { value: 'not_filed', label: 'No - annual report not filed' },
      { value: 'not_required', label: 'Not applicable (less than 10 employees)' },
      { value: 'not_sure', label: 'Not sure / Don\'t know' },
    ],
    helpText: 'Annual report to District Officer is MANDATORY under Section 21 - even if zero complaints were received (nil report). The deadline is typically January 31. Non-filing attracts ₹50,000+ penalty. Companies must also disclose in Board\'s Directors\' Report.',
  },
  {
    id: 'POSH_APP_020',
    text: 'Do you have a written POSH policy in place?',
    type: 'single_choice',
    category: 'current_compliance_status',
    required: true,
    options: [
      { value: 'yes_comprehensive', label: 'Yes - comprehensive policy covering all requirements' },
      { value: 'yes_basic', label: 'Yes - basic policy exists but may need updates' },
      { value: 'in_progress', label: 'In progress / Being drafted' },
      { value: 'no_policy', label: 'No written POSH policy' },
    ],
    helpText: 'A comprehensive POSH policy must cover: definition of harassment (all 5 types), ICC composition and contact details, complaint filing procedure and timelines, inquiry process, interim relief provisions, confidentiality requirements, and protection against retaliation.',
  },
];

// ============================================================================
// APPLICABILITY DETERMINATION LOGIC
// ============================================================================

export function determinePOSHApplicability(
  responses: Record<string, string>
): ApplicabilityResult[] {
  const results: ApplicabilityResult[] = [];
  
  // Parse key responses
  const employeeCount = responses['POSH_APP_001'];
  const hasWomenInWorkforce = responses['POSH_APP_003'];
  const locationCount = responses['POSH_APP_004'];
  const locationsWithTenPlus = responses['POSH_APP_005'];
  const primaryState = responses['POSH_APP_006'];
  const industry = responses['POSH_APP_008'];
  const hasRemoteWorkers = responses['POSH_APP_013'];
  const hasNightShifts = responses['POSH_APP_015'];
  const hasICC = responses['POSH_APP_017'];
  const iccTenure = responses['POSH_APP_018'];
  const annualReportFiled = responses['POSH_APP_019'];
  
  // Helper: Check if above 10-employee threshold
  const isAboveThreshold = employeeCount !== 'below_10';
  
  // Helper: Check if high-risk industry
  const isHighRiskIndustry = HIGH_RISK_INDUSTRIES.includes(industry);
  
  // Helper: Check state-specific registration
  const stateRequiresRegistration = ICC_REGISTRATION_STATES[primaryState]?.required || false;
  const stateRegistrationPortal = ICC_REGISTRATION_STATES[primaryState]?.portal;
  
  // ---------------------------------------------------------------------------
  // RESULT 1: ICC CONSTITUTION (Most Critical)
  // ---------------------------------------------------------------------------
  if (isAboveThreshold) {
    const iccMissing = hasICC === 'no' || hasICC === 'not_sure';
    const iccExpired = iccTenure === 'over_3_years' || iccTenure === 'unknown';
    const noWomenCurrently = hasWomenInWorkforce === 'no';

    results.push({
      code: 'POSH_ICC_CONSTITUTION',
      name: 'Internal Complaints Committee (ICC) Constitution',
      applies: true,
      reason: noWomenCurrently
        ? 'POSH Act protects "any woman of any age, whether employed or not" (Section 2(a)) - this includes clients, visitors, and vendors at your workplace. ICC is still required under Section 4(1). Since you currently have no women employees, women members for ICC must be nominated from another office of the same employer.'
        : iccMissing
        ? 'You have 10+ employees - ICC constitution is MANDATORY under Section 4(1).'
        : iccExpired
        ? 'Your ICC tenure has exceeded 3 years - reconstitution is required under Section 4(3).'
        : 'ICC constitution requirement applies to your organization.',
      threshold: '10+ employees',
      keyRequirements: [
        ...(noWomenCurrently ? [
          'IMPORTANT: No women currently in workforce - nominate Presiding Officer and women members from another office/branch of the same employer (permitted under Section 4(2)(a))',
        ] : []),
        'Presiding Officer: Senior-level woman employee',
        'Minimum 2 employee members (preferably with social work/legal background)',
        'External member from NGO or 5+ years women\'s empowerment experience',
        '50%+ of ICC members must be women',
        'Maximum tenure: 3 years (reconstitution required)',
        'Separate ICC required at each location with 10+ employees',
      ],
      penaltyRisk: iccMissing
        ? 'Rs.50,000 (first offense), Rs.1,00,000 (repeat), License cancellation (continued non-compliance)'
        : 'Inquiry proceedings may be invalidated if ICC composition is improper',
      timeline: iccMissing ? 'Immediate - constitute within 30 days' : 'Before current tenure expires',
    });
  } else {
    results.push({
      code: 'POSH_ICC_CONSTITUTION',
      name: 'Internal Complaints Committee (ICC) Constitution',
      applies: false,
      reason: 'Organizations with fewer than 10 employees are not required to constitute an ICC. Complaints should be directed to the district-level Local Complaints Committee (LCC).',
      threshold: '10+ employees',
      keyRequirements: [
        'Identify your district\'s LCC contact details',
        'Display LCC information at workplace',
        'Inform employees about LCC complaint mechanism',
      ],
    });
  }
  
  // ---------------------------------------------------------------------------
  // RESULT 2: MULTI-LOCATION ICC REQUIREMENT
  // ---------------------------------------------------------------------------
  if (isAboveThreshold && locationCount !== 'single' && locationsWithTenPlus !== 'none') {
    const iccLocationsNeeded = {
      '1_location': 1,
      '2_to_3': 3,
      '4_to_5': 5,
      '6_plus': 6,
    }[locationsWithTenPlus] || 1;
    
    results.push({
      code: 'POSH_MULTI_LOCATION_ICC',
      name: 'Multi-Location ICC Requirement',
      applies: true,
      reason: `You have multiple locations with 10+ employees - separate ICCs are required at each location per Section 4(1) proviso.`,
      threshold: 'Each location with 10+ employees',
      keyRequirements: [
        `Constitute ICCs at ${iccLocationsNeeded}+ locations`,
        'Each ICC must have complete composition (PO + 2 members + external)',
        'Employees can file complaints with ICC at their location',
        'Central coordination mechanism recommended for policy consistency',
        'Maintain separate ICC registers and records at each location',
      ],
      penaltyRisk: 'Centralized single-ICC model is explicitly non-compliant - complaints may be invalidated',
    });
  }
  
  // ---------------------------------------------------------------------------
  // RESULT 3: STATE-SPECIFIC ICC REGISTRATION
  // ---------------------------------------------------------------------------
  if (isAboveThreshold && stateRequiresRegistration) {
    results.push({
      code: 'POSH_STATE_REGISTRATION',
      name: 'State ICC Registration Requirement',
      applies: true,
      reason: `${primaryState.replace('_', ' ').toUpperCase()} requires mandatory ICC registration beyond central Act requirements.`,
      threshold: 'State-specific mandate',
      keyRequirements: [
        `Register ICC on: ${stateRegistrationPortal}`,
        'Submit ICC composition details',
        'Update registration on reconstitution',
        'Some states require digital annual report submission',
      ],
      penaltyRisk: 'Non-registration may attract state-level penalties and compliance notices',
      timeline: 'Within 30 days of ICC constitution',
    });
  }
  
  // ---------------------------------------------------------------------------
  // RESULT 4: ANNUAL REPORT FILING
  // ---------------------------------------------------------------------------
  if (isAboveThreshold) {
    const reportMissing = annualReportFiled === 'not_filed' || annualReportFiled === 'not_sure';
    
    results.push({
      code: 'POSH_ANNUAL_REPORT',
      name: 'Annual Report to District Officer',
      applies: true,
      reason: reportMissing
        ? 'Annual report filing is MANDATORY under Section 21 - even nil reports must be submitted.'
        : 'Annual report requirement applies. Ensure timely filing each year.',
      threshold: '10+ employees (annual requirement)',
      keyRequirements: [
        'Submit annual report by January 31 (for previous calendar year)',
        'Include: complaints received, disposed, pending beyond 90 days',
        'Include: awareness programs conducted',
        'NIL reports mandatory if no complaints received',
        'Companies: Include POSH disclosure in Board\'s Directors\' Report',
        'Retain filing acknowledgment/receipt',
      ],
      penaltyRisk: 'Rs.50,000+ penalty for non-filing',
      timeline: 'January 31 each year',
    });
  }
  
  // ---------------------------------------------------------------------------
  // RESULT 5: POSH POLICY REQUIREMENT
  // ---------------------------------------------------------------------------
  if (isAboveThreshold) {
    const policyMissing = responses['POSH_APP_020'] === 'no_policy' || responses['POSH_APP_020'] === 'in_progress';
    
    results.push({
      code: 'POSH_POLICY',
      name: 'Written POSH Policy',
      applies: true,
      reason: policyMissing
        ? 'A comprehensive written POSH policy is required under Section 19.'
        : 'Ensure policy is comprehensive and updated for modern workplace scenarios.',
      threshold: '10+ employees',
      keyRequirements: [
        'Define all 5 types of sexual harassment',
        'ICC composition and contact details',
        'Complaint filing procedure and timelines',
        'Inquiry process (90-day completion requirement)',
        'Interim relief measures',
        'Confidentiality requirements',
        'Protection against retaliation',
        policyMissing ? '' : 'Include virtual/remote harassment scenarios',
      ].filter(Boolean),
      penaltyRisk: 'Section 19 violation - Rs.50,000+ penalty',
      timeline: policyMissing ? 'Within 30 days' : 'Review annually',
    });
  }
  
  // ---------------------------------------------------------------------------
  // RESULT 6: TRAINING & AWARENESS
  // ---------------------------------------------------------------------------
  if (isAboveThreshold) {
    results.push({
      code: 'POSH_TRAINING',
      name: 'Training & Awareness Programs',
      applies: true,
      reason: 'Section 19(c) mandates regular workshops and awareness programs for all employees.',
      threshold: '10+ employees',
      keyRequirements: [
        'Annual employee awareness training',
        'ICC member specialized orientation (inquiry procedures, legal aspects)',
        'POSH orientation during new joiner induction',
        'Maintain training attendance records',
        'Update training content for virtual harassment scenarios',
      ],
      penaltyRisk: 'Conducted training without records = no compliance evidence',
      timeline: 'At least annually',
    });
  }
  
  // ---------------------------------------------------------------------------
  // RESULT 7: DISPLAY REQUIREMENTS
  // ---------------------------------------------------------------------------
  if (isAboveThreshold) {
    results.push({
      code: 'POSH_DISPLAY',
      name: 'Mandatory Display Requirements',
      applies: true,
      reason: 'Section 19(b) mandates conspicuous display of penal consequences AND ICC constitution order.',
      threshold: '10+ employees',
      keyRequirements: [
        'Display penal consequences at conspicuous locations',
        'Display ICC constitution order with member names/contact',
        'Display in languages understood by majority of employees',
        'Make policy accessible on intranet/website',
        'Provide multiple complaint reporting channels',
      ],
      penaltyRisk: 'Rs.50,000+ penalty for non-display',
      timeline: 'Immediate and ongoing',
    });
  }
  
  // ---------------------------------------------------------------------------
  // RESULT 8: HIGH-RISK INDUSTRY ADDITIONAL REQUIREMENTS
  // ---------------------------------------------------------------------------
  if (isAboveThreshold && isHighRiskIndustry) {
    const industrySpecificReqs: Record<string, string[]> = {
      hospitality: [
        'Customer/guest harassment protocol',
        'Night shift safeguards (written consent, GPS transport, CCTV)',
        'Women supervisor on night shifts',
        'Third-party harassment reporting mechanism',
      ],
      healthcare: [
        'Patient harassment protocol (National Medical Commission mandate)',
        'Isolated work area safeguards',
        'Night duty protections',
        'Clear escalation for patient-related incidents',
      ],
      bpo_ites: [
        'State-specific night shift compliance (Karnataka, Haryana)',
        'GPS-tracked transport with driver verification',
        'Minimum batch sizes for transport',
        'Client interaction harassment protocols',
      ],
      it_services: [
        'Client visit/offshore team harassment protocols',
        'Extended hours/deadline pressure safeguards',
        'Virtual harassment policy for remote teams',
      ],
      retail: [
        'Customer harassment protocol',
        'Late evening shift safeguards',
        'Store-level ICC awareness',
      ],
      media_entertainment: [
        'Industry-specific risk awareness',
        'Irregular hours safeguards',
        'Location shoot protocols',
      ],
      education: [
        'Student interaction protocols',
        'Clear boundaries policy',
        'Reporting mechanism for student complaints',
      ],
    };
    
    results.push({
      code: 'POSH_HIGH_RISK_INDUSTRY',
      name: 'High-Risk Industry Additional Requirements',
      applies: true,
      reason: `${industry.replace('_', ' ')} is classified as a high-risk industry requiring additional POSH safeguards.`,
      threshold: 'Industry-specific',
      keyRequirements: industrySpecificReqs[industry] || [
        'Industry-specific risk assessment',
        'Enhanced awareness training',
        'Third-party harassment protocols',
      ],
      penaltyRisk: 'Higher scrutiny during compliance audits',
    });
  }
  
  // ---------------------------------------------------------------------------
  // RESULT 9: NIGHT SHIFT COMPLIANCE
  // ---------------------------------------------------------------------------
  if (isAboveThreshold && (hasNightShifts === 'occasional' || hasNightShifts === 'regular')) {
    const isRegulatedState = NIGHT_SHIFT_REGULATION_STATES.includes(primaryState);
    
    results.push({
      code: 'POSH_NIGHT_SHIFT',
      name: 'Night Shift Compliance Requirements',
      applies: true,
      reason: isRegulatedState
        ? `Night shifts for women in ${primaryState.replace('_', ' ')} require specific state-mandated safeguards.`
        : 'Night shift operations for women require safety arrangements under Section 19.',
      threshold: 'Women working 8 PM - 6 AM',
      keyRequirements: [
        'Written consent from women employees',
        'GPS-tracked transport (if company-provided)',
        'Driver verification and background checks',
        'CCTV surveillance in transport and premises',
        'Women supervisor on night shift (recommended)',
        'Emergency helpline number',
        isRegulatedState ? 'Prior intimation to local police (if required by state)' : '',
        isRegulatedState ? 'Minimum batch sizes for transport (Karnataka: security guard if 1-2 women)' : '',
      ].filter(Boolean),
      penaltyRisk: 'State labor inspector notices, license issues',
      timeline: 'Before commencing night shift operations',
    });
  }
  
  // ---------------------------------------------------------------------------
  // RESULT 10: REMOTE/VIRTUAL WORKPLACE
  // ---------------------------------------------------------------------------
  if (isAboveThreshold && hasRemoteWorkers !== 'none') {
    results.push({
      code: 'POSH_VIRTUAL_WORKPLACE',
      name: 'Virtual Workplace Harassment Coverage',
      applies: true,
      reason: 'Digital platforms and remote work arrangements are covered under POSH per judicial interpretation (Sanjeev Mishra v. Bank of Baroda, 2021).',
      threshold: 'Remote/hybrid workforce',
      keyRequirements: [
        'Policy explicitly covers virtual harassment',
        'Harassment via email, chat, video calls included',
        'Social media and digital communication guidelines',
        'Screen-sharing conduct guidelines',
        'Digital complaint filing mechanism',
        'Evidence preservation guidelines for digital complaints',
      ],
      penaltyRisk: 'Virtual harassment complaints are valid - policy gaps create liability',
    });
  }
  
  // ---------------------------------------------------------------------------
  // RESULT 11: COMPLAINT HANDLING READINESS
  // ---------------------------------------------------------------------------
  if (isAboveThreshold) {
    results.push({
      code: 'POSH_COMPLAINT_HANDLING',
      name: 'Complaint Handling Readiness',
      applies: true,
      reason: 'Proper complaint handling infrastructure is essential for timely resolution within 90-day statutory limit.',
      threshold: '10+ employees',
      keyRequirements: [
        'Multiple complaint channels (written, email, in-person)',
        'Complaint acknowledgment within 7 working days',
        '90-day inquiry completion timeline tracking',
        'Confidentiality protocols and NDAs',
        'Interim relief mechanism',
        'Appeal process communication',
        'Record maintenance for 7 years',
      ],
      penaltyRisk: 'Improper procedures can invalidate ICC proceedings on appeal',
      timeline: 'Infrastructure before first complaint',
    });
  }
  
  return results;
}

// ============================================================================
// ASSESSMENT PROFILE GENERATOR
// ============================================================================

export function generatePOSHAssessmentProfile(
  responses: Record<string, string>
): POSHAssessmentProfile {
  const employeeCount = responses['POSH_APP_001'];
  const locationCount = responses['POSH_APP_004'];
  const locationsWithTenPlus = responses['POSH_APP_005'];
  const primaryState = responses['POSH_APP_006'];
  const industry = responses['POSH_APP_008'];
  const hasNightShifts = responses['POSH_APP_015'];
  const hasICC = responses['POSH_APP_017'];
  const annualReportFiled = responses['POSH_APP_019'];

  // Below threshold - redirect to LCC info
  if (employeeCount === 'below_10') {
    return {
      requiresFullAssessment: false,
      redirectToLCC: true,
      questionSetType: 'lcc_info_only',
      estimatedQuestionCount: 0,
      riskLevel: 'low',
      stateRegistrationRequired: false,
    };
  }

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';

  if (hasICC === 'no' || annualReportFiled === 'not_filed') {
    riskLevel = 'critical';
  } else if (hasICC === 'yes_partial' || annualReportFiled === 'not_sure') {
    riskLevel = 'high';
  } else if (HIGH_RISK_INDUSTRIES.includes(industry) || hasNightShifts === 'regular') {
    riskLevel = 'high';
  }
  
  // Determine question set type
  let questionSetType: POSHAssessmentProfile['questionSetType'] = 'core_compliance';
  let estimatedQuestionCount = 25;
  
  const isHighRisk = HIGH_RISK_INDUSTRIES.includes(industry);
  const isMultiLocation = locationCount !== 'single' && locationsWithTenPlus !== 'none';
  const hasNightOps = hasNightShifts === 'occasional' || hasNightShifts === 'regular';
  const isLargeOrg = employeeCount === '200_to_499' || employeeCount === '500_plus';
  
  if (isHighRisk && hasNightOps) {
    questionSetType = 'full_assessment';
    estimatedQuestionCount = 50;
  } else if (isHighRisk) {
    questionSetType = 'high_risk_industry';
    estimatedQuestionCount = 45;
  } else if (isMultiLocation) {
    questionSetType = 'multi_location';
    estimatedQuestionCount = 40;
  } else if (isLargeOrg) {
    questionSetType = 'core_advanced';
    estimatedQuestionCount = 35;
  }
  
  // Check state registration
  const stateRegistrationRequired = ICC_REGISTRATION_STATES[primaryState]?.required || false;
  const stateRegistrationPortal = ICC_REGISTRATION_STATES[primaryState]?.portal;
  
  return {
    requiresFullAssessment: true,
    redirectToLCC: false,
    questionSetType,
    estimatedQuestionCount,
    riskLevel,
    stateRegistrationRequired,
    stateRegistrationPortal,
  };
}

// ============================================================================
// SUMMARY GENERATOR
// ============================================================================

export function generatePOSHApplicabilitySummary(results: ApplicabilityResult[]): {
  applicableCount: number;
  notApplicableCount: number;
  byCategory: {
    iccRelated: ApplicabilityResult[];
    reportingRelated: ApplicabilityResult[];
    policyRelated: ApplicabilityResult[];
    operationalRelated: ApplicabilityResult[];
  };
  criticalGaps: string[];
  immediateActions: string[];
  penaltyExposure: string;
} {
  const applicable = results.filter((r) => r.applies);
  const notApplicable = results.filter((r) => !r.applies);
  
  // Categorize results
  const iccRelated = results.filter((r) => 
    ['POSH_ICC_CONSTITUTION', 'POSH_MULTI_LOCATION_ICC', 'POSH_STATE_REGISTRATION'].includes(r.code)
  );
  const reportingRelated = results.filter((r) => 
    ['POSH_ANNUAL_REPORT', 'POSH_COMPLAINT_HANDLING'].includes(r.code)
  );
  const policyRelated = results.filter((r) => 
    ['POSH_POLICY', 'POSH_TRAINING', 'POSH_DISPLAY'].includes(r.code)
  );
  const operationalRelated = results.filter((r) => 
    ['POSH_HIGH_RISK_INDUSTRY', 'POSH_NIGHT_SHIFT', 'POSH_VIRTUAL_WORKPLACE'].includes(r.code)
  );
  
  // Identify critical gaps
  const criticalGaps: string[] = [];
  applicable.forEach((r) => {
    if (r.penaltyRisk?.includes('50,000') || r.penaltyRisk?.includes('1,00,000') || r.penaltyRisk?.includes('License')) {
      criticalGaps.push(`${r.name}: ${r.reason}`);
    }
  });
  
  // Generate immediate actions
  const immediateActions = applicable
    .filter((r) => r.timeline?.includes('Immediate') || r.timeline?.includes('30 days'))
    .map((r) => r.name);
  
  // Calculate penalty exposure
  let penaltyExposure = 'Rs.0';
  if (criticalGaps.length > 0) {
    penaltyExposure = criticalGaps.length >= 3 
      ? 'Rs.1,50,000+ (multiple violations) + potential license cancellation'
      : criticalGaps.length >= 2
      ? 'Rs.1,00,000+ (multiple violations)'
      : 'Rs.50,000+ (single violation)';
  }
  
  return {
    applicableCount: applicable.length,
    notApplicableCount: notApplicable.length,
    byCategory: {
      iccRelated,
      reportingRelated,
      policyRelated,
      operationalRelated,
    },
    criticalGaps,
    immediateActions,
    penaltyExposure,
  };
}

// ============================================================================
// QUESTION COUNT ESTIMATOR
// ============================================================================

export function estimatePOSHQuestionCount(results: ApplicabilityResult[]): number {
  const applicableCodes = results.filter((r) => r.applies).map((r) => r.code);
  
  // Base questions for universal requirements
  let count = 15; // ICC basics, policy, training, display
  
  // Add questions based on applicable areas
  const questionCounts: Record<string, number> = {
    POSH_ICC_CONSTITUTION: 10,
    POSH_MULTI_LOCATION_ICC: 6,
    POSH_STATE_REGISTRATION: 3,
    POSH_ANNUAL_REPORT: 5,
    POSH_POLICY: 6,
    POSH_TRAINING: 5,
    POSH_DISPLAY: 3,
    POSH_HIGH_RISK_INDUSTRY: 8,
    POSH_NIGHT_SHIFT: 6,
    POSH_VIRTUAL_WORKPLACE: 4,
    POSH_COMPLAINT_HANDLING: 5,
  };
  
  applicableCodes.forEach((code) => {
    count += questionCounts[code] || 0;
  });
  
  return Math.min(count, 55); // Cap at 55 questions max
}

// ============================================================================
// EXPORT HELPERS FOR MAIN ASSESSMENT
// ============================================================================

export function getFilteredPOSHQuestions(
  results: ApplicabilityResult[],
  allQuestions: Array<{ id: string; category: string; applicabilityCode?: string }>
): Array<{ id: string; category: string; applicabilityCode?: string }> {
  const applicableCodes = results.filter((r) => r.applies).map((r) => r.code);
  
  // Map applicability codes to question categories
  const codeToCategory: Record<string, string[]> = {
    POSH_ICC_CONSTITUTION: ['icc_constitution', 'icc_composition', 'presiding_officer', 'external_member'],
    POSH_MULTI_LOCATION_ICC: ['multi_location', 'location_icc'],
    POSH_STATE_REGISTRATION: ['state_registration', 'registration'],
    POSH_ANNUAL_REPORT: ['annual_report', 'reporting', 'directors_report'],
    POSH_POLICY: ['policy', 'posh_policy', 'documentation'],
    POSH_TRAINING: ['training', 'awareness', 'orientation'],
    POSH_DISPLAY: ['display', 'communication'],
    POSH_HIGH_RISK_INDUSTRY: ['industry_specific', 'high_risk'],
    POSH_NIGHT_SHIFT: ['night_shift', 'transport', 'safety'],
    POSH_VIRTUAL_WORKPLACE: ['virtual', 'remote', 'wfh'],
    POSH_COMPLAINT_HANDLING: ['complaint', 'inquiry', 'timeline'],
  };
  
  const applicableCategories = applicableCodes.flatMap((code) => codeToCategory[code] || []);
  
  return allQuestions.filter(
    (q) =>
      applicableCategories.includes(q.category?.toLowerCase()) ||
      applicableCategories.some((cat) => q.id?.toLowerCase().includes(cat))
  );
}
