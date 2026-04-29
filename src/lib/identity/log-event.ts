'use server'

import { createClient } from '@/lib/supabase/server'

export async function logEvent(
  eventName: string,
  properties: Record<string, unknown> = {}
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('events').insert({
    user_id: user.id,
    event_name: eventName,
    properties,
  })
}
