import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export const metadata: Metadata = {
  title: 'Privacy Policy - ComplianceCheck',
  description: 'Privacy Policy for ComplianceCheck. Learn how we collect, use, and protect your data in compliance with DPDP Act 2023.',
  alternates: {
    canonical: 'https://compliancecheck.co.in/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | ComplianceCheck',
    description: 'Privacy Policy for ComplianceCheck. Learn how we collect, use, and protect your data in compliance with DPDP Act 2023.',
    type: 'website',
    url: 'https://compliancecheck.co.in/privacy',
    siteName: 'ComplianceCheck',
  },
  robots: {
    index: true,
    follow: true
  }
}

export default function PrivacyPage() {
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
            <div className="inline-block bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium mb-4">
              DPDP Act 2023 Compliant
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
            <p className="text-gray-600 dark:text-gray-400">Last updated: January 2025</p>
          </header>

          <article className="prose prose-gray dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Introduction</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                ComplianceCheck India (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our compliance assessment platform.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                We comply with the Digital Personal Data Protection (DPDP) Act, 2023 and other applicable Indian data protection laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">2.1 Personal Data</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">We may collect the following personal data:</p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-4">
                <li>Name and email address</li>
                <li>Company name and designation</li>
                <li>Contact information</li>
                <li>Assessment responses</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">2.2 Usage Data</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We automatically collect usage information including IP address, browser type, pages visited, and interaction data to improve our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">We use your information to:</p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Provide and maintain our compliance assessment services</li>
                <li>Generate personalised compliance reports</li>
                <li>Send assessment results and related communications</li>
                <li>Improve our platform and user experience</li>
                <li>Respond to your enquiries and support requests</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Data Retention</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We retain your personal data only for as long as necessary to fulfil the purposes outlined in this policy, unless a longer retention period is required by law. Assessment data is retained for 2 years from the date of completion, after which it is automatically deleted.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Your Rights</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Under the DPDP Act 2023, you have the right to:</p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Withdraw consent at any time</li>
                <li>Data portability</li>
                <li>Lodge complaints with the Data Protection Board</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Data Security</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security assessments.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Third-Party Services</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">We may use third-party services for:</p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Authentication (Supabase)</li>
                <li>Analytics (PostHog)</li>
                <li>Email delivery (Resend)</li>
                <li>Payment processing (Razorpay - coming soon)</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 mt-4">
                These providers have their own privacy policies governing the use of your information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Cookies</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We use essential cookies for authentication and session management. Analytics cookies are used with your consent to understand how you use our platform. You can manage cookie preferences through your browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Contact Us</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                For privacy-related enquiries or to exercise your rights, contact us at:
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Email: <a href="mailto:compliancecheck@zohomail.in" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">compliancecheck@zohomail.in</a><br />
                Location: Pune, Maharashtra, India
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Changes to This Policy</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page with an updated revision date.
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
