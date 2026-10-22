import { MetadataRoute } from 'next'
import { ASSESSMENT_META, describeAssessment } from '@/lib/seo/assessment-meta'
import { getAllPosts } from '@/lib/blog/posts'
import { getAllStateSlugs } from '@/lib/content/state-compliance'
import { SITE_URL } from '@/lib/seo/site'
import { PAYROLL_RULES_LAST_REVIEWED } from '@/lib/calculators/payroll-statutory-calculator'

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
  // lastModified is only set where a real content date exists (blog frontmatter,
  // calculator rules review date). Never use the build time.
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/how-it-works`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'weekly', priority: 0.9 },
    // Calculators - high-traffic free tools
    { url: `${SITE_URL}/calculator/ctc`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/calculator/gratuity`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/calculator/pf-esi-pt`, lastModified: PAYROLL_RULES_LAST_REVIEWED, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/calculators/compliance-penalty-calculator`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/calculators/compliance-penalty-calculator/methodology`, changeFrequency: 'monthly', priority: 0.8 },
    // Utility / legal
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE_URL}/documents/employee-consent`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.5 },
  ]

  // Landing pages, from the single source of truth. The /assessment/* app
  // pages are noindex (they duplicate the landing pages) so they are omitted.
  const assessmentPages: MetadataRoute.Sitemap = ASSESSMENT_META.map((meta) => {
    const d = describeAssessment(meta)
    return { url: `${SITE_URL}${d.landingPath}`, changeFrequency: 'monthly' as const, priority: 0.85 }
  })

  // Blog posts.
  const blogPages: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.lastReviewed ?? post.date,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  // Programmatic state guides (index + one page per state).
  const stateGuidePages: MetadataRoute.Sitemap = getAllStateSlugs().map((slug) => ({
    url: `${SITE_URL}/guides/${slug}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [
    ...staticPages,
    ...assessmentPages,
    ...blogPages,
    { url: `${SITE_URL}/guides`, changeFrequency: 'monthly', priority: 0.7 },
    ...stateGuidePages,
  ]
}
