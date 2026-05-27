import type { Metadata } from 'next'
import Link from 'next/link'
import styles from '../assessment-landing.module.css'

export const metadata: Metadata = {
  title: 'Restaurant & Food Business Compliance | FSSAI, Fire NOC, Liquor License | ComplianceCheck',
  description: 'Complete compliance assessment for restaurants, cloud kitchens, and food businesses. FSSAI, Fire NOC, Liquor License, GST, and Labour compliance. ₹999 post-beta.',
  alternates: {
    canonical: 'https://compliancecheck.co.in/assessments/landing/restaurant-food-business',
  },
  openGraph: {
    title: 'Restaurant & Food Business Compliance | ComplianceCheck',
    description: 'FSSAI, Fire NOC, Liquor License, and 8 compliance areas for food businesses. Assessment with gap analysis.',
    type: 'website',
    url: 'https://compliancecheck.co.in/assessments/landing/restaurant-food-business',
    siteName: 'ComplianceCheck',
  },
}

export default function RestaurantFoodBusinessPage() {
  const accentColor = '#E11D48'
  const accentLight = '#F43F5E'

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.container}>
          <div className={styles.navContent}>
            <Link href="/" className={styles.logo}><div className={styles.logoIcon}>✓</div>ComplianceCheck</Link>
            <Link href="/assessment/food-business" className={styles.navCta} style={{ background: accentColor }}>Start Free Assessment</Link>
          </div>
        </div>
      </nav>

      <section className={styles.hero} style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF1F2 100%)' }}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div>
              <div className={styles.heroBadge} style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30`, color: accentColor }}>
                🍽️ Food Business Compliance
              </div>
              <h1 className={styles.heroTitle}>Restaurant & Food Business Compliance</h1>
              <p className={styles.heroSubtitle}>
                Complete compliance assessment for restaurants, cloud kitchens, cafes, and food businesses. Check FSSAI, Fire NOC, Liquor License, GST, and Labour compliance in one assessment.
              </p>
              <ul className={styles.heroFeatures}>
                {["FSSAI registration & licensing", "Fire Safety NOC requirements", "Liquor License compliance", "GST registration & filing", "Labour law compliance", "Health & sanitation standards"].map((feature, i) => (
                  <li key={i}><span className={styles.featureCheck} style={{ background: `${accentColor}15`, color: accentColor }}>✓</span>{feature}</li>
                ))}
              </ul>
              <Link href="/assessment/food-business" className={styles.btnPrimary} style={{ background: accentColor, boxShadow: `0 4px 14px ${accentColor}50` }}>
                Start Free Assessment →
              </Link>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.visualHeader}>
                <div className={styles.visualIcon} style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)` }}>🍽️</div>
                <div className={styles.visualTitle}>8 Compliance Areas</div>
              </div>
              <div className={styles.visualAreas} style={{ gridTemplateColumns: '1fr' }}>
                {[{ icon: '🏪', name: 'FSSAI License' }, { icon: '🔥', name: 'Fire Safety NOC' }, { icon: '🍺', name: 'Liquor License' }, { icon: '💰', name: 'GST Compliance' }, { icon: '👥', name: 'Labour Laws' }, { icon: '🏥', name: 'Health & Sanitation' }, { icon: '📋', name: 'Shop License' }, { icon: '♻️', name: 'Environment Clearance' }].map((area, i) => (
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
            <div className={styles.statItem}><h3>25-67</h3><p>Questions</p></div>
            <div className={styles.statItem}><h3>15 min</h3><p>To Complete</p></div>
            <div className={styles.statItem}><h3>8</h3><p>Compliance Areas</p></div>
            <div className={styles.statItem}><h3>₹999</h3><p>Post-Beta Price</p></div>
          </div>
        </div>
      </section>

      <section className={styles.coverage}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}><h2>What&apos;s Covered in This Assessment</h2><p>Comprehensive compliance check for all food business requirements</p></div>
          <div className={styles.coverageGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {[
              { title: 'FSSAI Compliance', desc: 'Registration vs License determination based on turnover, license categories (Central/State), hygiene ratings, renewal timelines, and display requirements under Food Safety Act 2006.' },
              { title: 'Fire Safety NOC', desc: 'Fire department clearance requirements, fire equipment specifications, emergency exit compliance, fire drill documentation, and annual inspection readiness.' },
              { title: 'Liquor License', desc: 'State-wise excise license requirements, license categories (restaurant bar, permit room), serving hours compliance, stock maintenance, and renewal procedures.' },
              { title: 'GST Compliance', desc: 'Registration requirements, applicable tax rates (5% without ITC vs 18% with ITC), invoice compliance, return filing, and composition scheme eligibility.' },
              { title: 'Labour Compliance', desc: 'EPF/ESI applicability, minimum wages for hotel industry, working hours under Shops Act, weekly off requirements, and tip/service charge distribution.' },
              { title: 'Health & Sanitation', desc: 'Municipal health license, kitchen hygiene standards, pest control certification, water testing, food handler health certificates, and waste management.' }
            ].map((item, i) => (
              <div key={i} className={styles.coverageCard} style={{ borderLeft: `4px solid ${accentColor}` }}><h3>{item.title}</h3><p>{item.desc}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0', background: '#FFF1F2' }}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}><h2>Who Is This For?</h2><p>Tailored compliance assessment for all food business types</p></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '40px' }}>
            {[
              { icon: '🍴', name: 'Restaurants', desc: 'Fine dining to casual' },
              { icon: '☁️', name: 'Cloud Kitchens', desc: 'Delivery-only operations' },
              { icon: '☕', name: 'Cafes & Bakeries', desc: 'Coffee shops & bakeries' },
              { icon: '🍕', name: 'QSR Chains', desc: 'Fast food outlets' },
              { icon: '🏨', name: 'Hotels', desc: 'F&B operations' },
              { icon: '🎉', name: 'Catering', desc: 'Event caterers' },
              { icon: '🍺', name: 'Bars & Pubs', desc: 'Licensed establishments' },
              { icon: '🏭', name: 'Food Processing', desc: 'Manufacturing units' }
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
          <div className={styles.sectionHeader}><h2>How It Works</h2><p>Get your food business compliance status in 4 simple steps</p></div>
          <div className={styles.stepsGrid}>
            {[
              { title: 'Business Profile', desc: 'Tell us your business type, location, and seating capacity' },
              { title: 'Smart Filtering', desc: 'Questions filtered based on your profile (25-67 questions)' },
              { title: 'Gap Analysis', desc: 'See compliance status across all 8 areas' },
              { title: 'Action Plan', desc: 'Get prioritized steps with license application guidance' }
            ].map((step, i) => (
              <div key={i} className={styles.stepCard} style={{ background: '#F9FAFB' }}>
                <div className={styles.stepNumber} style={{ background: accentColor }}>{i + 1}</div>
                <h3>{step.title}</h3><p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sampleOutput} style={{ background: '#FFF1F2' }}>
        <div className={styles.container}>
          <div className={styles.sampleGrid}>
            <div className={styles.samplePreview}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>Food Business Report</div>
                <div style={{ padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', background: 'rgba(217, 119, 6, 0.2)', color: '#FBBF24' }}>Needs Attention</div>
              </div>
              <div className={styles.sampleScore}>
                <div className={styles.scoreCircle} style={{ background: `conic-gradient(${accentColor} 0% 62%, rgba(255,255,255,0.1) 62% 100%)` }}>
                  <div className={styles.scoreInner}><span className={styles.scoreValue}>62%</span><span className={styles.scoreLabel}>Compliant</span></div>
                </div>
              </div>
              <div className={styles.categoryBars}>
                {[{ name: 'FSSAI', percent: 100, color: 'barGreen' }, { name: 'Fire NOC', percent: 50, color: 'barYellow' }, { name: 'Liquor License', percent: 0, color: 'barRed' }, { name: 'GST', percent: 100, color: 'barGreen' }, { name: 'Labour', percent: 67, color: 'barYellow' }, { name: 'Health', percent: 75, color: 'barYellow' }].map((cat, i) => (
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
                {[{ title: 'Compliance Score', desc: 'Overall and area-wise compliance percentage' }, { title: 'License Checklist', desc: 'All required licenses with application process' }, { title: 'Gap Analysis', desc: 'Specific missing requirements in each area' }, { title: 'Risk Assessment', desc: 'Penalty exposure and inspection risks' }, { title: 'Application Guide', desc: 'Step-by-step license application process' }, { title: 'Renewal Calendar', desc: 'License renewal dates and requirements' }].map((feature, i) => (
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
            <div className={styles.pricingAmount}>₹999</div>
            <div className={styles.pricingPeriod}>One-time assessment fee (post-beta)</div>
            <ul className={styles.pricingFeatures}>
              {['Complete 8-area assessment', 'Business-type smart filtering', 'License requirement checklist', 'Gap analysis with priorities', 'Application process guide', 'Renewal calendar', 'Professional PDF report'].map((feature, i) => (
                <li key={i}><span style={{ color: accentColor, fontWeight: 700 }}>✓</span>{feature}</li>
              ))}
            </ul>
            <Link href="/assessment/food-business" className={styles.btnPrimary} style={{ background: accentColor, boxShadow: `0 4px 14px ${accentColor}50`, width: '100%', justifyContent: 'center' }}>
              Start Free Assessment →
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.finalCta}>
        <div className={styles.container}>
          <h2>Is Your Food Business Fully Compliant?</h2>
          <p>Avoid raids and penalties. Get a complete compliance check today.</p>
          <Link href="/assessment/food-business" className={styles.btnWhite}>Start Free Assessment →</Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerLinks}><Link href="/">Home</Link><Link href="/">All Assessments</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms of Service</Link></div>
            <div className={styles.footerCopy}>© 2025 ComplianceCheck. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
