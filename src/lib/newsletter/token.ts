/**
 * Signed tokens for newsletter links: confirm a subscription, unsubscribe,
 * and approve a weekly issue.
 *
 * Token = base64url(JSON payload) "." base64url(HMAC-SHA256(payload)), keyed by
 * NEWSLETTER_SECRET (same scheme as src/lib/report/share-token.ts). The purpose
 * is signed in, so an unsubscribe token can never be replayed as an approval.
 *
 * Server-only. The secret is read lazily (CLAUDE.md sec 3).
 */

import crypto from 'crypto'

export type NewsletterTokenPurpose = 'confirm' | 'unsubscribe' | 'approve'

export const CONFIRM_TTL_MS = 7 * 24 * 60 * 60 * 1000
export const APPROVE_TTL_MS = 7 * 24 * 60 * 60 * 1000

function getSecret(): string {
  const secret = process.env.NEWSLETTER_SECRET
  if (!secret) throw new Error('NEWSLETTER_SECRET is not configured')
  return secret
}

function sign(data: string): string {
  return crypto.createHmac('sha256', getSecret()).update(data).digest('base64url')
}

/**
 * @param subject subscriber id (confirm / unsubscribe) or issue id (approve)
 * @param ttlMs   omit for a token that never expires (unsubscribe links must keep working)
 */
export function signNewsletterToken(
  purpose: NewsletterTokenPurpose,
  subject: string,
  ttlMs?: number,
  now: number = Date.now()
): string {
  const body: { p: string; s: string; e?: number } = { p: purpose, s: subject }
  if (ttlMs !== undefined) body.e = now + ttlMs
  const payload = Buffer.from(JSON.stringify(body)).toString('base64url')
  return `${payload}.${sign(payload)}`
}

/** The subject when the token is authentic, unexpired and for `purpose`, else null. */
export function verifyNewsletterToken(
  token: string,
  purpose: NewsletterTokenPurpose,
  now: number = Date.now()
): string | null {
  const [payload, signature, ...rest] = token.split('.')
  if (!payload || !signature || rest.length > 0) return null

  const expected = Buffer.from(sign(payload))
  const given = Buffer.from(signature)
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null

  try {
    const { p, s, e } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (p !== purpose || typeof s !== 'string') return null
    if (e !== undefined && (typeof e !== 'number' || e < now)) return null
    return s
  } catch {
    return null
  }
}
