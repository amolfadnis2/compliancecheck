import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, MapPin, Clock, ArrowLeft } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Footer } from '@/components/site/footer'
import { CONTACT_EMAIL } from '@/lib/seo/site'
import { ContactForm } from './contact-form'

export const metadata: Metadata = {
  title: 'Contact Us - ComplianceCheck',
  description: 'Get in touch with ComplianceCheck for questions about compliance assessments, partnerships, or support.',
  alternates: {
    canonical: 'https://compliancecheck.co.in/contact',
  },
  openGraph: {
    title: 'Contact Us | ComplianceCheck',
    description: 'Get in touch with ComplianceCheck for questions about compliance assessments, partnerships, or support.',
    type: 'website',
    url: 'https://compliancecheck.co.in/contact',
    siteName: 'ComplianceCheck',
  },
  robots: {
    index: true,
    follow: true
  }
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
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
        <div className="max-w-4xl mx-auto px-6">
          {/* Page Header */}
          <header className="text-center mb-16">
            <span className="inline-block bg-gradient-to-r from-blue-500 to-teal-500 text-white px-4 py-1 rounded-full text-sm font-medium mb-4">
              📬 Get in Touch
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Have questions about our compliance assessments? We&apos;re here to help.
            </p>
          </header>

          {/* Contact Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Email</h2>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                {CONTACT_EMAIL}
              </a>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Location</h2>
              <p className="text-gray-600 dark:text-gray-400">Pune, Maharashtra, India</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Response Time</h2>
              <p className="text-gray-600 dark:text-gray-400">Within 24-48 hours</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send us a Message</h2>
            <ContactForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
