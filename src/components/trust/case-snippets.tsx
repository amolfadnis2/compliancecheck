import { AlertTriangle, CheckCircle } from 'lucide-react'

interface CaseSnippet {
  finding: string
  exposure: string
  fix: string
}

// Composited/illustrative examples of the kind of gaps ComplianceCheck finds —
// not a real named client. No "reviewed by" or credentialed-expert claims
// (constitution: no CA/advocate on staff yet — see CLAUDE.md PRD context).
const CASE_SNIPPETS: CaseSnippet[] = [
  {
    finding: 'A 40-person SaaS company had no DPDP consent notice on its lead capture form.',
    exposure: 'Up to Rs. 250 Cr penalty exposure under the DPDP Act for unlawful data collection.',
    fix: 'Added a compliant, purpose-specific consent notice and grievance officer contact — closed in 1 day.',
  },
  {
    finding: 'A restaurant chain was paying PF and ESI contributions after the 15th of the month, every month.',
    exposure: '12% interest plus 5-25% damages on every late deposit, compounding each cycle.',
    fix: 'Moved payroll to an automated deposit schedule with a 3-day buffer before the deadline.',
  },
  {
    finding: 'A 60-employee manufacturer had never constituted an Internal Complaints Committee under POSH.',
    exposure: 'Rs. 50,000 fine on first offence, rising to licence cancellation on repeat non-compliance.',
    fix: 'Nominated ICC members, filed the constitution order, and displayed the mandatory workplace notice.',
  },
]

export function CaseSnippets() {
  return (
    <section className="py-16 bg-white dark:bg-gray-900" aria-labelledby="case-snippets-heading">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 id="case-snippets-heading" className="text-3xl font-bold text-gray-900 dark:text-white">
            What ComplianceCheck actually finds
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Illustrative examples of the kind of gaps our assessments surface — and how they get fixed.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {CASE_SNIPPETS.map((snippet, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-6 flex flex-col gap-4"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{snippet.finding}</p>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 pl-7">{snippet.exposure}</p>
              <div className="flex items-start gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-gray-700 dark:text-gray-300">{snippet.fix}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-gray-400">
          Illustrative examples, not verified case studies
        </p>
      </div>
    </section>
  )
}
