/**
 * Labour Code Readiness Assessment Questions
 * Based on India's Four Labour Codes (effective November 21, 2025)
 * 
 * Features:
 * - Industry-based conditional logic
 * - Employee count-based dynamic help text
 * 
 * Categories:
 * 1. Code on Wages, 2019
 * 2. Code on Social Security, 2020
 * 3. Occupational Safety, Health and Working Conditions Code, 2020
 * 4. Industrial Relations Code, 2020
 */

export type QuestionType = 'yes_no' | 'multiple_choice' | 'text' | 'number';

// Industry types matching the form
export type IndustryType = 
  | 'Information Technology'
  | 'Manufacturing'
  | 'Retail & E-commerce'
  | 'Healthcare'
  | 'Financial Services'
  | 'Education'
  | 'Hospitality'
  | 'Construction'
  | 'Logistics & Transportation'
  | 'Professional Services'
  | 'Other';

// Employee count ranges
export type EmployeeCountRange = 
  | '1-9' | '10-19' | '20-49' | '50-99' | '100-299' | '300-499' | '500+';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  category: string;
  options?: string[];
  weight: number;
  helpText?: string;
  // Dynamic help text based on employee count
  dynamicHelpText?: Record<string, string>;
  // Industries where this question applies (empty = all industries)
  applicableIndustries?: IndustryType[];
  // Minimum employee count for this question to appear
  minEmployeeCount?: EmployeeCountRange;
}

export interface AssessmentCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const LABOUR_CODE_CATEGORIES: AssessmentCategory[] = [
  {
    id: 'wages',
    name: 'Code on Wages',
    description: 'Minimum wages, payment timelines, bonus, and equal remuneration',
    icon: '💰',
  },
  {
    id: 'social_security',
    name: 'Code on Social Security',
    description: 'EPF, ESI, gratuity, maternity benefits, and gig worker provisions',
    icon: '🛡️',
  },
  {
    id: 'osh',
    name: 'OSH Code',
    description: 'Working conditions, safety, welfare facilities, and contract labour',
    icon: '⚙️',
  },
  {
    id: 'industrial_relations',
    name: 'Industrial Relations Code',
    description: 'Standing orders, trade unions, retrenchment, and grievance redressal',
    icon: '🤝',
  },
];

// Helper to check if employee count meets minimum threshold
export function meetsEmployeeThreshold(
  userCount: EmployeeCountRange,
  minRequired: EmployeeCountRange
): boolean {
  const order: EmployeeCountRange[] = ['1-9', '10-19', '20-49', '50-99', '100-299', '300-499', '500+'];
  return order.indexOf(userCount) >= order.indexOf(minRequired);
}

// Get employee count as approximate number for display
export function getEmployeeCountNumber(range: EmployeeCountRange): number {
  const map: Record<EmployeeCountRange, number> = {
    '1-9': 5, '10-19': 15, '20-49': 35, '50-99': 75,
    '100-299': 200, '300-499': 400, '500+': 500
  };
  return map[range];
}


export const LABOUR_CODE_QUESTIONS: Question[] = [
  // ===== CODE ON WAGES (7 questions) - Universal applicability =====
  {
    id: 'wages_1',
    text: 'Do you pay at least the notified minimum wage for your geographic area and skill category?',
    type: 'yes_no',
    category: 'wages',
    weight: 10,
    helpText: 'Minimum wages are mandatory for ALL employees from day one, regardless of company size.',
  },
  {
    id: 'wages_2',
    text: 'Do you pay wages within 7 days of the wage period end (for monthly wages)?',
    type: 'yes_no',
    category: 'wages',
    weight: 8,
    helpText: 'The Code mandates payment within 7 days for monthly wage periods.',
  },
  {
    id: 'wages_3',
    text: 'Do you settle full and final dues within 2 working days of employee separation?',
    type: 'yes_no',
    category: 'wages',
    weight: 7,
    helpText: 'New timeline under Code on Wages - reduced from previous 30-45 days.',
  },
  {
    id: 'wages_4',
    text: 'Does your basic wage component constitute at least 50% of total remuneration (CTC)?',
    type: 'yes_no',
    category: 'wages',
    weight: 10,
    helpText: 'Critical: If allowances exceed 50%, the excess is reclassified as wages for PF/gratuity calculation.',
    dynamicHelpText: {
      '1-9': 'Important for future compliance when you scale beyond 10 employees.',
      '10-19': 'Affects ESI and gratuity calculations. Review your CTC structure.',
      '20-49': 'Critical: Directly impacts your EPF, ESI, and gratuity liabilities.',
      '50-99': 'With your workforce size, non-compliance can lead to significant back-dues.',
      '100-299': 'At 100+ employees, PF/ESIC audits are common. Ensure CTC structure is compliant.',
      '300-499': 'Large workforce = large liability. Get a professional CTC restructuring done.',
      '500+': 'Enterprise-level compliance risk. Recommend annual compensation audit.',
    },
  },
  {
    id: 'wages_5',
    text: 'Do you pay overtime at 2x the normal wage rate?',
    type: 'yes_no',
    category: 'wages',
    weight: 7,
    helpText: 'Overtime rate is now uniformly 2x across all establishments.',
    applicableIndustries: ['Manufacturing', 'Retail & E-commerce', 'Hospitality', 'Healthcare', 'Logistics & Transportation', 'Construction'],
  },
  {
    id: 'wages_6',
    text: 'Do you maintain gender pay parity for same or similar work?',
    type: 'yes_no',
    category: 'wages',
    weight: 9,
    helpText: 'Equal Remuneration provisions are now part of the Code on Wages.',
  },
  {
    id: 'wages_7',
    text: 'Do you pay bonus to eligible employees (earning ≤₹21,000/month) within 8 months of the accounting year end?',
    type: 'yes_no',
    category: 'wages',
    weight: 8,
    helpText: 'Applicable to establishments with 20+ employees. Bonus range: 8.33% to 20%.',
    minEmployeeCount: '20-49',
    dynamicHelpText: {
      '20-49': 'You now meet the 20+ threshold. Bonus is mandatory for eligible employees.',
      '50-99': 'Bonus compliance is mandatory. Maintain proper bonus registers.',
      '100-299': 'With your scale, ensure systematic bonus calculation and timely payment.',
      '300-499': 'Large workforce bonus liability. Budget for 8.33-20% of eligible wages.',
      '500+': 'Significant financial obligation. Integrate bonus into annual compensation planning.',
    },
  },


  // ===== CODE ON SOCIAL SECURITY (8 questions) =====
  {
    id: 'ss_1',
    text: 'Are all eligible employees (earning ≤₹15,000/month) enrolled in EPF?',
    type: 'yes_no',
    category: 'social_security',
    weight: 10,
    helpText: 'EPF is mandatory for establishments with 20+ employees.',
    minEmployeeCount: '20-49',
    dynamicHelpText: {
      '20-49': 'You just crossed the 20+ threshold. Register with EPFO immediately if not done.',
      '50-99': 'EPF compliance is mandatory. Ensure 100% enrolment of eligible employees.',
      '100-299': 'At your scale, EPFO audits are routine. Maintain accurate records.',
      '300-499': 'Large EPF liability. Consider professional PF administration.',
      '500+': 'Enterprise-level PF management required. Monthly compliance critical.',
    },
  },
  {
    id: 'ss_2',
    text: 'Do you remit EPF contributions (24% total: 12% employee + 12% employer) by the 15th of following month?',
    type: 'yes_no',
    category: 'social_security',
    weight: 9,
    helpText: 'Delayed payments attract interest at 12% p.a. and penalties.',
    minEmployeeCount: '20-49',
  },
  {
    id: 'ss_3',
    text: 'Are all eligible employees (earning ≤₹21,000/month) registered with ESIC?',
    type: 'yes_no',
    category: 'social_security',
    weight: 10,
    helpText: 'ESI applies to establishments with 10+ employees (Pan-India coverage now).',
    minEmployeeCount: '10-19',
    dynamicHelpText: {
      '10-19': 'You meet the 10+ threshold. ESI registration is mandatory.',
      '20-49': 'ESI + EPF both apply. Ensure dual compliance.',
      '50-99': 'ESI compliance well-established. Focus on timely contributions.',
      '100-299': 'At your scale, ESIC audits are common. Keep records updated.',
      '300-499': 'Large ESI liability. Automate contribution management.',
      '500+': 'Enterprise ESI management. Consider dedicated compliance team.',
    },
  },
  {
    id: 'ss_4',
    text: 'Do you have compulsory gratuity insurance coverage for your gratuity liability?',
    type: 'yes_no',
    category: 'social_security',
    weight: 9,
    helpText: 'NEW requirement: Employers must obtain insurance for gratuity liability.',
    minEmployeeCount: '10-19',
    dynamicHelpText: {
      '10-19': 'Gratuity applies at 10+ employees. Get LIC group gratuity or create reserves.',
      '20-49': 'Gratuity insurance is now mandatory. Contact LIC for group schemes.',
      '50-99': 'With 5+ year tenured employees, gratuity liability can be significant.',
      '100-299': 'Substantial gratuity liability. Professional actuarial valuation recommended.',
      '300-499': 'Large gratuity fund required. Consider trust-based management.',
      '500+': 'Enterprise gratuity management. Annual actuarial valuation mandatory.',
    },
  },
  {
    id: 'ss_5',
    text: 'Do you provide pro-rata gratuity to fixed-term employees completing 1+ year of service?',
    type: 'yes_no',
    category: 'social_security',
    weight: 8,
    helpText: 'NEW provision: Fixed-term employees eligible after just 1 year (vs 5 years for regular).',
    minEmployeeCount: '10-19',
  },
  {
    id: 'ss_6',
    text: 'Do you provide 26 weeks of maternity leave for the first two children?',
    type: 'yes_no',
    category: 'social_security',
    weight: 9,
    helpText: 'Applies to establishments with 10+ employees. 12 weeks for 3rd child onwards.',
    minEmployeeCount: '10-19',
  },
  {
    id: 'ss_7',
    text: 'If you engage gig/platform workers, do you contribute 1-2% of annual turnover to the Social Security Fund?',
    type: 'multiple_choice',
    category: 'social_security',
    options: ['Yes, we contribute', 'No, we don\'t contribute', 'Not applicable - we don\'t engage gig workers'],
    weight: 7,
    helpText: 'NEW provision for aggregators (ride-sharing, food delivery, logistics, etc.).',
    applicableIndustries: ['Information Technology', 'Retail & E-commerce', 'Logistics & Transportation', 'Hospitality', 'Healthcare'],
  },
  {
    id: 'ss_8',
    text: 'Do you provide crèche facilities (for establishments with 50+ employees)?',
    type: 'multiple_choice',
    category: 'social_security',
    options: ['Yes, we provide crèche', 'No crèche facility', 'Not applicable - less than 50 employees'],
    weight: 6,
    helpText: 'Gender-neutral requirement - applies regardless of workforce gender composition.',
    minEmployeeCount: '50-99',
    dynamicHelpText: {
      '50-99': 'Crèche is now mandatory at 50+ employees. Can be in-house or tie-up.',
      '100-299': 'Crèche mandatory. Consider quality facility as employee benefit.',
      '300-499': 'Multiple crèche locations may be needed for large campuses.',
      '500+': 'Enterprise crèche management. Consider on-site professional facility.',
    },
  },


  // ===== OSH CODE (8 questions) =====
  {
    id: 'osh_1',
    text: 'Have you obtained single registration via the Shram Suvidha Portal?',
    type: 'yes_no',
    category: 'osh',
    weight: 10,
    helpText: 'Mandatory for establishments with 10+ workers. Must be completed within 60 days of applicability.',
    minEmployeeCount: '10-19',
    dynamicHelpText: {
      '10-19': 'You now need Shram Suvidha registration. Apply online at shramsuvidha.gov.in.',
      '20-49': 'Single registration replaces 6 previous registrations. Simplifies compliance.',
      '50-99': 'Ensure registration is current. Update for any changes in establishment details.',
      '100-299': 'Registration must reflect accurate worker count and establishment type.',
      '300-499': 'Multiple establishment? Each location needs separate registration.',
      '500+': 'Enterprise registration management. Centralise compliance tracking.',
    },
  },
  {
    id: 'osh_2',
    text: 'Are daily working hours limited to 8 hours (with 48 hours weekly maximum)?',
    type: 'yes_no',
    category: 'osh',
    weight: 8,
    helpText: 'Reduced from 9 hours under previous laws. Spread-over cannot exceed 12 hours.',
  },
  {
    id: 'osh_3',
    text: 'Do you obtain mandatory worker consent before assigning overtime work?',
    type: 'yes_no',
    category: 'osh',
    weight: 7,
    helpText: 'NEW requirement: Overtime requires worker consent. Maximum 125 hours per quarter.',
    applicableIndustries: ['Manufacturing', 'Retail & E-commerce', 'Hospitality', 'Healthcare', 'Logistics & Transportation', 'Construction'],
  },
  {
    id: 'osh_4',
    text: 'For women employees working night shifts (7PM-6AM), do you provide adequate safety measures and transport?',
    type: 'multiple_choice',
    category: 'osh',
    options: ['Yes, safety and transport provided', 'No provisions in place', 'Not applicable - no women on night shifts'],
    weight: 8,
    helpText: 'Women can now work night shifts, but employers must ensure safety and provide transport.',
    applicableIndustries: ['Information Technology', 'Manufacturing', 'Healthcare', 'Hospitality', 'Retail & E-commerce', 'Financial Services', 'Logistics & Transportation'],
  },
  {
    id: 'osh_5',
    text: 'If you engage contract labour (50+ workers), is the contractor properly licensed?',
    type: 'multiple_choice',
    category: 'osh',
    options: ['Yes, contractor is licensed', 'No, contractor is not licensed', 'Not applicable - less than 50 contract workers'],
    weight: 9,
    helpText: 'Threshold raised to 50 workers. Contractor licence now valid for 5 years (all-India).',
    minEmployeeCount: '50-99',
    applicableIndustries: ['Manufacturing', 'Construction', 'Logistics & Transportation', 'Hospitality', 'Retail & E-commerce', 'Information Technology'],
    dynamicHelpText: {
      '50-99': 'If using 50+ contract workers, both you (principal employer) and contractor need registration.',
      '100-299': 'Contract labour compliance is critical. Verify all contractor licences.',
      '300-499': 'Multiple contractors? Maintain a contractor compliance register.',
      '500+': 'Enterprise contract labour management. Consider vendor compliance audits.',
    },
  },
  {
    id: 'osh_6',
    text: 'Is contract labour deployed only in permissible non-core activities (sanitation, security, canteen, housekeeping, etc.)?',
    type: 'multiple_choice',
    category: 'osh',
    options: ['Yes, only non-core activities', 'No, also in core activities', 'Not applicable - no contract labour'],
    weight: 9,
    helpText: 'Contract labour in core activities is prohibited except for intermittent work or volume spikes.',
    applicableIndustries: ['Manufacturing', 'Construction', 'Logistics & Transportation', 'Information Technology', 'Hospitality'],
  },
  {
    id: 'osh_7',
    text: 'Do you have a canteen facility (for establishments with 100+ workers)?',
    type: 'multiple_choice',
    category: 'osh',
    options: ['Yes, canteen provided', 'No canteen facility', 'Not applicable - less than 100 workers'],
    weight: 5,
    helpText: 'Threshold reduced from 250 to 100 workers under the new Code.',
    minEmployeeCount: '100-299',
    applicableIndustries: ['Manufacturing', 'Construction', 'Information Technology', 'Healthcare', 'Financial Services'],
    dynamicHelpText: {
      '100-299': 'Canteen now mandatory at 100+ workers. Can be in-house or contracted.',
      '300-499': 'Canteen must meet prescribed standards for space, hygiene, and subsidised rates.',
      '500+': 'Multiple canteen facilities may be needed. Quality impacts employee satisfaction.',
    },
  },
  {
    id: 'osh_8',
    text: 'For inter-state migrant workers (earning ≤₹18,000/month), do you provide journey allowance and medical checkups?',
    type: 'multiple_choice',
    category: 'osh',
    options: ['Yes, all benefits provided', 'Partial benefits only', 'Not applicable - no inter-state migrants'],
    weight: 7,
    helpText: 'Applies to establishments with 10+ inter-state migrant workers.',
    minEmployeeCount: '10-19',
    applicableIndustries: ['Manufacturing', 'Construction', 'Hospitality', 'Logistics & Transportation'],
  },


  // ===== INDUSTRIAL RELATIONS CODE (7 questions) =====
  {
    id: 'ir_1',
    text: 'Do you have a Grievance Redressal Committee (GRC) with equal employer-worker representation?',
    type: 'yes_no',
    category: 'industrial_relations',
    weight: 9,
    helpText: 'Mandatory for establishments with 20+ workers. GRC must decide within 30 days.',
    minEmployeeCount: '20-49',
    dynamicHelpText: {
      '20-49': 'GRC is now mandatory. Constitute with equal representation (max 10 members).',
      '50-99': 'GRC should have proportionate women representation. Document all proceedings.',
      '100-299': 'Formalise GRC process. Train members on grievance handling.',
      '300-499': 'Consider multiple GRCs for different departments/locations.',
      '500+': 'Enterprise grievance management. Integrate with HR systems.',
    },
  },
  {
    id: 'ir_2',
    text: 'Have you adopted certified Standing Orders (for establishments with 300+ workers)?',
    type: 'multiple_choice',
    category: 'industrial_relations',
    options: ['Yes, certified standing orders in place', 'In process of certification', 'Using model standing orders', 'Not applicable - less than 300 workers'],
    weight: 8,
    helpText: 'Threshold raised from 100 to 300 workers. Model standing orders are deemed certified upon adoption.',
    minEmployeeCount: '300-499',
    dynamicHelpText: {
      '300-499': 'Standing orders now mandatory. Can adopt model orders or get custom ones certified.',
      '500+': 'Customised standing orders recommended for large enterprises.',
    },
  },
  {
    id: 'ir_3',
    text: 'Do you have a Works Committee (for establishments with 100+ workers)?',
    type: 'multiple_choice',
    category: 'industrial_relations',
    options: ['Yes, Works Committee exists', 'No Works Committee', 'Not applicable - less than 100 workers'],
    weight: 6,
    helpText: 'Works Committee promotes measures for good relations between employer and workers.',
    minEmployeeCount: '100-299',
    dynamicHelpText: {
      '100-299': 'Works Committee mandatory at 100+. Equal employer-worker representation required.',
      '300-499': 'Works Committee should meet regularly. Document minutes of all meetings.',
      '500+': 'Works Committee is key for industrial harmony. Involve in major decisions.',
    },
  },
  {
    id: 'ir_4',
    text: 'Do your employment policies define "concerted casual leave by 50%+ workers" as potential strike action?',
    type: 'yes_no',
    category: 'industrial_relations',
    weight: 7,
    helpText: 'NEW definition: Mass casual leave is now classified as strike under the IR Code.',
    minEmployeeCount: '20-49',
  },
  {
    id: 'ir_5',
    text: 'Have you established a mechanism to receive 14-day advance strike notices?',
    type: 'yes_no',
    category: 'industrial_relations',
    weight: 7,
    helpText: 'Strike notice now required for ALL establishments (not just public utilities).',
    minEmployeeCount: '20-49',
  },
  {
    id: 'ir_6',
    text: 'Do you treat fixed-term employees equally with permanent workers (same wages, hours, benefits)?',
    type: 'yes_no',
    category: 'industrial_relations',
    weight: 9,
    helpText: 'Fixed-term employees must receive equal treatment. Gratuity eligible after 1 year.',
  },
  {
    id: 'ir_7',
    text: 'For retrenchments, do you follow LIFO (Last-In-First-Out) principle within worker categories?',
    type: 'multiple_choice',
    category: 'industrial_relations',
    options: ['Yes, LIFO followed', 'No, different criteria used', 'Not applicable - no retrenchments done'],
    weight: 7,
    helpText: 'LIFO is mandatory. Retrenchment compensation: 15 days\' pay per year + Reskilling Fund contribution.',
    minEmployeeCount: '50-99',
    dynamicHelpText: {
      '50-99': 'General retrenchment rules apply at 50+. LIFO principle is mandatory.',
      '100-299': 'Retrenchment requires proper procedure. 60 days notice for closure.',
      '300-499': 'At 300+, prior government permission required for retrenchment/closure.',
      '500+': 'Enterprise retrenchment requires extensive planning and government approval.',
    },
  },
];


/**
 * Filter questions based on industry and employee count
 */
export function getFilteredQuestions(
  industry: IndustryType,
  employeeCount: EmployeeCountRange
): Question[] {
  return LABOUR_CODE_QUESTIONS.filter((question) => {
    // Check industry filter
    if (question.applicableIndustries && question.applicableIndustries.length > 0) {
      if (!question.applicableIndustries.includes(industry) && industry !== 'Other') {
        return false;
      }
    }

    // Check employee count threshold
    if (question.minEmployeeCount) {
      if (!meetsEmployeeThreshold(employeeCount, question.minEmployeeCount)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get questions for a specific category (filtered)
 */
export function getQuestionsByCategory(
  categoryId: string,
  industry?: IndustryType,
  employeeCount?: EmployeeCountRange
): Question[] {
  let questions = LABOUR_CODE_QUESTIONS.filter((q) => q.category === categoryId);
  
  if (industry && employeeCount) {
    questions = questions.filter((question) => {
      // Check industry filter
      if (question.applicableIndustries && question.applicableIndustries.length > 0) {
        if (!question.applicableIndustries.includes(industry) && industry !== 'Other') {
          return false;
        }
      }

      // Check employee count threshold
      if (question.minEmployeeCount) {
        if (!meetsEmployeeThreshold(employeeCount, question.minEmployeeCount)) {
          return false;
        }
      }

      return true;
    });
  }
  
  return questions;
}

/**
 * Get dynamic help text for a question based on employee count
 */
export function getDynamicHelpText(
  question: Question,
  employeeCount: EmployeeCountRange
): string {
  if (question.dynamicHelpText && question.dynamicHelpText[employeeCount]) {
    return question.dynamicHelpText[employeeCount];
  }
  return question.helpText || '';
}

/**
 * Get summary of questions that will be shown
 */
export function getQuestionSummary(
  industry: IndustryType,
  employeeCount: EmployeeCountRange
): { total: number; byCategory: Record<string, number> } {
  const filtered = getFilteredQuestions(industry, employeeCount);
  const byCategory: Record<string, number> = {};
  
  LABOUR_CODE_CATEGORIES.forEach((cat) => {
    byCategory[cat.id] = filtered.filter((q) => q.category === cat.id).length;
  });
  
  return {
    total: filtered.length,
    byCategory,
  };
}

/**
 * Calculate compliance score based on responses (for filtered questions)
 */
export function calculateLabourCodeScore(
  responses: Record<string, string>,
  industry?: IndustryType,
  employeeCount?: EmployeeCountRange
): {
  overallScore: number;
  categoryScores: Record<string, number>;
  maxScores: Record<string, number>;
  questionsAnswered: number;
  totalQuestions: number;
} {
  // Get applicable questions
  const applicableQuestions = industry && employeeCount
    ? getFilteredQuestions(industry, employeeCount)
    : LABOUR_CODE_QUESTIONS;

  const categoryScores: Record<string, number> = {};
  const maxScores: Record<string, number> = {};
  let questionsAnswered = 0;

  // Initialize scores
  LABOUR_CODE_CATEGORIES.forEach((cat) => {
    categoryScores[cat.id] = 0;
    maxScores[cat.id] = 0;
  });

  // Calculate scores only for applicable questions
  applicableQuestions.forEach((question) => {
    const response = responses[question.id];
    maxScores[question.category] += question.weight;

    if (!response) return;
    questionsAnswered++;

    if (question.type === 'yes_no') {
      if (response === 'yes') {
        categoryScores[question.category] += question.weight;
      }
    } else if (question.type === 'multiple_choice') {
      // First option is typically the compliant answer
      if (question.options && response === question.options[0]) {
        categoryScores[question.category] += question.weight;
      } else if (question.options && response === question.options[question.options.length - 1]) {
        // Last option is typically "Not applicable" - give full score
        categoryScores[question.category] += question.weight;
      }
    }
  });

  // Calculate overall score as weighted average
  let totalScore = 0;
  let totalMaxScore = 0;

  Object.keys(categoryScores).forEach((cat) => {
    totalScore += categoryScores[cat];
    totalMaxScore += maxScores[cat];
  });

  const overallScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

  // Convert category scores to percentages
  const categoryPercentages: Record<string, number> = {};
  Object.keys(categoryScores).forEach((cat) => {
    categoryPercentages[cat] = maxScores[cat] > 0 
      ? Math.round((categoryScores[cat] / maxScores[cat]) * 100) 
      : 0;
  });

  return {
    overallScore,
    categoryScores: categoryPercentages,
    maxScores,
    questionsAnswered,
    totalQuestions: applicableQuestions.length,
  };
}


/**
 * Generate action items based on responses
 */
export function generateLabourCodeActionItems(
  responses: Record<string, string>,
  industry?: IndustryType,
  employeeCount?: EmployeeCountRange
): Array<{ priority: 'high' | 'medium' | 'low'; text: string; category: string }> {
  const actionItems: Array<{ priority: 'high' | 'medium' | 'low'; text: string; category: string }> = [];

  // Get applicable questions only
  const applicableQuestions = industry && employeeCount
    ? getFilteredQuestions(industry, employeeCount)
    : LABOUR_CODE_QUESTIONS;

  const applicableIds = new Set(applicableQuestions.map(q => q.id));

  // Code on Wages actions
  if (applicableIds.has('wages_1') && responses['wages_1'] === 'no') {
    actionItems.push({
      priority: 'high',
      text: 'Immediately review and revise pay structures to meet notified minimum wages for your area and skill categories.',
      category: 'wages',
    });
  }
  if (applicableIds.has('wages_4') && responses['wages_4'] === 'no') {
    actionItems.push({
      priority: 'high',
      text: 'Restructure CTC to ensure basic wages constitute at least 50% of total remuneration. This affects PF and gratuity calculations.',
      category: 'wages',
    });
  }
  if (applicableIds.has('wages_3') && responses['wages_3'] === 'no') {
    actionItems.push({
      priority: 'medium',
      text: 'Update separation policies to ensure full and final settlement within 2 working days.',
      category: 'wages',
    });
  }
  if (applicableIds.has('wages_6') && responses['wages_6'] === 'no') {
    actionItems.push({
      priority: 'high',
      text: 'Conduct a pay equity audit to ensure gender pay parity for same or similar work.',
      category: 'wages',
    });
  }
  if (applicableIds.has('wages_7') && responses['wages_7'] === 'no') {
    actionItems.push({
      priority: 'medium',
      text: 'Implement bonus payment process for eligible employees earning ≤₹21,000/month.',
      category: 'wages',
    });
  }

  // Social Security actions
  if (applicableIds.has('ss_1') && responses['ss_1'] === 'no') {
    actionItems.push({
      priority: 'high',
      text: 'Enrol all eligible employees (≤₹15,000/month) in EPF immediately.',
      category: 'social_security',
    });
  }
  if (applicableIds.has('ss_3') && responses['ss_3'] === 'no') {
    actionItems.push({
      priority: 'high',
      text: 'Register all eligible employees (≤₹21,000/month) with ESIC.',
      category: 'social_security',
    });
  }
  if (applicableIds.has('ss_4') && responses['ss_4'] === 'no') {
    actionItems.push({
      priority: 'high',
      text: 'Obtain compulsory gratuity insurance coverage - this is a new mandatory requirement.',
      category: 'social_security',
    });
  }
  if (applicableIds.has('ss_5') && responses['ss_5'] === 'no') {
    actionItems.push({
      priority: 'medium',
      text: 'Update fixed-term employee policies to include pro-rata gratuity after 1 year of service.',
      category: 'social_security',
    });
  }
  if (applicableIds.has('ss_7') && responses['ss_7'] === 'No, we don\'t contribute') {
    actionItems.push({
      priority: 'high',
      text: 'Initiate Social Security Fund contributions (1-2% of turnover) for gig/platform workers.',
      category: 'social_security',
    });
  }
  if (applicableIds.has('ss_8') && responses['ss_8'] === 'No crèche facility') {
    actionItems.push({
      priority: 'medium',
      text: 'Establish crèche facility - mandatory for 50+ employees. Can be in-house or tie-up with nearby facility.',
      category: 'social_security',
    });
  }

  // OSH Code actions
  if (applicableIds.has('osh_1') && responses['osh_1'] === 'no') {
    actionItems.push({
      priority: 'high',
      text: 'Complete single registration via Shram Suvidha Portal (shramsuvidha.gov.in) within 60 days.',
      category: 'osh',
    });
  }
  if (applicableIds.has('osh_3') && responses['osh_3'] === 'no') {
    actionItems.push({
      priority: 'medium',
      text: 'Implement mandatory consent mechanism before assigning overtime work.',
      category: 'osh',
    });
  }
  if (applicableIds.has('osh_4') && responses['osh_4'] === 'No provisions in place') {
    actionItems.push({
      priority: 'high',
      text: 'Establish safety measures and transport facility for women employees on night shifts.',
      category: 'osh',
    });
  }
  if (applicableIds.has('osh_5') && responses['osh_5'] === 'No, contractor is not licensed') {
    actionItems.push({
      priority: 'high',
      text: 'Ensure all contractors engaging 50+ workers have valid licences (5-year all-India validity).',
      category: 'osh',
    });
  }
  if (applicableIds.has('osh_6') && responses['osh_6'] === 'No, also in core activities') {
    actionItems.push({
      priority: 'high',
      text: 'Review and restrict contract labour deployment to non-core activities only.',
      category: 'osh',
    });
  }
  if (applicableIds.has('osh_7') && responses['osh_7'] === 'No canteen facility') {
    actionItems.push({
      priority: 'medium',
      text: 'Establish canteen facility - mandatory for 100+ workers. Can be in-house or contracted.',
      category: 'osh',
    });
  }

  // Industrial Relations actions
  if (applicableIds.has('ir_1') && responses['ir_1'] === 'no') {
    actionItems.push({
      priority: 'high',
      text: 'Constitute a Grievance Redressal Committee with equal employer-worker representation.',
      category: 'industrial_relations',
    });
  }
  if (applicableIds.has('ir_2') && responses['ir_2'] === 'In process of certification') {
    actionItems.push({
      priority: 'medium',
      text: 'Expedite Standing Orders certification. Model orders can be adopted as interim measure.',
      category: 'industrial_relations',
    });
  }
  if (applicableIds.has('ir_3') && responses['ir_3'] === 'No Works Committee') {
    actionItems.push({
      priority: 'medium',
      text: 'Constitute Works Committee with equal employer-worker representation.',
      category: 'industrial_relations',
    });
  }
  if (applicableIds.has('ir_5') && responses['ir_5'] === 'no') {
    actionItems.push({
      priority: 'medium',
      text: 'Establish a formal mechanism to receive and acknowledge 14-day strike notices.',
      category: 'industrial_relations',
    });
  }
  if (applicableIds.has('ir_6') && responses['ir_6'] === 'no') {
    actionItems.push({
      priority: 'high',
      text: 'Update fixed-term employment policies to ensure equal treatment with permanent workers.',
      category: 'industrial_relations',
    });
  }

  return actionItems.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Get compliance status based on score
 */
export function getComplianceStatus(score: number): {
  status: string;
  color: string;
  description: string;
} {
  const s = score >= 90 ? 'compliant' : score >= 70 ? 'needs_attention' : 'non_compliant'
  if (s === 'compliant') {
    return { status: 'Ready', color: 'green', description: 'Your organisation is well-prepared for the new Labour Codes.' }
  } else if (s === 'needs_attention') {
    return { status: 'Needs Attention', color: 'amber', description: 'Several areas require attention before full Labour Code implementation.' }
  } else {
    return { status: 'At Risk', color: 'red', description: 'Significant gaps exist. Immediate action required for Labour Code compliance.' }
  }
}
