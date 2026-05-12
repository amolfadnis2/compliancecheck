import Link from 'next/link';
import Image from 'next/image';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertTriangle, Lightbulb, ArrowRight } from 'lucide-react';
import { CATEGORIES } from '@/config/blog';
import type { MDXComponents as MDXComponentsType } from 'mdx/types';

interface CalloutProps {
  type?: 'info' | 'warning' | 'tip';
  children: React.ReactNode;
}

export function Callout({ type = 'info', children }: CalloutProps) {
  const config = {
    info: {
      icon: <Info className="h-4 w-4" aria-hidden="true" />,
      className: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
      textClass: 'text-blue-800 dark:text-blue-300',
    },
    warning: {
      icon: <AlertTriangle className="h-4 w-4" aria-hidden="true" />,
      className: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20',
      textClass: 'text-yellow-800 dark:text-yellow-300',
    },
    tip: {
      icon: <Lightbulb className="h-4 w-4" aria-hidden="true" />,
      className: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20',
      textClass: 'text-green-800 dark:text-green-300',
    },
  };

  const { icon, className, textClass } = config[type];

  return (
    <Alert className={className} role="note">
      <div className={`flex gap-2 ${textClass}`}>
        {icon}
        <AlertDescription className={textClass}>{children}</AlertDescription>
      </div>
    </Alert>
  );
}

interface StatProps {
  value: string;
  label: string;
}

export function Stat({ value, label }: StatProps) {
  return (
    <div className="my-6 rounded-xl border bg-card p-6 text-center">
      <p className="text-5xl font-extrabold text-primary mb-1">{value}</p>
      <p className="text-muted-foreground text-sm">{label}</p>
    </div>
  );
}

interface AssessmentCTAProps {
  slug: string;
}

export function AssessmentCTA({ slug }: AssessmentCTAProps) {
  const href = `/assessment/${slug}`;
  return (
    <div className="my-6 rounded-xl border-2 border-green-600 bg-green-50 dark:bg-green-900/20 p-5">
      <p className="font-semibold text-green-800 dark:text-green-300 mb-2">
        Test your compliance readiness
      </p>
      <p className="text-sm text-green-700 dark:text-green-400 mb-3">
        Get a personalised compliance gap report — free, takes under 10 minutes.
      </p>
      <Link
        href={href}
        className="inline-flex items-center gap-2 rounded-lg bg-green-700 hover:bg-green-800 text-white px-4 py-2 text-sm font-medium transition-colors"
      >
        Start free assessment
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

function getCategoryLabel(href: string) {
  const catSlug = href.replace('/blog?category=', '');
  return CATEGORIES.find((c) => c.slug === catSlug)?.label ?? catSlug;
}

export const mdxComponents: MDXComponentsType = {
  Callout,
  Stat,
  AssessmentCTA,
  a: ({ href, children, ...props }) => {
    if (!href) return <a {...props}>{children}</a>;
    const isExternal = href.startsWith('http');
    if (isExternal) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  },
  img: ({ src, alt }) => {
    if (!src) return null;
    const altText = alt ?? getCategoryLabel(src);
    return (
      <figure className="my-6">
        <Image
          src={src}
          alt={altText}
          width={800}
          height={450}
          className="rounded-lg w-full h-auto"
        />
        {alt && <figcaption className="mt-2 text-center text-sm text-muted-foreground">{alt}</figcaption>}
      </figure>
    );
  },
};
