/**
 * AssessmentCTA — conversion card linking a guide/article to the relevant
 * assessment. Pulls name + route + price from the assessment-meta single source
 * of truth so copy stays in sync with the product.
 */

import Link from 'next/link'
import { type AssessmentType } from '@/lib/constants/assessment-types'
import { getAssessmentMeta, describeAssessment } from '@/lib/seo/assessment-meta'
import { formatPrice } from '@/lib/constants/india'

export function AssessmentCTA({ type }: { type: AssessmentType }) {
  const d = describeAssessment(getAssessmentMeta(type))
  const priceLabel = d.isFree ? 'Free during beta' : `From ${formatPrice(d.pricePaise / 100)}`

  return (
    <div className="my-10 rounded-xl border border-primary/30 bg-primary/5 p-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">
        Check your status
      </p>
      <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{d.name}</h3>
      <p className="mt-2 text-gray-700 dark:text-gray-300">{d.blurb}</p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Link
          href={d.assessmentPath}
          className="rounded-md bg-primary px-5 py-2.5 font-medium text-white hover:bg-primary-dark"
        >
          Start free assessment →
        </Link>
        <span className="text-sm text-gray-500 dark:text-gray-400">{priceLabel} · no subscription</span>
      </div>
    </div>
  )
}
