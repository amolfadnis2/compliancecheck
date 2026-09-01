import Link from 'next/link'
import styles from '@/app/assessments/landing/assessment-landing.module.css'
import {
  ASSESSMENT_PRICES,
  isPaymentLive,
  type AssessmentType,
} from '@/lib/constants/assessment-types'
import { getSampleReportPath } from '@/lib/pdf/sample-report-paths'

/**
 * Pricing card for the assessment landing pages.
 *
 * Price and free/paid wording come from ASSESSMENT_PRICES (CLAUDE.md sec 9) so
 * a landing page can never advertise a price or a "free during beta" badge
 * that contradicts what the paywall actually charges — which is exactly what
 * had drifted on the Statutory Health and DPDP pages.
 *
 * Where a sample report exists it is linked here: the report IS the product,
 * so letting a buyer read one before paying is the strongest evidence we have.
 */
export function LandingPricingCard({
  type,
  accentColor,
  features,
  ctaHref,
}: {
  type: AssessmentType
  accentColor: string
  features: string[]
  ctaHref: string
}) {
  const priceINR = Math.round(ASSESSMENT_PRICES[type].amountPaise / 100)
  const live = isPaymentLive(type)
  const samplePath = getSampleReportPath(type)

  return (
    <div
      className={styles.pricingCard}
      style={{ borderColor: accentColor, boxShadow: `0 4px 20px ${accentColor}20` }}
    >
      <div className={styles.pricingBadge} style={{ background: `${accentColor}15`, color: accentColor }}>
        {live ? 'Free summary - pay only to unlock the full report' : 'Free during early access'}
      </div>
      <div className={styles.pricingAmount}>₹{priceINR.toLocaleString('en-IN')}</div>
      <div className={styles.pricingPeriod}>
        {live
          ? 'One-time. No subscription. 7-day refund if it is not useful.'
          : 'One-time fee when payment goes live. Free right now.'}
      </div>
      <ul className={styles.pricingFeatures}>
        {features.map((feature) => (
          <li key={feature}>
            <span style={{ color: accentColor, fontWeight: 700 }}>✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className={styles.btnPrimary}
        style={{
          background: accentColor,
          boxShadow: `0 4px 14px ${accentColor}50`,
          width: '100%',
          justifyContent: 'center',
        }}
      >
        Start Free Assessment →
      </Link>
      {samplePath && (
        <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <a href={samplePath} target="_blank" rel="noopener noreferrer" style={{ color: accentColor, fontWeight: 600 }}>
            See a full sample report (PDF) →
          </a>
          <br />
          <span style={{ color: '#6B7280' }}>Real format, fictional company. No email required.</span>
        </p>
      )}
    </div>
  )
}
