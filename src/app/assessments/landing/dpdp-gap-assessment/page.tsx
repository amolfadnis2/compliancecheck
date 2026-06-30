import type { Metadata } from 'next'
import Link from 'next/link'
import styles from '../assessment-landing.module.css'
import { ASSESSMENT_TYPES } from '@/lib/constants/assessment-types'
import { LandingSchema } from '@/lib/seo/LandingSchema'

export const metadata: Metadata = {
  title: 'DPDP Act 2023 Gap Assessment | Data Protection Compliance | ComplianceCheck',
  description: 'Comprehensive DPDP Act 2023 compliance assessment. 6-phase evaluation with maturity scoring, gap analysis, and remediation roadmap. ₹2,499 post-beta.',
  alternates: {
    canonical: 'https://compliancecheck.co.in/assessments/landing/dpdp-gap-assessment',
  },
  openGraph: {
    title: 'DPDP Gap Assessment | ComplianceCheck',
    description: "India's first data protection law. Assess your readiness with our 45-question gap analysis.",
    type: 'website',
    url: 'https://compliancecheck.co.in/assessments/landing/dpdp-gap-assessment',
    siteName: 'ComplianceCheck',
  },
}

export default function DPDPGapAssessmentPage() {
  const accentColor = '#7C3AED'
  const accentLight = '#8B5CF6'

  return (
    <div className={styles.page}>
      <LandingSchema type={ASSESSMENT_TYPES.DPDP} />
      <nav className={styles.nav}>
        <div className={styles.container}>
          <div className={styles.navContent}>
            <Link href="/" className={styles.logo}><div className={styles.logoIcon}>✓</div>ComplianceCheck</Link>
            <Link href="/assessment/dpdp" className={styles.navCta} style={{ background: accentColor }}>Start Free Assessment</Link>
          </div>
        </div>
      </nav>

      <section className={styles.hero} style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF5FF 100%)' }}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div>
              <div className={styles.heroBadge} style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30`, color: accentColor }}>
                🔒 India&apos;s First Data Protection Law
              </div>
              <h1 className={styles.heroTitle}>DPDP Act 2023 Gap Assessment</h1>
              <p className={styles.heroSubtitle}>
                Comprehensive assessment of your Digital Personal Data Protection Act compliance. Evaluate across 6 phases, get maturity scoring, and receive a prioritized remediation roadmap.
              </p>
              <ul className={styles.heroFeatures}>
                {["Data discovery & inventory assessment", "Consent management evaluation", "Data Principal rights readiness", "Security safeguards review", "Governance framework check", "Cross-border transfer compliance"].map((feature, i) => (
                  <li key={i}><span className={styles.featureCheck} style={{ background: `${accentColor}15`, color: accentColor }}>✓</span>{feature}</li>
                ))}
              </ul>
              <Link href="/assessment/dpdp" className={styles.btnPrimary} style={{ background: accentColor, boxShadow: `0 4px 14px ${accentColor}50` }}>
                Start Free Assessment →
              </Link>
              <div className={styles.alertBanner} style={{ background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
                <div className={styles.alertIcon} style={{ background: 'rgba(220, 38, 38, 0.1)' }}>⚠️</div>
                <div className={styles.alertContent}>
                  <h4 style={{ color: '#DC2626' }}>Penalties up to ₹250 Crore</h4>
                  <p>Non-compliance can result in penalties ranging from ₹50 Crore to ₹250 Crore. Compliance deadline is expected by May 2027.</p>
                </div>
              </div>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.visualHeader}>
                <div className={styles.visualIcon} style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)` }}>🔒</div>
                <div className={styles.visualTitle}>6 Assessment Phases</div>
              </div>
              <div className={styles.visualAreas} style={{ gridTemplateColumns: '1fr' }}>
                {[{ num: '01', name: 'Data Discovery & Inventory' }, { num: '02', name: 'Consent Management' }, { num: '03', name: 'Data Principal Rights' }, { num: '04', name: 'Security Safeguards' }, { num: '05', name: 'Governance Framework' }, { num: '06', name: 'Cross-Border Transfers' }].map((phase, i) => (
                  <div key={i} className={styles.areaItem} style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: accentLight, background: 'rgba(124, 58, 237, 0.2)', padding: '4px 8px', borderRadius: '4px' }}>{phase.num}</span>
                    <span style={{ fontSize: '13px' }}>{phase.name}</span>
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
            <div className={styles.statItem}><h3>45</h3><p>Questions</p></div>
            <div className={styles.statItem}><h3>6</h3><p>Assessment Phases</p></div>
            <div className={styles.statItem}><h3>₹250Cr</h3><p>Max Penalty</p></div>
            <div className={styles.statItem}><h3>₹2,499</h3><p>Post-Beta Price</p></div>
          </div>
        </div>
      </section>

      <section className={styles.coverage}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}><h2>What&apos;s Covered in This Assessment</h2><p>Comprehensive evaluation across all DPDP Act requirements</p></div>
          <div className={styles.coverageGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {[
              { title: 'Phase 1: Data Discovery', desc: 'Identify all personal data processed, data sources, storage locations, processing purposes, and create a comprehensive data inventory as required under Section 4.' },
              { title: 'Phase 2: Consent Management', desc: 'Evaluate consent collection mechanisms, clarity of purpose specification, withdrawal mechanisms, and compliance with Section 6 consent requirements.' },
              { title: 'Phase 3: Principal Rights', desc: 'Assess readiness to handle Data Principal rights under Sections 11-14: right to access, correction, erasure, and grievance redressal mechanisms.' },
              { title: 'Phase 4: Security Safeguards', desc: 'Review technical and organizational measures under Section 8: encryption, access controls, breach detection, and incident response procedures.' },
              { title: 'Phase 5: Governance', desc: 'Evaluate data protection governance: DPO appointment (if required), policies, training programs, and accountability frameworks under Sections 8-10.' },
              { title: 'Phase 6: Cross-Border', desc: 'Check compliance with cross-border data transfer restrictions under Section 16, including government-notified country requirements.' }
            ].map((item, i) => (
              <div key={i} className={styles.coverageCard} style={{ borderLeft: `4px solid ${accentColor}` }}><h3>{item.title}</h3><p>{item.desc}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0', background: '#FAF5FF' }}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}><h2>5-Level Maturity Model</h2><p>Understand exactly where you stand in your DPDP compliance journey</p></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginTop: '40px' }}>
            {[
              { level: 1, name: 'Initial', color: '#DC2626', desc: 'Ad-hoc processes, no formal data protection' },
              { level: 2, name: 'Developing', color: '#F59E0B', desc: 'Some policies exist but inconsistent' },
              { level: 3, name: 'Defined', color: '#EAB308', desc: 'Documented processes, partial implementation' },
              { level: 4, name: 'Managed', color: '#22C55E', desc: 'Consistent implementation, regular reviews' },
              { level: 5, name: 'Optimized', color: '#059669', desc: 'Continuous improvement, full compliance' }
            ].map((level, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '24px 16px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: level.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', margin: '0 auto 12px' }}>{level.level}</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>{level.name}</div>
                <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: '1.4' }}>{level.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.howItWorks} style={{ background: 'white' }}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}><h2>How It Works</h2><p>Get your DPDP compliance status in 4 simple steps</p></div>
          <div className={styles.stepsGrid}>
            {[
              { title: 'Answer Questions', desc: '45 questions across 6 phases of data protection compliance' },
              { title: 'Get Maturity Score', desc: 'Receive your maturity level (1-5) with phase-wise breakdown' },
              { title: 'Review Gap Analysis', desc: 'Identify specific gaps against DPDP Act requirements' },
              { title: 'Download Roadmap', desc: 'Get prioritized remediation steps with legal references' }
            ].map((step, i) => (
              <div key={i} className={styles.stepCard} style={{ background: '#F9FAFB' }}>
                <div className={styles.stepNumber} style={{ background: accentColor }}>{i + 1}</div>
                <h3>{step.title}</h3><p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sampleOutput} style={{ background: '#FAF5FF' }}>
        <div className={styles.container}>
          <div className={styles.sampleGrid}>
            <div className={styles.samplePreview}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>DPDP Compliance Report</div>
                <div style={{ padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', background: 'rgba(245, 158, 11, 0.2)', color: '#FBBF24' }}>Developing</div>
              </div>
              <div className={styles.sampleScore}>
                <div className={styles.scoreCircle} style={{ background: `conic-gradient(${accentColor} 0% 42%, rgba(255,255,255,0.1) 42% 100%)` }}>
                  <div className={styles.scoreInner}><span className={styles.scoreValue}>42</span><span className={styles.scoreLabel}>/ 100</span></div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[{ name: 'Data Discovery', percent: 60 }, { name: 'Consent', percent: 45 }, { name: 'Principal Rights', percent: 30 }, { name: 'Security', percent: 55 }, { name: 'Governance', percent: 35 }, { name: 'Cross-Border', percent: 25 }].map((phase, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '100px', fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{phase.name}</span>
                    <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                      <div style={{ width: `${phase.percent}%`, height: '100%', background: accentLight, borderRadius: '3px' }} />
                    </div>
                    <span style={{ width: '30px', fontSize: '11px', textAlign: 'right' }}>{phase.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.sampleFeatures}>
              <h3>What You&apos;ll Get</h3>
              <ul className={styles.featureList}>
                {[{ title: 'Maturity Level', desc: '5-level maturity assessment (Initial to Optimized)' }, { title: 'Phase-wise Scores', desc: 'Individual scores for all 6 assessment phases' }, { title: 'Gap Identification', desc: 'Specific non-compliances with DPDP Act sections' }, { title: 'Risk Assessment', desc: 'Penalty exposure based on identified gaps' }, { title: 'Remediation Roadmap', desc: 'Prioritized action items with timelines' }, { title: 'Legal References', desc: 'DPDP Act section citations for each requirement' }].map((feature, i) => (
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
            <div className={styles.pricingAmount}>₹2,499</div>
            <div className={styles.pricingPeriod}>One-time assessment fee (post-beta)</div>
            <ul className={styles.pricingFeatures}>
              {['Complete 45-question assessment', '6-phase evaluation', '5-level maturity scoring', 'DPDP Act section mapping', 'Penalty risk assessment', 'Remediation roadmap', 'Professional PDF report'].map((feature, i) => (
                <li key={i}><span style={{ color: accentColor, fontWeight: 700 }}>✓</span>{feature}</li>
              ))}
            </ul>
            <Link href="/assessment/dpdp" className={styles.btnPrimary} style={{ background: accentColor, boxShadow: `0 4px 14px ${accentColor}50`, width: '100%', justifyContent: 'center' }}>
              Start Free Assessment →
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.finalCta}>
        <div className={styles.container}>
          <h2>Is Your Business DPDP Ready?</h2>
          <p>Don&apos;t risk ₹250 Crore penalties. Assess your data protection compliance today.</p>
          <Link href="/assessment/dpdp" className={styles.btnWhite}>Start Free Assessment →</Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerLinks}><Link href="/">Home</Link><Link href="/">All Assessments</Link><Link href="/blog">Guides</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms of Service</Link></div>
            <div className={styles.footerCopy}>© 2025 ComplianceCheck. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
