export interface DPDPQuestion {
  id: string
  text: string
  type: 'yes_no' | 'multiple_choice'
  phase: 'consent' | 'security' | 'rights' | 'breach' | 'children' | 'governance'
  phaseLabel: string
  phaseNumber: number
  options?: string[]
  weight: number
  helpText?: string
  complianceAnswer?: string
  isConditional?: boolean // Only shown if certain conditions met
}

// Phase 1: Consent Management (9 questions, 20% weight)
export const CONSENT_MANAGEMENT_QUESTIONS: DPDPQuestion[] = [
  {
    id: 'consent_1',
    text: 'How do you obtain consent before collecting personal data from users?',
    type: 'multiple_choice',
    phase: 'consent',
    phaseLabel: 'Consent Management',
    phaseNumber: 1,
    options: [
      'Explicit consent with granular purpose-specific options',
      'Separate checkboxes for different purposes (not pre-checked)',
      'Single checkbox for general consent',
      'Pre-checked consent boxes',
      'Via Terms & Conditions only'
    ],
    weight: 10,
    complianceAnswer: 'Explicit consent with granular purpose-specific options',
    helpText: 'DPDP requires free, specific, informed, and unambiguous consent. Pre-checked boxes violate this. Penalty: ₹50 crore'
  },
  {
    id: 'consent_2',
    text: 'Can users easily withdraw their consent?',
    type: 'multiple_choice',
    phase: 'consent',
    phaseLabel: 'Consent Management',
    phaseNumber: 1,
    options: [
      'Yes, through same mechanism used to give consent (equally easy)',
      'Yes, but requires email/customer support request',
      'Yes, but requires written application',
      'No mechanism currently available'
    ],
    weight: 10,
    complianceAnswer: 'Yes, through same mechanism used to give consent (equally easy)',
    helpText: 'Consent withdrawal must be as easy as giving consent. Penalty: ₹50 crore'
  },
  {
    id: 'consent_3',
    text: 'Are your privacy notices available in multiple Indian languages?',
    type: 'multiple_choice',
    phase: 'consent',
    phaseLabel: 'Consent Management',
    phaseNumber: 1,
    options: [
      'Yes, in English + regional language(s) of service area',
      'Yes, in English + Hindi only',
      'English only',
      'No privacy notice available'
    ],
    weight: 8,
    complianceAnswer: 'Yes, in English + regional language(s) of service area',
    helpText: 'DPDP requires notices in one of 22 scheduled languages. Penalty: ₹50 crore'
  },
  {
    id: 'consent_4',
    text: 'Do you limit data usage strictly to the purposes for which consent was obtained?',
    type: 'yes_no',
    phase: 'consent',
    phaseLabel: 'Consent Management',
    phaseNumber: 1,
    weight: 9,
    complianceAnswer: 'yes',
    helpText: 'Purpose limitation is mandatory. Using data for different purposes requires fresh consent. Penalty: ₹50 crore'
  },
  {
    id: 'consent_5',
    text: 'Do you maintain records of when and how consent was obtained from each user?',
    type: 'yes_no',
    phase: 'consent',
    phaseLabel: 'Consent Management',
    phaseNumber: 1,
    weight: 8,
    complianceAnswer: 'yes',
    helpText: 'Consent records should include timestamp, consent version, and user acknowledgment. Retention: 7 years recommended'
  },
  {
    id: 'consent_6',
    text: 'Do you re-obtain consent when your privacy policy changes materially?',
    type: 'yes_no',
    phase: 'consent',
    phaseLabel: 'Consent Management',
    phaseNumber: 1,
    weight: 7,
    complianceAnswer: 'yes',
    helpText: 'Material changes to data processing require fresh consent. Penalty: ₹50 crore'
  },
  {
    id: 'consent_7',
    text: 'Do you provide granular consent options for cookies and tracking?',
    type: 'multiple_choice',
    phase: 'consent',
    phaseLabel: 'Consent Management',
    phaseNumber: 1,
    options: [
      'Yes, users can opt-in/out of each cookie category',
      'Yes, accept all or reject all only',
      'No cookie consent mechanism',
      'Not applicable - we don\'t use cookies'
    ],
    weight: 7,
    complianceAnswer: 'Yes, users can opt-in/out of each cookie category',
    helpText: 'Granular consent for non-essential cookies is best practice under DPDP'
  },
  {
    id: 'consent_8',
    text: 'Do you obtain separate, specific consent before sharing data with third parties?',
    type: 'yes_no',
    phase: 'consent',
    phaseLabel: 'Consent Management',
    phaseNumber: 1,
    weight: 9,
    complianceAnswer: 'yes',
    helpText: 'Third-party data sharing requires explicit, separate consent. Penalty: ₹50 crore'
  },
  {
    id: 'consent_9',
    text: 'Do you track and manage consent version history?',
    type: 'yes_no',
    phase: 'consent',
    phaseLabel: 'Consent Management',
    phaseNumber: 1,
    weight: 7,
    complianceAnswer: 'yes',
    helpText: 'Consent version tracking helps demonstrate compliance during audits'
  }
];

// Phase 2: Security Safeguards (9 questions, 20% weight)
export const SECURITY_SAFEGUARDS_QUESTIONS: DPDPQuestion[] = [
  {
    id: 'security_1',
    text: 'Is all personal data encrypted at rest (when stored in databases)?',
    type: 'multiple_choice',
    phase: 'security',
    phaseLabel: 'Security Safeguards',
    phaseNumber: 2,
    options: [
      'Yes, AES-256 or equivalent encryption for all personal data',
      'Yes, basic encryption (AES-128)',
      'Only sensitive fields encrypted',
      'No encryption at rest'
    ],
    weight: 12,
    complianceAnswer: 'Yes, AES-256 or equivalent encryption for all personal data',
    helpText: 'Failure to implement reasonable security safeguards: ₹250 crore maximum penalty'
  },
  {
    id: 'security_2',
    text: 'Is all personal data encrypted during transmission (in transit)?',
    type: 'multiple_choice',
    phase: 'security',
    phaseLabel: 'Security Safeguards',
    phaseNumber: 2,
    options: [
      'Yes, TLS 1.3 for all data transfers',
      'Yes, TLS 1.2 minimum',
      'Partial encryption (some APIs only)',
      'No encryption in transit'
    ],
    weight: 11,
    complianceAnswer: 'Yes, TLS 1.3 for all data transfers',
    helpText: 'TLS 1.2+ required. TLS 1.3 recommended. Penalty: ₹250 crore'
  },
  {
    id: 'security_3',
    text: 'Do you use tokenization or pseudonymization to protect personal data?',
    type: 'yes_no',
    phase: 'security',
    phaseLabel: 'Security Safeguards',
    phaseNumber: 2,
    weight: 8,
    complianceAnswer: 'yes',
    helpText: 'Tokenization/pseudonymization reduces risk of data breaches'
  },
  {
    id: 'security_4',
    text: 'Do you have role-based access control (RBAC) limiting who can access personal data?',
    type: 'yes_no',
    phase: 'security',
    phaseLabel: 'Security Safeguards',
    phaseNumber: 2,
    weight: 10,
    complianceAnswer: 'yes',
    helpText: 'Need-to-know principle: Only authorized personnel should access personal data. Penalty: ₹250 crore'
  },
  {
    id: 'security_5',
    text: 'Do you maintain audit logs of data access with minimum 1-year retention?',
    type: 'yes_no',
    phase: 'security',
    phaseLabel: 'Security Safeguards',
    phaseNumber: 2,
    weight: 9,
    complianceAnswer: 'yes',
    helpText: '1-year minimum log retention helps investigate breaches. Penalty: ₹250 crore'
  },
  {
    id: 'security_6',
    text: 'Do you have intrusion detection systems monitoring for security threats?',
    type: 'yes_no',
    phase: 'security',
    phaseLabel: 'Security Safeguards',
    phaseNumber: 2,
    weight: 8,
    complianceAnswer: 'yes',
    helpText: 'Real-time threat monitoring is critical for breach prevention'
  },
  {
    id: 'security_7',
    text: 'Are data backups tested and recovery procedures documented?',
    type: 'yes_no',
    phase: 'security',
    phaseLabel: 'Security Safeguards',
    phaseNumber: 2,
    weight: 7,
    complianceAnswer: 'yes',
    helpText: 'Test recovery quarterly to ensure data can be restored securely'
  },
  {
    id: 'security_8',
    text: 'Do you conduct regular security vulnerability assessments?',
    type: 'multiple_choice',
    phase: 'security',
    phaseLabel: 'Security Safeguards',
    phaseNumber: 2,
    options: [
      'Yes, continuous/automated scanning with quarterly reviews',
      'Yes, annual third-party security audit',
      'Yes, ad-hoc internal reviews only',
      'No formal vulnerability assessment process'
    ],
    weight: 9,
    complianceAnswer: 'Yes, continuous/automated scanning with quarterly reviews',
    helpText: 'Regular vulnerability assessments prevent security failures. Penalty: ₹250 crore'
  },
  {
    id: 'security_9',
    text: 'Do you follow secure software development practices (SSDLC)?',
    type: 'yes_no',
    phase: 'security',
    phaseLabel: 'Security Safeguards',
    phaseNumber: 2,
    weight: 8,
    complianceAnswer: 'yes',
    helpText: 'Security-by-design minimizes vulnerabilities from development stage'
  }
];

// Phase 3: Data Principal Rights (6 questions, 10% weight)
export const DATA_PRINCIPAL_RIGHTS_QUESTIONS: DPDPQuestion[] = [
  {
    id: 'rights_1',
    text: 'Can users access their personal data through a self-service mechanism?',
    type: 'multiple_choice',
    phase: 'rights',
    phaseLabel: 'Data Principal Rights',
    phaseNumber: 3,
    options: [
      'Yes, instant download of all data',
      'Yes, provided within 7 days via email request',
      'Yes, but requires written application',
      'No mechanism available'
    ],
    weight: 10,
    complianceAnswer: 'Yes, instant download of all data',
    helpText: 'Right to access must be fulfilled promptly. Penalty: ₹50 crore'
  },
  {
    id: 'rights_2',
    text: 'Can users correct inaccurate personal data?',
    type: 'yes_no',
    phase: 'rights',
    phaseLabel: 'Data Principal Rights',
    phaseNumber: 3,
    weight: 9,
    complianceAnswer: 'yes',
    helpText: 'Users must be able to correct incomplete or inaccurate data. Penalty: ₹50 crore'
  },
  {
    id: 'rights_3',
    text: 'Can users request deletion of their personal data (Right to Erasure)?',
    type: 'multiple_choice',
    phase: 'rights',
    phaseLabel: 'Data Principal Rights',
    phaseNumber: 3,
    options: [
      'Yes, instant deletion with confirmation',
      'Yes, processed within 30 days',
      'Yes, but requires email/support request',
      'No deletion mechanism available'
    ],
    weight: 10,
    complianceAnswer: 'Yes, instant deletion with confirmation',
    helpText: '48-hour advance notice before deletion is mandatory. Penalty: ₹50 crore'
  },
  {
    id: 'rights_4',
    text: 'Do you have a grievance redressal mechanism for data-related complaints?',
    type: 'yes_no',
    phase: 'rights',
    phaseLabel: 'Data Principal Rights',
    phaseNumber: 3,
    weight: 8,
    complianceAnswer: 'yes',
    helpText: 'Grievance officer must respond within reasonable timeframe (30 days). Penalty: ₹50 crore'
  },
  {
    id: 'rights_5',
    text: 'What is your typical response time for Data Principal rights requests?',
    type: 'multiple_choice',
    phase: 'rights',
    phaseLabel: 'Data Principal Rights',
    phaseNumber: 3,
    options: [
      'Within 48-72 hours',
      'Within 7 days',
      'Within 30 days',
      'No defined timeline'
    ],
    weight: 7,
    complianceAnswer: 'Within 48-72 hours',
    helpText: 'While no strict timeline in DPDP, 7-30 days is reasonable. Faster is better'
  },
  {
    id: 'rights_6',
    text: 'Can users nominate someone to exercise their rights in case of death/incapacity?',
    type: 'yes_no',
    phase: 'rights',
    phaseLabel: 'Data Principal Rights',
    phaseNumber: 3,
    weight: 6,
    complianceAnswer: 'yes',
    helpText: 'DPDP allows nomination of representative for rights exercise'
  }
];

// Phase 4: Breach Response (5 questions, 15% weight)
export const BREACH_RESPONSE_QUESTIONS: DPDPQuestion[] = [
  {
    id: 'breach_1',
    text: 'Do you have a documented data breach response plan?',
    type: 'yes_no',
    phase: 'breach',
    phaseLabel: 'Breach Response',
    phaseNumber: 4,
    weight: 12,
    complianceAnswer: 'yes',
    helpText: 'Must notify Data Protection Board within 72 hours. Penalty: ₹200 crore'
  },
  {
    id: 'breach_2',
    text: 'Can you detect and report a data breach to the Data Protection Board within 72 hours?',
    type: 'multiple_choice',
    phase: 'breach',
    phaseLabel: 'Breach Response',
    phaseNumber: 4,
    options: [
      'Yes, automated detection and notification process',
      'Yes, manual process within 72 hours',
      'Likely but not guaranteed',
      'No process in place'
    ],
    weight: 15,
    complianceAnswer: 'Yes, automated detection and notification process',
    helpText: '72-hour notification to Board is mandatory. Penalty: ₹200 crore'
  },
  {
    id: 'breach_3',
    text: 'Do you notify affected individuals in case of a data breach?',
    type: 'yes_no',
    phase: 'breach',
    phaseLabel: 'Breach Response',
    phaseNumber: 4,
    weight: 12,
    complianceAnswer: 'yes',
    helpText: 'Affected Data Principals must be notified. Penalty: ₹200 crore'
  },
  {
    id: 'breach_4',
    text: 'Do you maintain documentation of past security incidents and breaches?',
    type: 'yes_no',
    phase: 'breach',
    phaseLabel: 'Breach Response',
    phaseNumber: 4,
    weight: 10,
    complianceAnswer: 'yes',
    helpText: 'Incident documentation helps with root cause analysis and prevention'
  },
  {
    id: 'breach_5',
    text: 'Do you conduct post-incident reviews and remediation tracking?',
    type: 'yes_no',
    phase: 'breach',
    phaseLabel: 'Breach Response',
    phaseNumber: 4,
    weight: 11,
    complianceAnswer: 'yes',
    helpText: 'Post-incident analysis prevents repeat violations'
  }
];

// Phase 5: Children's Data (5 questions, 20% weight) - CONDITIONAL
export const CHILDREN_DATA_QUESTIONS: DPDPQuestion[] = [
  {
    id: 'children_1',
    text: 'Do you obtain verifiable parental consent before processing data of anyone under 18?',
    type: 'multiple_choice',
    phase: 'children',
    phaseLabel: 'Children\'s Data Protection',
    phaseNumber: 5,
    options: [
      'Yes, verified via OTP/document upload/digital signature',
      'Yes, via email confirmation from parent',
      'Yes, via checkbox confirmation',
      'No parental consent mechanism'
    ],
    weight: 15,
    complianceAnswer: 'Yes, verified via OTP/document upload/digital signature',
    helpText: 'Verifiable parental consent mandatory for <18. India uses under-18 definition. Penalty: ₹200 crore',
    isConditional: true
  },
  {
    id: 'children_2',
    text: 'Have you implemented age verification mechanisms?',
    type: 'multiple_choice',
    phase: 'children',
    phaseLabel: 'Children\'s Data Protection',
    phaseNumber: 5,
    options: [
      'Yes, verified via government ID/document validation',
      'Yes, self-declared age confirmation',
      'No age verification implemented',
      'Not applicable - adults only'
    ],
    weight: 12,
    complianceAnswer: 'Yes, verified via government ID/document validation',
    helpText: 'Robust age verification prevents inadvertent children\'s data processing. Penalty: ₹200 crore',
    isConditional: true
  },
  {
    id: 'children_3',
    text: 'Have you disabled behavioral tracking and targeted advertising for users under 18?',
    type: 'yes_no',
    phase: 'children',
    phaseLabel: 'Children\'s Data Protection',
    phaseNumber: 5,
    weight: 14,
    complianceAnswer: 'yes',
    helpText: 'Behavioral tracking of children is prohibited. Penalty: ₹200 crore',
    isConditional: true
  },
  {
    id: 'children_4',
    text: 'Do you have processes to delete children\'s data upon parental request?',
    type: 'yes_no',
    phase: 'children',
    phaseLabel: 'Children\'s Data Protection',
    phaseNumber: 5,
    weight: 12,
    complianceAnswer: 'yes',
    helpText: 'Parents can request deletion of child\'s data at any time. Penalty: ₹200 crore',
    isConditional: true
  },
  {
    id: 'children_5',
    text: 'Do you clearly inform parents about data collection purposes when obtaining consent?',
    type: 'yes_no',
    phase: 'children',
    phaseLabel: 'Children\'s Data Protection',
    phaseNumber: 5,
    weight: 12,
    complianceAnswer: 'yes',
    helpText: 'Transparent communication with parents is mandatory. Penalty: ₹200 crore',
    isConditional: true
  }
];

// Phase 6: Governance & Retention (4 questions, 15% weight)
export const GOVERNANCE_QUESTIONS: DPDPQuestion[] = [
  {
    id: 'gov_1',
    text: 'Have you designated a Data Protection Officer (DPO) or authorized representative?',
    type: 'multiple_choice',
    phase: 'governance',
    phaseLabel: 'Governance & Retention',
    phaseNumber: 6,
    options: [
      'Yes, India-based DPO reporting to Board',
      'Yes, authorized representative with contact details published',
      'Yes, but contact details not published',
      'No DPO or representative designated'
    ],
    weight: 12,
    complianceAnswer: 'Yes, India-based DPO reporting to Board',
    helpText: 'DPO contact must be published in privacy policy. SDFs require India-based DPO. Penalty: ₹150 crore'
  },
  {
    id: 'gov_2',
    text: 'Do you have a documented data retention policy?',
    type: 'multiple_choice',
    phase: 'governance',
    phaseLabel: 'Governance & Retention',
    phaseNumber: 6,
    options: [
      'Yes, written policy with specific retention periods by data type',
      'Yes, general policy without specific periods',
      'No written policy but informal practices',
      'No retention policy'
    ],
    weight: 10,
    complianceAnswer: 'Yes, written policy with specific retention periods by data type',
    helpText: 'Data must be deleted within 1 year of last interaction unless legally required'
  },
  {
    id: 'gov_3',
    text: 'Do you maintain Records of Processing Activities (RoPA)?',
    type: 'yes_no',
    phase: 'governance',
    phaseLabel: 'Governance & Retention',
    phaseNumber: 6,
    weight: 9,
    complianceAnswer: 'yes',
    helpText: 'RoPA documents what data is collected, why, where stored, and retention periods'
  },
  {
    id: 'gov_4',
    text: 'Do you provide employee training on data protection and privacy?',
    type: 'multiple_choice',
    phase: 'governance',
    phaseLabel: 'Governance & Retention',
    phaseNumber: 6,
    options: [
      'Yes, mandatory annual training for all employees',
      'Yes, training for data-handling staff only',
      'Ad-hoc training when needed',
      'No formal training program'
    ],
    weight: 9,
    complianceAnswer: 'Yes, mandatory annual training for all employees',
    helpText: 'Regular training reduces human error - the leading cause of data breaches'
  }
];

// Combine all questions
export const ALL_DPDP_QUESTIONS = [
  ...CONSENT_MANAGEMENT_QUESTIONS,
  ...SECURITY_SAFEGUARDS_QUESTIONS,
  ...DATA_PRINCIPAL_RIGHTS_QUESTIONS,
  ...BREACH_RESPONSE_QUESTIONS,
  ...CHILDREN_DATA_QUESTIONS,
  ...GOVERNANCE_QUESTIONS
];

// Category/Phase information
export const PHASE_INFO = {
  consent: {
    label: 'Consent Management',
    weight: 0.20,
    description: 'Free, specific, informed consent mechanisms',
    maxPenalty: '₹50 crore',
    icon: '✅'
  },
  security: {
    label: 'Security Safeguards',
    weight: 0.20,
    description: 'Encryption, access controls, monitoring',
    maxPenalty: '₹250 crore',
    icon: '🔒'
  },
  rights: {
    label: 'Data Principal Rights',
    weight: 0.10,
    description: 'Access, correction, erasure, grievance',
    maxPenalty: '₹50 crore',
    icon: '👤'
  },
  breach: {
    label: 'Breach Response',
    weight: 0.15,
    description: '72-hour notification, incident management',
    maxPenalty: '₹200 crore',
    icon: '🚨'
  },
  children: {
    label: 'Children\'s Data Protection',
    weight: 0.20,
    description: 'Parental consent, behavioral tracking prohibition',
    maxPenalty: '₹200 crore',
    icon: '👶'
  },
  governance: {
    label: 'Governance & Retention',
    weight: 0.15,
    description: 'DPO, retention policy, training',
    maxPenalty: '₹150 crore',
    icon: '📋'
  }
};

// Maturity levels
export const MATURITY_LEVELS = [
  { level: 1, name: 'Initial', min: 0, max: 20, color: 'red', description: 'Ad-hoc, no formal privacy program' },
  { level: 2, name: 'Developing', min: 21, max: 40, color: 'orange', description: 'Policies drafted, limited implementation' },
  { level: 3, name: 'Defined', min: 41, max: 60, color: 'yellow', description: 'Documented processes, partial automation' },
  { level: 4, name: 'Managed', min: 61, max: 80, color: 'lime', description: 'Metrics-driven, regular audits' },
  { level: 5, name: 'Optimized', min: 81, max: 100, color: 'green', description: 'Continuous improvement, privacy-by-design embedded' }
];

// Risk multipliers
export const RISK_MULTIPLIERS = {
  childrenData: 2.0,
  healthData: 1.8,
  financialData: 1.5,
  crossBorder: 1.5,
  sdfDesignation: 2.0
};

// SDF threshold (conservative estimate)
export const SDF_REVENUE_THRESHOLD = 500; // ₹500 crore

// Dropdown options
export const REVENUE_OPTIONS = [
  'Below ₹5 crore',
  '₹5-10 crore',
  '₹10-50 crore',
  '₹50-100 crore',
  '₹100-500 crore',
  '₹500+ crore' // SDF risk threshold
];

// Get questions based on organization profile
export function getRelevantQuestions(processesChildrenData: boolean): DPDPQuestion[] {
  if (processesChildrenData) {
    return ALL_DPDP_QUESTIONS; // All 38 questions including children's data
  } else {
    // Filter out conditional children's data questions
    return ALL_DPDP_QUESTIONS.filter(q => !q.isConditional);
  }
}

// Get summary of questions that will be shown (for preview widget)
export function getDPDPQuestionSummary(processesChildrenData: boolean): {
  total: number;
  totalWithChildren: number;
  byPhase: Record<string, number>;
} {
  const questions = getRelevantQuestions(processesChildrenData);
  const allQuestions = ALL_DPDP_QUESTIONS;
  const byPhase: Record<string, number> = {};
  
  // Count questions by phase
  Object.keys(PHASE_INFO).forEach((phase) => {
    byPhase[phase] = questions.filter((q) => q.phase === phase).length;
  });
  
  return {
    total: questions.length,
    totalWithChildren: allQuestions.length,
    byPhase,
  };
}

// Calculate maturity level from score
export function getMaturityLevel(score: number) {
  const level = MATURITY_LEVELS.find(l => score >= l.min && score <= l.max);
  return level || MATURITY_LEVELS[0];
}

// Calculate risk multipliers based on profile
export function calculateRiskMultipliers(profile: {
  processesChildrenData?: boolean;
  processesHealthData?: boolean;
  processesFinancialData?: boolean;
  crossBorderTransfers?: boolean;
  revenue?: string;
}) {
  const multipliers: { factor: string; multiplier: number; reason: string }[] = [];

  if (profile.processesChildrenData) {
    multipliers.push({
      factor: 'Children\'s Data',
      multiplier: RISK_MULTIPLIERS.childrenData,
      reason: 'Processing data of individuals under 18 years'
    });
  }

  if (profile.processesHealthData) {
    multipliers.push({
      factor: 'Health Data',
      multiplier: RISK_MULTIPLIERS.healthData,
      reason: 'Processing sensitive health/medical information'
    });
  }

  if (profile.processesFinancialData) {
    multipliers.push({
      factor: 'Financial Data',
      multiplier: RISK_MULTIPLIERS.financialData,
      reason: 'Processing banking/payment information'
    });
  }

  if (profile.crossBorderTransfers) {
    multipliers.push({
      factor: 'Cross-Border Transfers',
      multiplier: RISK_MULTIPLIERS.crossBorder,
      reason: 'Transferring data outside India'
    });
  }

  // Check SDF designation risk
  if (profile.revenue === '₹500+ crore') {
    multipliers.push({
      factor: 'SDF Designation Risk',
      multiplier: RISK_MULTIPLIERS.sdfDesignation,
      reason: 'Revenue exceeds ₹500 crore - likely SDF designation'
    });
  }

  return multipliers;
}

// ============================================================================
// ADDITIONAL EXPORTS FOR RESULTS PAGE COMPATIBILITY
// ============================================================================

// Alias for PHASE_INFO (used by results components)
export const DPDP_CATEGORIES = PHASE_INFO;

// DPDP compliance deadline
const DPDP_DEADLINE = new Date('2027-05-13'); // DPDP Rules 2025 enforcement date

// Calculate days until DPDP deadline
export function getDaysUntilDeadline(): number {
  const today = new Date();
  const diffTime = DPDP_DEADLINE.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

// Get DPDP compliance status based on score
export function getDPDPComplianceStatus(score: number): {
  status: 'compliant' | 'partial' | 'non-compliant';
  label: string;
  color: string;
  description: string;
} {
  if (score >= 80) {
    return {
      status: 'compliant',
      label: 'Compliance Ready',
      color: 'green',
      description: 'Your organization meets most DPDP requirements. Focus on continuous improvement.'
    };
  } else if (score >= 50) {
    return {
      status: 'partial',
      label: 'Partial Compliance',
      color: 'amber',
      description: 'Significant gaps exist. Prioritize high-risk areas before enforcement.'
    };
  } else {
    return {
      status: 'non-compliant',
      label: 'Non-Compliant',
      color: 'red',
      description: 'Major compliance gaps. Immediate action required to avoid penalties.'
    };
  }
}

// Calculate DPDP score from responses
export function calculateDPDPScore(
  responses: Record<string, string>,
  profile: {
    processesChildrenData?: string | boolean;
    processesHealthData?: string | boolean;
    processesSensitiveData?: string | boolean;
  }
): {
  overallScore: number;
  phaseScores: Record<string, { score: number; maxScore: number; percentage: number }>;
  maturityLevel: string;
  questionsAnswered: number;
  totalQuestions: number;
} {
  const processesChildren = profile.processesChildrenData === 'yes' || profile.processesChildrenData === true;
  const relevantQuestions = getRelevantQuestions(processesChildren);
  
  const phaseScores: Record<string, { score: number; maxScore: number; percentage: number }> = {};
  let totalScore = 0;
  let maxTotalScore = 0;
  let questionsAnswered = 0;

  // Initialize phase scores
  const phases = ['consent', 'security', 'rights', 'breach', 'governance'];
  if (processesChildren) phases.push('children');

  phases.forEach(phase => {
    const phaseQuestions = relevantQuestions.filter(q => q.phase === phase);
    let phaseScore = 0;
    let maxPhaseScore = 0;

    phaseQuestions.forEach(q => {
      maxPhaseScore += q.weight;
      const answer = responses[q.id];
      
      if (answer) {
        questionsAnswered++;

        if (q.type === 'yes_no') {
          if (answer === q.complianceAnswer) {
            phaseScore += q.weight;
          }
        } else if (q.type === 'multiple_choice') {
          if (answer === q.complianceAnswer) {
            phaseScore += q.weight;
          } else if (q.options && q.options.indexOf(answer) === 1) {
            // Second option consistently represents partial compliance across all MC questions
            phaseScore += q.weight * 0.5;
          }
          // Third option or beyond gets 0 — these represent clear non-compliance
        }
      }
    });

    const percentage = maxPhaseScore > 0 ? Math.round((phaseScore / maxPhaseScore) * 100) : 0;
    phaseScores[phase] = {
      score: Math.round(phaseScore),
      maxScore: maxPhaseScore,
      percentage
    };

    // Apply phase weights to total score
    const phaseWeight = PHASE_INFO[phase as keyof typeof PHASE_INFO]?.weight || 0.10;
    totalScore += (percentage / 100) * phaseWeight * 100;
    maxTotalScore += phaseWeight * 100;
  });

  const overallScore = maxTotalScore > 0 ? Math.round((totalScore / maxTotalScore) * 100) : 0;
  const maturity = getMaturityLevel(overallScore);

  return {
    overallScore,
    phaseScores,
    maturityLevel: maturity.name,
    questionsAnswered,
    totalQuestions: relevantQuestions.length
  };
}

// Generate action items based on responses
export function generateDPDPActionItems(
  responses: Record<string, string>,
  profile: {
    processesChildrenData?: string | boolean;
    processesHealthData?: string | boolean;
  }
): Array<{
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  phase: string;
  title: string;
  description: string;
  deadline: string;
  penalty: string;
}> {
  const actionItems: Array<{
    id: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    phase: string;
    title: string;
    description: string;
    deadline: string;
    penalty: string;
  }> = [];

  const processesChildren = profile.processesChildrenData === 'yes' || profile.processesChildrenData === true;
  const relevantQuestions = getRelevantQuestions(processesChildren);

  relevantQuestions.forEach(q => {
    const answer = responses[q.id];
    const phaseInfo = PHASE_INFO[q.phase as keyof typeof PHASE_INFO];

    // Unanswered questions are flagged as gaps
    if (!answer) {
      actionItems.push({
        id: q.id,
        priority: getPriorityFromPhase(q.phase, q.weight),
        phase: q.phase,
        title: getActionTitle(q),
        description: q.helpText || `Address compliance gap in ${phaseInfo?.label || q.phase}`,
        deadline: 'Before DPDP enforcement',
        penalty: phaseInfo?.maxPenalty || '₹50 crore'
      });
      return;
    }

    const isFullyCompliant = answer === q.complianceAnswer;
    // For MC questions, second option (index 1) is partial compliance — still needs an action item
    const isPartiallyCompliant =
      q.type === 'multiple_choice' &&
      q.options != null &&
      q.options.indexOf(answer) === 1;

    if (!isFullyCompliant) {
      const basePriority = getPriorityFromPhase(q.phase, q.weight);
      // Downgrade priority one level for partial compliance (gap still exists, but risk is lower)
      const priority: 'critical' | 'high' | 'medium' | 'low' = isPartiallyCompliant
        ? downgradePriority(basePriority)
        : basePriority;

      actionItems.push({
        id: q.id,
        priority,
        phase: q.phase,
        title: getActionTitle(q),
        description: q.helpText || `Address compliance gap in ${phaseInfo?.label || q.phase}`,
        deadline: 'Before DPDP enforcement',
        penalty: phaseInfo?.maxPenalty || '₹50 crore'
      });
    }
  });

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  actionItems.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return actionItems;
}

function downgradePriority(
  priority: 'critical' | 'high' | 'medium' | 'low'
): 'critical' | 'high' | 'medium' | 'low' {
  if (priority === 'critical') return 'high';
  if (priority === 'high') return 'medium';
  return 'low';
}

// Helper function to determine priority based on phase and weight
function getPriorityFromPhase(phase: string, weight: number): 'critical' | 'high' | 'medium' | 'low' {
  if (phase === 'security' || phase === 'breach') {
    return weight >= 9 ? 'critical' : 'high';
  }
  if (phase === 'consent' || phase === 'children') {
    return weight >= 8 ? 'high' : 'medium';
  }
  return weight >= 7 ? 'medium' : 'low';
}

// Helper function to generate action title
function getActionTitle(question: DPDPQuestion): string {
  const titleMap: Record<string, string> = {
    consent_1: 'Implement granular consent mechanisms',
    consent_2: 'Enable easy consent withdrawal',
    consent_3: 'Provide multilingual privacy notices',
    consent_4: 'Enforce purpose limitation controls',
    consent_5: 'Establish consent record management',
    consent_6: 'Re-obtain consent for policy changes',
    consent_7: 'Implement granular cookie consent',
    consent_8: 'Obtain separate third-party sharing consent',
    consent_9: 'Track consent version history',
    security_1: 'Implement data encryption at rest',
    security_2: 'Deploy encryption in transit',
    security_3: 'Implement tokenization and data masking',
    security_4: 'Set up role-based access controls',
    security_5: 'Enable audit logging with 1-year retention',
    security_6: 'Deploy intrusion detection systems',
    security_7: 'Test backups and document recovery procedures',
    security_8: 'Conduct regular vulnerability assessments',
    security_9: 'Adopt secure software development lifecycle',
    rights_1: 'Build data access request portal',
    rights_2: 'Enable data correction mechanisms',
    rights_3: 'Implement right to erasure',
    rights_4: 'Establish grievance redressal mechanism',
    rights_5: 'Define response timelines for rights requests',
    rights_6: 'Enable nomination of representative',
    breach_1: 'Create breach notification procedures',
    breach_2: 'Establish 72-hour DPB reporting process',
    breach_3: 'Implement affected party notification',
    breach_4: 'Document security incidents and breaches',
    breach_5: 'Conduct post-incident reviews',
    children_1: 'Obtain verifiable parental consent',
    children_2: 'Implement robust age verification',
    children_3: 'Disable behavioral tracking for minors',
    children_4: 'Enable deletion of children\'s data on request',
    children_5: 'Provide transparent communication with parents',
    gov_1: 'Appoint Data Protection Officer',
    gov_2: 'Define data retention policies',
    gov_3: 'Maintain Records of Processing Activities',
    gov_4: 'Launch employee data protection training program',
  };

  return titleMap[question.id] || `Address: ${question.text.substring(0, 50)}...`;
}
