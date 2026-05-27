import type { Metadata } from 'next'
import Link from 'next/link'
import styles from '../assessment-landing.module.css'

export const metadata: Metadata = {
  title: 'Statutory Health Check | PF, ESI, PT, Gratuity & Bonus Compliance | ComplianceCheck',
  description: 'Quick 10-minute assessment for PF, ESI, Professional Tax, Gratuity & Bonus compliance. Get instant compliance score and action items. ₹999 post-beta.',
  alternates: {
    canonical: 'https://compliancecheck.co.in/assessments/landing/statutory-health-check',
  },
  openGraph: {
    title: 'Statutory Health Check | ComplianceCheck',
    description: 'Quick 10-minute compliance assessment for Indian SMEs. Check PF, ESI, PT, Gratuity & Bonus status instantly.',
    type: 'website',
    url: 'https://compliancecheck.co.in/assessments/landing/statutory-health-check',
    siteName: 'ComplianceCheck',
  },
}

export default function StatutoryHealthCheckPage() {
  const accentColor = '#059669'

  return (
    <div className={styles.page}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.container}>
          <div className={styles.navContent}>
            <Link href="/" className={styles.logo}>
              <div className={styles.logoIcon}>✓</div>
              ComplianceCheck
            </Link>
            <Link 
              href="/assessment/statutory-health" 
              className={styles.navCta}
              style={{ background: accentColor }}
            >
              Start Free Assessment
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero} style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)' }}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div>
              <div 
                className={styles.heroBadge}
                style={{ 
                  background: `${accentColor}15`,
                  border: `1px solid ${accentColor}30`,
                  color: accentColor
                }}
              >
                🎉 Free During Beta
              </div>
              <h1 className={styles.heroTitle}>Statutory Compliance Health Check</h1>
              <p className={styles.heroSubtitle}>
                Quick 10-minute assessment to check your PF, ESI, Professional Tax, Gratuity, and Bonus compliance status. Get instant scores and actionable remediation steps.
              </p>
              <ul className={styles.heroFeatures}>
                {[
                  "Employees' Provident Fund (EPF) compliance",
                  "Employee State Insurance (ESI) status",
                  "Professional Tax registration & payment",
                  "Gratuity Act requirements",
                  "Payment of Bonus Act compliance"
                ].map((feature, i) => (
                  <li key={i}>
                    <span 
                      className={styles.featureCheck}
                      style={{ background: `${accentColor}15`, color: accentColor }}
                    >
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link 
                href="/assessment/statutory-health" 
                className={styles.btnPrimary}
                style={{ background: accentColor, boxShadow: `0 4px 14px ${accentColor}50` }}
              >
                Start Free Assessment →
              </Link>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.visualHeader}>
                <div className={styles.visualIcon} style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)' }}>
                  📋
                </div>
                <div className={styles.visualTitle}>5 Compliance Areas Covered</div>
              </div>
              <div className={styles.visualAreas}>
                <div className={styles.areaItem}><span>EPF Compliance</span></div>
                <div className={styles.areaItem}><span>ESI Status</span></div>
                <div className={styles.areaItem}><span>Professional Tax</span></div>
                <div className={styles.areaItem}><span>Gratuity Act</span></div>
                <div className={styles.areaItem} style={{ gridColumn: 'span 2' }}><span>Bonus Act Compliance</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className={styles.statsBar}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}><h3>12</h3><p>Questions</p></div>
            <div className={styles.statItem}><h3>10 min</h3><p>To Complete</p></div>
            <div className={styles.statItem}><h3>5</h3><p>Compliance Areas</p></div>
            <div className={styles.statItem}><h3>₹999</h3><p>Post-Beta Price</p></div>
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className={styles.coverage}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>What&apos;s Covered in This Assessment</h2>
            <p>Comprehensive check across all major statutory compliance requirements for Indian businesses</p>
          </div>
          <div className={styles.coverageGrid}>
            {[
              { title: 'EPF Compliance', desc: 'Verify registration status, contribution rates (12% employee + 12% employer), and timely deposit deadlines. Applies to establishments with 20+ employees.' },
              { title: 'ESI Status', desc: 'Check applicability (wages ≤₹21,000/month), contribution rates (0.75% employee + 3.25% employer), and compliance with ESIC requirements.' },
              { title: 'Professional Tax', desc: 'State-wise registration verification, monthly slab compliance, and payment deadlines. Varies by state with maximum ₹2,500/year.' },
              { title: 'Gratuity Act', desc: 'Applicability check (10+ employees), calculation verification (15 days wages × years of service), and payment timelines for eligible employees.' },
              { title: 'Bonus Act Compliance', desc: 'Eligibility criteria (salary ≤₹21,000), minimum bonus (8.33%), maximum bonus (20%), and calculation methodology review.' },
              { title: 'Record Keeping', desc: 'Verification of required registers, Form submissions, annual returns filing, and documentation compliance across all statutory requirements.' }
            ].map((item, i) => (
              <div key={i} className={styles.coverageCard}><h3>{item.title}</h3><p>{item.desc}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}><h2>How It Works</h2><p>Get your compliance status in 4 simple steps</p></div>
          <div className={styles.stepsGrid}>
            {[
              { title: 'Answer Questions', desc: '12 simple questions about your business setup and current compliance status' },
              { title: 'Get Instant Score', desc: 'Receive your compliance score immediately with category-wise breakdown' },
              { title: 'Review Gap Analysis', desc: "See exactly where you're compliant and where you need to take action" },
              { title: 'Download PDF Report', desc: 'Get a professional report with legal references and remediation steps' }
            ].map((step, i) => (
              <div key={i} className={styles.stepCard}>
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
                <div className={styles.scoreCircle} style={{ background: `conic-gradient(${accentColor} 0% 68%, rgba(255,255,255,0.1) 68% 100%)` }}>
                  <div className={styles.scoreInner}>
                    <span className={styles.scoreValue}>68%</span>
                    <span className={styles.scoreLabel}>Compliant</span>
                  </div>
                </div>
              </div>
              <div className={styles.categoryBars}>
                {[
                  { name: 'EPF', percent: 100, color: 'barGreen' },
                  { name: 'ESI', percent: 67, color: 'barYellow' },
                  { name: 'Prof. Tax', percent: 33, color: 'barRed' },
                  { name: 'Gratuity', percent: 100, color: 'barGreen' },
                  { name: 'Bonus', percent: 50, color: 'barYellow' }
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
                  { title: 'Overall Compliance Score', desc: 'Percentage-based score across all 5 areas' },
                  { title: 'Category-wise Breakdown', desc: 'Individual scores for EPF, ESI, PT, Gratuity, Bonus' },
                  { title: 'Risk Assessment', desc: 'High/Medium/Low risk indicators for each gap' },
                  { title: 'Action Items', desc: 'Prioritized list of remediation steps' },
                  { title: 'Legal References', desc: 'Specific sections of applicable Acts' },
                  { title: 'PDF Report', desc: 'Professional document for records or sharing' }
                ].map((feature, i) => (
                  <li key={i}><span style={{ color: accentColor, fontWeight: 700 }}>✓</span><span><strong>{feature.title}</strong> — {feature.desc}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className={styles.pricing}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}><h2>Simple, Transparent Pricing</h2><p>No subscriptions. Pay only when you need an assessment.</p></div>
          <div className={styles.pricingCard} style={{ borderColor: accentColor, boxShadow: `0 4px 20px ${accentColor}20` }}>
            <div className={styles.pricingBadge} style={{ background: `${accentColor}15`, color: accentColor }}>🎉 Free During Beta</div>
            <div className={styles.pricingAmount}>₹999</div>
            <div className={styles.pricingPeriod}>One-time assessment fee (post-beta)</div>
            <ul className={styles.pricingFeatures}>
              {['Complete 12-question assessment', 'Instant compliance score', 'Category-wise gap analysis', 'Prioritized action items', 'Legal references & citations', 'Professional PDF report', 'Email delivery of results'].map((feature, i) => (
                <li key={i}><span style={{ color: accentColor, fontWeight: 700 }}>✓</span>{feature}</li>
              ))}
            </ul>
            <Link href="/assessment/statutory-health" className={styles.btnPrimary} style={{ background: accentColor, boxShadow: `0 4px 14px ${accentColor}50`, width: '100%', justifyContent: 'center' }}>
              Start Free Assessment →
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.finalCta}>
        <div className={styles.container}>
          <h2>Ready to Check Your Compliance Status?</h2>
          <p>Takes only 10 minutes. No credit card required during beta.</p>
          <Link href="/assessment/statutory-health" className={styles.btnWhite}>Start Free Assessment →</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerLinks}>
              <Link href="/">Home</Link>
              <Link href="/">All Assessments</Link>
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
