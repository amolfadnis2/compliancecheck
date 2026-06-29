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
 *   draft: false                        # optional; drafts are excluded
 *   ---
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { AssessmentType } from '@/lib/constants/assessment-types'

export interface PostFrontmatter {
  title: string
  description: string
  date: string
  lastReviewed?: string
  author?: string
  tags?: string[]
  relatedAssessment?: AssessmentType
  draft?: boolean
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
