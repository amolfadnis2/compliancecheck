import type { Metadata } from 'next'
import Link from 'next/link'
import styles from '../assessment-landing.module.css'
import { ASSESSMENT_TYPES } from '@/lib/constants/assessment-types'
import { LandingSchema } from '@/lib/seo/LandingSchema'
import { DownloadSampleReportButton } from '@/components/trust/download-sample-report-button'
import { LandingViewTracker } from '@/components/trust/landing-view-tracker'

export const metadata: Metadata = {
  title: 'Auto Dealer Compliance Assessment | Dealer License, GST, Labour, Environment | ComplianceCheck',
  description: 'Complete compliance assessment for automobile dealers in India. Dealer license, GST, labour laws, environmental norms, consumer protection, and service center compliance. ₹1,499 post-beta.',
  alternates: {
    canonical: 'https://compliancecheck.co.in/assessments/landing/auto-dealer-compliance',
  },
  openGraph: {
    title: 'Auto Dealer Compliance Assessment | ComplianceCheck',
    description: 'Dealer license, GST, labour, environmental norms, and 8 compliance areas for automobile dealers. Gap analysis with action plan.',
    type: 'website',
    url: 'https://compliancecheck.co.in/assessments/landing/auto-dealer-compliance',
    siteName: 'ComplianceCheck',
  },
}

export default function AutoDealerCompliancePage() {
  const accentColor = '#1D4ED8'
  const accentLight = '#3B82F6'

  return (
    <div className={styles.page}>
      <LandingSchema type={ASSESSMENT_TYPES.AUTO_DEALER} />
      <LandingViewTracker assessmentType={ASSESSMENT_TYPES.AUTO_DEALER} source="landing_page" />
      <nav className={styles.nav}>
        <div className={styles.container}>
          <div className={styles.navContent}>
            <Link href="/" className={styles.logo}><div className={styles.logoIcon}>✓</div>ComplianceCheck</Link>
            <Link href="/assessment/auto-dealer" className={styles.navCta} style={{ background: accentColor }}>Start Free Assessment</Link>
          </div>
        </div>
      </nav>

      <section className={styles.hero} style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #EFF6FF 100%)' }}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div>
              <div className={styles.heroBadge} style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30`, color: accentColor }}>
                🚗 Auto Dealer Compliance
              </div>
              <h1 className={styles.heroTitle}>Auto Dealer Compliance Assessment</h1>
              <p className={styles.heroSubtitle}>
                Complete compliance check for new and used automobile dealers, two-wheeler showrooms, and multi-brand outlets. Covers dealer licensing, GST, labour laws, environmental norms, and consumer protection in one assessment.
              </p>
              <ul className={styles.heroFeatures}>
                {[
                  'Dealer license & trade certificate compliance',
                  'GST obligations for vehicle dealers',
                  'Labour law & service center compliance',
                  'Environmental & scrap disposal norms',
                  'Consumer Protection Act obligations',
                  'Finance & insurance regulatory checks',
                ].map((feature, i) => (
                  <li key={i}><span className={styles.featureCheck} style={{ background: `${accentColor}15`, color: accentColor }}>✓</span>{feature}</li>
                ))}
              </ul>
              <Link href="/assessment/auto-dealer" className={styles.btnPrimary} style={{ background: accentColor, boxShadow: `0 4px 14px ${accentColor}50` }}>
                Start Free Assessment →
              </Link>
              <div style={{ marginTop: '16px' }}>
                <DownloadSampleReportButton assessmentType={ASSESSMENT_TYPES.AUTO_DEALER} source="landing_page" />
              </div>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.visualHeader}>
                <div className={styles.visualIcon} style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)` }}>🚗</div>
                <div className={styles.visualTitle}>8 Compliance Areas</div>
              </div>
              <div className={styles.visualAreas} style={{ gridTemplateColumns: '1fr' }}>
                {[
                  { icon: '📋', name: 'Dealer License & Trade Certificate' },
                  { icon: '💰', name: 'GST Compliance' },
                  { icon: '👥', name: 'Labour Law Compliance' },
                  { icon: '🌿', name: 'Environmental Norms' },
                  { icon: '🛡️', name: 'Consumer Protection' },
                  { icon: '🏦', name: 'Finance & Insurance Regulations' },
                  { icon: '🏪', name: 'Trade License & Shops Act' },
                  { icon: '🔧', name: 'Service Center Standards' },
                ].map((area, i) => (
                  <div key={i} className={styles.areaItem} style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left', padding: '10px 14px' }}>
                    <span style={{ fontSize: '16px' }}>{area.icon}</span><span style={{ fontSize: '13px' }}>{area.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.statsBar}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}><h3>35-50</h3><p>Questions</p></div>
            <div className={styles.statItem}><h3>20 min</h3><p>To Complete</p></div>
            <div className={styles.statItem}><h3>8</h3><p>Compliance Areas</p></div>
            <div className={styles.statItem}><h3>₹1,499</h3><p>Post-Beta Price</p></div>
          </div>
        </div>
      </section>

      <section className={styles.coverage}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}><h2>What&apos;s Covered in This Assessment</h2><p>Comprehensive compliance check for all automobile dealer requirements</p></div>
          <div className={styles.coverageGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {[
              {
                title: 'Dealer License & Trade Certificate',
                desc: 'State Transport Authority dealer authorization, trade certificate for test drives, Form 20/21 vehicle registration obligations, dealership agreement compliance, and OEM franchise requirements.',
              },
              {
                title: 'GST Compliance',
                desc: 'Vehicle HSN codes and applicable rates, input tax credit on purchases, margin scheme for used vehicles, GST on accessories and AMC contracts, e-invoicing applicability, and return filing timelines.',
              },
              {
                title: 'Labour Law Compliance',
                desc: 'EPF/ESI applicability for dealership and workshop staff, minimum wages for automotive sector, working hours under Shops & Establishments Act, contract labour regulations, and POSH policy requirements.',
              },
              {
                title: 'Environmental Norms',
                desc: 'CPCB guidelines for battery and tyre disposal, hazardous waste (used oil, coolants) handling, Pollution Under Control (PUC) centre compliance if operating one, and State Pollution Control Board authorizations.',
              },
              {
                title: 'Consumer Protection',
                desc: 'Consumer Protection Act 2019 obligations, mandatory warranty and after-sales disclosures, misleading advertisement restrictions, unfair trade practice safeguards, and CCPA compliance for grievance redressal.',
              },
              {
                title: 'Finance & Insurance Regulations',
                desc: 'IRDAI regulations for vehicle insurance cross-selling, RBI guidelines if providing in-house financing or acting as DSA, DSA/LSP registration requirements, and fair lending practice disclosures.',
              },
              {
                title: 'Trade License & Shops Act',
                desc: 'Municipal trade and signage license, fire NOC for showroom and workshop, Shops & Establishments registration for all outlets, and display compliance under local body regulations.',
              },
              {
                title: 'Service Center Standards',
                desc: 'Occupational safety under Factories/Shops Act for workshop technicians, tool and lift certification, technician certification requirements (OEM mandated), and customer vehicle data privacy obligations.',
              },
            ].map((item, i) => (
              <div key={i} className={styles.coverageCard} style={{ borderLeft: `4px solid ${accentColor}` }}><h3>{item.title}</h3><p>{item.desc}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0', background: '#EFF6FF' }}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}><h2>Who Is This For?</h2><p>Tailored for all segments of the automobile dealership ecosystem</p></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '40px' }}>
            {[
              { icon: '🚘', name: 'New Car Dealers', desc: 'OEM franchise showrooms' },
              { icon: '🏷️', name: 'Used Car Dealers', desc: 'Pre-owned vehicle outlets' },
              { icon: '🛵', name: 'Two-Wheeler Dealers', desc: 'Bikes & scooter outlets' },
              { icon: '🚛', name: 'Commercial Vehicle', desc: 'Trucks & bus dealers' },
              { icon: '🔧', name: 'Authorized Service', desc: 'OEM service centers' },
              { icon: '🏪', name: 'Multi-Brand Outlets', desc: 'Independent dealers' },
              { icon: '⚡', name: 'EV Dealers', desc: 'Electric vehicle outlets' },
              { icon: '🏭', name: 'Spare Parts Dealers', desc: 'Auto parts distributors' },
            ].map((type, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '24px 16px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{type.icon}</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{type.name}</div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>{type.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.howItWorks} style={{ background: 'white' }}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}><h2>How It Works</h2><p>Get your dealership compliance status in 4 simple steps</p></div>
          <div className={styles.stepsGrid}>
            {[
              { title: 'Dealership Profile', desc: 'Tell us your dealer type, OEM brand, state, and whether you operate a service center' },
              { title: 'Smart Filtering', desc: 'Questions filtered based on your profile — 35 to 50 questions covering only relevant regulations' },
              { title: 'Gap Analysis', desc: 'See compliance status across all 8 areas with risk classification (High / Medium / Low)' },
              { title: 'Action Plan', desc: 'Get a prioritized remediation checklist with government portal links and timelines' },
            ].map((step, i) => (
              <div key={i} className={styles.stepCard} style={{ background: '#F9FAFB' }}>
                <div className={styles.stepNumber} style={{ background: accentColor }}>{i + 1}</div>
                <h3>{step.title}</h3><p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sampleOutput} style={{ background: '#EFF6FF' }}>
        <div className={styles.container}>
          <div className={styles.sampleGrid}>
            <div className={styles.samplePreview}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>Auto Dealer Report</div>
                <div style={{ padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', background: 'rgba(217, 119, 6, 0.2)', color: '#FBBF24' }}>Needs Attention</div>
              </div>
              <div className={styles.sampleScore}>
                <div className={styles.scoreCircle} style={{ background: `conic-gradient(${accentColor} 0% 65%, rgba(255,255,255,0.1) 65% 100%)` }}>
                  <div className={styles.scoreInner}><span className={styles.scoreValue}>65%</span><span className={styles.scoreLabel}>Compliant</span></div>
                </div>
              </div>
              <div className={styles.categoryBars}>
                {[
                  { name: 'Dealer License', percent: 90, color: 'barGreen' },
                  { name: 'GST', percent: 80, color: 'barGreen' },
                  { name: 'Labour', percent: 55, color: 'barYellow' },
                  { name: 'Environment', percent: 30, color: 'barRed' },
                  { name: 'Consumer', percent: 70, color: 'barYellow' },
                  { name: 'Service Center', percent: 60, color: 'barYellow' },
                ].map((cat, i) => (
                  <div key={i} className={styles.categoryBar}>
                    <span className={styles.categoryName}>{cat.name}</span>
                    <div className={styles.barContainer}><div className={`${styles.barFill} ${styles[cat.color]}`} style={{ width: `${cat.percent}%` }} /></div>
                    <span className={styles.categoryPercent}>{cat.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.sampleFeatures}>
              <h3>What You&apos;ll Get</h3>
              <ul className={styles.featureList}>
                {[
                  { title: 'Compliance Score', desc: 'Overall and area-wise compliance percentage' },
                  { title: 'License Checklist', desc: 'All required licenses with application process and renewal dates' },
                  { title: 'Gap Analysis', desc: 'Specific missing requirements identified for each area' },
                  { title: 'Risk Assessment', desc: 'Penalty exposure under Motor Vehicles Act, GST, and labour laws' },
                  { title: 'Remediation Guide', desc: 'Step-by-step action items with government portal links' },
                  { title: 'Audit Readiness Score', desc: 'How prepared you are for a surprise inspection by RTO or labour dept.' },
                ].map((feature, i) => (
                  <li key={i}><span style={{ color: accentColor, fontWeight: 700 }}>✓</span><span><strong>{feature.title}</strong> — {feature.desc}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.pricing} style={{ background: 'white' }}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}><h2>Simple, Transparent Pricing</h2><p>No subscriptions. Pay only when you need an assessment.</p></div>
          <div className={styles.pricingCard} style={{ borderColor: accentColor, boxShadow: `0 4px 20px ${accentColor}20` }}>
            <div className={styles.pricingBadge} style={{ background: `${accentColor}15`, color: accentColor }}>🎉 Free During Beta</div>
            <div className={styles.pricingAmount}>₹1,499</div>
            <div className={styles.pricingPeriod}>One-time assessment fee (post-beta)</div>
            <ul className={styles.pricingFeatures}>
              {[
                'Complete 8-area dealer compliance check',
                'OEM and dealer-type smart filtering',
                'License requirement checklist',
                'Gap analysis with risk prioritization',
                'Environmental compliance checklist',
                'Government portal & application links',
                'Professional PDF report',
              ].map((feature, i) => (
                <li key={i}><span style={{ color: accentColor, fontWeight: 700 }}>✓</span>{feature}</li>
              ))}
            </ul>
            <Link href="/assessment/auto-dealer" className={styles.btnPrimary} style={{ background: accentColor, boxShadow: `0 4px 14px ${accentColor}50`, width: '100%', justifyContent: 'center' }}>
              Start Free Assessment →
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.finalCta}>
        <div className={styles.container}>
          <h2>Is Your Dealership Fully Compliant?</h2>
          <p>Avoid RTO actions, GST notices, and labour inspections. Get a complete compliance check today.</p>
          <Link href="/assessment/auto-dealer" className={styles.btnWhite}>Start Free Assessment →</Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerLinks}>
              <Link href="/">Home</Link>
              <Link href="/">All Assessments</Link>
              <Link href="/blog">Guides</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
            </div>
            <div className={styles.footerCopy}>© 2025 ComplianceCheck. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
