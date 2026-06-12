/**
 * ASSESSMENT TYPES - Single Source of Truth
 * 
 * IMPORTANT: Always import from this file. Never hardcode assessment type strings.
 * This prevents mismatches between API, frontend, and database.
 * 
 * Usage:
 *   import { ASSESSMENT_TYPES } from '@/lib/constants/assessment-types'
 *   
 *   // In API routes:
 *   assessment_type: ASSESSMENT_TYPES.DPDP
 *   
 *   // In components:
 *   if (type === ASSESSMENT_TYPES.LABOUR_CODE) { ... }
 */

export const ASSESSMENT_TYPES = {
  STATUTORY_HEALTH: 'statutory_health',
  LABOUR_CODE: 'labour_code',
  DPDP: 'dpdp',
  STATE_WISE_COMPLIANCE: 'state_wise_compliance',
  FOOD_BUSINESS: 'food_business',
  POSH: 'posh',
  AUTO_DEALER: 'auto_dealer',
} as const;

// Type for assessment type values
export type AssessmentType = typeof ASSESSMENT_TYPES[keyof typeof ASSESSMENT_TYPES];

export type PricingTier = 'free' | 'paid';

export const ASSESSMENT_PRICING: Record<AssessmentType, PricingTier> = {
  [ASSESSMENT_TYPES.DPDP]: 'free',
  [ASSESSMENT_TYPES.LABOUR_CODE]: 'free',
  [ASSESSMENT_TYPES.POSH]: 'paid',
  [ASSESSMENT_TYPES.STATUTORY_HEALTH]: 'free',
  [ASSESSMENT_TYPES.FOOD_BUSINESS]: 'free',
  [ASSESSMENT_TYPES.STATE_WISE_COMPLIANCE]: 'free',
  [ASSESSMENT_TYPES.AUTO_DEALER]: 'paid',
};

export function isPaidAssessment(type: AssessmentType): boolean {
  return ASSESSMENT_PRICING[type] === 'paid';
}

/**
 * Helper to validate if a string is a valid assessment type
 */
export function isValidAssessmentType(type: string): type is AssessmentType {
  return Object.values(ASSESSMENT_TYPES).includes(type as AssessmentType);
}

/**
 * Get display name for assessment type
 */
export function getAssessmentDisplayName(type: AssessmentType): string {
  const displayNames: Record<AssessmentType, string> = {
    [ASSESSMENT_TYPES.STATUTORY_HEALTH]: 'Statutory Health Check',
    [ASSESSMENT_TYPES.LABOUR_CODE]: 'Labour Code Readiness',
    [ASSESSMENT_TYPES.DPDP]: 'DPDP Gap Assessment',
    [ASSESSMENT_TYPES.STATE_WISE_COMPLIANCE]: 'State-Wise Compliance Check',
    [ASSESSMENT_TYPES.FOOD_BUSINESS]: 'Restaurant & Food Business Compliance',
    [ASSESSMENT_TYPES.POSH]: 'POSH Act 2013 Compliance',
    [ASSESSMENT_TYPES.AUTO_DEALER]: 'Auto Dealer Compliance Assessment',
  };
  return displayNames[type] || type;
}

/**
 * LocalStorage key generator - ensures consistent keys
 */
export function getLocalStorageKey(assessmentId: string): string {
  return `assessment_${assessmentId}`;
}

export function getComplianceStatus(score: number): 'compliant' | 'needs_attention' | 'non_compliant' {
  if (score >= 90) return 'compliant'
  if (score >= 70) return 'needs_attention'
  return 'non_compliant'
}

export function getStatusLabel(score: number): string {
  const s = getComplianceStatus(score)
  return s === 'compliant' ? 'Compliant' : s === 'needs_attention' ? 'Needs Attention' : 'Non-Compliant'
}

export const STATUS_COLOR = {
  compliant: '#16a34a',
  needs_attention: '#d97706',
  non_compliant: '#dc2626',
} as const
