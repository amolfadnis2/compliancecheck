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
} as const;

// Type for assessment type values
export type AssessmentType = typeof ASSESSMENT_TYPES[keyof typeof ASSESSMENT_TYPES];

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
  };
  return displayNames[type] || type;
}

/**
 * LocalStorage key generator - ensures consistent keys
 */
export function getLocalStorageKey(assessmentId: string): string {
  return `assessment_${assessmentId}`;
}
