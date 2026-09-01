import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ScrollText, IndianRupee, Lock } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Footer } from '@/components/site/footer'
import { CONTACT_EMAIL } from '@/lib/seo/site'

export const metadata: Metadata = {
  title: 'About - ComplianceCheck',
  description:
    'Who is behind ComplianceCheck, why it exists, and how the compliance assessments for Indian SMEs are built and kept current.',
  alternates: {
    canonical: 'https://compliancecheck.co.in/about',
  },
  openGraph: {
    title: 'About | ComplianceCheck',
    description:
      'Who is behind ComplianceCheck, why it exists, and how the compliance assessments for Indian SMEs are built.',
    type: 'website',
    url: 'https://compliancecheck.co.in/about',
    siteName: 'ComplianceCheck',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">ComplianceCheck</span>
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              About ComplianceCheck
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Straight answers to &ldquo;what does the law actually require of my business?&rdquo;
              &mdash; built for Indian SMEs, one assessment at a time.
            </p>
          </header>

          <article className="space-y-10">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Who runs this
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                ComplianceCheck is built and run by <strong className="text-gray-900 dark:text-white">Amol Fadnis</strong>,
                a solo founder based in Pune, Maharashtra. Every checklist, question and report on
                this site is something I researched, wrote and maintain myself &mdash; there is no
                content farm and no outsourced support desk behind it.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                If you email{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                  {CONTACT_EMAIL}
                </a>
                , I am the person who replies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Why this exists
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Indian compliance is fragmented across dozens of central acts, four new Labour Codes,
                state-specific rules and a steady stream of amendments. Large companies have retained
                counsel and compliance teams. A 40-person business has a CA who handles tax, and a
                long list of labour, data-protection and licensing obligations that nobody is
                watching &mdash; until an inspector, an employee dispute or a penalty notice makes
                them urgent.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                ComplianceCheck sits in that gap: structured self-assessments that tell you, in 10
                to 15 minutes, where you stand and what to fix first &mdash; priced per report, with
                no subscription, so a small business can afford to actually use it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                How the assessments are built
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <ScrollText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" aria-hidden="true" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Every question maps to a specific legal requirement, and every gap in a paid
                    report cites the act, section or rule it comes from &mdash; the DPDP Act 2023 and
                    its Rules, the four Labour Codes in force since November 2025, the POSH Act 2013,
                    the EPF and ESI Acts, FSSAI regulations and state-level requirements, depending
                    on the assessment.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <IndianRupee className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" aria-hidden="true" />
                  <p className="text-gray-600 dark:text-gray-400">
                    The free summary always shows your real score and where your gaps are. Paying
                    unlocks the detail: exact remediation steps, legal citations, penalty exposure
                    and a PDF you can hand to your team or advisor.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" aria-hidden="true" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Your answers are stored encrypted, are never sold, and you can request export or
                    deletion of your data at any time &mdash; the same DPDP standards the
                    assessments test for are the ones this site holds itself to.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                What this is not
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                ComplianceCheck is not a law firm and its reports are not legal advice. It is a
                structured way to find your gaps and prioritise them. For decisions with legal
                consequences, take the report to a qualified professional &mdash; the citations in
                it are written so they can verify every item quickly.
              </p>
            </section>

            <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-8 text-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Questions, corrections, or feedback?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                If you spot something outdated or wrong in a checklist, I want to know about it.
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-block bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg"
              >
                Email {CONTACT_EMAIL}
              </a>
            </section>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  )
}
