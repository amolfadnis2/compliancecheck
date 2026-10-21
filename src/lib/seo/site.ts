import type { Metadata } from 'next'

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

// The single public contact address. Every user-facing email mention must use
// this constant — mixed addresses (zohomail, wrong domains) have shipped before.
export const CONTACT_EMAIL = 'contact@compliancecheck.co.in'

/** Build an absolute URL from a path (e.g. "/blog" -> full URL). */
export function absoluteUrl(path = '/'): string {
  if (path.startsWith('http')) return path
  // Canonical form of the homepage has no trailing slash.
  if (path === '/' || path === '') return SITE_URL
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Sitewide default Open Graph block (no `url`: each page sets its own). Pages
 * that override `openGraph` replace this object entirely, so spread it.
 */
export const DEFAULT_OPEN_GRAPH: NonNullable<Metadata['openGraph']> = {
  title: "ComplianceCheck - Instant Compliance Assessments for Indian Businesses",
  description: "Pay-as-you-go compliance assessments. Get gap analysis, action items & PDF reports in 15 minutes.",
  siteName: 'ComplianceCheck',
  locale: 'en_IN',
  type: 'website',
  images: [
    {
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'ComplianceCheck - Pay-as-you-go Assessments for Indian SMEs'
    }
  ]
}
