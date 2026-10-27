/**
 * Which Supabase table holds an assessment's row. POSH and Auto Dealer keep
 * their own tables (CLAUDE.md §13, §14); everything else is in `assessments`.
 */

import { ASSESSMENT_TYPES, type AssessmentType } from '@/lib/constants/assessment-types'

export function assessmentTableFor(type: AssessmentType): string {
  if (type === ASSESSMENT_TYPES.POSH) return 'posh_assessments'
  if (type === ASSESSMENT_TYPES.AUTO_DEALER) return 'auto_dealer_assessments'
  return 'assessments'
}
