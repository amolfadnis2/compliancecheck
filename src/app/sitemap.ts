import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog/posts'

const BASE_URL = 'https://compliancecheck.co.in'

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString()

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: currentDate, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/how-it-works`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/calculator/ctc`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/calculator/gratuity`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/calculators/compliance-penalty-calculator`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/calculators/compliance-penalty-calculator/methodology`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/assessment/statutory-health`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/assessment/labour-code`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/assessment/dpdp`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/assessment/state-wise-compliance`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/assessment/food-business`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/assessment/posh`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/assessment/auto-dealer`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE_URL}/assessments/landing/statutory-health-check`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE_URL}/assessments/landing/labour-code-readiness`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE_URL}/assessments/landing/dpdp-gap-assessment`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE_URL}/assessments/landing/state-wise-compliance`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE_URL}/assessments/landing/restaurant-food-business`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE_URL}/assessments/landing/posh-act-compliance`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE_URL}/documents/employee-consent`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/privacy`, lastModified: currentDate, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE_URL}/terms`, lastModified: currentDate, changeFrequency: 'yearly', priority: 0.5 },
    // Blog index
    { url: `${BASE_URL}/blog`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.9 },
  ]

  // Dynamic blog post pages
  const posts = getAllPosts()
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt ?? post.publishedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...blogPages]
}
