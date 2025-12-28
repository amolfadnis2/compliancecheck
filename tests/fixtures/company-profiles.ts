/**
 * ComplianceCheck Test Fixtures - Company Profiles
 * 
 * Standardized test profiles for consistent testing across all assessments.
 * Use these profiles to ensure threshold-based filtering works correctly.
 */

export interface CompanyProfile {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  industry: string;
  employeeCount: string;
  state: string;
  // DPDP-specific
  dataPrincipals?: string;
  processesChildrenData?: boolean;
  transfersDataAbroad?: boolean;
  operatesPlatform?: boolean;
  // Expected behavior
  description: string;
}

/**
 * Standard test profiles covering all threshold boundaries
 */
export const COMPANY_PROFILES: Record<string, CompanyProfile> = {
  
  // Tiny startup - Below most thresholds
  TINY_IT: {
    id: 'tiny-it',
    name: 'Startup Test User',
    companyName: 'TinyTech Startup Pvt Ltd',
    email: 'test@tinytech.com',
    phone: '9876543210',
    industry: 'Information Technology',
    employeeCount: '1-9 employees',
    state: 'Karnataka',
    dataPrincipals: 'Less than 1 Lakh',
    processesChildrenData: false,
    transfersDataAbroad: false,
    operatesPlatform: false,
    description: 'Below EPF (20), ESI wages likely above ceiling, no Bonus/Gratuity'
  },

  // Small company - Just above ESI threshold (10+)
  SMALL_SERVICES: {
    id: 'small-services',
    name: 'Small Biz User',
    companyName: 'SmallServ Solutions',
    email: 'test@smallserv.com',
    phone: '9876543211',
    industry: 'Professional Services',
    employeeCount: '10-19 employees',
    state: 'Maharashtra',
    dataPrincipals: 'Less than 1 Lakh',
    processesChildrenData: false,
    transfersDataAbroad: false,
    operatesPlatform: false,
    description: 'ESI applicable, POSH applicable, below EPF (20)'
  },

  // Mid-size company - Above EPF threshold (20+)
  MID_IT: {
    id: 'mid-it',
    name: 'Mid IT User',
    companyName: 'MidSize Tech Pvt Ltd',
    email: 'test@midsize.com',
    phone: '9876543212',
    industry: 'Information Technology',
    employeeCount: '20-49 employees',
    state: 'Karnataka',
    dataPrincipals: '1-10 Lakh',
    processesChildrenData: false,
    transfersDataAbroad: false,
    operatesPlatform: true,
    description: 'EPF, ESI, POSH, Bonus all applicable'
  },

  // Manufacturing - Industry-specific rules
  MID_MANUFACTURING: {
    id: 'mid-manufacturing',
    name: 'Manufacturing User',
    companyName: 'IndiaManufacture Ltd',
    email: 'test@manufacture.com',
    phone: '9876543213',
    industry: 'Manufacturing',
    employeeCount: '50-99 employees',
    state: 'Gujarat',
    dataPrincipals: '1-10 Lakh',
    processesChildrenData: false,
    transfersDataAbroad: false,
    operatesPlatform: false,
    description: 'Factory Act applicable, Creche required (50+), all statutory'
  },

  // Large company - Canteen threshold (100+)
  LARGE_SERVICES: {
    id: 'large-services',
    name: 'Large Corp User',
    companyName: 'LargeCorp Services India',
    email: 'test@largecorp.com',
    phone: '9876543214',
    industry: 'Professional Services',
    employeeCount: '100-299 employees',
    state: 'Maharashtra',
    dataPrincipals: '10-50 Lakh',
    processesChildrenData: false,
    transfersDataAbroad: true,
    operatesPlatform: true,
    description: 'Canteen required (100+), Works Committee, all compliances'
  },

  // Enterprise - All thresholds exceeded
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise User',
    companyName: 'Enterprise Corp India Pvt Ltd',
    email: 'test@enterprise.com',
    phone: '9876543215',
    industry: 'Information Technology',
    employeeCount: '500+ employees',
    state: 'Tamil Nadu',
    dataPrincipals: 'More than 1 Crore',
    processesChildrenData: false,
    transfersDataAbroad: true,
    operatesPlatform: true,
    description: 'SDF likely, Welfare Officer (250+), Standing Orders (300+), all max'
  },

  // EdTech - Processes children data
  EDTECH_CHILDREN: {
    id: 'edtech-children',
    name: 'EdTech User',
    companyName: 'LearnKids EdTech Pvt Ltd',
    email: 'test@learnkids.com',
    phone: '9876543216',
    industry: 'Education & Training',
    employeeCount: '50-99 employees',
    state: 'Delhi',
    dataPrincipals: '10-50 Lakh',
    processesChildrenData: true,
    transfersDataAbroad: false,
    operatesPlatform: true,
    description: 'DPDP children data questions triggered, higher penalty multiplier'
  },

  // Healthcare - Sensitive data
  HEALTHCARE: {
    id: 'healthcare',
    name: 'Healthcare User',
    companyName: 'HealthCare Plus',
    email: 'test@healthcare.com',
    phone: '9876543217',
    industry: 'Healthcare & Pharma',
    employeeCount: '100-299 employees',
    state: 'Maharashtra',
    dataPrincipals: '50 Lakh - 1 Crore',
    processesChildrenData: false,
    transfersDataAbroad: false,
    operatesPlatform: false,
    description: 'Sensitive health data, likely SDF designation'
  }
};

/**
 * Get profile by ID
 */
export function getProfile(id: string): CompanyProfile {
  const profile = Object.values(COMPANY_PROFILES).find(p => p.id === id);
  if (!profile) {
    throw new Error(`Profile not found: ${id}`);
  }
  return profile;
}

/**
 * Get all profiles as array
 */
export function getAllProfiles(): CompanyProfile[] {
  return Object.values(COMPANY_PROFILES);
}

export default COMPANY_PROFILES;
