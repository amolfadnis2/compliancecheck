import type { Metadata } from 'next'
import Link from 'next/link'
import { AssessmentHeader } from '@/components/assessment/assessment-header'
import { JsonLd } from '@/lib/seo/JsonLd'
import { breadcrumbSchema, faqSchema } from '@/lib/seo/schema'
import { SITE_NAME, absoluteUrl } from '@/lib/seo/site'
import { loadEpfParams } from '@/lib/calculators/epf/params.server'
import { loadPfShare } from '@/lib/calculators/epf/server'
import { decodeState } from '@/lib/calculators/epf/url-state'
import { factsFrom, fmtDate, inr, ratePct } from '@/lib/calculators/epf/view'
import { pfFaq } from '@/lib/calculators/epf/faq'
import { createClient } from '@/lib/supabase/server'
import { PfCalculator } from './PfCalculator'
import { PfCrossLinks } from './PfCrossLinks'

type SearchParams = Record<string, string | string[] | undefined>

const PATH = '/calculator/pf'

/** Title/description are built from params so the ceiling and rate never go stale. */
export async function generateMetadata(): Promise<Metadata> {
  const { params, rateRows } = await loadEpfParams()
  const f = factsFrom(params, rateRows)
  const title = `PF Calculator with Salary Hike ${f.ceilingFrom.slice(0, 4)} — EPF, EPS Pension & ${inr(f.ceiling)} Ceiling | ComplianceCheck`
  const description = `Free PF calculator for employees: forecast your EPF corpus with yearly salary hikes, the ${inr(f.ceiling)} wage ceiling, EPS pension, EDLI cover and your real return. Updated for ${ratePct(f.latestRate)} (FY ${f.latestFy}).`
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(PATH) },
    openGraph: { title, description, type: 'website', url: absoluteUrl(PATH), siteName: SITE_NAME, locale: 'en_IN' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

function webAppSchema(description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'PF calculator with salary hikes',
    url: absoluteUrl(PATH),
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    isAccessibleForFree: true,
    inLanguage: 'en-IN',
    description,
    audience: { '@type': 'Audience', audienceType: 'Salaried employees in India' },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    provider: { '@type': 'Organization', name: SITE_NAME, url: absoluteUrl('/') },
  }
}

/** First projected month = the month after today, in IST. */
function startInIst(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'numeric' }).formatToParts(now)
  const y = Number(parts.find((p) => p.type === 'year')!.value)
  const m = Number(parts.find((p) => p.type === 'month')!.value)
  return m === 12 ? { startY: y + 1, startM: 1 } : { startY: y, startM: m + 1 }
}

async function isLoggedIn(): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return false
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    return !!data.user
  } catch {
    return false
  }
}

export default async function PfCalculatorPage({ searchParams }: { searchParams: SearchParams }) {
  const slug = typeof searchParams.s === 'string' ? searchParams.s : null
  const [loaded, shared, loggedIn] = await Promise.all([loadEpfParams(), slug ? loadPfShare(slug) : Promise.resolve(null), isLoggedIn()])
  const initialState = shared ?? decodeState(searchParams)
  const facts = factsFrom(loaded.params, loaded.rateRows)
  const faq = pfFaq(facts)

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <JsonLd
        data={[
          webAppSchema(`Forecast your EPF corpus with yearly salary hikes, the ${inr(facts.ceiling)} wage ceiling, EPS pension, EDLI cover and your real return.`),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Free tools', path: '/#free-tools' },
            { name: 'PF calculator', path: PATH },
          ]),
          // FAQPage no longer earns Google rich results, but answer engines still read it.
          faqSchema(faq),
        ]}
      />
      <AssessmentHeader title="ComplianceCheck" subtitle="PF Calculator" badgeText="FREE Tool" badgeVariant="free" />

      <main id="main" className="mx-auto max-w-[1180px] px-4 pb-16 pt-6 sm:px-5">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/" className="hover:underline">Home</Link> <span aria-hidden="true">/</span>{' '}
          <Link href="/#free-tools" className="hover:underline">Free tools</Link> <span aria-hidden="true">/</span>{' '}
          <span aria-current="page">PF calculator</span>
        </nav>
        <h1 className="mb-1.5 text-3xl font-bold leading-tight tracking-tight">PF calculator with salary hikes</h1>
        <p className="mb-2 max-w-[68ch] text-gray-700 dark:text-gray-300">
          See what your EPF grows to by retirement as your salary rises each year. Updated for the {inr(facts.ceiling)} wage ceiling (from {fmtDate(facts.ceilingFrom)}) and the {ratePct(facts.latestRate)} rate for FY {facts.latestFy}.
        </p>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400" data-testid="pf-last-updated">
          Last updated {fmtDate(loaded.verifiedAt)}: statutory values checked against their sources (params version {loaded.params.version}).
        </p>

        <PfCalculator initialState={initialState} start={startInIst()} loaded={loaded} hasSharedState={!!shared} isLoggedIn={loggedIn} />

        <section className="mt-8" aria-labelledby="pf-faq-h">
          <h2 id="pf-faq-h" className="mb-3 text-xl font-bold">Questions people ask</h2>
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-2 dark:border-gray-700 dark:bg-gray-800">
            {faq.map((q) => (
              <details key={q.question} className="border-b border-gray-200 py-1.5 last:border-0 dark:border-gray-700">
                <summary className="flex min-h-[44px] cursor-pointer items-center font-medium">{q.question}</summary>
                <p className="mb-3 max-w-[75ch] text-gray-700 dark:text-gray-300">{q.answer}</p>
              </details>
            ))}
          </div>
          <div className="mt-4">
            <PfCrossLinks />
          </div>
        </section>

        <p className="mt-10 text-sm text-gray-600 dark:text-gray-400">
          Estimates for planning only. Actual PF credits depend on your employer’s filings and the rate EPFO declares each year. Future interest rates are assumptions, not guarantees.
        </p>
      </main>
    </div>
  )
}
