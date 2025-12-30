import { MetadataRoute } from 'next'

/**
 * Next.js 14 Dynamic Sitemap Generator
 * 
 * This file generates sitemap.xml automatically at /sitemap.xml
 * Google will crawl this to discover all pages on the site.
 * 
 * Pages included:
 * - All public-facing pages (home, assessments, calculators, legal pages)
 * 
 * Pages excluded:
 * - Authentication routes (login, register, logout, reset-password)
 * - API routes
 * - Dynamic result pages (require completed assessment)
 */

const BASE_URL = 'https://compliancecheck.co.in'

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString()

  // Static pages with their priorities and change frequencies
  const staticPages: MetadataRoute.Sitemap = [
    // Homepage - highest priority
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },

    // Calculator pages - high traffic targets (from SEO strategy)
    {
      url: `${BASE_URL}/calculator/ctc`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/calculator/gratuity`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },

    // Assessment pages - core product offerings
    {
      url: `${BASE_URL}/assessment/statutory-health`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/assessment/labour-code`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/assessment/dpdp`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/assessment/state-wise-compliance`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },

    // Document templates
    {
      url: `${BASE_URL}/documents/employee-consent`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },

    // Legal pages - important for E-E-A-T
    {
      url: `${BASE_URL}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]

  return staticPages
}
