/**
 * Signed, expiring links to a paid report — what the WhatsApp message and the
 * report email carry, so a user can open or forward their PDF (e.g. to their
 * CA) without logging in.
 *
 * Token = base64url(JSON payload) "." base64url(HMAC-SHA256(payload)), keyed by
 * REPORT_SHARE_SECRET. It names one assessment and expires after 30 days. The
 * token only proves the owner chose to share; the share route still re-checks
 * the entitlement on every request, so an unpaid report never downloads.
 *
 * Server-only (node crypto + secret). The secret is read lazily so the module
 * is safe to evaluate at build time (CLAUDE.md sec 3).
 */

import crypto from 'crypto'

export const REPORT_SHARE_TTL_MS = 30 * 24 * 60 * 60 * 1000

export interface ReportTokenPayload {
  id: string
  type: string
  /** Expiry, ms since epoch. */
  exp: number
}

function getSecret(): string {
  const secret = process.env.REPORT_SHARE_SECRET
  if (!secret) throw new Error('REPORT_SHARE_SECRET is not configured')
  return secret
}

function sign(data: string): string {
  return crypto.createHmac('sha256', getSecret()).update(data).digest('base64url')
}

export function signReportToken(
  { id, type }: { id: string; type: string },
  now: number = Date.now()
): string {
  const payload = Buffer.from(JSON.stringify({ i: id, t: type, e: now + REPORT_SHARE_TTL_MS })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

/** The payload when the token is authentic and unexpired, else null. */
export function verifyReportToken(token: string, now: number = Date.now()): ReportTokenPayload | null {
  const [payload, signature, ...rest] = token.split('.')
  if (!payload || !signature || rest.length > 0) return null

  const expected = Buffer.from(sign(payload))
  const given = Buffer.from(signature)
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null

  try {
    const { i, t, e } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (typeof i !== 'string' || typeof t !== 'string' || typeof e !== 'number') return null
    if (e < now) return null
    return { id: i, type: t, exp: e }
  } catch {
    return null
  }
}

/** Absolute URL of the share route for a token. */
export function reportShareUrl(token: string, origin?: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL || origin || 'https://compliancecheck.co.in').replace(/\/$/, '')
  return `${base}/api/report/share/${token}`
}
