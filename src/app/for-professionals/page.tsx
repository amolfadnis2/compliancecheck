import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Briefcase,
  CheckCircle,
  Download,
  FileText,
  Mail,
  Palette,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  ASSESSMENT_PRICES,
  ASSESSMENT_TYPES,
  getAssessmentDisplayName,
  type AssessmentType,
} from '@/lib/constants/assessment-types'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'

/**
 * Landing page for CAs, CSs, lawyers and consultants (partner mode, §19).
 * Built as the destination for paid ads: every "start" button opens the
 * assessment with `?partner=1`, which pre-ticks the partner box on Step 0.
 * Prices come from ASSESSMENT_PRICES — never hardcode them here.
 */

const PAGE_URL = 'https://compliancecheck.co.in/for-professionals'
const BLOG_POST = '/blog/white-label-compliance-reports-for-cas-cs-lawyers-and-consultants'

export const metadata: Metadata = {
  title: 'White-Label Compliance Reports for CAs, CSs & Lawyers | ComplianceCheck',
  description:
    'Give your clients a compliance gap report under your own firm name and logo: DPDP, POSH, Labour Codes, PF/ESI and more. No sign-up, pay per report, you set your fee.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    ...DEFAULT_OPEN_GRAPH,
    title: 'White-label compliance reports for your clients',
    description: 'Your logo. Your firm. A client-ready compliance gap report in about 15 minutes.',
    url: PAGE_URL,
    type: 'website',
  },
}

const ASSESSMENTS: { type: AssessmentType; path: string; blurb: string; featured?: boolean }[] = [
  { type: ASSESSMENT_TYPES.DPDP, path: '/assessment/dpdp', blurb: 'DPDP Act 2023 and DPDP Rules 2025 readiness: consent, notices, breach response, data retention.', featured: true },
  { type: ASSESSMENT_TYPES.POSH, path: '/assessment/posh', blurb: 'Internal Committee, policy, training and the annual report under the POSH Act 2013.', featured: true },
  { type: ASSESSMENT_TYPES.STATUTORY_HEALTH, path: '/assessment/statutory-health', blurb: 'EPF, ESI, professional tax, gratuity and bonus.' },
  { type: ASSESSMENT_TYPES.LABOUR_CODE, path: '/assessment/labour-code', blurb: 'Readiness for the four Labour Codes.' },
  { type: ASSESSMENT_TYPES.STATE_WISE_COMPLIANCE, path: '/assessment/state-wise-compliance', blurb: 'Shops & Establishments and other state laws that apply.' },
  { type: ASSESSMENT_TYPES.FOOD_BUSINESS, path: '/assessment/food-business', blurb: 'FSSAI licensing and food safety for restaurants and food businesses.' },
  { type: ASSESSMENT_TYPES.AUTO_DEALER, path: '/assessment/auto-dealer', blurb: 'Dealership-specific compliance for automobile dealers.' },
]

const SAMPLES = [
  { href: '/samples/partner/dpdp-law-firm-branded-sample.pdf', title: 'DPDP report', who: 'branded for a law firm' },
  { href: '/samples/partner/posh-consultant-branded-sample.pdf', title: 'POSH report', who: 'branded for an HR consultancy' },
  { href: '/samples/partner/statutory-health-ca-branded-sample.pdf', title: 'Statutory Health report', who: 'branded for a CA firm' },
]

const price = (type: AssessmentType) =>
  `₹${Math.round(ASSESSMENT_PRICES[type].amountPaise / 100).toLocaleString('en-IN')}`

const startHref = (path: string) => `${path}?partner=1`

export default function ForProfessionalsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-800 to-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">ComplianceCheck</span>
          </Link>
          <a href="#start" className="text-sm font-medium text-blue-700 dark:text-blue-400">
            Start a client report
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 pt-12 pb-12 md:pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-full px-4 py-2 text-sm text-blue-700 dark:text-blue-300 font-medium mb-6">
            <Briefcase className="h-4 w-4" />
            For CAs, CSs, lawyers and compliance consultants
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-5">
            Compliance gap reports for your clients, under your firm&apos;s name
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Answer the questions for your client and get a detailed PDF report with your logo, firm
            name and contact details: score, critical gaps, a dated action plan and legal references.
            No sign-up. Pay per report and bill your client your own fee.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={startHref('/assessment/dpdp')}>
              <Button size="lg" className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white">
                Start a branded DPDP report <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#samples">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" /> See a sample branded PDF
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* What's on the report */}
      <section className="px-4 py-12 bg-white dark:bg-gray-800">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { icon: Palette, title: 'Your brand on the report', text: 'Your logo, firm name, designation and brand colour on the cover, in a "Prepared By" box and in the footer of every page.' },
            { icon: FileText, title: 'A report your client can act on', text: 'Compliance score, peer comparison, critical gaps, a 0-30 / 31-90 / 90+ day action plan with a portal link per action, and a legal references appendix.' },
            { icon: Mail, title: 'Delivered in your name', text: 'Email goes out as "Your Firm via ComplianceCheck" with replies to you, or share a 30-day link on WhatsApp worded from your firm.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <Icon className="h-6 w-6 text-blue-700 dark:text-blue-400 mb-3" />
              <h2 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">How it works</h2>
          <ol className="space-y-4">
            {[
              'Pick the assessment your client needs below. The "filling this in for a client" box is already ticked for you.',
              'Add your firm name, designation and logo once. They are remembered on this browser for your next client.',
              'Answer the questions with your client’s information. Only their company name, state, headcount and industry are asked for, not their contact details.',
              'Review the branded summary, pay at checkout and download, email or WhatsApp the full report.',
            ].map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex-none w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-semibold">
                  {i + 1}
                </span>
                <p className="text-gray-700 dark:text-gray-300 pt-1">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Samples */}
      <section id="samples" className="px-4 py-12 bg-white dark:bg-gray-800 scroll-mt-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">See what your client receives</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
            Real reports from the same engine. The firms and clients are fictional and every page is marked as a sample.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {SAMPLES.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-500 transition-colors"
              >
                <Download className="h-5 w-5 flex-none text-blue-700 dark:text-blue-400" />
                <span>
                  <span className="block font-medium text-gray-900 dark:text-white">{s.title} (PDF)</span>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">{s.who}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Assessments + prices */}
      <section id="start" className="px-4 py-12 scroll-mt-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Start a branded client report</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
            One-time price per report, the same as a direct buyer. No subscription, no minimum volume.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {ASSESSMENTS.map(({ type, path, blurb, featured }) => (
              <div
                key={type}
                className={`rounded-lg border bg-white dark:bg-gray-800 p-5 flex flex-col ${featured ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <div className="flex justify-between items-start gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{getAssessmentDisplayName(type)}</h3>
                  <span className="font-bold text-gray-900 dark:text-white whitespace-nowrap">{price(type)}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex-1">{blurb}</p>
                <Link href={startHref(path)}>
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white dark:bg-blue-700 dark:hover:bg-blue-800">
                    Start for a client <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fine print */}
      <section className="px-4 py-12 bg-white dark:bg-gray-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Good to know</h2>
          <ul className="space-y-3">
            {[
              'ComplianceCheck is the merchant of record and issues the GST invoice to you. You bill your client separately.',
              'Your client’s company name and contact details are never sent to our analytics.',
              'Firm details are self-declared. The report says so, and you confirm they are your own before submitting.',
              'The report is a structured gap assessment, not legal advice. Your professional advice to the client remains yours.',
            ].map((t) => (
              <li key={t} className="flex gap-3 text-gray-700 dark:text-gray-300">
                <CheckCircle className="h-5 w-5 flex-none text-green-600 mt-0.5" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
            More detail, including a section-by-section comparison with the standard report:{' '}
            <Link href={BLOG_POST} className="text-blue-700 dark:text-blue-400 underline">
              White-label compliance reports for CAs, CSs, lawyers and consultants
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  )
}
