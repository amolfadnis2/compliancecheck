'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Idempotent: if a session already exists (anon or verified), returns it.
 * Only calls signInAnonymously if there is no current session at all.
 */
export async function ensureAnonUser() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    return { user: session.user, isNew: false }
  }

  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) {
    throw new Error(`Failed to create anonymous session: ${error.message}`)
  }

  return { user: data.user, isNew: true }
}
