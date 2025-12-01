/**
 * DPDP Act 2023 Gap Assessment Questions
 * Digital Personal Data Protection Act 2023 & DPDP Rules 2025
 * Compliance Deadline: May 13, 2027 (18 months from notification)
 * 
 * Categories:
 * 1. Data Inventory & Mapping
 * 2. Consent Management
 * 3. Privacy Notices
 * 4. Data Principal Rights
 * 5. Security Safeguards
 * 6. Breach Response
 * 7. Children's Data
 * 8. Third-Party & Transfers
 */

export type DPDPQuestionType = 'yes_no' | 'multiple_choice';

// Industry types
export type DPDPIndustryType = 
  | 'Information Technology'
  | 'E-commerce'
  | 'Financial Services'
  | 'Healthcare'
  | 'EdTech'
  | 'Gaming & Entertainment'
  | 'Social Media'
  | 'Telecommunications'
  | 'Travel & Hospitality'
  | 'Manufacturing'
  | 'Professional Services'
  | 'Other';

// Data principal count ranges
export type DataPrincipalCount = '<1L' | '1L-10L' | '10L-1Cr' | '>1Cr';

export interface DPDPQuestion {
  id: string;
  text: string;
  type: DPDPQuestionType;
  category: string;
  weight: number;
  helpText: string;
  complianceAnswer?: string;
  options?: { value: string; label: string }[];
  // DPDP-specific filters
  sdfOnly?: boolean;           // Show only for Significant Data Fiduciaries
  childrenDataOnly?: boolean;  // Show only if processing children's data
  crossBorderOnly?: boolean;   // Show only if international transfers
}

export interface DPDPCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  penaltyExposure: string;
}

export const DPDP_CATEGORIES: DPDPCategory[] = [
  {
    id: 'inventory',
    name: 'Data Inventory & Mapping',
    description: 'Personal data identification, data flows, and processing activities',
    icon: '📊',
    penaltyExposure: 'Up to Rs. 50 Cr',
  },
  {
    id: 'consent',
    name: 'Consent Management',
    description: 'Granular consent, withdrawal parity, and multilingual notices',
    icon: '✅',
    penaltyExposure: 'Up to Rs. 50 Cr',
  },
  {
    id: 'notices',
    name: 'Privacy Notices',
    description: 'Standalone notices, plain language, and pre-collection disclosure',
    icon: '📄',
    penaltyExposure: 'Up to Rs. 50 Cr',
  },
  {
    id: 'rights',
    name: 'Data Principal Rights',
    description: 'Access, correction, erasure, withdrawal, and grievance redressal',
    icon: '👤',
    penaltyExposure: 'Up to Rs. 200 Cr',
  },
  {
    id: 'security',
    name: 'Security Safeguards',
    description: 'Encryption, access controls, and audit logging',
    icon: '🔒',
    penaltyExposure: 'Up to Rs. 250 Cr',
  },
  {
    id: 'breach',
    name: 'Breach Response',
    description: '72-hour notification and incident response procedures',
    icon: '🚨',
    penaltyExposure: 'Up to Rs. 200 Cr',
  },
  {
    id: 'children',
    name: "Children's Data",
    description: 'Under-18 definition, parental consent, and tracking prohibition',
    icon: '👶',
    penaltyExposure: 'Up to Rs. 200 Cr',
  },
  {
    id: 'thirdparty',
    name: 'Third-Party & Transfers',
    description: 'Data Processing Agreements and cross-border transfers',
    icon: '🌐',
    penaltyExposure: 'Up to Rs. 250 Cr',
  },
];


export const DPDP_QUESTIONS: DPDPQuestion[] = [
  // ===== DATA INVENTORY & MAPPING (4 questions) =====
  {
    id: 'inventory_1',
    text: 'Have you identified and documented all personal data you collect from Indian residents?',
    type: 'yes_no',
    category: 'inventory',
    weight: 8,
    complianceAnswer: 'yes',
    helpText: 'Personal data includes any data about an identifiable individual: name, email, phone, Aadhaar, PAN, IP address, device identifiers, location data, biometrics, health data, financial data, and behavioural data.',
  },
  {
    id: 'inventory_2',
    text: 'Do you maintain a Records of Processing Activities (ROPA) documenting what data you process, why, and how?',
    type: 'yes_no',
    category: 'inventory',
    weight: 7,
    complianceAnswer: 'yes',
    helpText: 'ROPA should include: categories of data principals, types of personal data, processing purposes, retention periods, security measures, and third-party sharing details.',
  },
  {
    id: 'inventory_3',
    text: 'Have you mapped data flows showing how personal data moves through your organisation and to third parties?',
    type: 'yes_no',
    category: 'inventory',
    weight: 6,
    complianceAnswer: 'yes',
    helpText: 'Data flow maps help identify all touchpoints where personal data is collected, stored, processed, shared, and deleted.',
  },
  {
    id: 'inventory_4',
    text: 'Do you have a defined retention schedule specifying how long personal data is kept for each processing purpose?',
    type: 'yes_no',
    category: 'inventory',
    weight: 7,
    complianceAnswer: 'yes',
    helpText: 'DPDP requires data to be retained only as long as necessary for the specified purpose. Retention schedules must be documented and enforced.',
  },

  // ===== CONSENT MANAGEMENT (4 questions) =====
  {
    id: 'consent_1',
    text: 'Do you obtain explicit consent before collecting personal data, with separate consent for each processing purpose?',
    type: 'yes_no',
    category: 'consent',
    weight: 10,
    complianceAnswer: 'yes',
    helpText: 'DPDP requires free, specific, informed, unambiguous consent. Pre-ticked boxes are NOT valid. Bundled consent (one checkbox for multiple purposes) is NOT compliant. Penalty: Up to Rs. 50 Cr.',
  },
  {
    id: 'consent_2',
    text: 'Can users withdraw consent as easily as they gave it?',
    type: 'yes_no',
    category: 'consent',
    weight: 9,
    complianceAnswer: 'yes',
    helpText: 'Withdrawal must be as simple as giving consent. If consent was given with one click, withdrawal should also be one click. Hidden settings or multi-step processes violate this requirement.',
  },
  {
    id: 'consent_3',
    text: 'Are your consent notices available in regional Indian languages relevant to your users?',
    type: 'multiple_choice',
    category: 'consent',
    weight: 6,
    options: [
      { value: 'all', label: 'Yes, in all 22 scheduled languages' },
      { value: 'some', label: 'Yes, in Hindi and English plus some regional languages' },
      { value: 'hindi_english', label: 'Only in Hindi and English' },
      { value: 'english_only', label: 'Only in English' },
    ],
    helpText: 'DPDP mandates notices in languages specified in the Eighth Schedule to the Constitution. At minimum, provide Hindi and English. Best practice: cover languages of your primary user base.',
  },
  {
    id: 'consent_4',
    text: 'Do you maintain timestamped records of when and how consent was obtained from each data principal?',
    type: 'yes_no',
    category: 'consent',
    weight: 8,
    complianceAnswer: 'yes',
    helpText: 'Consent logs should be retained for 7 years and include: timestamp, IP address, consent version, purpose(s) consented to, and method of consent.',
  },

  // ===== PRIVACY NOTICES (3 questions) =====
  {
    id: 'notices_1',
    text: 'Do you provide a standalone, easily accessible privacy notice before collecting any personal data?',
    type: 'yes_no',
    category: 'notices',
    weight: 8,
    complianceAnswer: 'yes',
    helpText: 'Privacy notices must be provided BEFORE or AT the time of data collection. Buried links in terms & conditions are insufficient.',
  },
  {
    id: 'notices_2',
    text: 'Does your privacy notice clearly explain: what data is collected, why, how long it is kept, and how to contact your Data Protection Officer?',
    type: 'yes_no',
    category: 'notices',
    weight: 9,
    complianceAnswer: 'yes',
    helpText: 'DPDP requires notices in plain language. Technical jargon and legalese violate the spirit of transparency requirements.',
  },
  {
    id: 'notices_3',
    text: 'Do you update and re-notify users when your data processing purposes or practices change?',
    type: 'yes_no',
    category: 'notices',
    weight: 7,
    complianceAnswer: 'yes',
    helpText: 'Material changes to processing require fresh notice and may require fresh consent. Silent policy updates are not compliant.',
  },


  // ===== DATA PRINCIPAL RIGHTS (4 questions) =====
  {
    id: 'rights_1',
    text: 'Can data principals access a summary of their personal data held by you within 90 days of request?',
    type: 'yes_no',
    category: 'rights',
    weight: 9,
    complianceAnswer: 'yes',
    helpText: 'The 90-day SLA is mandatory under DPDP. This includes providing processing activities, categories of data, and third parties with whom data was shared.',
  },
  {
    id: 'rights_2',
    text: 'Do you have a process to correct inaccurate or incomplete personal data upon request?',
    type: 'yes_no',
    category: 'rights',
    weight: 8,
    complianceAnswer: 'yes',
    helpText: 'Correction requests must be actioned promptly. Document the process and maintain audit trails of corrections made.',
  },
  {
    id: 'rights_3',
    text: 'Can data principals request erasure of their personal data, and do you have a process to fulfil this?',
    type: 'yes_no',
    category: 'rights',
    weight: 9,
    complianceAnswer: 'yes',
    helpText: 'Erasure must cover all systems including backups (within reasonable timeframes). Exceptions exist for legal compliance and legitimate archival.',
  },
  {
    id: 'rights_4',
    text: 'Do you have a designated grievance redressal mechanism with response SLAs for data principal complaints?',
    type: 'yes_no',
    category: 'rights',
    weight: 10,
    complianceAnswer: 'yes',
    helpText: 'A dedicated channel (email, portal) for data protection complaints is mandatory. Response within 30 days recommended. Penalty for non-compliance: Up to Rs. 200 Cr.',
  },

  // ===== SECURITY SAFEGUARDS (4 questions) =====
  {
    id: 'security_1',
    text: 'Is all personal data encrypted at rest using industry-standard encryption (AES-256 or equivalent)?',
    type: 'yes_no',
    category: 'security',
    weight: 10,
    complianceAnswer: 'yes',
    helpText: 'Rule 6 of DPDP Rules mandates encryption. Failure to implement reasonable security safeguards carries the HIGHEST penalty: Up to Rs. 250 Cr.',
  },
  {
    id: 'security_2',
    text: 'Do you maintain audit logs of all personal data access for at least 1 year?',
    type: 'yes_no',
    category: 'security',
    weight: 8,
    complianceAnswer: 'yes',
    helpText: 'DPDP Rules require minimum 1-year retention of processing logs and traffic data for regulatory assessment and law enforcement purposes.',
  },
  {
    id: 'security_3',
    text: 'Do you have role-based access controls (RBAC) ensuring personal data is accessible only on a need-to-know basis?',
    type: 'yes_no',
    category: 'security',
    weight: 9,
    complianceAnswer: 'yes',
    helpText: 'Access to personal data should be limited to authorised personnel. Implement least-privilege principles and regular access reviews.',
  },
  {
    id: 'security_4',
    text: 'Do you use tokenisation or masking for sensitive personal data (Aadhaar, PAN, financial details)?',
    type: 'yes_no',
    category: 'security',
    weight: 8,
    complianceAnswer: 'yes',
    helpText: 'Tokenisation replaces sensitive data with non-sensitive placeholders. This is especially important for payment data and government identifiers.',
  },

  // ===== BREACH RESPONSE (3 questions) =====
  {
    id: 'breach_1',
    text: 'Do you have a documented incident response plan for personal data breaches?',
    type: 'yes_no',
    category: 'breach',
    weight: 9,
    complianceAnswer: 'yes',
    helpText: 'The plan should include: detection procedures, assessment criteria, escalation paths, notification templates, and post-incident review processes.',
  },
  {
    id: 'breach_2',
    text: 'Can you notify the Data Protection Board within 72 hours of detecting a personal data breach?',
    type: 'yes_no',
    category: 'breach',
    weight: 10,
    complianceAnswer: 'yes',
    helpText: '72-hour notification to DPB is MANDATORY. The clock starts from detection, not confirmation. Penalty for failure: Up to Rs. 200 Cr.',
  },
  {
    id: 'breach_3',
    text: 'Do you have a process to notify affected data principals immediately after a breach?',
    type: 'yes_no',
    category: 'breach',
    weight: 9,
    complianceAnswer: 'yes',
    helpText: 'Affected individuals must be notified without delay. Notification should include: nature of breach, likely consequences, and mitigation steps.',
  },


  // ===== CHILDREN'S DATA (3 questions - conditional) =====
  {
    id: 'children_1',
    text: 'Do you obtain verifiable parental consent before processing any data of users under 18?',
    type: 'yes_no',
    category: 'children',
    weight: 10,
    complianceAnswer: 'yes',
    childrenDataOnly: true,
    helpText: 'India defines a child as anyone under 18 (stricter than GDPR at 16). Verification must confirm the consenting person is the parent/guardian. Methods: government ID, DigiLocker tokens, or reliable identity documents. Penalty: Up to Rs. 200 Cr.',
  },
  {
    id: 'children_2',
    text: 'Have you disabled all behavioural tracking, profiling, and targeted advertising for users under 18?',
    type: 'yes_no',
    category: 'children',
    weight: 10,
    complianceAnswer: 'yes',
    childrenDataOnly: true,
    helpText: 'ABSOLUTELY PROHIBITED: behavioural monitoring, profiling, or targeted advertising directed at children. No exceptions for "legitimate interest" or "service improvement". Penalty: Up to Rs. 200 Cr.',
  },
  {
    id: 'children_3',
    text: 'Do you have age-verification mechanisms to identify and protect users under 18?',
    type: 'yes_no',
    category: 'children',
    weight: 8,
    complianceAnswer: 'yes',
    childrenDataOnly: true,
    helpText: 'Age gates with self-declaration may be insufficient. Consider more robust verification for services likely to attract children (gaming, education, social media).',
  },

  // ===== THIRD-PARTY & TRANSFERS (3 questions) =====
  {
    id: 'thirdparty_1',
    text: 'Do you have Data Processing Agreements (DPAs) with all third parties who process personal data on your behalf?',
    type: 'yes_no',
    category: 'thirdparty',
    weight: 9,
    complianceAnswer: 'yes',
    helpText: 'DPAs are mandatory for all data processors (vendors, cloud providers, analytics tools). The DPA should specify: processing scope, security requirements, breach notification, and audit rights.',
  },
  {
    id: 'thirdparty_2',
    text: 'Do you conduct due diligence or audits of third-party data processors for security and compliance?',
    type: 'yes_no',
    category: 'thirdparty',
    weight: 7,
    complianceAnswer: 'yes',
    helpText: 'You remain responsible for data even when processed by third parties. Conduct annual security assessments or require SOC 2 / ISO 27001 certifications.',
  },
  {
    id: 'thirdparty_3',
    text: 'If you transfer personal data outside India, do you have documented compliance with cross-border transfer requirements?',
    type: 'yes_no',
    category: 'thirdparty',
    weight: 9,
    complianceAnswer: 'yes',
    crossBorderOnly: true,
    helpText: 'Cross-border transfers are permitted except to countries blacklisted by the Central Government. Document: destination countries, legal basis, and contractual safeguards. Penalty: Up to Rs. 250 Cr.',
  },
];

// Applicability profile type
export interface DPDPProfile {
  industry: DPDPIndustryType;
  dataPrincipalCount: DataPrincipalCount;
  processesChildrenData: boolean;
  crossBorderTransfers: boolean;
  isDigitalPlatform: boolean;
}

// Check if organisation qualifies as Significant Data Fiduciary
export function isSignificantDataFiduciary(profile: DPDPProfile): boolean {
  // SDF criteria based on DPDP Rules:
  // - Processing personal data of 1 Cr+ individuals, OR
  // - Processing sensitive personal data at scale, OR
  // - Operating specific platform types
  if (profile.dataPrincipalCount === '>1Cr') return true;
  if (profile.dataPrincipalCount === '10L-1Cr' && profile.isDigitalPlatform) return true;
  // Platforms handling children's data at scale (10L-1Cr without digital platform flag)
  if (profile.processesChildrenData && profile.dataPrincipalCount === '10L-1Cr') {
    return true;
  }
  return false;
}


/**
 * Filter questions based on user profile (children's data, cross-border, SDF status)
 */
export function getFilteredDPDPQuestions(profile: DPDPProfile): DPDPQuestion[] {
  return DPDP_QUESTIONS.filter((question) => {
    // Children's data questions only if processing children's data
    if (question.childrenDataOnly && !profile.processesChildrenData) {
      return false;
    }
    // Cross-border questions only if doing international transfers
    if (question.crossBorderOnly && !profile.crossBorderTransfers) {
      return false;
    }
    // SDF-only questions (if we add any in future)
    if (question.sdfOnly && !isSignificantDataFiduciary(profile)) {
      return false;
    }
    return true;
  });
}

/**
 * Get questions for a specific category (filtered by profile)
 */
export function getDPDPQuestionsByCategory(
  categoryId: string,
  profile?: DPDPProfile
): DPDPQuestion[] {
  let questions = DPDP_QUESTIONS.filter((q) => q.category === categoryId);
  
  if (profile) {
    questions = questions.filter((question) => {
      if (question.childrenDataOnly && !profile.processesChildrenData) return false;
      if (question.crossBorderOnly && !profile.crossBorderTransfers) return false;
      if (question.sdfOnly && !isSignificantDataFiduciary(profile)) return false;
      return true;
    });
  }
  
  return questions;
}

/**
 * Calculate DPDP compliance score with risk multipliers
 */
export function calculateDPDPScore(
  responses: Record<string, string>,
  profile?: DPDPProfile
): {
  overallScore: number;
  categoryScores: Record<string, number>;
  maxScores: Record<string, number>;
  questionsAnswered: number;
  totalQuestions: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  estimatedPenaltyExposure: string;
} {
  const applicableQuestions = profile
    ? getFilteredDPDPQuestions(profile)
    : DPDP_QUESTIONS;

  const categoryScores: Record<string, number> = {};
  const maxScores: Record<string, number> = {};
  let questionsAnswered = 0;

  // Risk multipliers based on DPDP penalty structure
  const riskMultipliers: Record<string, number> = {
    children: 2.0,   // Rs. 200 Cr penalty
    security: 1.8,   // Rs. 250 Cr penalty (highest)
    breach: 1.5,     // Rs. 200 Cr penalty
    rights: 1.3,     // Rs. 200 Cr penalty
    thirdparty: 1.5, // Rs. 250 Cr penalty
    consent: 1.0,
    notices: 1.0,
    inventory: 1.0,
  };

  // Initialize scores
  DPDP_CATEGORIES.forEach((cat) => {
    categoryScores[cat.id] = 0;
    maxScores[cat.id] = 0;
  });

  // Calculate scores
  applicableQuestions.forEach((question) => {
    const response = responses[question.id];
    const multiplier = riskMultipliers[question.category] || 1.0;
    const adjustedWeight = question.weight * multiplier;
    
    maxScores[question.category] += adjustedWeight;

    if (!response) return;
    questionsAnswered++;

    if (question.type === 'yes_no') {
      if (response === question.complianceAnswer) {
        categoryScores[question.category] += adjustedWeight;
      }
    } else if (question.type === 'multiple_choice') {
      // First option is typically most compliant
      if (question.options && question.options.length > 0) {
        if (response === question.options[0].value) {
          categoryScores[question.category] += adjustedWeight;
        } else if (response === question.options[1]?.value) {
          categoryScores[question.category] += adjustedWeight * 0.7;
        } else if (response === question.options[2]?.value) {
          categoryScores[question.category] += adjustedWeight * 0.4;
        }
        // Last option (english_only) gets 0
      }
    }
  });

  // Calculate percentages and overall score
  let totalScore = 0;
  let totalMaxScore = 0;
  const categoryPercentages: Record<string, number> = {};

  Object.keys(categoryScores).forEach((cat) => {
    totalScore += categoryScores[cat];
    totalMaxScore += maxScores[cat];
    categoryPercentages[cat] = maxScores[cat] > 0 
      ? Math.round((categoryScores[cat] / maxScores[cat]) * 100) 
      : 100; // If no questions in category, assume compliant
  });

  const overallScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

  // Determine risk level and penalty exposure
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  let estimatedPenaltyExposure: string;

  if (overallScore >= 80) {
    riskLevel = 'low';
    estimatedPenaltyExposure = 'Minimal - Under Rs. 10 Cr';
  } else if (overallScore >= 60) {
    riskLevel = 'medium';
    estimatedPenaltyExposure = 'Moderate - Rs. 10 Cr to Rs. 50 Cr';
  } else if (overallScore >= 40) {
    riskLevel = 'high';
    estimatedPenaltyExposure = 'Significant - Rs. 50 Cr to Rs. 150 Cr';
  } else {
    riskLevel = 'critical';
    estimatedPenaltyExposure = 'Critical - Up to Rs. 250 Cr';
  }

  return {
    overallScore,
    categoryScores: categoryPercentages,
    maxScores,
    questionsAnswered,
    totalQuestions: applicableQuestions.length,
    riskLevel,
    estimatedPenaltyExposure,
  };
}


/**
 * Generate prioritised action items based on responses
 */
export function generateDPDPActionItems(
  responses: Record<string, string>,
  profile?: DPDPProfile
): Array<{ priority: 'high' | 'medium' | 'low'; text: string; category: string; penalty: string }> {
  const actionItems: Array<{ priority: 'high' | 'medium' | 'low'; text: string; category: string; penalty: string }> = [];

  const applicableQuestions = profile
    ? getFilteredDPDPQuestions(profile)
    : DPDP_QUESTIONS;
  const applicableIds = new Set(applicableQuestions.map(q => q.id));

  // Action item definitions with penalties
  const actionMap: Record<string, { text: string; penalty: string }> = {
    inventory_1: { text: 'Create a comprehensive personal data inventory covering all data collected from Indian residents', penalty: 'Rs. 50 Cr' },
    inventory_2: { text: 'Implement Records of Processing Activities (ROPA) documenting data categories, purposes, and retention', penalty: 'Rs. 50 Cr' },
    inventory_3: { text: 'Map all data flows within the organisation and to external third parties', penalty: 'Rs. 50 Cr' },
    inventory_4: { text: 'Define and document retention schedules for all categories of personal data', penalty: 'Rs. 50 Cr' },
    consent_1: { text: 'Implement granular consent mechanisms with separate consent for each processing purpose', penalty: 'Rs. 50 Cr' },
    consent_2: { text: 'Ensure consent withdrawal is as easy as giving consent (one-click withdrawal)', penalty: 'Rs. 50 Cr' },
    consent_3: { text: 'Provide consent notices in Hindi, English, and relevant regional languages', penalty: 'Rs. 50 Cr' },
    consent_4: { text: 'Implement consent logging with timestamps, IP addresses, and consent versions', penalty: 'Rs. 50 Cr' },
    notices_1: { text: 'Create standalone privacy notices presented before data collection', penalty: 'Rs. 50 Cr' },
    notices_2: { text: 'Rewrite privacy notice in plain language with clear DPO contact details', penalty: 'Rs. 50 Cr' },
    notices_3: { text: 'Implement process to update and re-notify users when privacy practices change', penalty: 'Rs. 50 Cr' },
    rights_1: { text: 'Build data subject access request (DSAR) portal with 90-day SLA tracking', penalty: 'Rs. 200 Cr' },
    rights_2: { text: 'Implement data correction workflow with audit trail', penalty: 'Rs. 200 Cr' },
    rights_3: { text: 'Create data erasure process covering all systems including backups', penalty: 'Rs. 200 Cr' },
    rights_4: { text: 'Establish dedicated grievance redressal channel with response SLAs', penalty: 'Rs. 200 Cr' },
    security_1: { text: 'Implement AES-256 encryption for all personal data at rest - HIGHEST PRIORITY', penalty: 'Rs. 250 Cr' },
    security_2: { text: 'Configure audit logging for all personal data access with 1-year retention', penalty: 'Rs. 250 Cr' },
    security_3: { text: 'Implement role-based access controls (RBAC) with least-privilege principles', penalty: 'Rs. 250 Cr' },
    security_4: { text: 'Deploy tokenisation for sensitive identifiers (Aadhaar, PAN, financial data)', penalty: 'Rs. 250 Cr' },
    breach_1: { text: 'Create documented incident response plan with detection, assessment, and notification procedures', penalty: 'Rs. 200 Cr' },
    breach_2: { text: 'Establish 72-hour breach notification capability to Data Protection Board', penalty: 'Rs. 200 Cr' },
    breach_3: { text: 'Implement affected party notification process with templated communications', penalty: 'Rs. 200 Cr' },
    children_1: { text: 'Implement verifiable parental consent mechanism (DigiLocker, ID verification)', penalty: 'Rs. 200 Cr' },
    children_2: { text: 'Disable all behavioural tracking and targeted advertising for under-18 users', penalty: 'Rs. 200 Cr' },
    children_3: { text: 'Implement robust age-verification mechanisms beyond self-declaration', penalty: 'Rs. 200 Cr' },
    thirdparty_1: { text: 'Execute Data Processing Agreements with all third-party processors', penalty: 'Rs. 250 Cr' },
    thirdparty_2: { text: 'Conduct security assessments of all data processors (require SOC 2/ISO 27001)', penalty: 'Rs. 250 Cr' },
    thirdparty_3: { text: 'Document cross-border transfer compliance with destination country assessment', penalty: 'Rs. 250 Cr' },
  };

  // Priority mapping based on penalty
  const penaltyPriority: Record<string, 'high' | 'medium' | 'low'> = {
    'Rs. 250 Cr': 'high',
    'Rs. 200 Cr': 'high',
    'Rs. 50 Cr': 'medium',
  };

  // Check each applicable question
  applicableQuestions.forEach((question) => {
    if (!applicableIds.has(question.id)) return;
    
    const response = responses[question.id];
    const action = actionMap[question.id];
    if (!action) return;

    let isNonCompliant = false;

    if (question.type === 'yes_no') {
      isNonCompliant = response !== question.complianceAnswer;
    } else if (question.type === 'multiple_choice') {
      // Not fully compliant if not the best option
      if (question.options && question.options.length > 0) {
        isNonCompliant = response !== question.options[0].value;
      }
    }

    if (isNonCompliant || !response) {
      const category = DPDP_CATEGORIES.find(c => c.id === question.category);
      actionItems.push({
        priority: penaltyPriority[action.penalty] || 'medium',
        text: action.text,
        category: category?.name || question.category,
        penalty: action.penalty,
      });
    }
  });

  // Sort by priority
  return actionItems.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Get compliance status based on score
 */
export function getDPDPComplianceStatus(score: number): {
  status: 'Ready' | 'Needs Attention' | 'At Risk' | 'Critical';
  color: string;
  description: string;
} {
  if (score >= 80) {
    return {
      status: 'Ready',
      color: 'green',
      description: 'Your organisation is well-prepared for DPDP Act compliance by May 2027.',
    };
  } else if (score >= 60) {
    return {
      status: 'Needs Attention',
      color: 'amber',
      description: 'Several areas require attention before the May 2027 compliance deadline.',
    };
  } else if (score >= 40) {
    return {
      status: 'At Risk',
      color: 'orange',
      description: 'Significant gaps exist. Prioritise remediation to avoid penalties up to Rs. 250 Cr.',
    };
  } else {
    return {
      status: 'Critical',
      color: 'red',
      description: 'Critical compliance gaps. Immediate action required to avoid severe penalties.',
    };
  }
}

/**
 * Get question summary for a given profile
 */
export function getDPDPQuestionSummary(profile: DPDPProfile): {
  total: number;
  byCategory: Record<string, number>;
} {
  const filtered = getFilteredDPDPQuestions(profile);
  const byCategory: Record<string, number> = {};
  
  DPDP_CATEGORIES.forEach((cat) => {
    byCategory[cat.id] = filtered.filter((q) => q.category === cat.id).length;
  });
  
  return {
    total: filtered.length,
    byCategory,
  };
}

/**
 * Calculate days until DPDP compliance deadline
 */
export function getDaysUntilDeadline(): number {
  const deadline = new Date('2027-05-13');
  const today = new Date();
  const diffTime = deadline.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
