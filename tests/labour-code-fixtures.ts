/**
 * Labour Code Test Fixtures
 * 
 * Test data for Labour Code Readiness Assessment
 */

export const LABOUR_CODE_COMPANIES = {
  microIT: {
    companyName: 'Micro IT Solutions',
    employeeCount: '1-9',
    industry: 'it_services',
    state: 'Karnataka',
    email: 'micro-it@test.com',
    expectedQuestions: { min: 8, max: 15 }
  },
  
  smallRetail: {
    companyName: 'Small Retail Store',
    employeeCount: '10-19',
    industry: 'retail',
    state: 'Maharashtra',
    email: 'small-retail@test.com',
    expectedQuestions: { min: 12, max: 20 }
  },
  
  mediumIT: {
    companyName: 'Medium Tech Company Pvt Ltd',
    employeeCount: '20-49',
    industry: 'it_services',
    state: 'Karnataka',
    email: 'medium-it@test.com',
    expectedQuestions: { min: 15, max: 23 }
  },
  
  mediumManufacturing: {
    companyName: 'Medium Manufacturing Ltd',
    employeeCount: '50-99',
    industry: 'manufacturing',
    state: 'Tamil Nadu',
    email: 'medium-mfg@test.com',
    expectedQuestions: { min: 20, max: 28 }
  },
  
  largeManufacturing: {
    companyName: 'Large Manufacturing Industries Ltd',
    employeeCount: '100-249',
    industry: 'manufacturing',
    state: 'Gujarat',
    email: 'large-mfg@test.com',
    expectedQuestions: { min: 24, max: 30 }
  },
  
  enterpriseManufacturing: {
    companyName: 'Enterprise Manufacturing Corporation',
    employeeCount: '500+',
    industry: 'manufacturing',
    state: 'Maharashtra',
    email: 'enterprise-mfg@test.com',
    expectedQuestions: { min: 28, max: 33 }
  },
  
  mediumHealthcare: {
    companyName: 'Healthcare Services Pvt Ltd',
    employeeCount: '50-99',
    industry: 'healthcare',
    state: 'Delhi',
    email: 'healthcare@test.com',
    expectedQuestions: { min: 18, max: 26 }
  },
};

export const EMPLOYEE_THRESHOLDS = {
  epf_bonus_grc: 20,      // EPF, Bonus, Grievance Redressal Committee
  creche_contract: 50,     // Crèche, Contract Labour Registration
  canteen_works: 100,      // Canteen, Works Committee  
  welfare_safety: 250,     // Welfare Officer (if hazardous)
  standing_retrench: 300,  // Standing Orders, Prior Retrenchment Permission
  safety_committee: 500,   // Safety Committee (general industries)
};

export const INDUSTRY_SPECIFIC = {
  manufacturing: {
    additionalQuestions: [
      'Factory registration',
      'Hazardous processes',
      'Safety equipment',
      'Machinery guards',
      'Fire safety measures',
      'Emergency exits',
      'First aid facilities'
    ]
  },
  
  it_services: {
    excludedQuestions: [
      'Factory registration',
      'Hazardous processes',
      'Heavy machinery',
      'Industrial accidents'
    ]
  },
  
  construction: {
    additionalQuestions: [
      'BOCW registration',
      'Building cess',
      'Site safety',
      'Worker welfare'
    ]
  }
};

export const LABOUR_CODE_CATEGORIES = [
  'Code on Wages',
  'Code on Social Security',
  'Occupational Safety, Health and Working Conditions',
  'Industrial Relations Code'
];

export function getExpectedQuestionCount(employeeCount: string, industry: string): { min: number; max: number } {
  const empCount = parseEmployeeCount(employeeCount);
  
  let base = 8;  // Minimum questions for any company
  
  // Add questions based on employee thresholds
  if (empCount >= 10) base += 3;   // ESI, Gratuity
  if (empCount >= 20) base += 4;   // EPF, Bonus, GRC
  if (empCount >= 50) base += 3;   // Crèche, Contract labour
  if (empCount >= 100) base += 3;  // Canteen, Works Committee
  if (empCount >= 300) base += 2;  // Standing orders
  if (empCount >= 500) base += 2;  // Safety committee
  
  // Industry-specific adjustments
  if (industry === 'manufacturing') {
    base += 6;  // Factory-specific OSH questions
  } else if (industry === 'construction') {
    base += 4;  // BOCW-specific questions
  } else if (industry === 'it_services') {
    base -= 2;  // Fewer OSH questions
  }
  
  return {
    min: Math.max(8, base - 3),
    max: Math.min(35, base + 3)
  };
}

function parseEmployeeCount(range: string): number {
  if (range === '1-9') return 5;
  if (range === '10-19') return 15;
  if (range === '20-49') return 35;
  if (range === '50-99') return 75;
  if (range === '100-249') return 175;
  if (range === '250-299') return 275;
  if (range === '300-499') return 400;
  if (range === '500+') return 600;
  return 0;
}
