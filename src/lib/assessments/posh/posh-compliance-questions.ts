/**
 * ComplianceCheck - POSH Act 2013 Compliance Assessment Questions
 * 
 * Complete question set for POSH Compliance Audit Assessment
 * Questions are dynamically filtered based on applicability results
 * 
 * Scoring Framework: 100 points total
 * - Section A: ICC Constitution (25 points)
 * - Section B: Policy & Documentation (20 points)
 * - Section C: Training & Awareness (20 points)
 * - Section D: Display & Communication (10 points)
 * - Section E: Reporting & Monitoring (15 points)
 * - Section F: Complaint Handling Readiness (10 points)
 * 
 * Total: 45 questions across 6 compliance areas
 * Typical user sees: 25-45 questions based on their profile
 */

// ============================================================================
// TYPES
// ============================================================================

export type QuestionType = 'yes_no' | 'single_choice' | 'multiple_choice';

export interface POSHQuestion {
  id: string;
  text: string;
  type: QuestionType;
  category: POSHCategory;
  weight: number;
  options?: { value: string; label: string }[];
  compliantAnswers: string[];
  partiallyCompliantAnswers?: string[];
  helpText: string;
  governmentRef: string;
  applicabilityCode?: string;
  conditionalOn?: {
    questionId: string;
    values: string[];
  };
}

export type POSHCategory = 
  | 'icc_constitution'
  | 'policy_documentation'
  | 'training_awareness'
  | 'display_communication'
  | 'reporting_monitoring'
  | 'complaint_handling';

export interface POSHCategoryInfo {
  code: POSHCategory;
  name: string;
  description: string;
  maxPoints: number;
  questionCount: number;
}

export interface POSHCompanyDetails {
  companyName: string;
  email: string;
  phone?: string;
  fullName: string;
  employeeCount: string;
  primaryState: string;
  industry: string;
  locationCount: string;
  locationsWithTenPlus: string;
  hasRemoteWorkers: string;
  hasNightShifts: string;
  isHighRiskIndustry: boolean;
  stateRegistrationRequired: boolean;
}

// ============================================================================
// CATEGORY DEFINITIONS
// ============================================================================

export const POSH_CATEGORIES: Record<POSHCategory, POSHCategoryInfo> = {
  icc_constitution: {
    code: 'icc_constitution',
    name: 'ICC Constitution',
    description: 'Internal Complaints Committee composition, appointments, tenure, and multi-location compliance',
    maxPoints: 25,
    questionCount: 10,
  },
  policy_documentation: {
    code: 'policy_documentation',
    name: 'Policy & Documentation',
    description: 'Written POSH policy, communication, accessibility, and service rules integration',
    maxPoints: 20,
    questionCount: 8,
  },
  training_awareness: {
    code: 'training_awareness',
    name: 'Training & Awareness',
    description: 'Employee training, ICC orientation, induction programs, and training records',
    maxPoints: 20,
    questionCount: 8,
  },
  display_communication: {
    code: 'display_communication',
    name: 'Display & Communication',
    description: 'Display of penal consequences, ICC details, and complaint mechanism accessibility',
    maxPoints: 10,
    questionCount: 5,
  },
  reporting_monitoring: {
    code: 'reporting_monitoring',
    name: 'Reporting & Monitoring',
    description: 'Annual report filing, Directors\' Report disclosure, and Board-level monitoring',
    maxPoints: 15,
    questionCount: 7,
  },
  complaint_handling: {
    code: 'complaint_handling',
    name: 'Complaint Handling Readiness',
    description: 'Filing mechanisms, confidentiality protocols, timeline tracking, and appeal process',
    maxPoints: 10,
    questionCount: 7,
  },
};

// ============================================================================
// SECTION A: ICC CONSTITUTION QUESTIONS (25 points, 10 questions)
// ============================================================================

const ICC_CONSTITUTION_QUESTIONS: POSHQuestion[] = [
  {
    id: 'POSH_ICC_001',
    text: 'Is your Internal Complaints Committee (ICC) currently constituted with all required members?',
    type: 'single_choice',
    category: 'icc_constitution',
    weight: 5,
    options: [
      { value: 'yes_complete', label: 'Yes - all positions filled with valid nomination orders' },
      { value: 'yes_partial', label: 'Yes - but some positions are vacant or nominations expired' },
      { value: 'no', label: 'No - ICC not currently constituted' },
    ],
    compliantAnswers: ['yes_complete'],
    partiallyCompliantAnswers: ['yes_partial'],
    helpText: 'ICC must have: 1 Presiding Officer (senior woman), minimum 2 employee members, and 1 external member. All positions must be filled with written nomination orders.',
    governmentRef: 'POSH Act 2013, Section 4(2)',
    applicabilityCode: 'POSH_ICC_CONSTITUTION',
  },
  {
    id: 'POSH_ICC_002',
    text: 'Is your Presiding Officer a senior-level woman employee?',
    type: 'single_choice',
    category: 'icc_constitution',
    weight: 4,
    options: [
      { value: 'yes', label: 'Yes - senior woman employee from this workplace' },
      { value: 'yes_other_office', label: 'Yes - nominated from another office of the same employer (no senior woman available here)' },
      { value: 'no', label: 'No - Presiding Officer position vacant or not a senior woman' },
    ],
    compliantAnswers: ['yes', 'yes_other_office'],
    helpText: 'Presiding Officer must be a woman employed at a senior level. If no senior woman is available, one can be nominated from another office of the same employer.',
    governmentRef: 'POSH Act 2013, Section 4(2)(a)',
    applicabilityCode: 'POSH_ICC_CONSTITUTION',
  },
  {
    id: 'POSH_ICC_003',
    text: 'Does your ICC have the mandatory external member?',
    type: 'single_choice',
    category: 'icc_constitution',
    weight: 5,
    options: [
      { value: 'yes_ngo', label: 'Yes - from NGO/organization committed to women\'s cause' },
      { value: 'yes_experience', label: 'Yes - person with 5+ years experience in women\'s empowerment' },
      { value: 'yes_legal', label: 'Yes - person familiar with labor/civil/criminal law AND women\'s issues' },
      { value: 'no_external', label: 'No external member currently' },
      { value: 'unclear_qualification', label: 'External member exists but qualification unclear' },
    ],
    compliantAnswers: ['yes_ngo', 'yes_experience', 'yes_legal'],
    partiallyCompliantAnswers: ['unclear_qualification'],
    helpText: 'External member is MANDATORY and must be from NGO/women\'s organization OR have 5+ years experience in women\'s empowerment OR familiarity with relevant law AND connection to women\'s causes. Delhi HC invalidated ICC in Ruchika Singh case for unqualified external member.',
    governmentRef: 'POSH Act 2013, Section 4(2)(c); Rule 4',
    applicabilityCode: 'POSH_ICC_CONSTITUTION',
  },
  {
    id: 'POSH_ICC_004',
    text: 'Are at least 50% of your ICC members women?',
    type: 'yes_no',
    category: 'icc_constitution',
    weight: 3,
    compliantAnswers: ['yes'],
    helpText: 'The proviso to Section 4(2) mandates that at least half of ICC members shall be women. This is a strict statutory requirement.',
    governmentRef: 'POSH Act 2013, Section 4(2) Proviso',
    applicabilityCode: 'POSH_ICC_CONSTITUTION',
  },
  {
    id: 'POSH_ICC_005',
    text: 'When was your current ICC constituted or last reconstituted?',
    type: 'single_choice',
    category: 'icc_constitution',
    weight: 3,
    options: [
      { value: 'within_1_year', label: 'Within the last 1 year' },
      { value: '1_to_2_years', label: '1-2 years ago' },
      { value: '2_to_3_years', label: '2-3 years ago' },
      { value: 'over_3_years', label: 'More than 3 years ago' },
      { value: 'no_records', label: 'Records not available / Don\'t know' },
    ],
    compliantAnswers: ['within_1_year', '1_to_2_years', '2_to_3_years'],
    helpText: 'ICC members have a maximum tenure of 3 years. After 3 years, the ICC MUST be reconstituted with fresh nomination orders. Expired ICC = No valid ICC.',
    governmentRef: 'POSH Act 2013, Section 4(3)',
    applicabilityCode: 'POSH_ICC_CONSTITUTION',
  },
  {
    id: 'POSH_ICC_006',
    text: 'Do you have written nomination orders for all ICC members?',
    type: 'single_choice',
    category: 'icc_constitution',
    weight: 2,
    options: [
      { value: 'yes_all', label: 'Yes - formal nomination orders for all members with dates' },
      { value: 'yes_some', label: 'Yes - but only for some members' },
      { value: 'informal', label: 'No - appointments were informal/verbal' },
      { value: 'no', label: 'No nomination orders exist' },
    ],
    compliantAnswers: ['yes_all'],
    partiallyCompliantAnswers: ['yes_some'],
    helpText: 'Written nomination orders serve as evidence of proper ICC constitution and help track tenure. They should include member name, designation, role in ICC, and effective date.',
    governmentRef: 'POSH Act 2013, Section 4; Rule 4',
    applicabilityCode: 'POSH_ICC_CONSTITUTION',
  },
  {
    id: 'POSH_ICC_007',
    text: 'Do you pay the external member fees and travel reimbursement as required?',
    type: 'single_choice',
    category: 'icc_constitution',
    weight: 1,
    options: [
      { value: 'yes', label: 'Yes - fees (Rs.200/day) and travel (3-tier AC or equivalent) paid' },
      { value: 'partial', label: 'Partial payment arrangement exists' },
      { value: 'pro_bono', label: 'External member works pro bono by choice' },
      { value: 'no', label: 'No payment arrangement' },
    ],
    compliantAnswers: ['yes', 'pro_bono'],
    partiallyCompliantAnswers: ['partial'],
    helpText: 'External member is entitled to Rs.200/day fee and travel reimbursement (3-tier AC train or equivalent) per Rule 6, to be paid by the employer.',
    governmentRef: 'POSH Rules 2013, Rule 6',
    applicabilityCode: 'POSH_ICC_CONSTITUTION',
  },
  {
    id: 'POSH_ICC_008',
    text: 'Does your organization have separate ICCs at each location with 10+ employees?',
    type: 'single_choice',
    category: 'icc_constitution',
    weight: 4,
    options: [
      { value: 'yes_all', label: 'Yes - separate ICC at each qualifying location' },
      { value: 'yes_partial', label: 'Some locations have ICC, others don\'t' },
      { value: 'centralized', label: 'No - we have one centralized ICC for all locations' },
      { value: 'single_location', label: 'Not applicable - single location only' },
    ],
    compliantAnswers: ['yes_all', 'single_location'],
    partiallyCompliantAnswers: ['yes_partial'],
    helpText: 'Section 4(1) proviso MANDATES separate ICCs at each office/administrative unit with 10+ employees. A centralized single-ICC model is explicitly non-compliant.',
    governmentRef: 'POSH Act 2013, Section 4(1) Proviso',
    applicabilityCode: 'POSH_MULTI_LOCATION_ICC',
  },
  {
    id: 'POSH_ICC_009',
    text: 'Have you documented ICC member qualifications and selection criteria?',
    type: 'yes_no',
    category: 'icc_constitution',
    weight: 1,
    compliantAnswers: ['yes'],
    helpText: 'Documenting member qualifications (especially external member\'s NGO connection or women\'s empowerment experience) provides evidence of proper constitution if challenged.',
    governmentRef: 'POSH Act 2013, Section 4(2); Rule 4',
    applicabilityCode: 'POSH_ICC_CONSTITUTION',
  },
  {
    id: 'POSH_ICC_010',
    text: 'Is there a process for replacing ICC members who resign, retire, or complete their tenure?',
    type: 'single_choice',
    category: 'icc_constitution',
    weight: 2,
    options: [
      { value: 'yes_documented', label: 'Yes - documented succession/replacement process exists' },
      { value: 'yes_informal', label: 'Yes - informal process but not documented' },
      { value: 'no', label: 'No replacement process defined' },
    ],
    compliantAnswers: ['yes_documented'],
    partiallyCompliantAnswers: ['yes_informal'],
    helpText: 'A documented replacement process ensures ICC continuity. Any vacancy should be filled within a reasonable time to maintain ICC functionality.',
    governmentRef: 'POSH Act 2013, Section 4',
    applicabilityCode: 'POSH_ICC_CONSTITUTION',
  },
];

// ============================================================================
// SECTION B: POLICY & DOCUMENTATION QUESTIONS (20 points, 8 questions)
// ============================================================================

const POLICY_DOCUMENTATION_QUESTIONS: POSHQuestion[] = [
  {
    id: 'POSH_POL_001',
    text: 'Does your organization have a comprehensive written POSH policy?',
    type: 'single_choice',
    category: 'policy_documentation',
    weight: 5,
    options: [
      { value: 'yes_comprehensive', label: 'Yes - comprehensive policy covering all requirements' },
      { value: 'yes_basic', label: 'Yes - basic policy exists but may be incomplete' },
      { value: 'in_progress', label: 'Policy is being drafted' },
      { value: 'no', label: 'No written POSH policy' },
    ],
    compliantAnswers: ['yes_comprehensive'],
    partiallyCompliantAnswers: ['yes_basic'],
    helpText: 'A comprehensive POSH policy must cover: definition of sexual harassment (all 5 types under Section 3), ICC composition, complaint procedure, inquiry process, timelines, interim relief, confidentiality, and protection against retaliation.',
    governmentRef: 'POSH Act 2013, Section 19(a)',
    applicabilityCode: 'POSH_POLICY',
  },
  {
    id: 'POSH_POL_002',
    text: 'Does your POSH policy define all types of sexual harassment as per Section 3?',
    type: 'single_choice',
    category: 'policy_documentation',
    weight: 3,
    options: [
      { value: 'yes_all_five', label: 'Yes - covers all 5 types: physical contact, sexual favors demand, sexually colored remarks, showing pornography, other unwelcome conduct' },
      { value: 'yes_some', label: 'Partially - covers some but not all types' },
      { value: 'generic', label: 'Generic definition without specific types' },
      { value: 'no', label: 'No definition in policy / No policy' },
    ],
    compliantAnswers: ['yes_all_five'],
    partiallyCompliantAnswers: ['yes_some'],
    helpText: 'Section 3 defines sexual harassment to include: (i) physical contact, (ii) demand for sexual favors, (iii) sexually colored remarks, (iv) showing pornography, (v) any other unwelcome physical, verbal, or non-verbal conduct of sexual nature.',
    governmentRef: 'POSH Act 2013, Section 3(2)',
    applicabilityCode: 'POSH_POLICY',
  },
  {
    id: 'POSH_POL_003',
    text: 'Has the POSH policy been communicated to all employees?',
    type: 'single_choice',
    category: 'policy_documentation',
    weight: 4,
    options: [
      { value: 'yes_acknowledged', label: 'Yes - communicated and acknowledgment obtained from all employees' },
      { value: 'yes_circulated', label: 'Yes - circulated via email/notice but no formal acknowledgment' },
      { value: 'partial', label: 'Communicated to some employees only' },
      { value: 'no', label: 'Not communicated' },
    ],
    compliantAnswers: ['yes_acknowledged'],
    partiallyCompliantAnswers: ['yes_circulated'],
    helpText: 'Policy should be communicated during onboarding (with acknowledgment) and circulated annually to all employees. Acknowledgment records serve as evidence of communication.',
    governmentRef: 'POSH Act 2013, Section 19(c)',
    applicabilityCode: 'POSH_POLICY',
  },
  {
    id: 'POSH_POL_004',
    text: 'Is your POSH policy easily accessible to all employees?',
    type: 'single_choice',
    category: 'policy_documentation',
    weight: 3,
    options: [
      { value: 'yes_multiple', label: 'Yes - available at multiple access points (intranet, physical copies, HR)' },
      { value: 'yes_single', label: 'Yes - available at one location only' },
      { value: 'on_request', label: 'Available only on specific request to HR' },
      { value: 'no', label: 'Not easily accessible' },
    ],
    compliantAnswers: ['yes_multiple'],
    partiallyCompliantAnswers: ['yes_single'],
    helpText: 'Policy should be accessible through multiple channels: company intranet/website, physical copies at HR, employee handbook. Employees should not have to request it.',
    governmentRef: 'POSH Act 2013, Section 19',
    applicabilityCode: 'POSH_POLICY',
  },
  {
    id: 'POSH_POL_005',
    text: 'When was your POSH policy last reviewed and updated?',
    type: 'single_choice',
    category: 'policy_documentation',
    weight: 2,
    options: [
      { value: 'within_1_year', label: 'Within the last 1 year' },
      { value: '1_to_2_years', label: '1-2 years ago' },
      { value: 'over_2_years', label: 'More than 2 years ago' },
      { value: 'never', label: 'Never reviewed since creation' },
      { value: 'no_policy', label: 'No policy exists' },
    ],
    compliantAnswers: ['within_1_year', '1_to_2_years'],
    partiallyCompliantAnswers: ['over_2_years'],
    helpText: 'Policy should be reviewed at least every 2 years to incorporate judicial developments, amendments, and modern workplace scenarios like virtual harassment.',
    governmentRef: 'Best Practice',
    applicabilityCode: 'POSH_POLICY',
  },
  {
    id: 'POSH_POL_006',
    text: 'Is sexual harassment defined as misconduct in your service rules/employment contracts?',
    type: 'single_choice',
    category: 'policy_documentation',
    weight: 5,
    options: [
      { value: 'yes', label: 'Yes - explicitly stated as misconduct with disciplinary consequences' },
      { value: 'implied', label: 'Implied under general misconduct but not explicitly stated' },
      { value: 'no', label: 'No - not addressed in service rules' },
    ],
    compliantAnswers: ['yes'],
    partiallyCompliantAnswers: ['implied'],
    helpText: 'Section 19(j) MANDATES that sexual harassment be treated as misconduct under service rules/standing orders. This enables disciplinary action based on ICC recommendations.',
    governmentRef: 'POSH Act 2013, Section 19(j)',
    applicabilityCode: 'POSH_POLICY',
  },
  {
    id: 'POSH_POL_007',
    text: 'Does your policy cover harassment by third parties (customers, vendors, visitors)?',
    type: 'yes_no',
    category: 'policy_documentation',
    weight: 2,
    compliantAnswers: ['yes'],
    helpText: 'Section 19(a) requires employers to provide a safe working environment from third parties. Policy should address how complaints against non-employees are handled.',
    governmentRef: 'POSH Act 2013, Section 19(a)',
    applicabilityCode: 'POSH_POLICY',
  },
  {
    id: 'POSH_POL_008',
    text: 'Does your policy explicitly cover virtual/remote workplace harassment?',
    type: 'single_choice',
    category: 'policy_documentation',
    weight: 2,
    options: [
      { value: 'yes', label: 'Yes - explicitly covers harassment via email, chat, video calls, social media' },
      { value: 'implied', label: 'Not explicitly stated but could be interpreted to cover it' },
      { value: 'no', label: 'No - policy does not address virtual harassment' },
    ],
    compliantAnswers: ['yes'],
    partiallyCompliantAnswers: ['implied'],
    helpText: 'Courts have held virtual/digital platforms constitute workplace. Policy should explicitly cover harassment through emails, chats, video calls, social media, and screen-sharing.',
    governmentRef: 'Sanjeev Mishra v. Bank of Baroda (Rajasthan HC, 2021)',
    applicabilityCode: 'POSH_VIRTUAL_WORKPLACE',
  },
];

// ============================================================================
// SECTION C: TRAINING & AWARENESS QUESTIONS (20 points, 8 questions)
// ============================================================================

const TRAINING_AWARENESS_QUESTIONS: POSHQuestion[] = [
  {
    id: 'POSH_TRN_001',
    text: 'Does your organization conduct annual POSH awareness training for all employees?',
    type: 'single_choice',
    category: 'training_awareness',
    weight: 6,
    options: [
      { value: 'yes_annual', label: 'Yes - conducted annually for all employees' },
      { value: 'yes_occasional', label: 'Yes - but not annual (once in 2+ years)' },
      { value: 'only_some', label: 'Only for some employees (e.g., managers only)' },
      { value: 'no', label: 'No POSH training conducted' },
    ],
    compliantAnswers: ['yes_annual'],
    partiallyCompliantAnswers: ['yes_occasional'],
    helpText: 'Section 19(c) mandates organizing workshops and awareness programs for sensitizing employees. Annual training is the recommended frequency.',
    governmentRef: 'POSH Act 2013, Section 19(c)',
    applicabilityCode: 'POSH_TRAINING',
  },
  {
    id: 'POSH_TRN_002',
    text: 'Have ICC members received specialized training on inquiry procedures and legal responsibilities?',
    type: 'single_choice',
    category: 'training_awareness',
    weight: 5,
    options: [
      { value: 'yes_all', label: 'Yes - all ICC members have received specialized orientation' },
      { value: 'yes_some', label: 'Some ICC members have been trained' },
      { value: 'general_only', label: 'ICC members attended general POSH training only (not specialized)' },
      { value: 'no', label: 'No specialized ICC training conducted' },
    ],
    compliantAnswers: ['yes_all'],
    partiallyCompliantAnswers: ['yes_some'],
    helpText: 'Section 19(c) requires organizing orientation programs for ICC members covering inquiry procedures, timelines, evidence handling, report writing, and legal aspects.',
    governmentRef: 'POSH Act 2013, Section 19(c)',
    applicabilityCode: 'POSH_TRAINING',
  },
  {
    id: 'POSH_TRN_003',
    text: 'Is POSH awareness included in your new joiner induction/onboarding program?',
    type: 'single_choice',
    category: 'training_awareness',
    weight: 4,
    options: [
      { value: 'yes_mandatory', label: 'Yes - mandatory part of onboarding with acknowledgment' },
      { value: 'yes_optional', label: 'Yes - covered but not mandatory' },
      { value: 'planned', label: 'Planned but not yet implemented' },
      { value: 'no', label: 'Not included in onboarding' },
    ],
    compliantAnswers: ['yes_mandatory'],
    partiallyCompliantAnswers: ['yes_optional'],
    helpText: 'New employees should be informed about POSH policy, ICC details, and complaint mechanism during induction, with acknowledgment documented.',
    governmentRef: 'POSH Act 2013, Section 19(c)',
    applicabilityCode: 'POSH_TRAINING',
  },
  {
    id: 'POSH_TRN_004',
    text: 'Do you maintain attendance records for POSH training sessions?',
    type: 'single_choice',
    category: 'training_awareness',
    weight: 3,
    options: [
      { value: 'yes_complete', label: 'Yes - complete attendance records with dates and content covered' },
      { value: 'yes_partial', label: 'Partial records maintained' },
      { value: 'no', label: 'No training records maintained' },
    ],
    compliantAnswers: ['yes_complete'],
    partiallyCompliantAnswers: ['yes_partial'],
    helpText: 'Training without records = no compliance evidence. Maintain: date, attendee list, content covered, trainer details, and employee acknowledgments.',
    governmentRef: 'Best Practice; Section 19(c) compliance evidence',
    applicabilityCode: 'POSH_TRAINING',
  },
  {
    id: 'POSH_TRN_005',
    text: 'Does your training content cover virtual/remote workplace harassment scenarios?',
    type: 'single_choice',
    category: 'training_awareness',
    weight: 2,
    options: [
      { value: 'yes', label: 'Yes - includes harassment via email, chat, video calls, etc.' },
      { value: 'no', label: 'No - training focuses only on physical workplace' },
      { value: 'no_remote', label: 'Not applicable - no remote workers' },
    ],
    compliantAnswers: ['yes', 'no_remote'],
    helpText: 'Training content should be updated to cover modern workplace scenarios including harassment through digital communications, inappropriate behavior during video calls, etc.',
    governmentRef: 'Sanjeev Mishra v. Bank of Baroda (Rajasthan HC, 2021)',
    applicabilityCode: 'POSH_VIRTUAL_WORKPLACE',
  },
  {
    id: 'POSH_TRN_006',
    text: 'Have contract workers, interns, and trainees been included in POSH awareness programs?',
    type: 'single_choice',
    category: 'training_awareness',
    weight: 3,
    options: [
      { value: 'yes', label: 'Yes - all categories of workers included' },
      { value: 'partial', label: 'Some categories included, others excluded' },
      { value: 'no', label: 'Only regular employees included' },
      { value: 'na', label: 'Not applicable - no contract workers/interns' },
    ],
    compliantAnswers: ['yes', 'na'],
    partiallyCompliantAnswers: ['partial'],
    helpText: 'Section 2(f) includes contract workers, interns, trainees, and apprentices in the definition of "employee". They must receive POSH awareness.',
    governmentRef: 'POSH Act 2013, Section 2(f)',
    applicabilityCode: 'POSH_TRAINING',
  },
  {
    id: 'POSH_TRN_007',
    text: 'Does your training cover the complaint process and timelines that employees can expect?',
    type: 'yes_no',
    category: 'training_awareness',
    weight: 2,
    compliantAnswers: ['yes'],
    helpText: 'Employees should understand: how to file a complaint, 3-month filing deadline, 90-day inquiry completion, interim relief options, and appeal rights.',
    governmentRef: 'POSH Act 2013, Sections 9-18',
    applicabilityCode: 'POSH_TRAINING',
  },
  {
    id: 'POSH_TRN_008',
    text: 'Do you conduct industry-specific training addressing customer/client/patient harassment scenarios?',
    type: 'single_choice',
    category: 'training_awareness',
    weight: 2,
    options: [
      { value: 'yes', label: 'Yes - training includes third-party harassment scenarios relevant to our industry' },
      { value: 'general_only', label: 'General training only - no industry-specific content' },
      { value: 'na', label: 'Not applicable - minimal external interactions' },
    ],
    compliantAnswers: ['yes', 'na'],
    partiallyCompliantAnswers: ['general_only'],
    helpText: 'High-risk industries (hospitality, healthcare, retail, BPO) should include scenarios involving customer/client/patient harassment in their training.',
    governmentRef: 'POSH Act 2013, Section 19(a)',
    applicabilityCode: 'POSH_HIGH_RISK_INDUSTRY',
  },
];

// ============================================================================
// SECTION D: DISPLAY & COMMUNICATION QUESTIONS (10 points, 5 questions)
// ============================================================================

const DISPLAY_COMMUNICATION_QUESTIONS: POSHQuestion[] = [
  {
    id: 'POSH_DSP_001',
    text: 'Are the penal consequences of sexual harassment displayed conspicuously at your workplace?',
    type: 'single_choice',
    category: 'display_communication',
    weight: 3,
    options: [
      { value: 'yes_prominent', label: 'Yes - displayed prominently at all locations' },
      { value: 'yes_some', label: 'Yes - but only at some locations' },
      { value: 'on_intranet', label: 'Only on intranet/website, not physical display' },
      { value: 'no', label: 'Not displayed' },
    ],
    compliantAnswers: ['yes_prominent'],
    partiallyCompliantAnswers: ['yes_some', 'on_intranet'],
    helpText: 'Section 19(b) mandates displaying penal consequences at "conspicuous place" in the workplace. This typically means notice boards, common areas, reception.',
    governmentRef: 'POSH Act 2013, Section 19(b)',
    applicabilityCode: 'POSH_DISPLAY',
  },
  {
    id: 'POSH_DSP_002',
    text: 'Is the ICC constitution order (with member names and contact details) displayed?',
    type: 'single_choice',
    category: 'display_communication',
    weight: 3,
    options: [
      { value: 'yes_complete', label: 'Yes - ICC order with all member names and contact details displayed' },
      { value: 'yes_partial', label: 'Yes - ICC information displayed but incomplete' },
      { value: 'no', label: 'Not displayed' },
    ],
    compliantAnswers: ['yes_complete'],
    partiallyCompliantAnswers: ['yes_partial'],
    helpText: 'Employees must know who the ICC members are and how to reach them. Display should include: member names, roles, and contact information.',
    governmentRef: 'POSH Act 2013, Section 19(b)',
    applicabilityCode: 'POSH_DISPLAY',
  },
  {
    id: 'POSH_DSP_003',
    text: 'Are displays in languages understood by the majority of employees?',
    type: 'single_choice',
    category: 'display_communication',
    weight: 2,
    options: [
      { value: 'yes_multiple', label: 'Yes - in English and local language(s)' },
      { value: 'english_only', label: 'English only' },
      { value: 'local_only', label: 'Local language only' },
      { value: 'no_display', label: 'No display exists' },
    ],
    compliantAnswers: ['yes_multiple'],
    partiallyCompliantAnswers: ['english_only', 'local_only'],
    helpText: 'Displays should be in language(s) understood by majority of workforce. For multi-lingual workplaces, consider English + Hindi + local language.',
    governmentRef: 'POSH Act 2013, Section 19(b)',
    applicabilityCode: 'POSH_DISPLAY',
  },
  {
    id: 'POSH_DSP_004',
    text: 'Are ICC contact details and complaint mechanism available on company intranet/website?',
    type: 'yes_no',
    category: 'display_communication',
    weight: 2,
    compliantAnswers: ['yes'],
    helpText: 'Digital accessibility ensures remote workers and employees at all locations can access ICC information and understand the complaint process.',
    governmentRef: 'POSH Act 2013, Section 19',
    applicabilityCode: 'POSH_DISPLAY',
  },
  {
    id: 'POSH_DSP_005',
    text: 'Do employees have multiple channels to file complaints (written, email, in-person)?',
    type: 'single_choice',
    category: 'display_communication',
    weight: 2,
    options: [
      { value: 'yes_multiple', label: 'Yes - written, email, online form, and in-person options available' },
      { value: 'yes_two', label: 'Yes - at least two channels available' },
      { value: 'single', label: 'Only one channel (e.g., written only)' },
      { value: 'unclear', label: 'Complaint mechanism not clearly communicated' },
    ],
    compliantAnswers: ['yes_multiple', 'yes_two'],
    partiallyCompliantAnswers: ['single'],
    helpText: 'Multiple complaint channels ensure accessibility. Consider: designated email, online portal, written submission to ICC/HR, direct approach to Presiding Officer.',
    governmentRef: 'POSH Act 2013, Section 9',
    applicabilityCode: 'POSH_DISPLAY',
  },
];

// ============================================================================
// SECTION E: REPORTING & MONITORING QUESTIONS (15 points, 7 questions)
// ============================================================================

const REPORTING_MONITORING_QUESTIONS: POSHQuestion[] = [
  {
    id: 'POSH_RPT_001',
    text: 'Did your ICC submit the annual report to the District Officer for the previous calendar year?',
    type: 'single_choice',
    category: 'reporting_monitoring',
    weight: 5,
    options: [
      { value: 'yes_timely', label: 'Yes - submitted by January 31 with acknowledgment' },
      { value: 'yes_late', label: 'Yes - but submitted after deadline' },
      { value: 'not_submitted', label: 'No - annual report not submitted' },
      { value: 'not_aware', label: 'Not aware of this requirement' },
    ],
    compliantAnswers: ['yes_timely'],
    partiallyCompliantAnswers: ['yes_late'],
    helpText: 'Section 21 MANDATES annual report to District Officer containing: complaints received, disposed, pending, and programs conducted. Deadline is typically January 31. NIL reports are also mandatory.',
    governmentRef: 'POSH Act 2013, Section 21',
    applicabilityCode: 'POSH_ANNUAL_REPORT',
  },
  {
    id: 'POSH_RPT_002',
    text: 'Does your annual report include all required information?',
    type: 'single_choice',
    category: 'reporting_monitoring',
    weight: 3,
    options: [
      { value: 'yes_complete', label: 'Yes - complaints received, disposed, pending >90 days, and awareness programs' },
      { value: 'yes_partial', label: 'Partial information included' },
      { value: 'no_report', label: 'No annual report filed' },
    ],
    compliantAnswers: ['yes_complete'],
    partiallyCompliantAnswers: ['yes_partial'],
    helpText: 'Annual report must include: (a) number of complaints received, (b) number disposed, (c) number pending beyond 90 days, (d) workshops/awareness programs conducted, (e) nature of action taken.',
    governmentRef: 'POSH Act 2013, Section 21',
    applicabilityCode: 'POSH_ANNUAL_REPORT',
  },
  {
    id: 'POSH_RPT_003',
    text: 'Is POSH compliance disclosed in your company\'s Board of Directors\' Report? (For companies only)',
    type: 'single_choice',
    category: 'reporting_monitoring',
    weight: 3,
    options: [
      { value: 'yes', label: 'Yes - POSH compliance status disclosed in Directors\' Report' },
      { value: 'no', label: 'No - not included in Directors\' Report' },
      { value: 'na', label: 'Not applicable - not a company (LLP/proprietorship/etc.)' },
    ],
    compliantAnswers: ['yes', 'na'],
    helpText: 'Companies (Accounts) Rules 2014 require companies to include a statement on POSH compliance in the Board\'s Directors\' Report, including cases pending beyond 90 days.',
    governmentRef: 'Companies (Accounts) Rules 2014; POSH Act Section 22',
    applicabilityCode: 'POSH_ANNUAL_REPORT',
  },
  {
    id: 'POSH_RPT_004',
    text: 'Does the ICC submit periodic reports to management/employer?',
    type: 'single_choice',
    category: 'reporting_monitoring',
    weight: 3,
    options: [
      { value: 'yes_quarterly', label: 'Yes - quarterly or more frequent reports' },
      { value: 'yes_annual', label: 'Yes - annual report to management' },
      { value: 'adhoc', label: 'Only when cases arise' },
      { value: 'no', label: 'No reports to management' },
    ],
    compliantAnswers: ['yes_quarterly', 'yes_annual'],
    partiallyCompliantAnswers: ['adhoc'],
    helpText: 'Regular reporting to management ensures oversight and enables proactive compliance monitoring. Consider quarterly ICC updates to senior leadership.',
    governmentRef: 'POSH Act 2013, Section 21; Best Practice',
    applicabilityCode: 'POSH_ANNUAL_REPORT',
  },
  {
    id: 'POSH_RPT_005',
    text: 'Is there Board-level or senior management monitoring of POSH compliance?',
    type: 'single_choice',
    category: 'reporting_monitoring',
    weight: 4,
    options: [
      { value: 'yes_board', label: 'Yes - ICC reports to Board/Audit Committee' },
      { value: 'yes_management', label: 'Yes - reports to senior management (not Board)' },
      { value: 'hr_only', label: 'HR department handles independently' },
      { value: 'no', label: 'No senior-level monitoring' },
    ],
    compliantAnswers: ['yes_board', 'yes_management'],
    partiallyCompliantAnswers: ['hr_only'],
    helpText: 'Supreme Court in Aureliano Fernandes (2023) emphasized organizational accountability. Board/senior management oversight demonstrates commitment and ensures timely action.',
    governmentRef: 'Aureliano Fernandes v. State of Goa (SC, 2023)',
    applicabilityCode: 'POSH_ANNUAL_REPORT',
  },
  {
    id: 'POSH_RPT_006',
    text: 'Have you registered your ICC with the state portal (if applicable)?',
    type: 'single_choice',
    category: 'reporting_monitoring',
    weight: 3,
    options: [
      { value: 'yes', label: 'Yes - ICC registered on state portal with updated details' },
      { value: 'in_progress', label: 'Registration in progress' },
      { value: 'no', label: 'No - not registered' },
      { value: 'na', label: 'Not applicable - state does not require registration' },
    ],
    compliantAnswers: ['yes', 'na'],
    partiallyCompliantAnswers: ['in_progress'],
    helpText: 'States like Maharashtra, Telangana (T-She Box), Haryana, and Delhi require mandatory ICC registration beyond central Act requirements.',
    governmentRef: 'State-specific mandates (Maharashtra 2017, Telangana 2019, Delhi 2025)',
    applicabilityCode: 'POSH_STATE_REGISTRATION',
  },
  {
    id: 'POSH_RPT_007',
    text: 'Do you retain ICC records and inquiry documents as required?',
    type: 'single_choice',
    category: 'reporting_monitoring',
    weight: 2,
    options: [
      { value: 'yes_7_years', label: 'Yes - records maintained for 7+ years' },
      { value: 'yes_shorter', label: 'Yes - but for shorter period' },
      { value: 'case_by_case', label: 'Maintained for some cases only' },
      { value: 'no', label: 'No systematic record retention' },
    ],
    compliantAnswers: ['yes_7_years'],
    partiallyCompliantAnswers: ['yes_shorter'],
    helpText: 'While POSH Act doesn\'t specify retention period, general legal practice suggests maintaining records for 7 years. Records include: complaint, evidence, inquiry proceedings, report, and action taken.',
    governmentRef: 'Best Practice; Limitation Act considerations',
    applicabilityCode: 'POSH_ANNUAL_REPORT',
  },
];

// ============================================================================
// SECTION F: COMPLAINT HANDLING READINESS QUESTIONS (10 points, 7 questions)
// ============================================================================

const COMPLAINT_HANDLING_QUESTIONS: POSHQuestion[] = [
  {
    id: 'POSH_CMP_001',
    text: 'Is there a clear complaint filing mechanism communicated to all employees?',
    type: 'single_choice',
    category: 'complaint_handling',
    weight: 3,
    options: [
      { value: 'yes_documented', label: 'Yes - documented procedure with multiple filing options' },
      { value: 'yes_basic', label: 'Yes - basic mechanism exists' },
      { value: 'informal', label: 'Informal process only' },
      { value: 'no', label: 'No clear mechanism' },
    ],
    compliantAnswers: ['yes_documented'],
    partiallyCompliantAnswers: ['yes_basic'],
    helpText: 'Complaint mechanism should specify: who to approach, how to file (written/email), what information to provide, and expected timelines.',
    governmentRef: 'POSH Act 2013, Section 9',
    applicabilityCode: 'POSH_COMPLAINT_HANDLING',
  },
  {
    id: 'POSH_CMP_002',
    text: 'Do you have confidentiality protocols to protect complaint information?',
    type: 'single_choice',
    category: 'complaint_handling',
    weight: 3,
    options: [
      { value: 'yes_comprehensive', label: 'Yes - NDAs, case codes, restricted access, and secure storage' },
      { value: 'yes_basic', label: 'Yes - basic confidentiality measures' },
      { value: 'no', label: 'No specific confidentiality protocols' },
    ],
    compliantAnswers: ['yes_comprehensive'],
    partiallyCompliantAnswers: ['yes_basic'],
    helpText: 'Section 16/Rule 12 mandates confidentiality. Breach attracts Rs.5,000 penalty. Consider: case code system, restricted file access, NDA for ICC members, secure physical/digital storage.',
    governmentRef: 'POSH Act 2013, Section 16; Rule 12',
    applicabilityCode: 'POSH_COMPLAINT_HANDLING',
  },
  {
    id: 'POSH_CMP_003',
    text: 'Is there a system to track the 90-day inquiry completion timeline?',
    type: 'single_choice',
    category: 'complaint_handling',
    weight: 2,
    options: [
      { value: 'yes', label: 'Yes - systematic tracking with alerts/reminders' },
      { value: 'manual', label: 'Manual tracking without alerts' },
      { value: 'no', label: 'No timeline tracking system' },
    ],
    compliantAnswers: ['yes'],
    partiallyCompliantAnswers: ['manual'],
    helpText: 'Section 11(4) mandates 90-day inquiry completion. Track: complaint date, interim stages, approaching deadlines. Cases pending beyond 90 days must be reported.',
    governmentRef: 'POSH Act 2013, Section 11(4)',
    applicabilityCode: 'POSH_COMPLAINT_HANDLING',
  },
  {
    id: 'POSH_CMP_004',
    text: 'Is the appeal mechanism (to appellate authority) communicated to employees?',
    type: 'single_choice',
    category: 'complaint_handling',
    weight: 2,
    options: [
      { value: 'yes', label: 'Yes - employees informed about 90-day appeal right' },
      { value: 'partial', label: 'Partially communicated' },
      { value: 'no', label: 'Not communicated' },
    ],
    compliantAnswers: ['yes'],
    partiallyCompliantAnswers: ['partial'],
    helpText: 'Section 18 provides 90-day appeal right against ICC recommendations. Both complainant and respondent should be informed of this right.',
    governmentRef: 'POSH Act 2013, Section 18',
    applicabilityCode: 'POSH_COMPLAINT_HANDLING',
  },
  {
    id: 'POSH_CMP_005',
    text: 'Are interim relief options (transfer, leave, no-contact) documented and available?',
    type: 'single_choice',
    category: 'complaint_handling',
    weight: 2,
    options: [
      { value: 'yes', label: 'Yes - interim relief options documented and ICC empowered to recommend' },
      { value: 'informal', label: 'Available informally but not documented' },
      { value: 'no', label: 'No interim relief mechanism' },
    ],
    compliantAnswers: ['yes'],
    partiallyCompliantAnswers: ['informal'],
    helpText: 'Section 12 provides interim relief: transfer, paid leave (up to 3 months), no-contact orders, work-from-home. ICC should be empowered to recommend these.',
    governmentRef: 'POSH Act 2013, Section 12',
    applicabilityCode: 'POSH_COMPLAINT_HANDLING',
  },
  {
    id: 'POSH_CMP_006',
    text: 'Is there protection against retaliation for complainants and witnesses?',
    type: 'single_choice',
    category: 'complaint_handling',
    weight: 2,
    options: [
      { value: 'yes_policy', label: 'Yes - anti-retaliation clause in policy with reporting mechanism' },
      { value: 'yes_implicit', label: 'Yes - implicit protection but not explicitly stated' },
      { value: 'no', label: 'No specific anti-retaliation provision' },
    ],
    compliantAnswers: ['yes_policy'],
    partiallyCompliantAnswers: ['yes_implicit'],
    helpText: 'Protection against victimization is essential for effective complaint mechanism. Policy should explicitly prohibit retaliation and provide reporting channel for victimization concerns.',
    governmentRef: 'POSH Act 2013, Section 19(f)',
    applicabilityCode: 'POSH_COMPLAINT_HANDLING',
  },
  {
    id: 'POSH_CMP_007',
    text: 'Does your organization assist women in filing police complaints (FIR) if requested?',
    type: 'single_choice',
    category: 'complaint_handling',
    weight: 1,
    options: [
      { value: 'yes', label: 'Yes - process and support available for filing FIR' },
      { value: 'no', label: 'No specific assistance mechanism' },
      { value: 'not_requested', label: 'Not requested so far / Don\'t know' },
    ],
    compliantAnswers: ['yes'],
    partiallyCompliantAnswers: ['not_requested'],
    helpText: 'Section 19(g) mandates employers assist aggrieved woman in filing police complaint (FIR) under IPC if she chooses criminal proceedings.',
    governmentRef: 'POSH Act 2013, Section 19(g)',
    applicabilityCode: 'POSH_COMPLAINT_HANDLING',
  },
];

// ============================================================================
// COMBINED QUESTIONS EXPORT
// ============================================================================

export const ALL_POSH_QUESTIONS: POSHQuestion[] = [
  ...ICC_CONSTITUTION_QUESTIONS,
  ...POLICY_DOCUMENTATION_QUESTIONS,
  ...TRAINING_AWARENESS_QUESTIONS,
  ...DISPLAY_COMMUNICATION_QUESTIONS,
  ...REPORTING_MONITORING_QUESTIONS,
  ...COMPLAINT_HANDLING_QUESTIONS,
];

// Export by category for filtered access
export const POSH_QUESTIONS_BY_CATEGORY: Record<POSHCategory, POSHQuestion[]> = {
  icc_constitution: ICC_CONSTITUTION_QUESTIONS,
  policy_documentation: POLICY_DOCUMENTATION_QUESTIONS,
  training_awareness: TRAINING_AWARENESS_QUESTIONS,
  display_communication: DISPLAY_COMMUNICATION_QUESTIONS,
  reporting_monitoring: REPORTING_MONITORING_QUESTIONS,
  complaint_handling: COMPLAINT_HANDLING_QUESTIONS,
};

// ============================================================================
// QUESTION FILTERING BASED ON APPLICABILITY
// ============================================================================

export function filterPOSHQuestions(
  applicabilityCodes: string[]
): POSHQuestion[] {
  return ALL_POSH_QUESTIONS.filter((q) => {
    // If question has no applicability code, it's always included
    if (!q.applicabilityCode) return true;
    
    // Check if the applicability code is in the list
    return applicabilityCodes.includes(q.applicabilityCode);
  });
}

// ============================================================================
// SCORING CALCULATION
// ============================================================================

export interface POSHScoreResult {
  overallScore: number;
  overallPercentage: number;
  categoryScores: Record<POSHCategory, {
    score: number;
    maxScore: number;
    percentage: number;
    status: 'compliant' | 'needs_attention' | 'non_compliant';
  }>;
  complianceStatus: 'compliant' | 'needs_attention' | 'non_compliant';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  actionItems: Array<{
    questionId: string;
    category: POSHCategory;
    text: string;
    priority: 'high' | 'medium' | 'low';
    governmentRef: string;
  }>;
  compliantItems: Array<{
    questionId: string;
    category: POSHCategory;
    text: string;
  }>;
}

export function calculatePOSHScore(
  questions: POSHQuestion[],
  responses: Record<string, string>
): POSHScoreResult {
  const categoryScores: POSHScoreResult['categoryScores'] = {
    icc_constitution: { score: 0, maxScore: 0, percentage: 0, status: 'non_compliant' },
    policy_documentation: { score: 0, maxScore: 0, percentage: 0, status: 'non_compliant' },
    training_awareness: { score: 0, maxScore: 0, percentage: 0, status: 'non_compliant' },
    display_communication: { score: 0, maxScore: 0, percentage: 0, status: 'non_compliant' },
    reporting_monitoring: { score: 0, maxScore: 0, percentage: 0, status: 'non_compliant' },
    complaint_handling: { score: 0, maxScore: 0, percentage: 0, status: 'non_compliant' },
  };
  
  const actionItems: POSHScoreResult['actionItems'] = [];
  const compliantItems: POSHScoreResult['compliantItems'] = [];
  
  let totalScore = 0;
  let totalMaxScore = 0;
  
  questions.forEach((q) => {
    const answer = responses[q.id];
    const category = q.category;
    
    // Add to max score
    categoryScores[category].maxScore += q.weight;
    totalMaxScore += q.weight;
    
    if (!answer) return; // Skip unanswered questions
    
    // Calculate score
    let questionScore = 0;
    let isCompliant = false;
    
    if (q.compliantAnswers.includes(answer)) {
      questionScore = q.weight;
      isCompliant = true;
    } else if (q.partiallyCompliantAnswers?.includes(answer)) {
      questionScore = Math.round(q.weight * 0.5); // 50% credit for partial compliance
    }
    
    categoryScores[category].score += questionScore;
    totalScore += questionScore;
    
    // Track compliant and non-compliant items
    if (isCompliant) {
      compliantItems.push({
        questionId: q.id,
        category: q.category,
        text: q.text,
      });
    } else {
      // Add to action items
      const priority: 'high' | 'medium' | 'low' = 
        q.weight >= 4 ? 'high' : q.weight >= 2 ? 'medium' : 'low';
      
      actionItems.push({
        questionId: q.id,
        category: q.category,
        text: q.text,
        priority,
        governmentRef: q.governmentRef,
      });
    }
  });
  
  // Calculate percentages and status for each category
  Object.keys(categoryScores).forEach((cat) => {
    const cs = categoryScores[cat as POSHCategory];
    cs.percentage = cs.maxScore > 0 ? Math.round((cs.score / cs.maxScore) * 100) : 0;
    cs.status = cs.percentage >= 90 ? 'compliant' : cs.percentage >= 70 ? 'needs_attention' : 'non_compliant';
  });

  // Calculate overall
  const overallPercentage = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

  const complianceStatus: POSHScoreResult['complianceStatus'] =
    overallPercentage >= 90 ? 'compliant' :
    overallPercentage >= 70 ? 'needs_attention' : 'non_compliant';
  
  // Determine risk level based on score and critical questions
  const criticalMissing = actionItems.filter((a) => a.priority === 'high').length;
  const riskLevel: POSHScoreResult['riskLevel'] = 
    overallPercentage < 45 || criticalMissing >= 5 ? 'critical' :
    overallPercentage < 60 || criticalMissing >= 3 ? 'high' :
    overallPercentage < 75 ? 'medium' : 'low';
  
  // Sort action items by priority
  actionItems.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  return {
    overallScore: totalScore,
    overallPercentage,
    categoryScores,
    complianceStatus,
    riskLevel,
    actionItems,
    compliantItems,
  };
}

// ============================================================================
// COMPLIANCE STATUS INTERPRETATION
// ============================================================================

export const COMPLIANCE_STATUS_INFO = {
  compliant: {
    label: 'Fully Compliant',
    description: 'Your organization meets POSH Act requirements. Maintain practices and conduct annual reviews.',
    color: 'green',
    scoreRange: '90-100%',
  },
  needs_attention: {
    label: 'Substantially Compliant',
    description: 'Minor gaps exist. Address identified issues within 30 days to achieve full compliance.',
    color: 'amber',
    scoreRange: '60-89%',
  },
  non_compliant: {
    label: 'Non-Compliant',
    description: 'Significant gaps exist. Immediate remediation required to avoid statutory penalties.',
    color: 'red',
    scoreRange: 'Below 60%',
  },
};

export const RISK_LEVEL_INFO = {
  low: {
    label: 'Low Risk',
    description: 'Compliance framework is strong. Continue monitoring.',
    penaltyExposure: 'Minimal',
  },
  medium: {
    label: 'Medium Risk',
    description: 'Some compliance gaps require attention.',
    penaltyExposure: 'Rs.50,000+',
  },
  high: {
    label: 'High Risk',
    description: 'Multiple compliance failures. Urgent action required.',
    penaltyExposure: 'Rs.1,00,000+',
  },
  critical: {
    label: 'Critical Risk',
    description: 'Severe non-compliance. Risk of license cancellation and heavy penalties.',
    penaltyExposure: 'Rs.1,50,000+ + License Risk',
  },
};

// ============================================================================
// COMPLIANCE RULES FOR PDF GENERATION
// ============================================================================

export interface POSHComplianceRule {
  questionId: string;
  requirement: string;
  governmentRef: string;
  officialLink: string;
  deadline: string;
  penalty: string;
  actionIfNonCompliant: string[];
  actionIfCompliant: string;
}

export const POSH_COMPLIANCE_RULES: POSHComplianceRule[] = [
  {
    questionId: 'POSH_ICC_001',
    requirement: 'Constitute Internal Complaints Committee',
    governmentRef: 'POSH Act 2013, Section 4',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Immediate (mandatory for 10+ employees)',
    penalty: 'Rs.50,000 (first offense), Rs.1,00,000 (repeat), License cancellation (continued)',
    actionIfNonCompliant: [
      'Identify senior woman employee as Presiding Officer',
      'Nominate minimum 2 employee members',
      'Engage external member from NGO or women\'s organization',
      'Issue formal nomination orders with dates',
      'Display ICC constitution order at workplace',
    ],
    actionIfCompliant: 'Review ICC composition annually. Track member tenure for 3-year reconstitution.',
  },
  {
    questionId: 'POSH_ICC_003',
    requirement: 'Appoint Qualified External Member',
    governmentRef: 'POSH Act 2013, Section 4(2)(c); Rule 4',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Part of ICC constitution',
    penalty: 'ICC may be invalidated (Ruchika Singh v. Air France precedent)',
    actionIfNonCompliant: [
      'Identify NGO working on women\'s issues in your area',
      'Alternatively, find person with 5+ years women\'s empowerment experience',
      'Document external member\'s qualification clearly',
      'Issue formal nomination with term dates',
      'Arrange for fees (Rs.200/day) and travel reimbursement',
    ],
    actionIfCompliant: 'Maintain documentation of external member qualification. Review engagement annually.',
  },
  {
    questionId: 'POSH_POL_001',
    requirement: 'Written POSH Policy',
    governmentRef: 'POSH Act 2013, Section 19',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Before commencing operations',
    penalty: 'Rs.50,000+ for Section 19 violation',
    actionIfNonCompliant: [
      'Draft comprehensive POSH policy covering all Section 3 harassment types',
      'Include ICC details, complaint procedure, timelines',
      'Add confidentiality, interim relief, and anti-retaliation clauses',
      'Get policy approved by management/Board',
      'Communicate to all employees with acknowledgment',
    ],
    actionIfCompliant: 'Review policy every 2 years. Update for virtual harassment and new judicial interpretations.',
  },
  {
    questionId: 'POSH_POL_006',
    requirement: 'Sexual Harassment as Misconduct in Service Rules',
    governmentRef: 'POSH Act 2013, Section 19(j)',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Mandatory requirement',
    penalty: 'Disciplinary action may not be enforceable without this',
    actionIfNonCompliant: [
      'Amend service rules/standing orders to include sexual harassment as misconduct',
      'Update employment contracts with POSH clause',
      'Define disciplinary consequences for proven harassment',
      'Get amended rules certified (if applicable)',
    ],
    actionIfCompliant: 'Ensure new employment contracts include POSH misconduct clause.',
  },
  {
    questionId: 'POSH_TRN_001',
    requirement: 'Annual Employee Awareness Training',
    governmentRef: 'POSH Act 2013, Section 19(c)',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Annual (ongoing)',
    penalty: 'Rs.50,000+ for Section 19 violation; Conducted training without records = no evidence',
    actionIfNonCompliant: [
      'Schedule annual POSH awareness training for all employees',
      'Include all worker categories: regular, contract, interns',
      'Cover policy, complaint procedure, ICC details, consequences',
      'Maintain attendance records and training content documentation',
      'Update content for virtual/remote harassment scenarios',
    ],
    actionIfCompliant: 'Schedule next annual training. Update content for new scenarios.',
  },
  {
    questionId: 'POSH_DSP_001',
    requirement: 'Display Penal Consequences at Workplace',
    governmentRef: 'POSH Act 2013, Section 19(b)',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Immediate and ongoing',
    penalty: 'Rs.50,000+ for Section 19 violation',
    actionIfNonCompliant: [
      'Create posters/notices with penal consequences',
      'Display at conspicuous locations: reception, notice boards, common areas',
      'Include in local language(s) understood by employees',
      'Display ICC member names and contact details',
      'Make information available on company intranet',
    ],
    actionIfCompliant: 'Ensure displays are current and visible. Update when ICC changes.',
  },
  {
    questionId: 'POSH_RPT_001',
    requirement: 'Annual Report to District Officer',
    governmentRef: 'POSH Act 2013, Section 21',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'January 31 each year (for previous calendar year)',
    penalty: 'Rs.50,000+ for non-filing',
    actionIfNonCompliant: [
      'Identify District Officer for your jurisdiction',
      'Prepare annual report with required information',
      'Include: complaints received, disposed, pending >90 days, programs conducted',
      'Submit NIL report if no complaints received',
      'Obtain acknowledgment and retain copy',
    ],
    actionIfCompliant: 'Set calendar reminder for annual filing. Maintain filing records.',
  },
  {
    questionId: 'POSH_CMP_002',
    requirement: 'Confidentiality Protocols',
    governmentRef: 'POSH Act 2013, Section 16; Rule 12',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Before receiving any complaint',
    penalty: 'Rs.5,000 per breach of confidentiality',
    actionIfNonCompliant: [
      'Establish case code system for complaint tracking',
      'Implement restricted access to complaint files',
      'Require NDAs from ICC members',
      'Secure physical and digital storage',
      'Train ICC on confidentiality obligations',
    ],
    actionIfCompliant: 'Review and test confidentiality protocols periodically.',
  },
];

// ============================================================================
// QUESTION COUNT ESTIMATOR
// ============================================================================

export function estimatePOSHQuestionCount(applicabilityCodes: string[]): number {
  let count = 0;
  
  // Base questions (always applicable for 10+ employees)
  if (applicabilityCodes.includes('POSH_ICC_CONSTITUTION')) count += 7; // Core ICC questions
  if (applicabilityCodes.includes('POSH_POLICY')) count += 7; // Core policy questions
  if (applicabilityCodes.includes('POSH_TRAINING')) count += 6; // Core training questions
  if (applicabilityCodes.includes('POSH_DISPLAY')) count += 5; // Display questions
  if (applicabilityCodes.includes('POSH_ANNUAL_REPORT')) count += 5; // Reporting questions
  if (applicabilityCodes.includes('POSH_COMPLAINT_HANDLING')) count += 7; // Complaint handling questions
  
  // Conditional questions
  if (applicabilityCodes.includes('POSH_MULTI_LOCATION_ICC')) count += 1; // Multi-location ICC
  if (applicabilityCodes.includes('POSH_STATE_REGISTRATION')) count += 1; // State registration
  if (applicabilityCodes.includes('POSH_VIRTUAL_WORKPLACE')) count += 2; // Virtual workplace
  if (applicabilityCodes.includes('POSH_HIGH_RISK_INDUSTRY')) count += 1; // Industry-specific
  
  return Math.max(count, 25); // Minimum 25 questions
}
