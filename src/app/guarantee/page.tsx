import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Footer } from '@/components/site/footer'

export const metadata: Metadata = {
  title: '7-Day Money-Back Guarantee - ComplianceCheck',
  description: 'Every paid ComplianceCheck report is covered by a 7-day, no-questions-asked money-back guarantee.',
  alternates: {
    canonical: 'https://compliancecheck.co.in/guarantee',
  },
  openGraph: {
    title: '7-Day Money-Back Guarantee | ComplianceCheck',
    description: 'Every paid ComplianceCheck report is covered by a 7-day, no-questions-asked money-back guarantee.',
    type: 'website',
    url: 'https://compliancecheck.co.in/guarantee',
    siteName: 'ComplianceCheck',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function GuaranteePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="fixed top-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
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

      <main className="pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <header className="mb-12">
            <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium mb-4">
              <ShieldCheck className="w-4 h-4" />
              7-Day Money-Back Guarantee
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Guarantee</h1>
            <p className="text-gray-600 dark:text-gray-400">Last updated: July 2026</p>
          </header>

          <article className="prose prose-gray dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">The short version</h2>
              <p className="text-gray-600 dark:text-gray-400">
                If you pay for a ComplianceCheck report and decide within 7 days of purchase that it wasn&apos;t worth it,
                we&apos;ll refund you in full. No questions asked, no forms to fill beyond a single click.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How it works</h2>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>The 7-day window starts from the moment your payment is confirmed.</li>
                <li>Go to your results page and click &quot;Request a refund&quot; — no explanation required.</li>
                <li>We process refunds to your original payment method within 2 business days.</li>
                <li>You&apos;ll get an email confirming your refund request, and another once it&apos;s issued.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What&apos;s covered</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Any assessment report purchased through ComplianceCheck&apos;s live checkout. Promotional or waived
                (₹0) unlocks aren&apos;t covered, since no payment was made.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">After 7 days</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Requests made after the 7-day window has closed aren&apos;t eligible under this guarantee. If something
                specific went wrong with your report, email us at{' '}
                <a href="mailto:compliancecheck@zohomail.in" className="text-blue-600 dark:text-blue-400">
                  compliancecheck@zohomail.in
                </a>{' '}
                and we&apos;ll take a look.
              </p>
            </section>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  )
}
