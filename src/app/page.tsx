'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Skip to Main Content - Accessibility */}
      <a 
        href="#main" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-neutral-100 z-50 py-4" aria-label="Main navigation">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-xl font-bold text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
            aria-label="ComplianceCheck - Go to homepage"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center text-white" aria-hidden="true">
              ✓
            </div>
            ComplianceCheck
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="#for-business" 
              className="text-neutral-600 hover:text-neutral-900 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
            >
              Assessments
            </Link>
            <Link 
              href="#for-you" 
              className="text-neutral-600 hover:text-neutral-900 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
            >
              Free Tools
            </Link>
            <Link 
              href="#faq" 
              className="text-neutral-600 hover:text-neutral-900 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
            >
              FAQ
            </Link>
            <Link 
              href="mailto:compliancecheck@zohomail.in" 
              className="bg-neutral-900 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-neutral-800 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Contact Us
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          id="mobile-menu"
          className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="px-6 pt-4 pb-6 space-y-3 bg-white border-t border-neutral-100">
            <Link 
              href="#for-business" 
              className="block text-neutral-600 hover:text-neutral-900 text-base font-medium py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              role="menuitem"
              onClick={() => setMobileMenuOpen(false)}
            >
              Assessments
            </Link>
            <Link 
              href="#for-you" 
              className="block text-neutral-600 hover:text-neutral-900 text-base font-medium py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              role="menuitem"
              onClick={() => setMobileMenuOpen(false)}
            >
              Free Tools
            </Link>
            <Link 
              href="#faq" 
              className="block text-neutral-600 hover:text-neutral-900 text-base font-medium py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              role="menuitem"
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQ
            </Link>
            <Link 
              href="mailto:compliancecheck@zohomail.in" 
              className="block bg-neutral-900 text-white px-5 py-3 rounded-lg font-medium text-base hover:bg-neutral-800 transition-all text-center mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              role="menuitem"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main id="main">
        {/* Hero Section */}
        <section className="pt-36 pb-12 bg-gradient-to-b from-white to-neutral-50" aria-labelledby="hero-heading">
          <div className="container mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-success/10 to-success-light/10 border border-success/20 px-4 py-2 rounded-full text-sm font-medium text-success mb-6">
              <span aria-hidden="true">🎉</span>
              Now in Beta - All Features Free
            </div>
            
            <h1 id="hero-heading" className="text-4xl md:text-6xl font-bold text-neutral-900 leading-tight mb-6">
              Compliance Made Simple
              <br />
              <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                for Indian Businesses
              </span>
            </h1>
            
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Instant compliance assessments for employers. Free salary calculators for employees. No subscriptions required.
            </p>
          </div>
        </section>

        {/* FOR YOUR BUSINESS Section - Assessments */}
        <section id="for-business" className="py-16 bg-neutral-50" aria-labelledby="business-heading">
          <div className="container mx-auto px-6">
            {/* Section Title */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-3 mb-3">
                <span className="text-3xl" aria-hidden="true">🏢</span>
                <h2 id="business-heading" className="text-3xl font-bold text-neutral-900">For Your Business</h2>
              </div>
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide bg-primary/10 text-primary">
                Free During Beta
              </span>
            </div>

            {/* 4-Column Grid for Assessments */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              
              {/* Statutory Health Check */}
              <Link 
                href="/assessment/statutory-health"
                className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div className="mb-4">
                  <span className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl" aria-hidden="true">📋</span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Statutory Health Check</h3>
                <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                  Quick 10-minute assessment for PF, ESI, Professional Tax, Gratuity & Bonus compliance.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-xs bg-neutral-100 px-2 py-0.5 rounded-full text-neutral-500">12 questions</span>
                  <span className="text-xs bg-neutral-100 px-2 py-0.5 rounded-full text-neutral-500">PDF report</span>
                </div>
                <div className="text-xs text-neutral-400 mb-2">Rs.999 post-beta</div>
                <div className="text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
                  Start assessment →
                </div>
              </Link>

              {/* Labour Code Readiness */}
              <Link 
                href="/assessment/labour-code"
                className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div className="mb-4">
                  <span className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl" aria-hidden="true">⚖️</span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Labour Code Readiness</h3>
                <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                  Assessment for all 4 new Labour Codes (effective Nov 2025). Gap analysis & action items.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-xs bg-neutral-100 px-2 py-0.5 rounded-full text-neutral-500">30 questions</span>
                  <span className="text-xs bg-neutral-100 px-2 py-0.5 rounded-full text-neutral-500">Cost estimates</span>
                </div>
                <div className="text-xs text-neutral-400 mb-2">Rs.1,999 post-beta</div>
                <div className="text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
                  Start assessment →
                </div>
              </Link>

              {/* DPDP Gap Assessment */}
              <Link 
                href="/assessment/dpdp"
                className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div className="mb-4">
                  <span className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl" aria-hidden="true">🔒</span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">DPDP Gap Assessment</h3>
                <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                  Data protection compliance for DPDP Act 2023 (deadline May 2027). Maturity scoring.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-xs bg-neutral-100 px-2 py-0.5 rounded-full text-neutral-500">45 questions</span>
                  <span className="text-xs bg-neutral-100 px-2 py-0.5 rounded-full text-neutral-500">5-phase model</span>
                </div>
                <div className="text-xs text-neutral-400 mb-2">Rs.2,499 post-beta</div>
                <div className="text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
                  Start assessment →
                </div>
              </Link>

              {/* State-Wise Compliance */}
              <Link 
                href="/assessment/state-wise-compliance"
                className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-violet-500 hover:shadow-lg hover:-translate-y-1 transition-all group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
              >
                <span className="absolute -top-2 right-4 bg-violet-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">NEW</span>
                <div className="mb-4">
                  <span className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center text-2xl" aria-hidden="true">📍</span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Which Laws Apply to My Business?</h3>
                <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                  Find out exactly what&apos;s required in your state — Professional Tax slabs, Labour Welfare Fund rates, S&amp;E deadlines, and more.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-xs bg-violet-100 px-2 py-0.5 rounded-full text-violet-600 font-medium">20+ compliance areas checked</span>
                </div>
                <div className="text-xs text-neutral-400 mb-2">Rs.1,499 post-beta</div>
                <div className="text-sm font-semibold text-violet-600 group-hover:translate-x-1 transition-transform">
                  Check my state →
                </div>
              </Link>

            </div>
          </div>
        </section>

        {/* Visual Divider */}
        <div className="bg-gradient-to-r from-transparent via-neutral-300 to-transparent h-px max-w-4xl mx-auto" aria-hidden="true" />

        {/* FOR YOU Section - Free Calculators */}
        <section id="for-you" className="py-16 bg-white" aria-labelledby="personal-heading">
          <div className="container mx-auto px-6">
            {/* Section Title */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-3 mb-3">
                <span className="text-3xl" aria-hidden="true">👤</span>
                <h2 id="personal-heading" className="text-3xl font-bold text-neutral-900">For You</h2>
              </div>
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide bg-success/10 text-success">
                Free Forever
              </span>
            </div>

            {/* 2-Column Grid for Calculators */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              
              {/* CTC Calculator */}
              <Link 
                href="/calculator/ctc"
                className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 hover:border-success hover:shadow-lg hover:-translate-y-1 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-2xl" aria-hidden="true">💰</span>
                  <span className="text-xs font-semibold uppercase tracking-wide bg-success/10 text-success px-2.5 py-1 rounded-full">Free</span>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">CTC to In-Hand Calculator</h3>
                <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                  Convert your CTC to actual take-home salary. Understand all deductions including PF, ESI, Professional Tax, and Income Tax.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs bg-white border border-neutral-200 px-2.5 py-1 rounded-full text-neutral-500">Instant calculation</span>
                  <span className="text-xs bg-white border border-neutral-200 px-2.5 py-1 rounded-full text-neutral-500">All deductions explained</span>
                </div>
                <div className="text-sm font-semibold text-success group-hover:translate-x-1 transition-transform">
                  Calculate now →
                </div>
              </Link>

              {/* Gratuity Calculator */}
              <Link 
                href="/calculator/gratuity"
                className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 hover:border-success hover:shadow-lg hover:-translate-y-1 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-2xl" aria-hidden="true">🎁</span>
                  <span className="text-xs font-semibold uppercase tracking-wide bg-success/10 text-success px-2.5 py-1 rounded-full">Free</span>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Gratuity Calculator</h3>
                <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                  Estimate your gratuity payout based on years of service and last drawn salary. Covers both Payment of Gratuity Act and new Labour Code formula.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs bg-white border border-neutral-200 px-2.5 py-1 rounded-full text-neutral-500">5+ years eligibility</span>
                  <span className="text-xs bg-white border border-neutral-200 px-2.5 py-1 rounded-full text-neutral-500">New Labour Code ready</span>
                </div>
                <div className="text-sm font-semibold text-success group-hover:translate-x-1 transition-transform">
                  Calculate now →
                </div>
              </Link>

            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-24 bg-neutral-50" aria-labelledby="problem-heading">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <div className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
                THE PROBLEM
              </div>
              <h2 id="problem-heading" className="text-3xl md:text-5xl font-bold text-neutral-900">
                Why Indian SMEs struggle with compliance
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-8 rounded-2xl text-center">
                <div className="text-5xl mb-4" aria-hidden="true">💼</div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  Consultants are Expensive
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  Full compliance audits cost <span className="font-semibold text-amber-600">₹1-10 lakh+</span>. Too expensive for early-stage companies.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl text-center">
                <div className="text-5xl mb-4" aria-hidden="true">📊</div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  SaaS is Overkill
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  Enterprise tools cost <span className="font-semibold text-amber-600">₹20K-5L/year</span>. Unnecessary for occasional compliance checks.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl text-center">
                <div className="text-5xl mb-4" aria-hidden="true">🔍</div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  DIY is Risky
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  Free Google searches lead to incomplete information and missed requirements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 bg-white" aria-labelledby="faq-heading">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <div className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
                FAQ
              </div>
              <h2 id="faq-heading" className="text-3xl md:text-5xl font-bold text-neutral-900">
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
                  Is there a subscription?
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  No subscriptions. Pay only when you need an assessment. Free tools stay free forever.
                </p>
              </div>

              <div className="bg-neutral-50 p-8 rounded-2xl">
                <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                  How accurate are the assessments?
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  Our questions are based on official government sources and verified by compliance experts. We cite specific sections and rules.
                </p>
              </div>

              <div className="bg-neutral-50 p-8 rounded-2xl">
                <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                  What happens after the assessment?
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  You get a detailed PDF report with your compliance score, gap analysis, and prioritized action items with government references.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-neutral-50 border-t border-neutral-200" role="contentinfo">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-lg font-bold text-neutral-900">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center text-white" aria-hidden="true">
                ✓
              </div>
              ComplianceCheck
            </div>
            
            <nav className="flex items-center gap-6 text-sm text-neutral-600" aria-label="Footer navigation">
              <Link 
                href="/privacy" 
                className="hover:text-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="hover:text-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                Terms of Service
              </Link>
              <Link 
                href="mailto:compliancecheck@zohomail.in" 
                className="hover:text-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                Contact
              </Link>
            </nav>
            
            <div className="text-sm text-neutral-500">
              Made in India <span aria-label="Indian flag">🇮🇳</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
