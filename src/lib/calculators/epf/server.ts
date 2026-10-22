/**
 * Server-only data access for the PF calculator. Shared by the server
 * actions (src/app/calculator/pf/actions.ts) and the sendBeacon route.
 *
 * Service clients are created per call (CLAUDE.md §3). Missing Supabase env
 * vars never throw to the client — writes become no-ops.
 */

import { createHash, randomBytes } from 'crypto'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit } from '@/lib/rate-limit'
import { ENGINE_VERSION } from './types'
import { LEAD_PURPOSES, PF_LEAD_CONSENT, TEAM_SIZE_BANDS } from './consent'
import type { PfState } from './url-state'
import { coerceState, pfStateSchema } from './url-state-schema'

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

/** One-way key for rate limiting; the raw IP is never stored or logged. */
export const ipKey = (ip: string | null | undefined) =>
  createHash('sha256').update(`pf:${ip ?? 'unknown'}`).digest('hex').slice(0, 16)

// ---------------------------------------------------------------------------
// Session log
// ---------------------------------------------------------------------------

export const sessionPayloadSchema = z.object({
  anonId: z.string().min(4).max(80).regex(/^[A-Za-z0-9_.:-]+$/),
  paramsVersion: z.string().max(20),
  salaryBand: z.enum(['<15k', '15k-25k', '25k-50k', '50k-1L', '1L+']),
  inputs: z.object({
    age: z.number(),
    retirement_age: z.number(),
    hike_pct: z.number(),
    step_up_month: z.number(),
    vpf_pct: z.number(),
    scenario: z.string().max(20),
    basis: z.string().max(10),
    eps_member: z.boolean(),
    labour_code: z.boolean(),
    eps_ceiling_reading: z.string().max(10),
    tax_regime: z.string().max(5),
  }).strict(),
  summary: z.object({
    years: z.number(),
    corpus_band: z.string().max(12),
    xirr_corpus: z.number().nullable(),
    xirr_own: z.number().nullable(),
    pension_eligible: z.boolean(),
    tax_threshold_hit: z.boolean(),
    cap_freeze: z.boolean(),
    engine_ms: z.number(),
  }).strict(),
})

export type SessionPayload = z.infer<typeof sessionPayloadSchema>

/** 20 logs per anon id and 60 per IP per hour (in-memory, per instance). */
export async function insertPfSession(raw: unknown, ip: string | null, userId: string | null = null): Promise<{ ok: boolean; id?: string; reason?: string }> {
  const parsed = sessionPayloadSchema.safeParse(raw)
  if (!parsed.success) return { ok: false, reason: 'invalid' }
  const p = parsed.data
  if (!checkRateLimit(`pf-session:anon:${p.anonId}`, 20, 3_600_000) || !checkRateLimit(`pf-session:ip:${ipKey(ip)}`, 60, 3_600_000)) {
    return { ok: false, reason: 'rate_limited' }
  }
  const db = serviceClient()
  if (!db) return { ok: true, id: `local_${Date.now()}` }
  try {
    const { data, error } = await db
      .from('pf_calc_sessions')
      .insert({
        user_id: userId,
        anon_id: p.anonId,
        engine_version: ENGINE_VERSION,
        params_version: p.paramsVersion,
        salary_band: p.salaryBand,
        inputs: p.inputs,
        results_summary: p.summary,
      })
      .select('id')
      .single()
    if (error) throw error
    return { ok: true, id: data.id as string }
  } catch (err) {
    console.error('[pf] session insert failed:', err)
    return { ok: false, reason: 'db_error' }
  }
}

// ---------------------------------------------------------------------------
// Share links
// ---------------------------------------------------------------------------

export async function createPfShare(rawState: unknown, ip: string | null): Promise<{ ok: true; slug: string } | { ok: false; reason: string }> {
  const parsed = pfStateSchema.safeParse(rawState)
  if (!parsed.success) return { ok: false, reason: 'invalid' }
  if (!checkRateLimit(`pf-share:${ipKey(ip)}`, 30, 3_600_000)) return { ok: false, reason: 'rate_limited' }
  const db = serviceClient()
  if (!db) return { ok: false, reason: 'unavailable' }
  const slug = randomBytes(8).toString('base64url') // 11 chars
  try {
    const { error } = await db.from('pf_calc_shares').insert({ slug, inputs: parsed.data })
    if (error) throw error
    return { ok: true, slug }
  } catch (err) {
    console.error('[pf] share insert failed:', err)
    return { ok: false, reason: 'db_error' }
  }
}

/** Read a share by exact slug through get_pf_share(); null if missing/expired/unavailable. */
export async function loadPfShare(slug: string): Promise<PfState | null> {
  if (!/^[A-Za-z0-9_-]{8,32}$/.test(slug)) return null
  const db = anonClient()
  if (!db) return null
  try {
    const { data, error } = await db.rpc('get_pf_share', { p_slug: slug })
    if (error || !data) return null
    return coerceState(data)
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

export const leadSchema = z.object({
  email: z.string().trim().email().max(254),
  name: z.string().trim().max(100).optional().or(z.literal('')),
  company: z.string().trim().max(150).optional().or(z.literal('')),
  teamSizeBand: z.enum(TEAM_SIZE_BANDS).optional(),
  purpose: z.enum(LEAD_PURPOSES),
  consent: z.literal(true),
  consentVersion: z.literal(PF_LEAD_CONSENT.version),
  sessionId: z.string().uuid().optional(),
})

export async function insertPfLead(raw: unknown, ip: string | null): Promise<{ ok: boolean; reason?: string }> {
  const parsed = leadSchema.safeParse(raw)
  if (!parsed.success) return { ok: false, reason: 'invalid' }
  if (!checkRateLimit(`pf-lead:${ipKey(ip)}`, 10, 3_600_000)) return { ok: false, reason: 'rate_limited' }
  const l = parsed.data
  const db = serviceClient()
  if (!db) return { ok: true }
  try {
    const { error } = await db.from('leads').insert({
      email: l.email,
      name: l.name || null,
      company: l.company || null,
      team_size_band: l.teamSizeBand ?? null,
      purpose: l.purpose,
      source: 'pf_calculator',
      consent_text_version: l.consentVersion,
      consent_at: new Date().toISOString(),
      source_session_id: l.sessionId ?? null,
    })
    if (error) throw error
    return { ok: true }
  } catch (err) {
    console.error('[pf] lead insert failed:', err)
    return { ok: false, reason: 'db_error' }
  }
}
