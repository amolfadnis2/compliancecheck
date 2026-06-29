/**
 * Tailwind-styled element map for MDX article bodies.
 *
 * Passed to <MDXRemote components={mdxComponents} /> so rendered Markdown gets
 * consistent typography without pulling in the @tailwindcss/typography plugin.
 */

import Link from 'next/link'
import type { ComponentPropsWithoutRef } from 'react'

export const mdxComponents = {
  h1: (props: ComponentPropsWithoutRef<'h1'>) => (
    <h1 className="mt-10 mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100" {...props} />
  ),
  h2: (props: ComponentPropsWithoutRef<'h2'>) => (
    <h2 className="mt-10 mb-3 text-2xl font-bold text-gray-900 dark:text-gray-100" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<'h3'>) => (
    <h3 className="mt-8 mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<'p'>) => (
    <p className="my-4 leading-7 text-gray-700 dark:text-gray-300" {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<'ul'>) => (
    <ul className="my-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<'ol'>) => (
    <ol className="my-4 ml-6 list-decimal space-y-2 text-gray-700 dark:text-gray-300" {...props} />
  ),
  li: (props: ComponentPropsWithoutRef<'li'>) => <li className="leading-7" {...props} />,
  a: ({ href = '#', ...props }: ComponentPropsWithoutRef<'a'>) => (
    <Link href={href} className="font-medium text-primary underline underline-offset-2 hover:text-primary-dark" {...props} />
  ),
  strong: (props: ComponentPropsWithoutRef<'strong'>) => (
    <strong className="font-semibold text-gray-900 dark:text-gray-100" {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote className="my-6 border-l-4 border-primary/40 bg-neutral-50 dark:bg-gray-800 py-2 pl-4 italic text-gray-700 dark:text-gray-300" {...props} />
  ),
  table: (props: ComponentPropsWithoutRef<'table'>) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm" {...props} />
    </div>
  ),
  th: (props: ComponentPropsWithoutRef<'th'>) => (
    <th className="border border-neutral-200 dark:border-gray-700 bg-neutral-100 dark:bg-gray-800 px-3 py-2 font-semibold" {...props} />
  ),
  td: (props: ComponentPropsWithoutRef<'td'>) => (
    <td className="border border-neutral-200 dark:border-gray-700 px-3 py-2" {...props} />
  ),
  code: (props: ComponentPropsWithoutRef<'code'>) => (
    <code className="rounded bg-neutral-100 dark:bg-gray-800 px-1.5 py-0.5 text-sm" {...props} />
  ),
  hr: (props: ComponentPropsWithoutRef<'hr'>) => (
    <hr className="my-8 border-neutral-200 dark:border-gray-700" {...props} />
  ),
}
