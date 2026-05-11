import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock } from 'lucide-react';
import { CategoryPill } from './CategoryPill';
import type { PostWithoutContent } from '@/lib/blog/types';
import { Card, CardContent } from '@/components/ui/card';

interface PostCardProps {
  post: PostWithoutContent;
  featured?: boolean;
}

export function PostCard({ post, featured = false }: PostCardProps) {
  const href = `/blog/${post.slug}`;
  const pubDate = new Date(post.publishedAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  if (featured) {
    return (
      <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-200">
        <Link href={href} className="block">
          <div className="relative aspect-video w-full">
            <Image
              src={post.coverImage}
              alt={post.coverImageAlt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              priority
            />
          </div>
        </Link>
        <CardContent className="p-6">
          <div className="mb-3">
            <CategoryPill slug={post.category} href={`/blog?category=${post.category}`} />
          </div>
          <Link href={href}>
            <h2 className="text-2xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h2>
          </Link>
          <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              <time dateTime={post.publishedAt}>{pubDate}</time>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {post.readingTime}
            </span>
          </div>
          <Link
            href={href}
            className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:underline"
            aria-label={`Read more: ${post.title}`}
          >
            Read more &rarr;
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <Link href={href} className="block">
        <div className="relative aspect-video w-full">
          <Image
            src={post.coverImage}
            alt={post.coverImageAlt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="mb-2">
          <CategoryPill slug={post.category} href={`/blog?category=${post.category}`} />
        </div>
        <Link href={href}>
          <h3 className="font-semibold leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" aria-hidden="true" />
            <time dateTime={post.publishedAt}>{pubDate}</time>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {post.readingTime}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
