import { getAllPosts } from './posts';
import { AUTHOR } from './author';
import { BLOG_URL, BASE_URL } from '@/config/blog';

export function generateRssFeed(): string {
  const posts = getAllPosts().slice(0, 20);
  const lastBuildDate = new Date().toUTCString();

  const items = posts
    .map((post) => {
      const link = `${BLOG_URL}/${post.slug}`;
      const pubDate = new Date(post.publishedAt).toUTCString();
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${link}</link>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${pubDate}</pubDate>
      <author>${AUTHOR.name}</author>
      <category>${post.category}</category>
      <guid isPermaLink="true">${link}</guid>
    </item>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ComplianceCheck — Indian Compliance Insights</title>
    <description>Practical guides on Labour Codes, DPDP Act, POSH, and statutory compliance for SME founders and HR teams.</description>
    <link>${BASE_URL}</link>
    <atom:link href="${BLOG_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-IN</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <managingEditor>${AUTHOR.name}</managingEditor>${items}
  </channel>
</rss>`;
}
