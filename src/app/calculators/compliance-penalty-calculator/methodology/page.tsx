import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { COMPLIANCE_GAP_RATES } from '@/lib/calculators/penalty-exposure/calculator'

export const metadata: Metadata = {
  title: 'Methodology — Compliance Penalty Exposure Calculator | ComplianceCheck',
  description:
    'Full methodology for our Indian Compliance Penalty Exposure Calculator — every probability assumption, source citation, and calculation formula explained.',
  alternates: {
    canonical: '/calculators/compliance-penalty-calculator/methodology',
  },
}

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link
          href="/calculators/compliance-penalty-calculator"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Calculator
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Methodology: How We Calculate Compliance Penalty Exposure
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          This page documents every assumption, probability rate, and source used in the{' '}
          <Link
            href="/calculators/compliance-penalty-calculator"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Compliance Penalty Exposure Calculator
          </Link>
          . We publish this in full as an E-E-A-T signal and to allow you to challenge or verify any
          figure.
        </p>

        {/* Two-Number Framing */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            The Two-Number Framing
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            We display two figures to avoid both understating and overstating risk:
          </p>
          <ul className="mt-3 space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex gap-2">
              <span className="font-semibold text-blue-700 dark:text-blue-400 min-w-fit">Typical Annual Risk:</span>
              The sum of probability-weighted penalties for each applicable law. For each law, we
              take the realistic penalty exposure and multiply it by the probability that an Indian
              SME in that category is currently non-compliant (the &ldquo;gap rate&rdquo;).
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-red-700 dark:text-red-400 min-w-fit">Maximum Statutory Exposure:</span>
              The sum of statutory ceilings for all applicable laws. This is the worst-case number
              if every violation were prosecuted to the maximum. It is often dominated by DPDP Act
              penalties (₹250 crore for the most serious breach), which skew the figure for any
              business that processes personal data.
            </li>
          </ul>
        </section>

        {/* Gap Rates */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Probability Gap Rates
          </h2>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            These rates represent the proportion of eligible Indian businesses estimated to have a
            compliance gap in each area. A gap rate of 0.42 means 42% of eligible companies are
            estimated to be non-compliant.
          </p>
          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Compliance Area
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                    Gap Rate
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Primary Source
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {GAP_RATE_ROWS.map((row) => (
                  <tr key={row.key} className="bg-white dark:bg-gray-900">
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{row.label}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-blue-700 dark:text-blue-400">
                      {(COMPLIANCE_GAP_RATES[row.key as keyof typeof COMPLIANCE_GAP_RATES] * 100).toFixed(0)}%
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-500">{row.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Per-Law Methodology */}
        <section className="mt-10 space-y-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Per-Law Calculation Formulas
          </h2>

          {FORMULA_SECTIONS.map((s) => (
            <div key={s.id} className="rounded-lg border border-gray-200 p-5 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">{s.title}</h3>
              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">{s.ref}</p>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{s.description}</p>
              <div className="mt-3 rounded bg-gray-50 px-4 py-3 font-mono text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                {s.formula}
              </div>
              {s.assumptions && (
                <ul className="mt-3 space-y-1 text-xs text-gray-500 dark:text-gray-500 list-disc list-inside">
                  {s.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              )}
            </div>
          ))}
        </section>

        {/* Sources */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sources & References</h2>
          <ul className="mt-4 space-y-3">
            {SOURCES.map((src, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="flex-shrink-0 font-semibold text-gray-500">[{i + 1}]</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {src.title}.{' '}
                  {src.url && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {src.url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Limitations */}
        <section className="mt-10 rounded-lg border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/30">
          <h2 className="font-semibold text-amber-800 dark:text-amber-300">
            Limitations & Disclaimer
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-amber-700 dark:text-amber-400 list-disc list-inside">
            <li>Gap rates are aggregate estimates from industry surveys; your company may have zero or far greater exposure.</li>
            <li>Salary assumptions (₹25,000 average monthly wage, EPF ceiling ₹15,000) are used for EPF/ESI calculations.</li>
            <li>DPDP Act enforcement is still evolving; the maximum penalty figures are statutory ceilings per the Schedule, not typical first-violation fines.</li>
            <li>State-specific variations (professional tax, shops &amp; establishments, state labour welfare fund) are not captured.</li>
            <li>This is not legal advice. Rates current as of April 2026.</li>
          </ul>
        </section>

        <div className="mt-10 border-t border-gray-200 pt-8 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Questions about this methodology? Email us at{' '}
            <a href="mailto:compliancecheck@zohomail.in" className="text-blue-600 hover:underline dark:text-blue-400">
              compliancecheck@zohomail.in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Static content data
// ---------------------------------------------------------------------------
const GAP_RATE_ROWS = [
  { key: 'epf_late_payment', label: 'EPF late contribution payment', source: 'CII-Protiviti India Risk Survey 2024' },
  { key: 'esi_late_payment', label: 'ESI late contribution payment', source: 'CII-Protiviti India Risk Survey 2024' },
  { key: 'posh_no_icc', label: 'POSH — No Internal Committee constituted', source: 'Internal assessment data (n=350+ SMEs)' },
  { key: 'posh_no_annual_return', label: 'POSH — Annual return not filed', source: 'Internal assessment data (n=350+ SMEs)' },
  { key: 'dpdp_security_gap', label: 'DPDP — Security safeguards gap', source: 'PwC India DPDP Readiness Survey 2024' },
  { key: 'dpdp_breach_reporting_gap', label: 'DPDP — Breach notification gap', source: 'PwC India DPDP Readiness Survey 2024' },
  { key: 'dpdp_rights_gap', label: 'DPDP — Data Principal rights gap', source: 'PwC India DPDP Readiness Survey 2024' },
  { key: 'dpdp_children_gap', label: 'DPDP — Children\'s data gap (EdTech/Healthcare)', source: 'Internal assessment data' },
  { key: 'labour_code_wage_gap', label: 'Labour Code — Code on Wages violation', source: 'CII-Protiviti India Risk Survey 2024' },
  { key: 'gst_late_filing', label: 'GST late filing', source: 'GSTN Annual Report 2023-24' },
  { key: 'fssai_lapse', label: 'FSSAI licence lapse', source: 'FSSAI Annual Report 2023-24' },
  { key: 'factories_act_lapse', label: 'Factories Act — hazardous process violation', source: 'Internal assessment data' },
  { key: 'gratuity_gap', label: 'Gratuity — non-payment / delayed payment', source: 'Internal assessment data' },
]

const FORMULA_SECTIONS = [
  {
    id: 'epf',
    title: "EPF — Typical Annual Risk",
    ref: 'EPF Act 1952, Section 7Q (interest) + Section 14B (damages), amended June 14, 2024',
    description:
      'We calculate a monthly contribution base using the number of employees × EPF wage ceiling (₹15,000) × 24% combined rate. For one missed cycle, damages = 1% per month + 1% interest = 2% of contribution. Annual typical = 2% × monthly contribution × gap rate (35%) × 12.',
    formula:
      'monthly_contribution = employee_count × 15,000 × 0.24\n' +
      'one_cycle_damages = monthly_contribution × 0.02\n' +
      'typical_annual = one_cycle_damages × 0.35 × 12\n' +
      'max = annual_contribution × 1.0  (100% damages cap)',
    assumptions: [
      'Average monthly wage assumed ₹25,000; EPF contribution ceiling ₹15,000.',
      'Post-June 2024 damages rate of 1%/month (amended from 5-25% sliding scale).',
      'Karnataka HC January 2026 order: damages cannot be reduced below 25% for defaults >6 months.',
    ],
  },
  {
    id: 'esi',
    title: "ESI — Typical Annual Risk",
    ref: 'ESI Act 1948, Section 85',
    description:
      'Monthly contribution = employees × min(average wage, ₹21,000) × 3.25%. Damages at average rate of (5% + 25%) / 2 = 15%. Annual typical = contribution × 15% × gap rate (30%) × 12.',
    formula:
      'monthly_contribution = employee_count × min(avg_wage, 21000) × 0.0325\n' +
      'typical_annual = monthly_contribution × 0.15 × 0.30 × 12\n' +
      'max = monthly_contribution × 0.25 × 12',
    assumptions: ['ESI gross wage ceiling ₹21,000/month. Average damages rate 15% of arrears.'],
  },
  {
    id: 'dpdp',
    title: "DPDP Act 2023 — Typical Annual Risk",
    ref: 'DPDP Act 2023, Schedule (penalty tiers)',
    description:
      'Base risk is tiered by annual turnover as a proxy for data volume and DPB enforcement priority. Multiplied by gap rate of 84% (only 16% of Indian businesses claim DPDP readiness per PwC 2024).',
    formula:
      'base_risk = (turnover < 2Cr) ? 1,00,000 :\n' +
      '            (turnover < 10Cr) ? 5,00,000 :\n' +
      '            (turnover < 50Cr) ? 25,00,000 :\n' +
      '            (turnover < 500Cr) ? 1,00,00,000 : 5,00,00,000\n' +
      'typical = base_risk × 0.84',
    assumptions: [
      'Turnover used as proxy for data volume and regulatory priority.',
      'Only the "security safeguards" breach is base-rated; breach notification, rights, and children\'s data use separate (lower) base risks.',
      'Maximum statutory: ₹250 crore for security failure (Section Schedule, Item 1).',
    ],
  },
  {
    id: 'posh',
    title: "POSH Act 2013 — Typical Annual Risk",
    ref: 'POSH Act 2013, Section 26 (ICC) and Section 21 (annual return)',
    description:
      'Two separate violations: failure to constitute IC (₹50,000, gap rate 42%) and annual return non-filing (₹50,000, gap rate 65%). Both apply to employers with 10+ employees and women employees.',
    formula:
      'icc_risk = 50,000 × 0.42\n' +
      'return_risk = 50,000 × 0.65\n' +
      'typical = icc_risk + return_risk\n' +
      'max = 50,000 + 50,000 = 1,00,000',
    assumptions: ['Applies only when employee count >= 10 AND hasWomenEmployees = true.'],
  },
  {
    id: 'labour',
    title: "Code on Wages 2019 — Typical Annual Risk",
    ref: 'Code on Wages 2019, Section 54 (enforceable since November 21, 2025)',
    description:
      'Penalty ceiling of ₹1 lakh for underpayment or contravention. Gap rate of 70% based on industry survey data on wage structure non-compliance with the 50% basic wage rule.',
    formula:
      'typical = 1,00,000 × 0.70\n' +
      'max = 1,00,000',
    assumptions: ['Applies to all establishments regardless of employee count.'],
  },
]

const SOURCES = [
  {
    title: 'CII-Protiviti India Risk Survey 2024 — HR & Compliance Risk Rankings',
    url: 'https://www.protiviti.com/in-en',
  },
  {
    title: 'PwC India DPDP Readiness Survey 2024 — "Only 16% of Indian businesses claim full DPDP readiness"',
    url: 'https://www.pwc.in',
  },
  {
    title: 'GSTN Annual Report 2023-24 — Late filing statistics',
    url: 'https://www.gst.gov.in',
  },
  {
    title: 'FSSAI Annual Report 2023-24',
    url: 'https://fssai.gov.in',
  },
  {
    title: 'EPFO Circular dated June 14, 2024 — Revised damages rate under Section 14B',
    url: 'https://epfindia.gov.in',
  },
  {
    title: 'Karnataka High Court Order January 2026 — EPF damages floor at 25% for defaults exceeding 6 months',
    url: undefined,
  },
  {
    title: 'Digital Personal Data Protection Act 2023 — Schedule (Penalty Tiers). Ministry of Electronics and Information Technology, Government of India',
    url: 'https://meity.gov.in',
  },
  {
    title: 'Code on Wages 2019 — Central Rules notified November 21, 2025',
    url: 'https://labour.gov.in',
  },
  {
    title: 'ComplianceCheck Internal Assessment Data (n=350+ SME assessments, 2024-2026)',
    url: undefined,
  },
]
