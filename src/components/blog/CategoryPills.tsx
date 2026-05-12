'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { CATEGORIES, CATEGORY_COLOR_MAP } from '@/config/blog';
import { cn } from '@/lib/utils';

interface CategoryPillsProps {
  activeCategory?: string;
}

export function CategoryPills({ activeCategory }: CategoryPillsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigate(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    params.delete('page');
    router.push(`/blog?${params.toString()}`);
  }

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
      role="navigation"
      aria-label="Blog categories"
    >
      <button
        onClick={() => navigate(null)}
        className={cn(
          'flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium border transition-colors',
          !activeCategory
            ? 'bg-foreground text-background border-foreground'
            : 'bg-background text-muted-foreground border-border hover:border-foreground hover:text-foreground'
        )}
        aria-current={!activeCategory ? 'page' : undefined}
      >
        All
      </button>
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.slug;
        const colors = CATEGORY_COLOR_MAP[cat.color] ?? CATEGORY_COLOR_MAP['blue'];
        return (
          <button
            key={cat.slug}
            onClick={() => navigate(cat.slug)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium border transition-colors',
              isActive
                ? cn(colors.bg, colors.text, colors.border)
                : 'bg-background text-muted-foreground border-border hover:border-foreground hover:text-foreground'
            )}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
