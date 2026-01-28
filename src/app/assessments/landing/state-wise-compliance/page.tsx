import type { Metadata } from 'next'
import Link from 'next/link'
import styles from '../assessment-landing.module.css'

export const metadata: Metadata = {
  title: 'State-Wise Compliance Check | Professional Tax, LWF, S&E Act | ComplianceCheck',
  description: 'Find out exactly what compliance requirements apply in your state. Professional Tax, Labour Welfare Fund, Shops & Establishments Act, and more. ₹1,499 post-beta.',
  openGraph: {
    title: 'State-Wise Compliance Check | ComplianceCheck',
    description: 'State-specific compliance requirements for Indian businesses. 36 states & UTs, 20+ compliance areas.',
    type: 'website',
  },
}

export default function StateWiseCompliancePage() {
  const accentColor = '#0D9488'
  const accentLight = '#14B8A6'

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.container}>
          <div className={styles.navContent}>
            <Link href="/" className={styles.logo}><div className={styles.logoIcon}>✓</div>ComplianceCheck</Link>
            <Link href="/assessments/state-wise" className={styles.navCta} style={{ background: accentColor }}>Check My State</Link>
          </div>
        </div>
      </nav>

      <section className={styles.hero} style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDFA 100%)' }}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div>
              <div className={styles.heroBadge} style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30`, color: accentColor }}>
                📍 State-Specific Compliance
              </div>
              <h1 className={styles.heroTitle}>Which Laws Apply to My Business?</h1>
              <p className={styles.heroSubtitle}>
                Find out exactly what&apos;s required in your state. Professional Tax slabs, Labour Welfare Fund rates, Shops & Establishments rules, and 20+ compliance areas personalized for your location.
              </p>
              <ul className={styles.heroFeatures}>
                {["Professional Tax registration & slabs", "Labour Welfare Fund rates & deadlines", "Shops & Establishments Act requirements", "Factory Act applicability", "Contract Labour regulations", "State-specific holidays & leave rules"].map((feature, i) => (
                  <li key={i}><span className={styles.featureCheck} style={{ background: `${accentColor}15`, color: accentColor }}>✓</span>{feature}</li>
                ))}
              </ul>
              <Link href="/assessments/state-wise" className={styles.btnPrimary} style={{ background: accentColor, boxShadow: `0 4px 14px ${accentColor}50` }}>
                Check My State →
              </Link>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.visualHeader}>
                <div className={styles.visualIcon} style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)` }}>🗺️</div>
                <div className={styles.visualTitle}>All States & UTs Covered</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '8px' }}>
                {['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Gujarat', 'Telangana', 'West Bengal', 'Rajasthan', 'UP'].map((state, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '10px 8px', textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>{state}</div>
                ))}
              </div>
              <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>+ 27 more states & UTs</div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.statsBar}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}><h3>36</h3><p>States & UTs</p></div>
            <div className={styles.statItem}><h3>20+</h3><p>Compliance Areas</p></div>
            <div className={styles.statItem}><h3>100+</h3><p>Rules Mapped</p></div>
            <div className={styles.statItem}><h3>₹1,499</h3><p>Post-Beta Price</p></div>
          </div>
        </div>
      </section>

      <section className={styles.coverage}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}><h2>What&apos;s Covered in This Assessment</h2><p>Comprehensive state-wise compliance mapping for your business</p></div>
          <div className={styles.coverageGrid} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {[
              { title: 'Professional Tax', desc: 'State slabs, registration, monthly/annual filing deadlines' },
              { title: 'Labour Welfare Fund', desc: 'Contribution rates, applicability, payment schedules' },
              { title: 'Shops & Establishments', desc: 'Registration, working hours, leave entitlements' },
              { title: 'Factory Act', desc: 'Applicability thresholds, safety requirements, licenses' },
              { title: 'Contract Labour', desc: 'Registration, licensing, principal employer duties' },
              { title: 'Minimum Wages', desc: 'State-wise rates, scheduled employments, revisions' },
              { title: 'State Holidays', desc: 'Mandatory holidays, festival list, compensatory offs' },
              { title: 'Local Registrations', desc: 'Municipal licenses, trade licenses, signage permits' }
            ].map((item, i) => (
              <div key={i} className={styles.coverageCard} style={{ padding: '20px' }}><h3 style={{ fontSize: '15px', marginBottom: '8px' }}>{item.title}</h3><p style={{ fontSize: '13px' }}>{item.desc}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.howItWorks} style={{ background: '#F0FDFA' }}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}><h2>How It Works</h2><p>Get your state-specific compliance requirements in 3 simple steps</p></div>
          <div className={styles.stepsGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              { title: 'Select Your State', desc: 'Choose your state and tell us about your business type' },
              { title: 'View Applicability', desc: 'See which laws apply based on your employee count & industry' },
              { title: 'Get Compliance Guide', desc: 'Download state-specific requirements, rates, and deadlines' }
            ].map((step, i) => (
              <div key={i} className={styles.stepCard} style={{ background: 'white' }}>
                <div className={styles.stepNumber} style={{ background: accentColor }}>{i + 1}</div>
                <h3>{step.title}</h3><p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sampleOutput}>
        <div className={styles.container}>
          <div className={styles.sampleGrid}>
            <div className={styles.samplePreview}>
              <div style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)`, margin: '-32px -32px 24px -32px', padding: '24px 32px', borderRadius: '16px 16px 0 0' }}>
                <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>Compliance Report</div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>Maharashtra</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { name: 'Professional Tax', status: 'required', note: '₹2,500/year max' },
                  { name: 'Labour Welfare Fund', status: 'required', note: '₹12/employee/half-year' },
                  { name: 'Shops & Establishments', status: 'required', note: 'Registration mandatory' },
                  { name: 'Factory Act', status: 'conditional', note: 'If 10+ workers with power' },
                  { name: 'Contract Labour', status: 'conditional', note: 'If 20+ contract workers' },
                  { name: 'Building Workers Cess', status: 'exempt', note: 'Not applicable' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', background: item.status === 'required' ? 'rgba(5, 150, 105, 0.2)' : item.status === 'conditional' ? 'rgba(217, 119, 6, 0.2)' : 'rgba(156, 163, 175, 0.2)', color: item.status === 'required' ? '#10B981' : item.status === 'conditional' ? '#FBBF24' : '#9CA3AF' }}>
                      {item.status === 'required' ? '✓' : item.status === 'conditional' ? '?' : '—'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{item.note}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                <span>✓ Required</span><span>? Conditional</span><span>— Not Applicable</span>
              </div>
            </div>
            <div className={styles.sampleFeatures}>
              <h3>What You&apos;ll Get</h3>
              <ul className={styles.featureList}>
                {[{ title: 'Applicability Matrix', desc: 'Clear view of which laws apply to your business' }, { title: 'Rate Tables', desc: 'Professional Tax slabs, LWF rates for your state' }, { title: 'Deadline Calendar', desc: 'Monthly and annual filing deadlines' }, { title: 'Registration Checklist', desc: 'Required registrations with contact details' }, { title: 'Form Templates', desc: 'State-specific form references' }, { title: 'PDF Report', desc: 'Complete state compliance guide' }].map((feature, i) => (
                  <li key={i}><span style={{ color: accentColor, fontWeight: 700 }}>✓</span><span><strong>{feature.title}</strong> — {feature.desc}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.pricing} style={{ background: '#F0FDFA' }}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}><h2>Simple, Transparent Pricing</h2><p>No subscriptions. Pay only when you need an assessment.</p></div>
          <div className={styles.pricingCard} style={{ borderColor: accentColor, boxShadow: `0 4px 20px ${accentColor}20` }}>
            <div className={styles.pricingBadge} style={{ background: `${accentColor}15`, color: accentColor }}>🎉 Free During Beta</div>
            <div className={styles.pricingAmount}>₹1,499</div>
            <div className={styles.pricingPeriod}>One-time assessment fee (post-beta)</div>
            <ul className={styles.pricingFeatures}>
              {['Complete state compliance check', 'Applicability matrix', 'Rate tables & slabs', 'Filing deadline calendar', 'Registration checklist', 'Form references', 'Professional PDF report'].map((feature, i) => (
                <li key={i}><span style={{ color: accentColor, fontWeight: 700 }}>✓</span>{feature}</li>
              ))}
            </ul>
            <Link href="/assessments/state-wise" className={styles.btnPrimary} style={{ background: accentColor, boxShadow: `0 4px 14px ${accentColor}50`, width: '100%', justifyContent: 'center' }}>
              Check My State →
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.finalCta}>
        <div className={styles.container}>
          <h2>Know Exactly What Your State Requires</h2>
          <p>Stop guessing. Get a clear compliance roadmap for your state today.</p>
          <Link href="/assessments/state-wise" className={styles.btnWhite}>Check My State →</Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerLinks}><Link href="/">Home</Link><Link href="/assessments">All Assessments</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms of Service</Link></div>
            <div className={styles.footerCopy}>© 2025 ComplianceCheck. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
