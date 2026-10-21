import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllStateSlugs, getStateBySlug } from '@/lib/content/state-compliance'
import { ContentShell } from '@/components/site/ContentShell'
import { JsonLd } from '@/lib/seo/JsonLd'
import { breadcrumbSchema } from '@/lib/seo/schema'
import { absoluteUrl } from '@/lib/seo/site'

const url = absoluteUrl('/guides')

export const metadata: Metadata = {
  title: 'State-wise Compliance Guides for India | ComplianceCheck',
  description:
    'Compliance guides for every Indian state and union territory: Professional Tax, Labour Welfare Fund, and Shops & Establishment registration.',
  alternates: { canonical: url },
  openGraph: {
    title: 'State-wise Compliance Guides | ComplianceCheck',
    description: 'Professional Tax, Labour Welfare Fund and Shops & Establishment rules, state by state.',
    url,
    siteName: 'ComplianceCheck',
    locale: 'en_IN',
    type: 'website',
  },
}

export default function GuidesIndexPage() {
  const states = getAllStateSlugs()
    .map((slug) => ({ slug, name: getStateBySlug(slug) }))
    .filter((s): s is { slug: string; name: string } => s.name !== null)

  return (
    <ContentShell>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'State guides', path: '/guides' },
        ])}
      />

      <div className="mx-auto max-w-3xl px-4 py-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold leading-tight text-gray-900 dark:text-gray-100">
            State-wise Compliance Guides
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Professional Tax, Labour Welfare Fund, and Shops &amp; Establishment registration
            vary by state. Pick a state to see what applies to businesses there.
          </p>
        </header>

        <ul className="grid gap-3 sm:grid-cols-2">
          {states.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/guides/${s.slug}`}
                className="block rounded-lg border border-neutral-200 dark:border-gray-800 p-4 font-medium text-gray-900 dark:text-gray-100 hover:border-primary hover:text-primary"
              >
                {s.name} compliance guide
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </ContentShell>
  )
}
