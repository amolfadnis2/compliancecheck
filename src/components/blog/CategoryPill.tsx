'use client';

import Link from 'next/link';
import { CATEGORIES, CATEGORY_COLOR_MAP, type CategorySlug } from '@/config/blog';
import { cn } from '@/lib/utils';

interface CategoryPillProps {
  slug: CategorySlug;
  href?: string;
  className?: string;
}

export function CategoryPill({ slug, href, className }: CategoryPillProps) {
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) return null;
  const colors = CATEGORY_COLOR_MAP[category.color] ?? CATEGORY_COLOR_MAP['blue'];

  const pill = (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border',
        colors.bg,
        colors.text,
        colors.border,
        className
      )}
    >
      {category.label}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {pill}
      </Link>
    );
  }

  return pill;
}
