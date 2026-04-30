import { isPaidAssessment, type AssessmentType } from '@/lib/constants/assessment-types'

/**
 * Feature flags backed by env vars — no runtime dependency, tree-shakeable.
 *
 * NEXT_PUBLIC_FF_CTC_EMAIL_GATE:
 *   'off'   → no gate (control — default)
 *   'on'    → gate shown to everyone
 */

type FlagValue = 'off' | 'on'

export function getCTCEmailGateFlag(): FlagValue {
  const raw = process.env.NEXT_PUBLIC_FF_CTC_EMAIL_GATE
  if (raw === 'on') return 'on'
  return 'off'
}

/**
 * Returns true if the email gate should be shown for the CTC calculator.
 */
export function shouldShowCTCEmailGate(): boolean {
  return getCTCEmailGateFlag() === 'on'
}

/**
 * Returns true if email verification is required before showing assessment results.
 * Paid assessments always require verification; free assessments never do.
 */
export function shouldRequireEmailVerification(assessmentType: AssessmentType): boolean {
  return isPaidAssessment(assessmentType)
}
