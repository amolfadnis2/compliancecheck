/**
 * Server-only newsletter helpers: Resend client, link builders, and the
 * double-opt-in confirmation email. Clients are created lazily (CLAUDE.md sec 3).
 */

import { Resend } from 'resend'
import { SITE_URL } from '@/lib/seo/site'
import { CONFIRM_TTL_MS, APPROVE_TTL_MS, signNewsletterToken } from './token'

let _resend: Resend | null = null
export function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

export function newsletterFrom(): string {
  return process.env.NEWSLETTER_FROM || 'ComplianceCheck <noreply@compliancecheck.co.in>'
}

export function baseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || SITE_URL).replace(/\/$/, '')
}

export function normaliseEmail(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const email = v.trim().toLowerCase()
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
  return email
}

export function confirmUrl(subscriberId: number): string {
  return `${baseUrl()}/newsletter/confirm?token=${signNewsletterToken('confirm', String(subscriberId), CONFIRM_TTL_MS)}`
}

/** Link in the email body: a page with an "Unsubscribe" button. */
export function unsubscribePageUrl(subscriberId: number): string {
  return `${baseUrl()}/newsletter/unsubscribe?token=${signNewsletterToken('unsubscribe', String(subscriberId))}`
}

/** RFC 8058 one-click target for the List-Unsubscribe header (mail clients POST here). */
export function oneClickUnsubscribeUrl(subscriberId: number): string {
  return `${baseUrl()}/api/newsletter/unsubscribe?token=${signNewsletterToken('unsubscribe', String(subscriberId))}`
}

export function approveUrl(issueId: string): string {
  return `${baseUrl()}/newsletter/approve?token=${signNewsletterToken('approve', issueId, APPROVE_TTL_MS)}`
}

export async function sendConfirmationEmail(email: string, subscriberId: number): Promise<void> {
  const link = confirmUrl(subscriberId)
  const { error } = await getResend().emails.send({
    from: newsletterFrom(),
    to: [email],
    subject: 'Confirm your ComplianceCheck newsletter subscription',
    html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111827;">
  <h1 style="font-size:20px;margin:0 0 12px 0;">Confirm your subscription</h1>
  <p style="font-size:15px;line-height:1.5;margin:0 0 20px 0;">Click below to start getting the ComplianceCheck weekly newsletter: new calculators, assessments and compliance articles, once a week.</p>
  <p style="margin:0 0 24px 0;"><a href="${link}" style="display:inline-block;background:#15803d;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">Confirm subscription</a></p>
  <p style="font-size:13px;line-height:1.5;color:#6b7280;margin:0;">If you did not ask for this, ignore this email and you will not be subscribed. The link expires in 7 days.</p>
</div>`,
    text: `Confirm your ComplianceCheck newsletter subscription:\n${link}\n\nIf you did not ask for this, ignore this email and you will not be subscribed. The link expires in 7 days.`,
  })
  if (error) throw new Error(`Resend: ${error.message}`)
}
