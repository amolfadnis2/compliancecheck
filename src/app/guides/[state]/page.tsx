import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getAllStateSlugs,
  getStateBySlug,
  getStateCompliance,
} from '@/lib/content/state-compliance'
import { ContentShell } from '@/components/site/ContentShell'
import { AssessmentCTA } from '@/components/site/AssessmentCTA'
import { ShareButtons } from '@/components/site/ShareButtons'
import { JsonLd } from '@/lib/seo/JsonLd'
import { breadcrumbSchema, faqSchema } from '@/lib/seo/schema'
import { absoluteUrl } from '@/lib/seo/site'
import { ASSESSMENT_TYPES } from '@/lib/constants/assessment-types'

interface Params {
  params: { state: string }
}

export function generateStaticParams() {
  return getAllStateSlugs().map((state) => ({ state }))
}

export function generateMetadata({ params }: Params): Metadata {
  const state = getStateBySlug(params.state)
  if (!state) return {}
  const url = absoluteUrl(`/guides/${params.state}`)
  return {
    title: `${state} Compliance Guide | Professional Tax, LWF & Shops Act | ComplianceCheck`,
    description: `Compliance requirements for businesses in ${state}: Professional Tax, Labour Welfare Fund, and Shops & Establishment registration. Find out what applies to you.`,
    alternates: { canonical: url },
    openGraph: {
      title: `${state} Compliance Guide | ComplianceCheck`,
      description: `State-specific compliance requirements for businesses in ${state}.`,
      url,
      siteName: 'ComplianceCheck',
      locale: 'en_IN',
      type: 'article',
    },
  }
}

export default function StateGuidePage({ params }: Params) {
  const state = getStateBySlug(params.state)
  if (!state) notFound()

  const data = getStateCompliance(state)
  const url = absoluteUrl(`/guides/${params.state}`)

  const faqs = [
    {
      question: `Is Professional Tax applicable in ${state}?`,
      answer: data.professionalTax.note,
    },
    {
      question: `Does ${state} have a Labour Welfare Fund?`,
      answer: data.labourWelfareFund.note,
    },
    {
      question: `Do I need Shops and Establishment registration in ${state}?`,
      answer: data.shopsEstablishment.note,
    },
  ]

  const sectionTitle = 'mt-8 mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100'
  const para = 'leading-7 text-gray-700 dark:text-gray-300'

  return (
    <ContentShell>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Guides', path: '/blog' },
          { name: `${state} Compliance`, path: `/guides/${params.state}` },
        ])}
      />
      <JsonLd data={faqSchema(faqs)} />

      <article className="mx-auto max-w-3xl px-4 py-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold leading-tight text-gray-900 dark:text-gray-100">
            Compliance Requirements for Businesses in {state}
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            A quick reference to the compliance items that vary by state — Professional Tax,
            Labour Welfare Fund, and Shops &amp; Establishment registration in {state}.
          </p>
        </header>

        <ul className="mb-8 grid gap-3 sm:grid-cols-3">
          {data.highlights.map((h, i) => (
            <li
              key={i}
              className="rounded-lg border border-neutral-200 dark:border-gray-800 p-4 text-sm text-gray-700 dark:text-gray-300"
            >
              {h}
            </li>
          ))}
        </ul>

        <h2 className={sectionTitle}>Professional Tax in {state}</h2>
        <p className={para}>{data.professionalTax.note}</p>

        <h2 className={sectionTitle}>Labour Welfare Fund in {state}</h2>
        <p className={para}>{data.labourWelfareFund.note}</p>

        <h2 className={sectionTitle}>Shops &amp; Establishment registration in {state}</h2>
        <p className={para}>{data.shopsEstablishment.note}</p>

        <AssessmentCTA type={ASSESSMENT_TYPES.STATE_WISE_COMPLIANCE} />

        <p className="mt-6 text-sm italic text-gray-500 dark:text-gray-400">
          This guide is general information, not legal advice. Requirements depend on your
          headcount, industry and exact location within {state}.
        </p>

        <div className="mt-8 border-t border-neutral-200 dark:border-gray-800 pt-6">
          <ShareButtons url={url} title={`${state} Compliance Guide`} />
        </div>
      </article>
    </ContentShell>
  )
}
