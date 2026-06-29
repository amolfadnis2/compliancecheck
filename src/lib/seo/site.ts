/**
 * Central site-level SEO constants.
 *
 * SITE_URL is the canonical production origin. Several legacy files still inline
 * the literal string; new code should import from here so there is one place to
 * change the domain.
 */

export const SITE_URL = 'https://compliancecheck.co.in'
export const SITE_NAME = 'ComplianceCheck'
export const SITE_TAGLINE =
  'Pay-as-you-go compliance assessments for Indian SMEs'

/** Build an absolute URL from a path (e.g. "/blog" -> full URL). */
export function absoluteUrl(path = '/'): string {
  if (path.startsWith('http')) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
