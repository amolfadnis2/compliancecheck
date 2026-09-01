import type { Metadata } from 'next'
import Link from 'next/link'
import styles from '../assessment-landing.module.css'
import { ASSESSMENT_TYPES } from '@/lib/constants/assessment-types'
import { LandingSchema } from '@/lib/seo/LandingSchema'
import { LandingPricingCard } from '@/components/site/LandingPricingCard'

export const metadata: Metadata = {
  title: 'POSH Act 2013 Compliance | ICC Audit & Workplace Safety | ComplianceCheck',
  description: 'Complete POSH Act compliance assessment. ICC constitution audit, policy review, complaint mechanism check, and annual report requirements. Full report ₹1,999.',
  alternates: {
    canonical: 'https://compliancecheck.co.in/assessments/landing/posh-act-compliance',
  },
  openGraph: {
    title: 'POSH Act 2013 Compliance | ComplianceCheck',
    description: 'Prevention of Sexual Harassment compliance assessment. ICC audit, policy review, and compliance roadmap.',
    type: 'website',
    url: 'https://compliancecheck.co.in/assessments/landing/posh-act-compliance',
    siteName: 'ComplianceCheck',
  },
}

export default function POSHActCompliancePage() {
  const accentColor = '#7C3AED'
  const accentLight = '#8B5CF6'

  return (
    <div className={styles.page}>
      <LandingSchema type={ASSESSMENT_TYPES.POSH} />
      <nav className={styles.nav}>
        <div className={styles.container}>
          <div className={styles.navContent}>
            <Link href="/" className={styles.logo}><div className={styles.logoIcon}>✓</div>ComplianceCheck</Link>
            <Link href="/assessment/posh" className={styles.navCta} style={{ background: accentColor }}>Start Free Assessment</Link>
          </div>
        </div>
      </nav>

      <section className={styles.hero} style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF5FF 100%)' }}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div>
              <div className={styles.heroBadge} style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30`, color: accentColor }}>
                🛡️ Mandatory for 10+ Employees
              </div>
              <h1 className={styles.heroTitle}>POSH Act 2013 Compliance Assessment</h1>
              <p className={styles.heroSubtitle}>
                Comprehensive audit of your Prevention of Sexual Harassment compliance. Check ICC constitution, policy coverage, complaint mechanisms, and annual reporting requirements.
              </p>
              <ul className={styles.heroFeatures}>
                {["Internal Committee (ICC) constitution audit", "POSH Policy review and adequacy check", "Complaint mechanism evaluation", "Training and awareness program review", "Annual report filing status"].map((feature, i) => (
                  <li key={i}><span className={styles.featureCheck} style={{ background: `${accentColor}15`, color: accentColor }}>✓</span>{feature}</li>
                ))}
              </ul>
              <Link href="/assessment/posh" className={styles.btnPrimary} style={{ background: accentColor, boxShadow: `0 4px 14px ${accentColor}50` }}>
                Start Free Assessment →
              </Link>
              <div className={styles.alertBanner} style={{ background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
                <div className={styles.alertIcon} style={{ background: 'rgba(220, 38, 38, 0.1)' }}>⚠️</div>
                <div className={styles.alertContent}>
                  <h4 style={{ color: '#DC2626' }}>Non-compliance can be costly</h4>
                  <p>Penalties up to ₹50,000 for first offence, cancellation of business license for repeated violations. Plus significant reputational damage.</p>
                </div>
              </div>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.visualHeader}>
                <div className={styles.visualIcon} style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)` }}>🛡️</div>
                <div className={styles.visualTitle}>6 Compliance Areas Audited</div>
              </div>
              <div className={styles.visualAreas} style={{ gridTemplateColumns: '1fr' }}>
                {[{ icon: '👥', name: 'ICC Constitution & Composition' }, { icon: '📜', name: 'POSH Policy Documentation' }, { icon: '📢', name: 'Complaint Mechanisms' }, { icon: '🎓', name: 'Training & Awareness' }, { icon: '📊', name: 'Annual Report Filing' }, { icon: '📋', name: 'Record Keeping' }].map((area, i) => (
                  <div key={i} className={styles.areaItem} style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left', padding: '12px 14px' }}>
                    <span style={{ width: '32px', height: '32px', background: 'rgba(124, 58, 237, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{area.icon}</span>
                    <span style={{ fontSize: '13px' }}>{area.name}</span>
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
            <div className={styles.statItem}><h3>40-50</h3><p>Questions</p></div>
            <div className={styles.statItem}><h3>20 min</h3><p>To Complete</p></div>
            <div className={styles.statItem}><h3>6</h3><p>Audit Areas</p></div>
            <div className={styles.statItem}><h3>₹1,999</h3><p>Full Report</p></div>
          </div>
        </div>
      </section>

      <section className={styles.coverage}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}><h2>What&apos;s Covered in This Assessment</h2><p>Complete POSH Act compliance audit across all mandatory requirements</p></div>
          <div className={styles.coverageGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {[
              { icon: '👥', title: 'Internal Committee (ICC) Audit', desc: 'Verify ICC constitution, composition (presiding officer, external member, employee representatives), quorum requirements, tenure validity, and reconstitution timelines as per Section 4 of the POSH Act.' },
              { icon: '📜', title: 'Policy Documentation', desc: 'Review POSH policy completeness, definitions of sexual harassment, scope coverage (employees, interns, vendors), complaint procedure documentation, and policy communication to all stakeholders.' },
              { icon: '📢', title: 'Complaint Mechanisms', desc: 'Evaluate complaint filing procedures, multiple reporting channels availability, confidentiality safeguards, acknowledgment timelines (7 days), and inquiry completion requirements (90 days).' },
              { icon: '🎓', title: 'Training & Awareness', desc: 'Assess ICC member training status, employee awareness programs, induction training coverage, periodic refresher sessions, and training documentation maintenance.' },
              { icon: '📊', title: 'Annual Report Requirements', desc: 'Check annual report preparation, filing status with District Officer, report content completeness (cases received, disposed, pending), and submission timelines.' },
              { icon: '📋', title: 'Record Keeping', desc: 'Verify complaint register maintenance, inquiry records, ICC meeting minutes, training attendance records, and secure document storage for the mandatory 3-year retention period.' }
            ].map((item, i) => (
              <div key={i} className={styles.coverageCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ width: '40px', height: '40px', background: `${accentColor}15`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{item.icon}</div>
                  <h3 style={{ margin: 0 }}>{item.title}</h3>
                </div>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0', background: '#FAF5FF' }}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}><h2>Why POSH Compliance Matters</h2><p>Beyond legal requirements, it&apos;s about creating a safe workplace</p></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginTop: '40px' }}>
            {[
              { icon: '⚖️', title: 'Legal Mandate', desc: 'Mandatory for all organizations with 10+ employees. Non-compliance attracts penalties up to ₹50,000 and potential license cancellation.' },
              { icon: '🏢', title: 'Employer Liability', desc: "Under the Vishaka Guidelines and POSH Act, employers are legally liable for workplace harassment incidents if proper mechanisms aren't in place." },
              { icon: '💼', title: 'Due Diligence', desc: 'Investors and acquirers check POSH compliance during due diligence. Non-compliance can derail funding rounds or M&A deals.' }
            ].map((item, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '28px', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', background: `${accentColor}15`, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 16px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ fontSize: '14px', color: '#4B5563', margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.howItWorks} style={{ background: 'white' }}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}><h2>How It Works</h2><p>Get your POSH compliance status in 4 simple steps</p></div>
          <div className={styles.stepsGrid}>
            {[
              { title: 'Answer Questions', desc: '40-50 questions about your current ICC setup, policies, and procedures' },
              { title: 'Get Compliance Score', desc: 'Receive instant compliance score with area-wise breakdown' },
              { title: 'Review Gap Analysis', desc: "Identify exactly what's missing or non-compliant" },
              { title: 'Download Report', desc: 'Get professional PDF with legal references and remediation steps' }
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
                <div style={{ fontSize: '16px', fontWeight: '600' }}>POSH Compliance Report</div>
                <div style={{ padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', background: 'rgba(217, 119, 6, 0.2)', color: '#FBBF24' }}>Needs Attention</div>
              </div>
              <div className={styles.sampleScore}>
                <div className={styles.scoreCircle} style={{ background: `conic-gradient(${accentColor} 0% 58%, rgba(255,255,255,0.1) 58% 100%)` }}>
                  <div className={styles.scoreInner}><span className={styles.scoreValue}>58%</span><span className={styles.scoreLabel}>Compliant</span></div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { text: 'ICC constituted with Presiding Officer', status: 'pass' },
                  { text: 'External member not appointed', status: 'fail' },
                  { text: 'POSH Policy documented', status: 'pass' },
                  { text: 'Training not conducted this year', status: 'partial' },
                  { text: 'Annual report not filed', status: 'fail' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', background: item.status === 'pass' ? 'rgba(5, 150, 105, 0.2)' : item.status === 'partial' ? 'rgba(217, 119, 6, 0.2)' : 'rgba(220, 38, 38, 0.2)', color: item.status === 'pass' ? '#10B981' : item.status === 'partial' ? '#FBBF24' : '#F87171' }}>
                      {item.status === 'pass' ? '✓' : item.status === 'partial' ? '!' : '✗'}
                    </div>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.sampleFeatures}>
              <h3>What You&apos;ll Get</h3>
              <ul className={styles.featureList}>
                {[{ title: 'Overall Compliance Score', desc: 'Percentage-based score across all 6 audit areas' }, { title: 'ICC Composition Check', desc: 'Detailed verification of committee setup' }, { title: 'Gap Identification', desc: 'Specific non-compliances highlighted' }, { title: 'Risk Assessment', desc: 'High/Medium/Low risk for each gap' }, { title: 'Remediation Steps', desc: 'Actionable items to fix each issue' }, { title: 'Legal References', desc: 'POSH Act sections and rules cited' }, { title: 'PDF Report', desc: 'Professional document for board/management' }].map((feature, i) => (
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
          <LandingPricingCard
            type={ASSESSMENT_TYPES.POSH}
            accentColor={accentColor}
            ctaHref="/assessment/posh"
            features={['Complete 40-50 question ICC audit', 'Instant compliance score', '6-area gap analysis', 'ICC composition verification', 'Prioritized remediation steps', 'POSH Act section references', 'Professional PDF report', 'Email delivery of results']}
          />
        </div>
      </section>

      <section className={styles.finalCta}>
        <div className={styles.container}>
          <h2>Is Your Workplace POSH Compliant?</h2>
          <p>Don&apos;t wait for a complaint to discover gaps. Assess your compliance proactively.</p>
          <Link href="/assessment/posh" className={styles.btnWhite}>Start Free Assessment →</Link>
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
