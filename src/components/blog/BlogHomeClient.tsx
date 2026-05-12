'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PostCard } from './PostCard';
import { CategoryPills } from './CategoryPills';
import { SearchBar } from './SearchBar';
import { Pagination } from './Pagination';
import type { PostWithoutContent } from '@/lib/blog/types';
import { POSTS_PER_PAGE } from '@/config/blog';
import { trackEvent } from '@/lib/analytics/tracking';

interface BlogHomeClientProps {
  allPosts: PostWithoutContent[];
  featuredPost: PostWithoutContent | null;
}

function BlogHomeInner({ allPosts, featuredPost }: BlogHomeClientProps) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') ?? undefined;
  const currentPage = parseInt(searchParams.get('page') ?? '1', 10);

  const [searchResults, setSearchResults] = useState<PostWithoutContent[] | null>(null);

  useEffect(() => {
    trackEvent('blog_home_viewed');
  }, []);

  useEffect(() => {
    if (activeCategory) {
      trackEvent('blog_category_clicked', { category: activeCategory });
    }
  }, [activeCategory]);

  const handleSearchResults = useCallback((results: PostWithoutContent[] | null) => {
    setSearchResults(results);
  }, []);

  const filteredByCategory = activeCategory
    ? allPosts.filter((p) => p.category === activeCategory)
    : allPosts;

  const gridPosts = featuredPost
    ? filteredByCategory.filter((p) => p.slug !== featuredPost.slug)
    : filteredByCategory;

  const displayPosts = searchResults ?? gridPosts;

  const totalPages = Math.max(1, Math.ceil(displayPosts.length / POSTS_PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const pagePosts = displayPosts.slice((safePage - 1) * POSTS_PER_PAGE, safePage * POSTS_PER_PAGE);

  return (
    <>
      <div className="sticky top-16 z-10 bg-background/95 backdrop-blur-sm border-b py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CategoryPills activeCategory={activeCategory} />
        </div>
      </div>

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 max-w-md">
          <SearchBar posts={allPosts} onResults={handleSearchResults} />
        </div>

        {pagePosts.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <p className="text-lg">No articles found.</p>
            <p className="text-sm mt-1">Try a different search term or category.</p>
          </div>
        ) : (
          <div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Blog post grid"
          >
            {pagePosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}

        {!searchResults && (
          <div className="mt-10">
            <Pagination currentPage={safePage} totalPages={totalPages} />
          </div>
        )}
      </main>
    </>
  );
}

export function BlogHomeClient(props: BlogHomeClientProps) {
  return (
    <Suspense fallback={null}>
      <BlogHomeInner {...props} />
    </Suspense>
  );
}
