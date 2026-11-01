/**
 * Server-side partner mode helper for the assessment submit routes.
 *
 * Each route calls `resolvePartnerSubmission(supabase, body)` and spreads the
 * returned `columns` into its insert. It validates the browser's `preparedBy`
 * (an invalid or missing one silently means a normal self-submission — never
 * a failed assessment), upserts `report_preparers` by email and returns the
 * snapshot to store on the row.
 *
 * Server-only: pass a service-role client (report_preparers has no anon policy).
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { parsePreparedBy, SUBMISSION_MODES, type PreparedBy, type SubmissionMode } from './types'

export interface PartnerSubmission {
  submissionMode: SubmissionMode
  preparedBy: PreparedBy | null
  preparerId: string | null
  /**
   * Spread into the assessment row insert. Empty for self-submissions so a
   * normal assessment never depends on the partner-mode migration having run.
   */
  columns: { submission_mode?: SubmissionMode; preparer_id?: string | null; prepared_by?: PreparedBy | null }
}

const SELF: PartnerSubmission = {
  submissionMode: SUBMISSION_MODES.SELF,
  preparedBy: null,
  preparerId: null,
  columns: {},
}

/** Validate only (no DB) — for the local/temp fallback paths. */
export function parsePartnerBody(body: unknown): PreparedBy | null {
  if (!body || typeof body !== 'object') return null
  const b = body as { submissionMode?: unknown; preparedBy?: unknown }
  if (b.submissionMode !== SUBMISSION_MODES.PARTNER_ON_BEHALF) return null
  return parsePreparedBy(b.preparedBy)
}

export async function resolvePartnerSubmission(
  supabase: SupabaseClient | null,
  body: unknown
): Promise<PartnerSubmission> {
  const preparedBy = parsePartnerBody(body)
  if (!preparedBy) return SELF

  let preparerId: string | null = null
  if (supabase) {
    try {
      const logoPath = preparedBy.logoUrl?.split('/report-logos/')[1] ?? null
      const { data, error } = await supabase
        .from('report_preparers')
        .upsert(
          {
            email: preparedBy.email.toLowerCase(),
            firm_name: preparedBy.firmName,
            preparer_name: preparedBy.preparerName,
            designation: preparedBy.designation,
            phone: preparedBy.phone ?? null,
            website: preparedBy.website ?? null,
            city: preparedBy.city ?? null,
            logo_path: logoPath,
            brand_color: preparedBy.brandColor ?? null,
            attested_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'email' }
        )
        .select('id')
        .single()
      if (error) console.error('[partner] preparer upsert failed:', error.message)
      preparerId = data?.id ?? null
    } catch (err) {
      // Never fail an assessment over partner bookkeeping — the snapshot on the
      // row is what drives the branded report.
      console.error('[partner] preparer upsert error:', err)
    }
  }

  return {
    submissionMode: SUBMISSION_MODES.PARTNER_ON_BEHALF,
    preparedBy,
    preparerId,
    columns: { submission_mode: SUBMISSION_MODES.PARTNER_ON_BEHALF, preparer_id: preparerId, prepared_by: preparedBy },
  }
}
