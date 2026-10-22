'use server'

import { headers } from 'next/headers'
import { z } from 'zod'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createPfShare, insertPfLead, insertPfSession } from '@/lib/calculators/epf/server'
import { pfStateSchema } from '@/lib/calculators/epf/url-state-schema'

function clientIp(): string | null {
  const h = headers()
  return h.get('x-nf-client-connection-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
}

async function currentUserId(): Promise<string | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null
  try {
    const supabase = await createServerClient()
    const { data } = await supabase.auth.getUser()
    return data.user?.id ?? null
  } catch {
    return null
  }
}

/** Debounced from the client; stores salary band + results summary only. */
export async function logCalcSession(payload: unknown) {
  try {
    return await insertPfSession(payload, clientIp(), await currentUserId())
  } catch (err) {
    console.error('[pf] logCalcSession failed:', err)
    return { ok: false, reason: 'error' }
  }
}

export async function sharePfCalc(state: unknown): Promise<{ ok: true; path: string } | { ok: false; reason: string }> {
  try {
    const res = await createPfShare(state, clientIp())
    return res.ok ? { ok: true, path: `/calculator/pf?s=${res.slug}` } : res
  } catch (err) {
    console.error('[pf] sharePfCalc failed:', err)
    return { ok: false, reason: 'error' }
  }
}

const saveSchema = z.object({ name: z.string().trim().min(1).max(120), state: pfStateSchema })

/** Logged-in users only. RLS (user_id = auth.uid()) is the real guard. */
export async function savePfCalc(raw: unknown): Promise<{ ok: true } | { ok: false; reason: 'auth' | 'invalid' | 'error' }> {
  const parsed = saveSchema.safeParse(raw)
  if (!parsed.success) return { ok: false, reason: 'invalid' }
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { ok: false, reason: 'auth' }
    const supabase = await createServerClient()
    const { data } = await supabase.auth.getUser()
    if (!data.user) return { ok: false, reason: 'auth' }
    const { error } = await supabase
      .from('pf_calc_saved')
      .insert({ user_id: data.user.id, name: parsed.data.name, inputs: parsed.data.state })
    if (error) throw error
    return { ok: true }
  } catch (err) {
    console.error('[pf] savePfCalc failed:', err)
    return { ok: false, reason: 'error' }
  }
}

export async function capturePfLead(raw: unknown) {
  try {
    return await insertPfLead(raw, clientIp())
  } catch (err) {
    console.error('[pf] capturePfLead failed:', err)
    return { ok: false, reason: 'error' }
  }
}
