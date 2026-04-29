import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [profileRes, eventsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('events').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  const payload = {
    exported_at: new Date().toISOString(),
    user_id: user.id,
    profile: profileRes.data ?? null,
    events: eventsRes.data ?? [],
    calendar_subscriptions: [],
    assessments: [],
  }

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="my-compliancecheck-data.json"',
    },
  })
}
