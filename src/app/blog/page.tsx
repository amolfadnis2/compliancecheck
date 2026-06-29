import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/blog/posts'
import { ContentShell } from '@/components/site/ContentShell'
import { JsonLd } from '@/lib/seo/JsonLd'
import { breadcrumbSchema } from '@/lib/seo/schema'
import { absoluteUrl } from '@/lib/seo/site'

export const metadata: Metadata = {
  title: 'Compliance Guides for Indian Businesses | ComplianceCheck',
  description:
    'Plain-English guides on Indian compliance — Labour Codes 2025, the DPDP Act 2023, POSH, PF/ESI, GST and state-wise requirements. Written for founders and HR teams.',
  alternates: { canonical: absoluteUrl('/blog') },
  openGraph: {
    title: 'Compliance Guides for Indian Businesses | ComplianceCheck',
    description:
      'Plain-English guides on Indian compliance for founders and HR teams.',
    url: absoluteUrl('/blog'),
    siteName: 'ComplianceCheck',
    locale: 'en_IN',
    type: 'website',
  },
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function BlogIndexPage() {
  const posts = getAllPosts()

  return (
    <ContentShell>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Guides', path: '/blog' },
        ])}
      />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            Compliance Guides
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Plain-English explainers on Indian compliance for founders and HR teams.
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">New guides are on the way.</p>
        ) : (
          <ul className="space-y-8">
            {posts.map((post) => (
              <li key={post.slug} className="border-b border-neutral-200 dark:border-gray-800 pb-8">
                <Link href={`/blog/${post.slug}`} className="group block">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">{post.description}</p>
                  <p className="mt-3 text-sm text-gray-400">{formatDate(post.date)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </ContentShell>
  )
}
