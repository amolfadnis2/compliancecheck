'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, RefreshCw, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AssessmentHeader } from '@/components/assessment/assessment-header'
import { InputForm, type FormValues } from './components/InputForm'
import { HeroNumber } from './components/HeroNumber'
import { ExposureBreakdown } from './components/ExposureBreakdown'
import { TopRisksList } from './components/TopRisksList'
import { EmailGate } from './components/EmailGate'
import { DisclaimerBox } from './components/DisclaimerBox'
import { FAQ_ITEMS } from '@/lib/calculators/penalty-exposure/faq-content'
import { calculateExposure } from '@/lib/calculators/penalty-exposure/calculator'
import { TURNOVER_BAND_TO_CR, type PenaltyExposureResult, type BusinessInput } from '@/lib/calculators/penalty-exposure/types'
import { trackEvent } from '@/lib/analytics'

const DEFAULT_FORM: FormValues = {
  state: '',
  employeeCount: 0,
  industry: 'it',
  turnoverBand: '40L-2cr',
  processesPersonalData: false,
  hasWomenEmployees: true,
}

export default function PenaltyCalculatorClient() {
  const [form, setForm] = useState<FormValues>(DEFAULT_FORM)
  const [result, setResult] = useState<PenaltyExposureResult | null>(null)
  const [businessInput, setBusinessInput] = useState<BusinessInput | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const handleCalculate = useCallback(() => {
    setIsLoading(true)

    const input: BusinessInput = {
      state: form.state,
      employeeCount: form.employeeCount,
      industry: form.industry,
      annualTurnoverCr: TURNOVER_BAND_TO_CR[form.turnoverBand],
      processesPersonalData: form.processesPersonalData,
      hasWomenEmployees: form.hasWomenEmployees,
    }

    // Small artificial delay so the button feedback is visible
    setTimeout(() => {
      const exposure = calculateExposure(input)
      setResult(exposure)
      setBusinessInput(input)
      setIsLoading(false)

      trackEvent('penalty_calculator_completed', {
        employee_count: input.employeeCount,
        industry: input.industry,
        turnover_band: form.turnoverBand,
        processes_personal_data: input.processesPersonalData,
        has_women_employees: input.hasWomenEmployees,
        typical_risk: exposure.totalTypicalRisk,
        max_exposure: exposure.totalMaxExposure,
        laws_applicable: exposure.lawExposures.length,
      })

      // Scroll to results
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }, 400)
  }, [form])

  // Track page view on mount
  useState(() => {
    trackEvent('penalty_calculator_viewed')
  })

  const handleReset = () => {
    setResult(null)
    setBusinessInput(null)
    setForm(DEFAULT_FORM)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-gray-950 dark:to-gray-900">
      <AssessmentHeader
        title="ComplianceCheck"
        subtitle="Penalty Exposure Calculator"
        badgeText="FREE Tool"
        badgeVariant="free"
      />

      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* Page Hero */}
        <div className="mb-10 text-center">
          <div className="mb-3 flex justify-center">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              DPDP Act · Labour Codes · EPF · ESI · POSH · GST · More
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Calculate Your Indian Compliance Penalty Exposure
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
            Enter 5 business details. Get your estimated statutory penalty exposure across 18+ Indian
            compliance laws — free, anonymous, no login.
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
            ~30 seconds · Updated for April 2026 penalty rates
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Left: Input Form */}
          <div className="lg:col-span-2">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldAlert className="h-5 w-5 text-blue-600" />
                  Your Business Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <InputForm
                  values={form}
                  onChange={setForm}
                  onCalculate={handleCalculate}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-3 space-y-6" id="results-section">
            {!result && (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-20 text-center dark:border-gray-700 dark:bg-gray-800/20">
                <ShieldAlert className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
                <p className="font-medium text-gray-500 dark:text-gray-400">
                  Fill in your business details and click &ldquo;Calculate My Exposure&rdquo;
                </p>
                <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                  Results appear here instantly
                </p>
              </div>
            )}

            {result && businessInput && (
              <>
                <DisclaimerBox />

                <HeroNumber
                  typicalRisk={result.totalTypicalRisk}
                  maxExposure={result.totalMaxExposure}
                />

                {result.hasCriminalRisk && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                    <strong>Criminal liability also applies:</strong> EPF Section 14 and/or ESI
                    Section 85 can result in imprisonment in cases of wilful default or repeated
                    violations. This is separate from the monetary estimates above.
                  </div>
                )}

                <Card>
                  <CardContent className="pt-5">
                    <ExposureBreakdown exposures={result.lawExposures} />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-5">
                    <TopRisksList topRisks={result.topRisks} />
                  </CardContent>
                </Card>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <Link
                    href="/calculators/compliance-penalty-calculator/methodology"
                    className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                  >
                    <BookOpen className="h-4 w-4" />
                    How is this calculated? (Methodology)
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Recalculate
                  </button>
                </div>

                <EmailGate input={businessInput} result={result} />
              </>
            )}
          </div>
        </div>

        {/* Supporting content — per-law explainers */}
        <section className="mt-20 space-y-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Key Indian Compliance Laws for SMEs in 2026
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Understanding where your exposure comes from
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {LAW_EXPLAINERS.map((law) => (
              <div
                key={law.title}
                className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xl">{law.icon}</span>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{law.title}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{law.description}</p>
                <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
                  Max penalty: {law.maxPenalty}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {FAQ_ITEMS.map((item, idx) => (
              <div key={idx} className="py-4">
                <button
                  className="flex w-full items-center justify-between gap-4 text-left"
                  onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                  aria-expanded={openFAQ === idx}
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.question}
                  </span>
                  <span className="flex-shrink-0 text-gray-400 dark:text-gray-500">
                    {openFAQ === idx ? '−' : '+'}
                  </span>
                </button>
                {openFAQ === idx && (
                  <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {item.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mt-16 rounded-xl bg-blue-700 p-8 text-center text-white">
          <h2 className="text-xl font-bold">Ready to fix the gaps?</h2>
          <p className="mt-2 text-blue-200">
            Our assessments go deeper — question by question, regulation by regulation.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Button asChild variant="secondary" className="bg-white text-blue-700 hover:bg-blue-50">
              <Link href="/assessment/statutory-health">Statutory Health Check — FREE</Link>
            </Button>
            <Button asChild variant="outline" className="border-white text-white hover:bg-blue-600">
              <Link href="/assessment/dpdp">DPDP Gap Assessment</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Static law explainer data (SEO content)
// ---------------------------------------------------------------------------
const LAW_EXPLAINERS = [
  {
    icon: '🔒',
    title: 'DPDP Act 2023',
    description:
      'The Digital Personal Data Protection Act 2023 imposes penalties up to ₹250 crore for security failures. The Data Protection Board is operational since November 2025; full enforcement expected May 2027.',
    maxPenalty: '₹250 crore per violation',
  },
  {
    icon: '⚖️',
    title: "EPF & ESI",
    description:
      "Late EPF contributions attract 12% p.a. interest + 1% per month damages (amended June 2024). ESI late payment draws 12% interest and damages between 5-25% of arrears, plus criminal liability.",
    maxPenalty: 'Rate-based + criminal liability',
  },
  {
    icon: '👩',
    title: 'POSH Act 2013',
    description:
      'Every employer with 10+ employees must constitute an Internal Committee. Failure attracts a penalty of up to ₹50,000 and repeat violation can trigger licence cancellation.',
    maxPenalty: '₹50,000 + licence cancellation',
  },
  {
    icon: '🏭',
    title: 'Labour Codes 2025',
    description:
      "The Code on Wages 2019 rules became enforceable from November 21, 2025. Penalties for underpayment or non-compliance reach ₹1 lakh plus up to 3 months' imprisonment.",
    maxPenalty: '₹1 lakh + 3 months imprisonment',
  },
  {
    icon: '🍽️',
    title: 'FSSAI (Food Businesses)',
    description:
      'Operating a food business without an FSSAI licence under the Food Safety and Standards Act 2006 attracts a penalty of up to ₹5 lakh plus up to 6 months imprisonment.',
    maxPenalty: '₹5 lakh + 6 months imprisonment',
  },
  {
    icon: '📋',
    title: 'GST & Companies Act',
    description:
      'Late GSTR-1/3B filing costs ₹50/day (capped ₹10,000 per return) plus 18% p.a. interest. Late company filings under MCA attract ₹100/day with no upper ceiling.',
    maxPenalty: '₹100/day (no cap) under Companies Act',
  },
]
