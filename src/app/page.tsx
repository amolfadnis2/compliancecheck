import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-b border-neutral-100 z-50 py-4">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-neutral-900">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center text-white">
              ✓
            </div>
            ComplianceCheck
          </Link>
          <Link 
            href="/assessment/statutory-health" 
            className="bg-neutral-900 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-neutral-800 transition-all hover:-translate-y-0.5"
          >
            Start Free Assessment
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 bg-gradient-to-b from-white to-neutral-50">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-primary-light/10 border border-primary/20 px-4 py-2 rounded-full text-sm font-medium text-primary mb-6">
            <span>🚀</span>
            FREE During Beta - Limited Time Only
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 leading-tight mb-6">
            Instant Compliance Reports
            <br />
            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              for Indian SMEs
            </span>
          </h1>
          
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto mb-10">
            Get compliance assessments in 10 minutes. No subscriptions. No consultants. Just answers you can act on.
          </p>

          {/* Tool Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <Link
              href="/assessment/statutory-health"
              className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-success to-success-light shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Statutory Health Check
            </Link>
            <Link
              href="/assessment/labour-code"
              className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-primary-light shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Labour Code Readiness
            </Link>
            <Link
              href="/calculator/ctc"
              className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-400 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              CTC Calculator
            </Link>
            <Link
              href="/calculator/gratuity"
              className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-500 to-yellow-400 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Gratuity Calculator
            </Link>
            <Link
              href="/assessment/dpdp"
              className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-red-600 to-red-400 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              DPDP Gap Assessment
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-12 pt-10 mt-10 border-t border-neutral-200">
            <div className="text-center">
              <div className="text-4xl font-bold text-neutral-900">5</div>
              <div className="text-sm text-neutral-600 mt-1">Assessment Tools</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-neutral-900">10 min</div>
              <div className="text-sm text-neutral-600 mt-1">Average Completion</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-neutral-900">99%</div>
              <div className="text-sm text-neutral-600 mt-1">Cost Savings vs Consultants</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              THE PROBLEM
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-900">
              Indian SMEs face a painful compliance choice
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-neutral-50 p-8 rounded-2xl">
              <div className="text-5xl mb-4 bg-white/80 w-18 h-18 flex items-center justify-center rounded-xl">
                💼
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                Hire a Consultant
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Full compliance audits cost <span className="font-semibold text-neutral-900">₹1-10 lakh+</span>. Too expensive for early-stage companies.
              </p>
            </div>

            <div className="bg-neutral-50 p-8 rounded-2xl">
              <div className="text-5xl mb-4 bg-white/80 w-18 h-18 flex items-center justify-center rounded-xl">
                📊
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                Subscribe to SaaS
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Enterprise tools cost <span className="font-semibold text-neutral-900">₹20K-5L/year</span>. Overkill for occasional compliance checks.
              </p>
            </div>

            <div className="bg-neutral-50 p-8 rounded-2xl">
              <div className="text-5xl mb-4 bg-white/80 w-18 h-18 flex items-center justify-center rounded-xl">
                🔍
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                DIY with Google
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Free but risky. Incomplete information leads to missed requirements and penalties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-24 bg-neutral-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              Our Solutions
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-900">
              Free compliance assessments during beta
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Statutory Health Check */}
            <div className="bg-white p-8 rounded-2xl border-2 border-neutral-100 hover:border-primary-light hover:-translate-y-1 transition-all">
              <div className="text-5xl mb-5 bg-neutral-50 w-18 h-18 flex items-center justify-center rounded-xl">
                📋
              </div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">
                Statutory Health Check
              </h3>
              <div className="text-3xl font-bold text-neutral-900 mb-4">
                FREE <span className="text-sm font-medium text-neutral-600 ml-2">during beta</span>
              </div>
              <p className="text-neutral-600 mb-6 leading-relaxed">
                Quick 10-minute check for PF, ESI, PT, Gratuity & Bonus compliance.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start text-neutral-700 text-sm">
                  <span className="text-success font-semibold mr-2">✓</span>
                  15 guided questions
                </li>
                <li className="flex items-start text-neutral-700 text-sm">
                  <span className="text-success font-semibold mr-2">✓</span>
                  Traffic-light compliance dashboard
                </li>
                <li className="flex items-start text-neutral-700 text-sm">
                  <span className="text-success font-semibold mr-2">✓</span>
                  Next due dates calendar
                </li>
                <li className="flex items-start text-neutral-700 text-sm">
                  <span className="text-success font-semibold mr-2">✓</span>
                  Professional PDF report
                </li>
              </ul>
            </div>

            {/* Labour Code Readiness */}
            <div className="bg-white p-8 rounded-2xl border-2 border-primary hover:-translate-y-1 transition-all relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-semibold">
                Most Popular
              </div>
              <div className="text-5xl mb-5 bg-neutral-50 w-18 h-18 flex items-center justify-center rounded-xl">
                ⚖️
              </div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">
                Labour Code Readiness
              </h3>
              <div className="text-3xl font-bold text-neutral-900 mb-4">
                FREE <span className="text-sm font-medium text-neutral-600 ml-2">during beta</span>
              </div>
              <p className="text-neutral-600 mb-6 leading-relaxed">
                Comprehensive assessment for all 4 new Labour Codes with smart filtering.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start text-neutral-700 text-sm">
                  <span className="text-success font-semibold mr-2">✓</span>
                  18-30 personalized questions
                </li>
                <li className="flex items-start text-neutral-700 text-sm">
                  <span className="text-success font-semibold mr-2">✓</span>
                  Readiness score per code
                </li>
                <li className="flex items-start text-neutral-700 text-sm">
                  <span className="text-success font-semibold mr-2">✓</span>
                  Gap analysis report
                </li>
                <li className="flex items-start text-neutral-700 text-sm">
                  <span className="text-success font-semibold mr-2">✓</span>
                  Priority action items
                </li>
                <li className="flex items-start text-neutral-700 text-sm">
                  <span className="text-success font-semibold mr-2">✓</span>
                  Industry-specific guidance
                </li>
              </ul>
            </div>

            {/* DPDP Gap Assessment */}
            <div className="bg-white p-8 rounded-2xl border-2 border-neutral-100 hover:border-primary-light hover:-translate-y-1 transition-all">
              <div className="text-5xl mb-5 bg-neutral-50 w-18 h-18 flex items-center justify-center rounded-xl">
                🔒
              </div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">
                DPDP Gap Assessment
              </h3>
              <div className="text-3xl font-bold text-neutral-900 mb-4">
                FREE <span className="text-sm font-medium text-neutral-600 ml-2">during beta</span>
              </div>
              <p className="text-neutral-600 mb-6 leading-relaxed">
                Data protection compliance for the DPDP Act 2023.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start text-neutral-700 text-sm">
                  <span className="text-success font-semibold mr-2">✓</span>
                  45 comprehensive questions
                </li>
                <li className="flex items-start text-neutral-700 text-sm">
                  <span className="text-success font-semibold mr-2">✓</span>
                  6-phase compliance assessment
                </li>
                <li className="flex items-start text-neutral-700 text-sm">
                  <span className="text-success font-semibold mr-2">✓</span>
                  Consent mechanism checklist
                </li>
                <li className="flex items-start text-neutral-700 text-sm">
                  <span className="text-success font-semibold mr-2">✓</span>
                  Privacy notice guidelines
                </li>
                <li className="flex items-start text-neutral-700 text-sm">
                  <span className="text-success font-semibold mr-2">✓</span>
                  Risk assessment & remediation
                </li>
              </ul>
            </div>

            {/* CTC Calculator */}
            <div className="bg-white p-8 rounded-2xl border-2 border-neutral-100 hover:border-primary-light hover:-translate-y-1 transition-all">
              <div className="text-5xl mb-5 bg-neutral-50 w-18 h-18 flex items-center justify-center rounded-xl">
                💰
              </div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">
                CTC Calculator
              </h3>
              <div className="text-3xl font-bold text-neutral-900 mb-4">
                FREE <span className="text-sm font-medium text-neutral-600 ml-2">always</span>
              </div>
              <p className="text-neutral-600 mb-6 leading-relaxed">
                Calculate in-hand salary from CTC with detailed breakup.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start text-neutral-700 text-sm">
                  <span className="text-success font-semibold mr-2">✓</span>
                  Instant calculations
                </li>
                <li className="flex items-start text-neutral-700 text-sm">
                  <span className="text-success font-semibold mr-2">✓</span>
                  PF, ESI, PT breakup
                </li>
                <li className="flex items-start text-neutral-700 text-sm">
                  <span className="text-success font-semibold mr-2">✓</span>
                  Professional Tax by state
                </li>
                <li className="flex items-start text-neutral-700 text-sm">
                  <span className="text-success font-semibold mr-2">✓</span>
                  Downloadable PDF summary
                </li>
              </ul>
            </div>

            {/* Gratuity Calculator */}
            <div className="bg-white p-8 rounded-2xl border-2 border-neutral-100 hover:border-primary-light hover:-translate-y-1 transition-all">
              <div className="text-5xl mb-5 bg-neutral-50 w-18 h-18 flex items-center justify-center rounded-xl">
                🧮
              </div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">
                Gratuity Calculator
              </h3>
              <div className="text-3xl font-bold text-neutral-900 mb-4">
                FREE <span className="text-sm font-medium text-neutral-600 ml-2">forever</span>
              </div>
              <p className="text-neutral-600 mb-6 leading-relaxed">
                Calculate gratuity under new Labour Codes. Fixed-term employees now eligible after 1 year!
              </p>
              <ul className="space-y-2">
                <li className="flex items-start text-neutral-700 text-sm">
                  <span className="text-success font-semibold mr-2">✓</span>
                  2025 Labour Code formula
                </li>
                <li className="flex items-start text-neutral-700 text-sm">
                  <span className="text-success font-semibold mr-2">✓</span>
                  Fixed-term employee support
                </li>
                <li className="flex items-start text-neutral-700 text-sm">
                  <span className="text-success font-semibold mr-2">✓</span>
                  Rs.20 lakh ceiling applied
                </li>
                <li className="flex items-start text-neutral-700 text-sm">
                  <span className="text-success font-semibold mr-2">✓</span>
                  Tax exemption details
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="early-access" className="py-24 bg-gradient-to-r from-primary to-primary-light">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Start Your Free Compliance Assessment
            </h2>
            <p className="text-white/90 text-lg mb-8">
              All tools are FREE during beta. Get instant compliance reports in 10 minutes.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-5">
              <Link
                href="/assessment/statutory-health"
                className="bg-white text-primary px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Start Assessment
              </Link>
              <Link
                href="/calculator/ctc"
                className="bg-white/20 text-white px-8 py-4 rounded-xl font-semibold border border-white/30 hover:bg-white/30 transition-all"
              >
                Try CTC Calculator
              </Link>
            </div>
            <p className="text-white/80 text-sm">
              No credit card required. No signup needed.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              FAQ
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-900">
              Common questions
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-neutral-50 p-8 rounded-2xl">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                Who is this for?
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Startup founders, HR managers, and CA/CS professionals managing compliance for companies with 10-500 employees.
              </p>
            </div>

            <div className="bg-neutral-50 p-8 rounded-2xl">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                Is this a subscription?
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                No. Currently FREE during beta. Future pricing will be pay-per-use (₹999-2,499 per assessment). No recurring charges, no lock-in contracts.
              </p>
            </div>

            <div className="bg-neutral-50 p-8 rounded-2xl">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                How accurate are the assessments?
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Our checklists are developed with practicing CS and labor law experts. We provide 80% of consultant value at 1% of the cost.
              </p>
            </div>

            <div className="bg-neutral-50 p-8 rounded-2xl">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                What if I need help after the assessment?
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Each report includes prioritized action items. We&apos;re also building a network of verified consultants for complex cases.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-neutral-900 text-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-between items-center gap-6">
            <div className="text-xl font-bold">ComplianceCheck</div>
            <div className="flex gap-8">
              <Link href="#" className="text-white/70 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-white/70 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="mailto:hello@compliancecheck.in" className="text-white/70 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
            <div className="text-white/50 text-sm">
              © 2025 ComplianceCheck. Made in India 🇮🇳
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
