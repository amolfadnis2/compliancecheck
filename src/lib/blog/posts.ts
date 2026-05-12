import fs from 'fs'
import path from 'path'

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  coverImage?: string
  category?: string
  publishedAt: string
  draft?: boolean
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}
  const result: Record<string, string> = {}
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    const value = line.slice(colonIdx + 1).trim().replace(/^['"]|['"]$/g, '')
    if (key) result[key] = value
  }
  return result
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const filePath = path.join(BLOG_DIR, `${slug}.mdx`)
    if (!fs.existsSync(filePath)) return null
    const raw = fs.readFileSync(filePath, 'utf-8')
    const fm = parseFrontmatter(raw)
    if (!fm.title || !fm.publishedAt) return null
    return {
      slug,
      title: fm.title,
      excerpt: fm.excerpt ?? '',
      coverImage: fm.coverImage ?? fm.cover_image,
      category: fm.category,
      publishedAt: fm.publishedAt ?? fm.published_at,
      draft: fm.draft === 'true',
    }
  } catch {
    return null
  }
}

export function getAllPosts(): BlogPost[] {
  try {
    if (!fs.existsSync(BLOG_DIR)) return []
    return fs
      .readdirSync(BLOG_DIR)
      .filter((f) => f.endsWith('.mdx'))
      .map((f) => getPostBySlug(f.replace(/\.mdx$/, '')))
      .filter((p): p is BlogPost => p !== null && !p.draft)
      .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
  } catch {
    return []
  }
}
