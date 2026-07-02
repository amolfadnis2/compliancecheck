/**
 * Entitlement gate — the real paywall.
 *
 * Single source of truth for "has this assessment been paid or waived?", used by
 * the results page, the server PDF route, and the email route. The visible
 * <PaymentGate> only reflects the server's verdict; THIS is what actually
 * protects the detailed report.
 *
 * Server-only — reads the unified `assessment_entitlements` table with the
 * service-role key. Never import from a client component.
 *
 * Uses a `cache: 'no-store'` fetch override (same pattern as the results page)
 * so that immediately after payment, a router.refresh() sees the fresh status
 * rather than a stale Next.js fetch-cache entry.
 */

import { createClient } from '@supabase/supabase-js'

export type EntitlementStatus = 'paid' | 'waived' | 'none'

function noStoreAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      global: {
        fetch: (url: RequestInfo | URL, init?: RequestInit) =>
          fetch(url, { ...init, cache: 'no-store' }),
      },
    }
  )
}

/**
 * Resolve the entitlement status for an assessment. Returns 'none' if the DB is
 * unconfigured or on any error — callers decide whether that hard-blocks (PDF /
 * email routes) or falls through to the free flow (results page).
 */
export async function getEntitlement(
  assessmentId: string,
  assessmentType: string
): Promise<EntitlementStatus> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return 'none'
    }

    const supabase = noStoreAdminClient()
    const { data, error } = await supabase
      .from('assessment_entitlements')
      .select('status')
      .eq('assessment_id', assessmentId)
      .eq('assessment_type', assessmentType)
      .in('status', ['paid', 'waived'])
      .maybeSingle()

    if (error || !data) return 'none'
    return data.status === 'paid' ? 'paid' : 'waived'
  } catch (err) {
    console.error('[entitlement] lookup failed:', err)
    return 'none'
  }
}

/** Convenience boolean: true when the assessment is paid or waived. */
export async function isEntitled(
  assessmentId: string,
  assessmentType: string
): Promise<boolean> {
  return (await getEntitlement(assessmentId, assessmentType)) !== 'none'
}
