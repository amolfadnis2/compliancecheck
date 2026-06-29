import { MetadataRoute } from 'next'
import { ASSESSMENT_META, describeAssessment } from '@/lib/seo/assessment-meta'
import { getAllPosts } from '@/lib/blog/posts'
import { getAllStateSlugs } from '@/lib/content/state-compliance'
import { SITE_URL } from '@/lib/seo/site'

/**
 * Next.js 14 Dynamic Sitemap Generator (/sitemap.xml)
 *
 * Assessment + landing URLs are derived from the assessment-meta single source
 * of truth (CLAUDE.md §9); blog posts and programmatic state guides are appended
 * automatically so new content is discoverable without editing this file.
 *
 * Excluded: auth, API, admin, and dynamic result pages (see robots.ts).
 */

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString()

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: currentDate, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/how-it-works`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.9 },
    // Calculators - high-traffic free tools
    { url: `${SITE_URL}/calculator/ctc`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/calculator/gratuity`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/calculators/compliance-penalty-calculator`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/calculators/compliance-penalty-calculator/methodology`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.8 },
    // Utility / legal
    { url: `${SITE_URL}/contact`, lastModified: currentDate, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE_URL}/documents/employee-consent`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/privacy`, lastModified: currentDate, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE_URL}/terms`, lastModified: currentDate, changeFrequency: 'yearly', priority: 0.5 },
  ]

  // Assessment + landing pages, from the single source of truth.
  const assessmentPages: MetadataRoute.Sitemap = ASSESSMENT_META.flatMap((meta) => {
    const d = describeAssessment(meta)
    return [
      { url: `${SITE_URL}${d.assessmentPath}`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.8 },
      { url: `${SITE_URL}${d.landingPath}`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.85 },
    ]
  })

  // Blog posts.
  const blogPages: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.lastReviewed ?? post.date,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  // Programmatic state guides.
  const stateGuidePages: MetadataRoute.Sitemap = getAllStateSlugs().map((slug) => ({
    url: `${SITE_URL}/guides/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticPages, ...assessmentPages, ...blogPages, ...stateGuidePages]
}
