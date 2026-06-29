/**
 * /feed.xml — RSS 2.0 feed of all published blog posts.
 *
 * This is the backbone of the "publish once, syndicate everywhere" pipeline:
 * point Buffer / Zapier / Make / n8n at this feed to auto-schedule posts to
 * LinkedIn, X, etc. whenever a new article ships.
 */

import { getAllPosts } from '@/lib/blog/posts'
import { SITE_NAME, SITE_URL } from '@/lib/seo/site'

export const dynamic = 'force-static'
export const revalidate = 3600

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildFeed(): string {
  const posts = getAllPosts()
  const updated = posts[0]?.date ?? new Date().toISOString()

  const items = posts
    .map((post) => {
      const link = `${SITE_URL}/blog/${post.slug}`
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)} Guides</title>
    <link>${SITE_URL}/blog</link>
    <description>Compliance guides for Indian businesses — Labour Codes, DPDP Act, POSH, GST and more.</description>
    <language>en-in</language>
    <lastBuildDate>${new Date(updated).toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`
}

export function GET() {
  return new Response(buildFeed(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
