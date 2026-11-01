/**
 * Server-only partner-mode lookups (service role). Never import from a
 * client component.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import type { AssessmentType } from '@/lib/constants/assessment-types'
import { assessmentTableFor } from '@/lib/payment/assessment-table'
import { parsePreparedBy, SUBMISSION_MODES, type PreparedBy, type SubmissionMode } from './types'

export interface AssessmentPartner {
  preparedBy: PreparedBy | null
  preparerId: string | null
  submissionMode: SubmissionMode
}

const NONE: AssessmentPartner = { preparedBy: null, preparerId: null, submissionMode: SUBMISSION_MODES.SELF }

/**
 * Partner info stored on an assessment row. Returns "self" on any error —
 * including before the partner-mode migration has been applied — so callers
 * (email, payments) behave exactly as before for normal assessments.
 */
export async function getAssessmentPartner(
  type: AssessmentType,
  id: string,
  client?: SupabaseClient
): Promise<AssessmentPartner> {
  try {
    const supabase = client ?? createAdminClient()
    const { data, error } = await supabase
      .from(assessmentTableFor(type))
      .select('prepared_by, preparer_id, submission_mode')
      .eq('id', id)
      .maybeSingle()
    if (error || !data) return NONE
    const preparedBy = parsePreparedBy(data.prepared_by)
    if (!preparedBy) return NONE
    return {
      preparedBy,
      preparerId: data.preparer_id ?? null,
      submissionMode: (data.submission_mode as SubmissionMode) ?? SUBMISSION_MODES.PARTNER_ON_BEHALF,
    }
  } catch {
    return NONE
  }
}

/** Partner fields for server-side revenue events and entitlement rows. */
export function partnerEventProps(p: AssessmentPartner): {
  submission_mode?: SubmissionMode
  preparer_id?: string
  preparer_designation?: string
} {
  if (!p.preparedBy) return {}
  return {
    submission_mode: p.submissionMode,
    preparer_id: p.preparerId ?? undefined,
    preparer_designation: p.preparedBy.designation,
  }
}

/** Columns to add to an assessment_entitlements write ({} for self — migration-safe). */
export function partnerEntitlementColumns(p: AssessmentPartner): { submission_mode?: SubmissionMode; preparer_id?: string | null } {
  if (!p.preparedBy) return {}
  return { submission_mode: p.submissionMode, preparer_id: p.preparerId }
}
