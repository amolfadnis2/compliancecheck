/**
 * POST /api/newsletter/subscribe  { email, source, consent: true }
 *
 * Records an explicit opt-in as 'pending' and emails a confirmation link
 * (double opt-in). The reply is the same whether or not the address is
 * already subscribed, so the endpoint does not reveal who is on the list.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit } from '@/lib/rate-limit'
import { NEWSLETTER_CONSENT_TEXT, isNewsletterSource } from '@/lib/newsletter/consent'
import { normaliseEmail, sendConfirmationEmail } from '@/lib/newsletter/server'

/** Don't resend a confirmation to the same address more often than this. */
const RESEND_COOLDOWN_MS = 10 * 60 * 1000

export async function POST(request: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY || !process.env.NEWSLETTER_SECRET) {
      return NextResponse.json({ error: 'Newsletter sign-up is not available right now.' }, { status: 503 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    if (!checkRateLimit(`newsletter:${ip}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
    }

    const body = await request.json().catch(() => ({}))
    const email = normaliseEmail(body.email)
    if (!email) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    if (body.consent !== true) return NextResponse.json({ error: 'Consent is required.' }, { status: 400 })
    const source = isNewsletterSource(body.source) ? body.source : 'home'

    const supabase = createAdminClient()
    const { data: existing, error: readError } = await supabase
      .from('newsletter_subscribers')
      .select('id, status, confirmation_sent_at')
      .eq('email', email)
      .maybeSingle()
    if (readError) throw readError

    if (existing?.status === 'active') return NextResponse.json({ ok: true })

    const now = new Date()
    if (
      existing?.status === 'pending' &&
      existing.confirmation_sent_at &&
      now.getTime() - new Date(existing.confirmation_sent_at).getTime() < RESEND_COOLDOWN_MS
    ) {
      return NextResponse.json({ ok: true })
    }

    const record = {
      email,
      status: 'pending',
      source,
      consent_text: NEWSLETTER_CONSENT_TEXT,
      consent_at: now.toISOString(),
      confirmation_sent_at: now.toISOString(),
      updated_at: now.toISOString(),
    }
    const { data: saved, error: writeError } = await supabase
      .from('newsletter_subscribers')
      .upsert(record, { onConflict: 'email' })
      .select('id')
      .single()
    if (writeError || !saved) throw writeError ?? new Error('upsert returned no row')

    await sendConfirmationEmail(email, saved.id as number)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('newsletter/subscribe failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Could not subscribe right now. Please try again later.' }, { status: 500 })
  }
}
