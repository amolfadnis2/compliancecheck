import type { CategorySlug } from '@/config/blog';

export interface PostFrontmatter {
  title: string;
  slug: string;
  excerpt: string;
  category: CategorySlug;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  coverImage: string;
  coverImageAlt: string;
  seoTitle?: string;
  seoDescription?: string;
  relatedAssessment?: string;
  draft?: boolean;
}

export interface Post extends PostFrontmatter {
  content: string;
  readingTime: string;
  readingTimeMinutes: number;
}

export interface PostWithoutContent extends PostFrontmatter {
  readingTime: string;
  readingTimeMinutes: number;
}
