import { MetadataRoute } from 'next'

/**
 * Next.js 14 Dynamic Robots.txt Generator
 *
 * This file generates robots.txt automatically at /robots.txt
 * Controls which pages search engines AND AI crawlers can crawl.
 *
 * Strategy:
 * - Standard search crawlers: allow all public content.
 * - AI / answer-engine crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.):
 *   EXPLICITLY ALLOWED. We *want* LLMs to read and cite us — citations are free,
 *   high-intent referral traffic. See /llms.txt for a curated machine-readable map.
 *
 * Disallowed for everyone:
 * - /api/, /admin/, /auth/ - app internals, sensitive
 * - /results/ - dynamic, auth-gated, no SEO value
 * - /logout, /reset-password, /forgot-password - no SEO value
 */

const BASE_URL = 'https://compliancecheck.co.in'

// Crawlers we explicitly want indexing / citing public content.
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'anthropic-ai',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Bytespider',
  'Amazonbot',
  'CCBot',
  'cohere-ai',
]

const SHARED_DISALLOW = [
  '/api/',
  '/admin/',
  '/auth/',
  '/results/',
  '/logout',
  '/reset-password',
  '/forgot-password',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: SHARED_DISALLOW,
      },
      // Explicitly welcome AI crawlers to public content.
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: SHARED_DISALLOW,
      })),
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
