/**
 * Browser helper: record an explicit newsletter opt-in. The server emails a
 * confirmation link; the person is only subscribed once they click it.
 */

import { analytics } from '@/lib/analytics/tracking'
import type { NewsletterSource } from './consent'

/** Resolves to an error message, or null on success. Never throws. */
export async function requestNewsletterSignup(email: string, source: NewsletterSource): Promise<string | null> {
  try {
    const res = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source, consent: true }),
    })
    const data = await res.json().catch(() => ({}))
    analytics.newsletterSignupRequested({ source, succeeded: res.ok })
    return res.ok ? null : data.error || 'Could not subscribe right now. Please try again later.'
  } catch {
    analytics.newsletterSignupRequested({ source, succeeded: false })
    return 'Could not subscribe right now. Please try again later.'
  }
}
