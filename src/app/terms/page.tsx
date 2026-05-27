import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export const metadata: Metadata = {
  title: 'Terms of Service - ComplianceCheck',
  description: 'Terms of Service for ComplianceCheck compliance assessment platform. Read our usage terms, disclaimers, and policies.',
  alternates: {
    canonical: 'https://compliancecheck.co.in/terms',
  },
  openGraph: {
    title: 'Terms of Service | ComplianceCheck',
    description: 'Terms of Service for ComplianceCheck compliance assessment platform. Read our usage terms, disclaimers, and policies.',
    type: 'website',
    url: 'https://compliancecheck.co.in/terms',
    siteName: 'ComplianceCheck',
  },
  robots: {
    index: true,
    follow: true
  }
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">ComplianceCheck</span>
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <header className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h1>
            <p className="text-gray-600 dark:text-gray-400">Last updated: January 2025</p>
          </header>

          <article className="prose prose-gray dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 dark:text-gray-400">
                By accessing or using ComplianceCheck (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Description of Service</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                ComplianceCheck provides digital compliance assessment tools for Indian businesses. Our services include:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Interactive compliance questionnaires</li>
                <li>Automated compliance scoring and gap analysis</li>
                <li>PDF reports with action items</li>
                <li>Free compliance calculators and tools</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Important Disclaimer</h2>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-4">
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  ComplianceCheck is a self-assessment tool and does not constitute legal, tax, or professional advice. Our assessments are designed to help you identify potential compliance gaps, but they should not be relied upon as a substitute for professional consultation.
                </p>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                We recommend consulting with qualified legal, HR, or compliance professionals for specific guidance on your compliance obligations. ComplianceCheck and its operators shall not be liable for any decisions made based on the information provided by our assessments.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. User Accounts</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">When you create an account, you agree to:</p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorised access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Beta Programme</h2>
              <p className="text-gray-600 dark:text-gray-400">
                During the beta period, all assessments are provided free of charge. We reserve the right to modify, limit, or discontinue the beta programme at any time. Beta features may contain bugs or errors, and we appreciate your feedback to improve the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Pricing and Payments</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Post-beta, assessments will be available on a pay-as-you-go basis. Prices will be clearly displayed before purchase. All payments are processed securely through Razorpay.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Prices are subject to change. We will notify registered users of any pricing changes before they take effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Intellectual Property</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The Service, including all content, features, and functionality, is owned by ComplianceCheck and is protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Your assessment reports are owned by you. However, we may use anonymised and aggregated data to improve our services and for research purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Prohibited Uses</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Use the Service for any unlawful purpose</li>
                <li>Attempt to gain unauthorised access to our systems</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Resell or redistribute our assessments without permission</li>
                <li>Scrape or harvest data from the Service</li>
                <li>Misrepresent assessment results to third parties</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-600 dark:text-gray-400">
                To the maximum extent permitted by law, ComplianceCheck shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Indemnification</h2>
              <p className="text-gray-600 dark:text-gray-400">
                You agree to indemnify and hold harmless ComplianceCheck from any claims, damages, losses, or expenses arising from your use of the Service or violation of these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Governing Law</h2>
              <p className="text-gray-600 dark:text-gray-400">
                These Terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Pune, Maharashtra.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Changes to Terms</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We reserve the right to modify these Terms at any time. Material changes will be notified via email or through the Service. Your continued use of the Service after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">13. Contact</h2>
              <p className="text-gray-600 dark:text-gray-400">
                For questions about these Terms, contact us at:<br />
                Email: <a href="mailto:compliancecheck@zohomail.in" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">compliancecheck@zohomail.in</a>
              </p>
            </section>
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} ComplianceCheck. Made in India 🇮🇳
          </p>
        </div>
      </footer>
    </div>
  )
}
