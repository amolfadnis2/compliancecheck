import type { Metadata } from 'next'
import Link from 'next/link'
import styles from '../assessment-landing.module.css'

export const metadata: Metadata = {
  title: 'Labour Code Readiness Assessment | Nov 2025 Deadline | ComplianceCheck',
  description: "Prepare for India's 4 new Labour Codes effective November 2025. Get implementation cost estimates, gap analysis, and action plan. ₹1,999 post-beta.",
  openGraph: {
    title: 'Labour Code Readiness Assessment | ComplianceCheck',
    description: 'Are you ready for the 4 new Labour Codes? Assessment with cost estimates and implementation roadmap.',
    type: 'website',
  },
}

export default function LabourCodeReadinessPage() {
  const accentColor = '#D97706'
  const accentLight = '#F59E0B'

  return (
    <div className={styles.page}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.container}>
          <div className={styles.navContent}>
            <Link href="/" className={styles.logo}><div className={styles.logoIcon}>✓</div>ComplianceCheck</Link>
            <Link href="/assessments/labour-code" className={styles.navCta} style={{ background: accentColor }}>Start Free Assessment</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero} style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFBEB 100%)' }}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div>
              <div className={styles.heroBadge} style={{ background: '#DC262615', border: '1px solid #DC262630', color: '#DC2626' }}>
                ⏰ Deadline: November 2025
              </div>
              <h1 className={styles.heroTitle}>Labour Code Readiness Assessment</h1>
              <p className={styles.heroSubtitle}>
                India&apos;s 4 new Labour Codes become effective November 2025. Assess your readiness, understand implementation costs, and get a prioritized action plan before the deadline.
              </p>
              <ul className={styles.heroFeatures}>
                {["Code on Wages, 2019 compliance", "Code on Social Security, 2020 requirements", "Occupational Safety, Health & Working Conditions", "Industrial Relations Code readiness", "Implementation cost estimates"].map((feature, i) => (
                  <li key={i}><span className={styles.featureCheck} style={{ background: `${accentColor}15`, color: accentColor }}>✓</span>{feature}</li>
                ))}
              </ul>
              <Link href="/assessments/labour-code" className={styles.btnPrimary} style={{ background: accentColor, boxShadow: `0 4px 14px ${accentColor}50` }}>
                Start Free Assessment →
              </Link>
              <div className={styles.alertBanner} style={{ background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
                <div className={styles.alertIcon} style={{ background: 'rgba(220, 38, 38, 0.1)' }}>⚠️</div>
                <div className={styles.alertContent}>
                  <h4 style={{ color: '#DC2626' }}>Major Changes Ahead</h4>
                  <p>The new codes will consolidate 29 existing labour laws. Changes to wage structure, working hours, leave policy, and social security contributions will affect every employer.</p>
                </div>
              </div>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.visualHeader}>
                <div className={styles.visualIcon} style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)` }}>⚖️</div>
                <div className={styles.visualTitle}>4 Labour Codes Covered</div>
              </div>
              <div className={styles.visualAreas} style={{ gridTemplateColumns: '1fr' }}>
                {[{ icon: '💰', name: 'Code on Wages, 2019' }, { icon: '🛡️', name: 'Social Security Code, 2020' }, { icon: '🏭', name: 'OSH Code, 2020' }, { icon: '🤝', name: 'Industrial Relations Code, 2020' }].map((code, i) => (
                  <div key={i} className={styles.areaItem} style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                    <span style={{ fontSize: '20px' }}>{code.icon}</span><span>{code.name}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(220, 38, 38, 0.2)', borderRadius: '8px', textAlign: 'center', fontSize: '13px', color: '#FCA5A5' }}>
                Effective: November 2025
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className={styles.statsBar}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}><h3>30</h3><p>Questions</p></div>
            <div className={styles.statItem}><h3>15-20</h3><p>After Filtering</p></div>
            <div className={styles.statItem}><h3>4</h3><p>Labour Codes</p></div>
            <div className={styles.statItem}><h3>₹1,999</h3><p>Post-Beta Price</p></div>
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className={styles.coverage}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}><h2>What&apos;s Covered in This Assessment</h2><p>Comprehensive readiness check across all 4 new Labour Codes</p></div>
          <div className={styles.coverageGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {[
              { title: 'Code on Wages, 2019', desc: 'New wage definitions, minimum wage applicability, payment timelines (7 days for daily/weekly, 10 days for monthly), deduction limits (50%), and equal remuneration requirements.' },
              { title: 'Social Security Code, 2020', desc: 'Revised EPF/ESI thresholds, gratuity changes (eligibility after 1 year for fixed-term), new gig worker provisions, and unified registration under single portal.' },
              { title: 'OSH Code, 2020', desc: 'Working hours (max 8 hours/day), overtime limits (125 hours/quarter), annual leave (1 day per 20 days worked), and safety committee requirements.' },
              { title: 'Industrial Relations Code, 2020', desc: 'Standing orders applicability (300+ employees), strike/lockout notice (60 days), retrenchment thresholds, and fixed-term employment provisions.' }
            ].map((item, i) => (
              <div key={i} className={styles.coverageCard} style={{ borderLeft: `4px solid ${accentColor}` }}><h3>{item.title}</h3><p>{item.desc}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks} style={{ background: '#FFFBEB' }}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}><h2>How It Works</h2><p>Get your readiness assessment in 4 simple steps</p></div>
          <div className={styles.stepsGrid}>
            {[
              { title: 'Company Profile', desc: 'Basic questions about your industry, employee count, and locations' },
              { title: 'Smart Filtering', desc: 'Questions automatically filtered based on your profile (30 → 15-20)' },
              { title: 'Gap Analysis', desc: 'Code-wise readiness score with implementation cost estimates' },
              { title: 'Action Plan', desc: 'Prioritized timeline with steps to achieve compliance by Nov 2025' }
            ].map((step, i) => (
              <div key={i} className={styles.stepCard} style={{ background: 'white' }}>
                <div className={styles.stepNumber} style={{ background: accentColor }}>{i + 1}</div>
                <h3>{step.title}</h3><p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Output */}
      <section className={styles.sampleOutput}>
        <div className={styles.container}>
          <div className={styles.sampleGrid}>
            <div className={styles.samplePreview}>
              <div className={styles.sampleScore}>
                <div className={styles.scoreCircle} style={{ background: `conic-gradient(${accentColor} 0% 54%, rgba(255,255,255,0.1) 54% 100%)` }}>
                  <div className={styles.scoreInner}><span className={styles.scoreValue}>54%</span><span className={styles.scoreLabel}>Ready</span></div>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '16px', marginBottom: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>Est. Implementation Cost</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: accentLight }}>₹2.4L - ₹3.8L</div>
              </div>
              <div className={styles.categoryBars}>
                {[{ name: 'Wages Code', percent: 70, color: 'barYellow' }, { name: 'Social Security', percent: 45, color: 'barYellow' }, { name: 'OSH Code', percent: 60, color: 'barYellow' }, { name: 'IR Code', percent: 40, color: 'barRed' }].map((cat, i) => (
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
                {[{ title: 'Readiness Score', desc: 'Overall and code-wise readiness percentage' }, { title: 'Cost Estimates', desc: 'Projected implementation costs for your company size' }, { title: 'Timeline Planning', desc: 'Month-wise milestones to meet Nov 2025 deadline' }, { title: 'Gap Analysis', desc: 'Specific areas requiring changes in each code' }, { title: 'Policy Changes', desc: 'List of HR policies needing updates' }, { title: 'Compliance Roadmap', desc: 'Step-by-step implementation guide' }].map((feature, i) => (
                  <li key={i}><span style={{ color: accentColor, fontWeight: 700 }}>✓</span><span><strong>{feature.title}</strong> — {feature.desc}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className={styles.pricing} style={{ background: '#FFFBEB' }}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}><h2>Simple, Transparent Pricing</h2><p>No subscriptions. Pay only when you need an assessment.</p></div>
          <div className={styles.pricingCard} style={{ borderColor: accentColor, boxShadow: `0 4px 20px ${accentColor}20` }}>
            <div className={styles.pricingBadge} style={{ background: `${accentColor}15`, color: accentColor }}>🎉 Free During Beta</div>
            <div className={styles.pricingAmount}>₹1,999</div>
            <div className={styles.pricingPeriod}>One-time assessment fee (post-beta)</div>
            <ul className={styles.pricingFeatures}>
              {['Complete 4-code assessment', 'Smart question filtering', 'Implementation cost estimates', 'Code-wise gap analysis', 'Timeline & milestones', 'Policy change recommendations', 'Professional PDF report'].map((feature, i) => (
                <li key={i}><span style={{ color: accentColor, fontWeight: 700 }}>✓</span>{feature}</li>
              ))}
            </ul>
            <Link href="/assessments/labour-code" className={styles.btnPrimary} style={{ background: accentColor, boxShadow: `0 4px 14px ${accentColor}50`, width: '100%', justifyContent: 'center' }}>
              Start Free Assessment →
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.finalCta}>
        <div className={styles.container}>
          <h2>November 2025 is Closer Than You Think</h2>
          <p>Don&apos;t wait until the last minute. Assess your readiness today and plan your transition.</p>
          <Link href="/assessments/labour-code" className={styles.btnWhite}>Start Free Assessment →</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerLinks}>
              <Link href="/">Home</Link><Link href="/assessments">All Assessments</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms of Service</Link>
            </div>
            <div className={styles.footerCopy}>© 2025 ComplianceCheck. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
