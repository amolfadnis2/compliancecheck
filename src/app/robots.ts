import { MetadataRoute } from 'next'

/**
 * Next.js 14 Dynamic Robots.txt Generator
 * 
 * This file generates robots.txt automatically at /robots.txt
 * Controls which pages search engines can crawl.
 * 
 * Allowed:
 * - All public pages (home, assessments, calculators, legal)
 * 
 * Disallowed:
 * - /api/ - API routes (no value for crawlers)
 * - /auth/ - Authentication flows (login, register, etc.)
 * - /results/ - Dynamic result pages (no SEO value, require auth)
 * - /logout - No SEO value
 * - /reset-password - No SEO value
 */

const BASE_URL = 'https://compliancecheck.co.in'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/auth/',
          '/results/',
          '/logout',
          '/reset-password',
          '/forgot-password',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
