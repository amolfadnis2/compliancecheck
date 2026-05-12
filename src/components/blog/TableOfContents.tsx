'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics/tracking';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  postSlug: string;
}

export function TableOfContents({ postSlug }: TableOfContentsProps) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll('article h2, article h3'));
    const toc: TocItem[] = headings.map((el) => ({
      id: el.id,
      text: el.textContent ?? '',
      level: el.tagName === 'H2' ? 2 : 3,
    }));
    setItems(toc);
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '0px 0px -60% 0px', threshold: 0 }
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  function handleClick(id: string, text: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    trackEvent('blog_toc_clicked', { post_slug: postSlug, section: text });
  }

  if (items.length === 0) return null;

  return (
    <nav aria-label="Table of contents">
      <p className="mb-3 text-sm font-semibold text-foreground uppercase tracking-wide">
        On this page
      </p>
      <ol className="space-y-1">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? 'pl-4' : ''}>
            <button
              onClick={() => handleClick(item.id, item.text)}
              className={cn(
                'text-left text-sm leading-snug transition-colors w-full',
                activeId === item.id
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-current={activeId === item.id ? 'location' : undefined}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
