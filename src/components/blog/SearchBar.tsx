'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { PostWithoutContent } from '@/lib/blog/types';

interface SearchBarProps {
  posts: PostWithoutContent[];
  onResults: (results: PostWithoutContent[] | null) => void;
}

export function SearchBar({ posts, onResults }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [resultCount, setResultCount] = useState<number | null>(null);
  const fuseRef = useRef<import('fuse.js').default<PostWithoutContent> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initFuse = useCallback(async () => {
    if (fuseRef.current) return;
    const Fuse = (await import('fuse.js')).default;
    fuseRef.current = new Fuse(posts, {
      keys: ['title', 'excerpt', 'tags'],
      threshold: 0.3,
      includeScore: true,
    });
  }, [posts]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResultCount(null);
      onResults(null);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      await initFuse();
      if (!fuseRef.current) return;
      const results = fuseRef.current.search(query).map((r) => r.item);
      setResultCount(results.length);
      onResults(results);
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, initFuse, onResults]);

  function clear() {
    setQuery('');
    setResultCount(null);
    onResults(null);
  }

  return (
    <div className="relative">
      <label htmlFor="blog-search" className="sr-only">
        Search articles
      </label>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      />
      <Input
        id="blog-search"
        type="search"
        placeholder="Search articles…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={initFuse}
        className="pl-9 pr-9"
        aria-label="Search articles"
        aria-describedby={resultCount !== null ? 'search-results-count' : undefined}
      />
      {query && (
        <button
          onClick={clear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {resultCount !== null && (
        <p
          id="search-results-count"
          className="mt-1.5 text-xs text-muted-foreground"
          aria-live="polite"
          role="status"
        >
          {resultCount} {resultCount === 1 ? 'result' : 'results'} for &ldquo;{query}&rdquo;
        </p>
      )}
    </div>
  );
}
