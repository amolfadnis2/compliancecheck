/**
 * POST /api/newsletter/unsubscribe
 *
 * Two callers:
 *  - the button on /newsletter/unsubscribe, sending JSON { token }
 *  - mail clients doing RFC 8058 one-click unsubscribe from the
 *    List-Unsubscribe header: POST ?token=... with a form body
 *    "List-Unsubscribe=One-Click"
 *
 * Idempotent: unsubscribing twice is fine.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyNewsletterToken } from '@/lib/newsletter/token'

export async function POST(request: NextRequest) {
  try {
    let token = request.nextUrl.searchParams.get('token')
    if (!token && request.headers.get('content-type')?.includes('application/json')) {
      const body = await request.json().catch(() => ({}))
      token = typeof body.token === 'string' ? body.token : null
    }

    const id = token ? verifyNewsletterToken(token, 'unsubscribe') : null
    if (!id) return NextResponse.json({ error: 'This unsubscribe link is invalid.' }, { status: 400 })

    const now = new Date().toISOString()
    const { error } = await createAdminClient()
      .from('newsletter_subscribers')
      .update({ status: 'unsubscribed', unsubscribed_at: now, updated_at: now })
      .eq('id', Number(id))
      .neq('status', 'unsubscribed')
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('newsletter/unsubscribe failed:', err instanceof Error ? err.message : err)
    return NextResponse.json(
      { error: 'Could not unsubscribe right now. Please try again, or email contact@compliancecheck.co.in.' },
      { status: 500 }
    )
  }
}
