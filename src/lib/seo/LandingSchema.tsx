/**
 * LandingSchema — emits Service + BreadcrumbList + FAQPage JSON-LD for an
 * assessment landing page in one line. Drop it inside the page's returned JSX.
 *
 *   <LandingSchema type={ASSESSMENT_TYPES.DPDP} />
 */

import { type AssessmentType } from '@/lib/constants/assessment-types'
import { getAssessmentMeta, describeAssessment } from './assessment-meta'
import { serviceSchema, breadcrumbSchema, faqSchema } from './schema'
import { JsonLd } from './JsonLd'

export function LandingSchema({ type }: { type: AssessmentType }) {
  const meta = getAssessmentMeta(type)
  const d = describeAssessment(meta)

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: d.name,
          description: d.blurb,
          url: d.landingPath,
          pricePaise: d.pricePaise,
          isFree: d.isFree,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Assessments', path: '/' },
          { name: d.name, path: d.landingPath },
        ])}
      />
      {d.faqs.length > 0 && <JsonLd data={faqSchema(d.faqs)} />}
    </>
  )
}
