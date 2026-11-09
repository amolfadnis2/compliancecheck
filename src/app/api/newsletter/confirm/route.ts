/**
 * POST /api/newsletter/confirm  { token }
 *
 * Called by the button on /newsletter/confirm (not by the email link itself,
 * so mail scanners that pre-fetch links cannot confirm on someone's behalf).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyNewsletterToken } from '@/lib/newsletter/token'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const id = typeof body.token === 'string' ? verifyNewsletterToken(body.token, 'confirm') : null
    if (!id) {
      return NextResponse.json({ error: 'This confirmation link is invalid or has expired. Please sign up again.' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const now = new Date().toISOString()
    // Only a pending row is activated: a later unsubscribe wins over an old confirmation link.
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ status: 'active', confirmed_at: now, unsubscribed_at: null, updated_at: now })
      .eq('id', Number(id))
      .eq('status', 'pending')
    if (error) throw error

    const { data } = await supabase.from('newsletter_subscribers').select('status').eq('id', Number(id)).maybeSingle()
    if (data?.status !== 'active') {
      return NextResponse.json({ error: 'This confirmation link is no longer valid. Please sign up again.' }, { status: 400 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('newsletter/confirm failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Could not confirm right now. Please try again later.' }, { status: 500 })
  }
}
