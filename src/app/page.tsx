'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Footer } from '@/components/site/footer';
import { CaseSnippets } from '@/components/trust/case-snippets';
import { DownloadSampleReportButton } from '@/components/trust/download-sample-report-button';
import { ASSESSMENT_TYPES } from '@/lib/constants/assessment-types';
import {
  Heart,
  Scale,
  Shield,
  MapPin,
  Utensils,
  AlertTriangle,
  ArrowRight,
  Calculator,
  Gift,
  Menu,
  X,
  Car,
} from 'lucide-react';

// Trust strip data — honest, verifiable stats only
const TRUST_SIGNALS = [
  { stat: '7', label: 'compliance domains covered' },
  { stat: '18+', label: 'Indian laws referenced' },
  { stat: '250+', label: 'compliance questions across all tools' },
  { stat: '15 min', label: 'average to complete' },
];

// Assessment card data
const assessments: {
  id: string;
  title: string;
  description: string;
  questions: number;
  fullPrice: string;
  isLive: boolean;
  href: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  gradient: string;
  hoverBorder: string;
  badge: { text: string; color: string } | null;
}[] = [
  {
    id: 'statutory-health-check',
    title: 'Statutory Health Check',
    description: 'Quick 10-minute assessment for PF, ESI, Professional Tax, Gratuity & Bonus compliance.',
    questions: 12,
    fullPrice: '₹499',
    isLive: true,
    href: '/assessment/statutory-health',
    icon: Heart,
    gradient: 'from-blue-500 to-blue-600',
    hoverBorder: 'hover:border-blue-500',
    badge: { text: 'LIVE', color: 'bg-blue-600' }
  },
  {
    id: 'labour-code-readiness',
    title: 'Labour Code Readiness',
    description: 'Assessment for all 4 new Labour Codes (Nov 2025). Gap analysis & action items.',
    questions: 30,
    fullPrice: '₹999',
    isLive: false,
    href: '/assessment/labour-code',
    icon: Scale,
    gradient: 'from-teal-500 to-teal-600',
    hoverBorder: 'hover:border-teal-500',
    badge: null
  },
  {
    id: 'dpdp-gap-assessment',
    title: 'DPDP Gap Assessment',
    description: 'Data protection compliance for DPDP Act 2023 (effective May 2027). Maturity scoring.',
    questions: 45,
    fullPrice: '₹2,499',
    isLive: true,
    href: '/assessment/dpdp',
    icon: Shield,
    gradient: 'from-blue-600 to-cyan-600',
    hoverBorder: 'hover:border-blue-600',
    badge: { text: 'Popular', color: 'bg-blue-500' }
  },
  {
    id: 'which-laws-apply',
    title: 'Which Laws Apply to My Business?',
    description: "Find out exactly what's required in your state — Professional Tax slabs, Labour Welfare Fund rates, S&E deadlines, and more.",
    questions: 10,
    fullPrice: '₹499',
    isLive: false,
    href: '/assessment/state-wise-compliance',
    icon: MapPin,
    gradient: 'from-indigo-600 to-purple-600',
    hoverBorder: 'hover:border-indigo-500',
    badge: null
  },
  {
    id: 'food-business-compliance',
    title: 'Restaurant & Food Business',
    description: 'FSSAI, Fire NOC, Liquor Licence, GST, and Labour compliance for food businesses.',
    questions: 26,
    fullPrice: '₹999',
    isLive: false,
    href: '/assessment/food-business',
    icon: Utensils,
    gradient: 'from-cyan-500 to-teal-600',
    hoverBorder: 'hover:border-cyan-500',
    badge: { text: 'NEW', color: 'bg-teal-500' }
  },
  {
    id: 'posh-compliance',
    title: 'POSH Act 2013 Compliance',
    description: 'Workplace safety assessment for Prevention of Sexual Harassment compliance and ICC requirements.',
    questions: 40,
    fullPrice: '₹1,999',
    isLive: false,
    href: '/assessment/posh',
    icon: AlertTriangle,
    gradient: 'from-purple-500 to-pink-600',
    hoverBorder: 'hover:border-purple-500',
    badge: { text: 'NEW', color: 'bg-purple-500' }
  },
  {
    id: 'auto-dealer-compliance',
    title: 'Auto Dealership Compliance',
    description: '2-Wheeler & 4-Wheeler Dealers — Labour, CMVR, EHS, IRDAI MISP, ELV, GST 2.0, DPDP. 6-phase, up to 100 questions.',
    questions: 100,
    fullPrice: '₹2,999',
    isLive: false,
    href: '/assessment/auto-dealer',
    icon: Car,
    gradient: 'from-blue-700 to-sky-500',
    hoverBorder: 'hover:border-sky-500',
    badge: { text: 'NEW', color: 'bg-sky-600' }
  },
];

// Free tools data
const freeTools = [
  {
    id: 'penalty-calculator',
    title: 'Compliance Penalty Calculator',
    description: 'See your total statutory penalty exposure across DPDP Act, Labour Codes, EPF/ESI, POSH, GST and more. Two-number framing: typical risk + worst-case ceiling.',
    href: '/calculators/compliance-penalty-calculator',
    icon: Shield,
    gradient: 'from-red-500 to-red-600',
    tags: ['18+ Indian laws', 'DPDP · EPF · POSH · GST', 'No login required']
  },
  {
    id: 'ctc-calculator',
    title: 'CTC to In-Hand Calculator',
    description: 'Convert your CTC to actual take-home salary. Understand all deductions including PF, ESI, Professional Tax, and Income Tax.',
    href: '/calculator/ctc',
    icon: Calculator,
    gradient: 'from-emerald-500 to-emerald-600',
    tags: ['Instant calculation', 'All deductions explained']
  },
  {
    id: 'gratuity-calculator',
    title: 'Gratuity Calculator',
    description: 'Estimate your gratuity payout based on years of service and last drawn salary. Covers both Payment of Gratuity Act and new Labour Code formula.',
    href: '/calculator/gratuity',
    icon: Gift,
    gradient: 'from-emerald-500 to-emerald-600',
    tags: ['5+ years eligibility', 'New Labour Code ready']
  }
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Skip to Main Content - Accessibility */}
      <a 
        href="#main" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Navigation */}
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      {/* Main Content */}
      <main id="main">
        {/* Hero Section */}
        <HeroSection />

        {/* Assessments Section */}
        <AssessmentsSection />

        {/* Sample Reports Section — see the real output before paying */}
        <SampleReportsSection />

        {/* Case Snippets — concrete "found X, fixed Y" trust signals */}
        <CaseSnippets />

        {/* Free Tools Section */}
        <FreeToolsSection />

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* Testimonials — placeholder, see TestimonialsSection for replacement instructions */}
        <TestimonialsSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// Testimonials — PLACEHOLDER CONTENT. Do not treat these as real quotes.
// Replace each card with a real beta-user testimonial (with permission to
// publish) before this section goes live. The dashed border and explicit
// "Add a real..." copy are intentional — they must stay visually obvious as
// placeholders until replaced.
function TestimonialsSection() {
  const placeholders = [
    { role: 'Founder, early beta user' },
    { role: 'HR Lead, early beta user' },
    { role: 'Compliance CS partner' },
  ]

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900/50" aria-labelledby="testimonials-heading">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 id="testimonials-heading" className="text-3xl font-bold text-gray-900 dark:text-white">
            What early users say
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Checklists reviewed against the DPDP Act 2023, the 2025 Labour Codes, and the POSH Act 2013.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {placeholders.map((p, i) => (
            <div
              key={i}
              className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-center"
            >
              <p className="text-sm italic text-gray-400 dark:text-gray-500">
                &ldquo;Add a real customer quote here&rdquo;
              </p>
              <p className="mt-3 text-xs font-medium text-gray-400 dark:text-gray-600">
                — {p.role} (placeholder)
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Header Component
function Header({
  mobileMenuOpen, 
  setMobileMenuOpen 
}: { 
  mobileMenuOpen: boolean; 
  setMobileMenuOpen: (open: boolean) => void;
}) {
  const navLinks = [
    { href: '/how-it-works', label: 'How It Works' },
    { href: '#assessments', label: 'Assessments' },
    { href: '#free-tools', label: 'Free Tools' },
    { href: '/blog', label: 'Guides' },
    { href: '#faq', label: 'FAQ' },
    { href: '/suggestions', label: 'Share an Idea' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 z-50">
      <nav className="max-w-7xl mx-auto px-6 py-4" aria-label="Main navigation">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-lg"
            aria-label="ComplianceCheck - Go to homepage"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">ComplianceCheck</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Primary nav CTA — drives toward assessments, not away to contact */}
            <Link
              href="#assessments"
              className="hidden sm:inline-flex bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Start an Assessment
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg">
            <nav className="max-w-7xl mx-auto px-6 py-4">
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                  <Link
                    href="#assessments"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    Start an Assessment
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </nav>
    </header>
  );
}


// Hero Section — Fix 1: outcome-led value proposition above the card grid
function HeroSection() {
  return (
    <section
      className="pt-28 pb-12 bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900"
      aria-labelledby="hero-heading"
    >
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1
          id="hero-heading"
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6"
        >
          Know exactly where your business stands on{' '}
          <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            Indian compliance
          </span>{' '}
          — in 15 minutes
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          Answer a guided set of questions and get a free compliance summary instantly:
          your score, category breakdown, and top gaps identified. Unlock the full report —
          with every gap explained, the exact law cited, and a prioritised action plan —
          from ₹499. No lawyer appointment needed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <a
            href="#assessments"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-blue-200 dark:hover:shadow-blue-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            See All Assessments &amp; Pricing
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </a>
          <a
            href="/calculators/compliance-penalty-calculator"
            className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold px-8 py-4 rounded-xl border border-gray-200 dark:border-gray-700 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <Calculator className="w-5 h-5" aria-hidden="true" />
            Check Your Penalty Exposure — Free
          </a>
        </div>

        {/* Trust strip — Fix 4 (partial): surface credentials into the first viewport */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-gray-200 dark:border-gray-700 pt-8"
          aria-label="Trust indicators"
        >
          {TRUST_SIGNALS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{s.stat}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Assessments Section
function AssessmentsSection() {
  return (
    <section
      id="assessments"
      className="pt-32 pb-24 bg-white dark:bg-gray-900"
      aria-labelledby="assessments-heading"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <header className="text-center mb-16">
          {/* Top Badge */}
          <span className="inline-block bg-gradient-to-r from-blue-500 to-teal-500 text-white px-4 py-1 rounded-full text-sm font-medium mb-4">
            📋 Choose Your Assessment
          </span>

          {/* Main Heading — H2 because H1 is in the hero */}
          <h2
            id="assessments-heading"
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            7 Assessments. Every major compliance domain.
          </h2>

          {/* Subtitle */}
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Start with a free compliance summary — your score and top gaps, instantly.
            Unlock the full report with remediation steps, legal citations, and a
            downloadable PDF. Pay once per assessment. No subscription.
          </p>

          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Free compliance summary included with every assessment.
            Full reports from ₹499 — pay once, no subscription.
          </p>
        </header>

        {/* Assessment Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {assessments.map((assessment) => (
            <AssessmentCard key={assessment.id} assessment={assessment} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Sample Reports Section — download a real, watermarked report for every
// assessment type before paying. No email or signup required.
const SAMPLE_REPORT_TYPES = [
  ASSESSMENT_TYPES.STATUTORY_HEALTH,
  ASSESSMENT_TYPES.LABOUR_CODE,
  ASSESSMENT_TYPES.DPDP,
  ASSESSMENT_TYPES.STATE_WISE_COMPLIANCE,
  ASSESSMENT_TYPES.FOOD_BUSINESS,
  ASSESSMENT_TYPES.POSH,
  ASSESSMENT_TYPES.AUTO_DEALER,
];

function SampleReportsSection() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900/50" aria-labelledby="sample-reports-heading">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h2 id="sample-reports-heading" className="text-3xl font-bold text-gray-900 dark:text-white">
          See a real report before you pay
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Every sample below is a full, watermarked report generated the same way your report would be —
          same format, same level of detail.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {SAMPLE_REPORT_TYPES.map((type) => (
            <DownloadSampleReportButton key={type} assessmentType={type} source="homepage" />
          ))}
        </div>
      </div>
    </section>
  );
}

// Assessment Card Component
function AssessmentCard({ assessment }: { assessment: typeof assessments[number] }) {
  const IconComponent = assessment.icon;

  return (
    <Link
      href={assessment.href}
      className={`group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700 ${assessment.hoverBorder} dark:hover:border-opacity-50 overflow-hidden transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 flex flex-col h-full`}
    >
      {/* Hover Background Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${assessment.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
        aria-hidden="true"
      />

      {/* Badge */}
      {assessment.badge && (
        <span
          className={`absolute top-4 right-4 ${assessment.badge.color} text-white text-xs font-medium px-2.5 py-1 rounded-full`}
        >
          {assessment.badge.text}
        </span>
      )}

      {/* Icon */}
      <div
        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${assessment.gradient} flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform duration-300`}
      >
        <IconComponent className="w-7 h-7 text-white" aria-hidden="true" />
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-teal-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
        {assessment.title}
      </h2>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
        {assessment.description}
      </p>

      {/* Spacer + Bottom Content - pushed to bottom */}
      <div className="mt-auto">
        {/* Questions count */}
        <div className="mb-3 text-sm">
          <strong className="font-semibold text-gray-700 dark:text-gray-300">{assessment.questions}</strong>
          <span className="text-gray-500 dark:text-gray-500"> questions</span>
        </div>

        {/* Pricing line */}
        <div className="flex items-center gap-3 mb-4 text-sm">
          <span className="text-gray-600 dark:text-gray-400">Free summary</span>
          <span className="w-px h-4 bg-gray-300 dark:bg-gray-600" aria-hidden="true" />
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            Full report: {assessment.fullPrice}
          </span>
          {!assessment.isLive && (
            <span className="text-xs text-green-600 dark:text-green-400">Early access — free now</span>
          )}
        </div>

        {/* CTA Button */}
        <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-blue-600 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-teal-600 text-white transition-all duration-300">
          <span className="font-medium">
            {assessment.isLive ? 'Start — Free Summary' : 'Start Assessment'}
          </span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Decorative Element */}
      <div
        className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-teal-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"
        aria-hidden="true"
      />
    </Link>
  );
}

// Free Tools Section
function FreeToolsSection() {
  return (
    <section
      id="free-tools"
      className="py-24 bg-gray-50 dark:bg-gray-800"
      aria-labelledby="free-tools-heading"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <header className="text-center mb-12">
          <span className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1 rounded-full text-sm font-medium mb-4">
            👤 For You
          </span>
          <h2
            id="free-tools-heading"
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Free Tools
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Useful calculators for employees. No signup required. Free forever.
          </p>
          <span className="inline-block mt-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-full text-sm font-semibold">
            FREE FOREVER
          </span>
        </header>

        {/* Tools Grid — 3-col to match assessments section above */}
        <div className="grid md:grid-cols-3 gap-8">
          {freeTools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className="group bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:border-emerald-500 hover:shadow-2xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-md`}>
                    <IconComponent className="w-7 h-7 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                    Free
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {tool.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {tool.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {tool.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2.5 py-1 rounded-full text-gray-500 dark:text-gray-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Calculate now <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}


// How It Works Section
function HowItWorksSection() {
  const steps = [
    {
      number: '1',
      title: 'Choose Your Assessment',
      description: 'Pick from 7 domains: labour law, data protection, food safety, POSH, and more.'
    },
    {
      number: '2',
      title: 'Answer the Questions',
      description: 'Guided questions take 10–45 minutes depending on the assessment. No jargon — plain language throughout.'
    },
    {
      number: '3',
      title: 'Get Your Free Summary',
      description: 'Instantly see your compliance score, category breakdown, and the top gaps your business has. No payment needed.'
    },
    {
      number: '4',
      title: 'Unlock the Full Report',
      description: 'Pay once to access every gap with the exact legal provision, a prioritised fix-it list, and a PDF you can download or get by email.'
    }
  ];

  return (
    <section
      id="how-it-works"
      className="py-24 bg-white dark:bg-gray-900"
      aria-labelledby="how-it-works-heading"
    >
      <div className="max-w-7xl mx-auto px-6">
        <header className="text-center mb-16">
          <span className="inline-block bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-medium mb-4">
            ⚡ Simple Process
          </span>
          <h2
            id="how-it-works-heading"
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            How It Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Get compliance clarity in four simple steps
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {step.description}
              </p>
              {index < steps.length - 1 && (
                <ArrowRight className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-gray-300 dark:text-gray-600" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// FAQ Section
function FAQSection() {
  const faqs = [
    {
      question: 'Who is this for?',
      answer: 'Startup founders, HR managers, and compliance professionals managing Indian businesses with 10-500 employees.'
    },
    {
      question: 'What do I get for free?',
      answer: 'Every assessment gives you a free compliance summary the moment you finish: your overall score, a breakdown by category, and your top compliance gaps. No sign-up, no payment.'
    },
    {
      question: 'What do I get when I pay?',
      answer: 'The full report includes every gap with the exact legal section that applies, a prioritised action plan your team can act on immediately, and a branded PDF you can download or receive by email. One payment — no subscription, no renewal. Prices start at ₹499.'
    },
    {
      question: 'Is this a subscription?',
      answer: 'No. Pay only when you need an assessment. No recurring charges, no lock-in contracts. Each report is a one-time purchase. Prices are shown on every assessment card before you start.'
    },
    {
      question: 'How accurate are the assessments?',
      answer: 'Our questions are based on the actual government acts and rules. Every answer maps to a specific legal section so you can verify everything yourself.'
    }
  ];

  return (
    <section
      id="faq"
      className="py-24 bg-gray-50 dark:bg-gray-800"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-4xl mx-auto px-6">
        <header className="text-center mb-16">
          <span className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium mb-4">
            ❓ FAQ
          </span>
          <h2
            id="faq-heading"
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Common Questions
          </h2>
        </header>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset">
                <h3 className="font-semibold text-gray-900 dark:text-white">{faq.question}</h3>
                <span className="ml-4 flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-open:rotate-45 transition-transform font-bold">
                  +
                </span>
              </summary>
              <div className="px-6 pb-6">
                <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

