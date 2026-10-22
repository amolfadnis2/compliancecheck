/**
 * Blog/guides content layer — reads MDX files from /content/blog at build time.
 *
 * Server-only (uses fs). Each post is a `.mdx` file with YAML frontmatter:
 *
 *   ---
 *   title: "Labour Codes 2025: what every employer must do"
 *   description: "A plain-English checklist..."
 *   date: "2026-06-20"
 *   lastReviewed: "2026-06-20"
 *   author: "ComplianceCheck Team"
 *   tags: ["labour-code", "compliance"]
 *   relatedAssessment: "labour_code"   # optional AssessmentType for the CTA
 *   related: ["other-post-slug"]        # optional; shown as "Also read"
 *   draft: false                        # optional; drafts are excluded
 *   ---
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { AssessmentType } from '@/lib/constants/assessment-types'

export interface FaqItem {
  question: string
  answer: string
}

export interface PostFrontmatter {
  title: string
  description: string
  date: string
  lastReviewed?: string
  author?: string
  tags?: string[]
  relatedAssessment?: AssessmentType
  related?: string[]
  draft?: boolean
  faq?: FaqItem[]
}

export interface PostMeta extends PostFrontmatter {
  slug: string
}

export interface Post extends PostMeta {
  content: string
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

function readDir(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  return fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'))
}

function parseFile(filename: string): Post {
  const slug = filename.replace(/\.mdx$/, '')
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf8')
  const { data, content } = matter(raw)
  return { slug, content, ...(data as PostFrontmatter) }
}

/** All published posts, newest first. Drafts excluded. */
export function getAllPosts(): PostMeta[] {
  return readDir()
    .map(parseFile)
    .filter((p) => !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map(({ content: _content, ...meta }) => meta)
}

/** Slugs for generateStaticParams (published only). */
export function getAllPostSlugs(): string[] {
  return getAllPosts().map((p) => p.slug)
}

/** Full post by slug, or null if missing/draft. */
export function getPost(slug: string): Post | null {
  const filename = `${slug}.mdx`
  if (!readDir().includes(filename)) return null
  const post = parseFile(filename)
  if (post.draft) return null
  return post
}

/**
 * Up to `limit` posts for the "Also read" block. Uses the curated `related`
 * slugs first, then tops up with the posts sharing the most tags.
 */
export function getRelatedPosts(post: PostMeta, limit = 3): PostMeta[] {
  const all = getAllPosts().filter((p) => p.slug !== post.slug)
  const bySlug = new Map(all.map((p) => [p.slug, p]))
  const picked = (post.related ?? [])
    .map((slug) => bySlug.get(slug))
    .filter((p): p is PostMeta => p !== undefined)
    .slice(0, limit)
  if (picked.length >= limit) return picked

  const tags = new Set(post.tags ?? [])
  const rest = all
    .filter((p) => !picked.includes(p))
    .map((p) => ({ p, shared: (p.tags ?? []).filter((t) => tags.has(t)).length }))
    .filter((x) => x.shared > 0)
    .sort((a, b) => b.shared - a.shared)
    .map((x) => x.p)
  return [...picked, ...rest].slice(0, limit)
}
