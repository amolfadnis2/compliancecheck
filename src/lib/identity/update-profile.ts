'use server'

import { createClient } from '@/lib/supabase/server'
import type { ProfileUpdate } from './types'

export async function updateProfile(update: ProfileUpdate) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({ ...update, last_seen_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) throw new Error(`Profile update failed: ${error.message}`)
}

/**
 * Appends a source to sources_used if not already present and advances
 * lifecycle_stage from 'anonymous' → 'engaged' on first source interaction.
 */
export async function appendSource(source: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('sources_used, lifecycle_stage, first_source')
    .eq('id', user.id)
    .single()

  if (!profile) return

  const alreadyPresent = profile.sources_used?.includes(source)
  if (alreadyPresent) return

  const updatedSources = [...(profile.sources_used ?? []), source]
  const isFirstSource = profile.first_source === 'unknown'

  await supabase
    .from('profiles')
    .update({
      sources_used: updatedSources,
      ...(isFirstSource ? { first_source: source } : {}),
      last_seen_at: new Date().toISOString(),
    })
    .eq('id', user.id)
}
