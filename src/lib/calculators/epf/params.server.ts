/**
 * Server-only loader for EPF statutory params.
 *
 * Reads the public statutory_params / epf_interest_rates tables with the anon
 * key (RLS allows public SELECT) and caches for an hour under the
 * 'epf-params' tag. The admin dashboard busts it via revalidateTag.
 * Falls back to ./defaults.ts if Supabase is unconfigured or unreachable.
 */

import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { buildParams, type EpfRateRow, type LoadedEpfParams, type StatutoryParamRow } from './params'
import { FALLBACK_LOADED } from './defaults'

export const EPF_PARAMS_TAG = 'epf-params'

async function fetchFromSupabase(): Promise<Omit<LoadedEpfParams, 'params'> | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  // Created per call (inside the cache), never at module level — CLAUDE.md §3.
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const [params, rates] = await Promise.all([
    supabase.from('statutory_params').select('key, value, effective_from, effective_to, status, source_name, source_ref, source_url, verified_at, notes'),
    supabase.from('epf_interest_rates').select('fy, rate, status, cbt_meeting, decided_on, notified_on, source_url').order('fy'),
  ])
  if (params.error || rates.error || !params.data?.length || !rates.data?.length) return null

  const paramRows = params.data as StatutoryParamRow[]
  const rateRows = rates.data as EpfRateRow[]
  const verifiedAt = paramRows.reduce((m, r) => (r.verified_at.slice(0, 10) > m ? r.verified_at.slice(0, 10) : m), '')
  return { paramRows, rateRows, verifiedAt, fromFallback: false }
}

const cachedRows = unstable_cache(
  async () => {
    try {
      return await fetchFromSupabase()
    } catch (err) {
      console.error('[epf-params] Supabase fetch failed, using fallback:', err)
      return null
    }
  },
  ['epf-params-v1'],
  { tags: [EPF_PARAMS_TAG], revalidate: 3600 }
)

export async function loadEpfParams(): Promise<LoadedEpfParams> {
  const rows = await cachedRows()
  if (!rows) return FALLBACK_LOADED
  try {
    // Scalars are resolved per request date, so a row whose effective_from
    // passes takes over without a redeploy.
    const { params } = buildParams(rows.paramRows, rows.rateRows)
    return { ...rows, params }
  } catch (err) {
    console.error('[epf-params] Incomplete params in Supabase, using fallback:', err)
    return FALLBACK_LOADED
  }
}
