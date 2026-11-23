/**
 * Where a newsletter sign-up came from, and the exact wording the person saw.
 * Client-safe: the UI renders CONSENT_TEXT and the subscribe route stores the
 * same string, so the consent record matches what was on screen.
 */

export const NEWSLETTER_SOURCES = ['home', 'checkout', 'email_gate'] as const
export type NewsletterSource = (typeof NEWSLETTER_SOURCES)[number]

export const NEWSLETTER_CONSENT_TEXT =
  'Send me the ComplianceCheck weekly newsletter: new calculators, assessments and compliance articles. I can unsubscribe at any time.'

export function isNewsletterSource(v: unknown): v is NewsletterSource {
  return typeof v === 'string' && (NEWSLETTER_SOURCES as readonly string[]).includes(v)
}
