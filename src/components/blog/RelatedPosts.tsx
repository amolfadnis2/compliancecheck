import { PostCard } from './PostCard';
import type { PostWithoutContent } from '@/lib/blog/types';

interface RelatedPostsProps {
  posts: PostWithoutContent[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section aria-label="Related articles">
      <h2 className="text-2xl font-bold mb-6">Related articles</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
