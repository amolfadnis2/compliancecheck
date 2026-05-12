import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import type { Post, PostWithoutContent } from './types';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

function getMdxFiles(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.mdx'));
}

function parsePost(filename: string): Post | null {
  const filePath = path.join(CONTENT_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const frontmatter = data as Post;
  if (!frontmatter.title || !frontmatter.slug) return null;
  const rt = readingTime(content);
  return {
    ...frontmatter,
    content,
    readingTime: rt.text,
    readingTimeMinutes: rt.minutes,
  };
}

function stripContent(post: Post): PostWithoutContent {
  const { content: _content, ...rest } = post;
  return rest;
}

export function getAllPosts(includeDrafts = false): PostWithoutContent[] {
  const files = getMdxFiles();
  const posts = files
    .map((f) => parsePost(f))
    .filter((p): p is Post => p !== null)
    .filter((p) => includeDrafts || !p.draft)
    .map(stripContent)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return posts;
}

export function getPostBySlug(slug: string): Post | null {
  const files = getMdxFiles();
  for (const file of files) {
    const post = parsePost(file);
    if (post && post.slug === slug && !post.draft) return post;
  }
  return null;
}

export function getRelatedPosts(
  currentSlug: string,
  category: string,
  tags: string[],
  limit = 3
): PostWithoutContent[] {
  const all = getAllPosts();
  const others = all.filter((p) => p.slug !== currentSlug);

  const scored = others.map((p) => {
    let score = 0;
    if (p.category === category) score += 10;
    const tagOverlap = p.tags.filter((t) => tags.includes(t)).length;
    score += tagOverlap * 2;
    return { post: p, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.post);
}

export function getAllSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}
