'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { CONTACT_EMAIL } from '@/lib/seo/site'

const inputClassName =
  'w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all'

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    setStatus('sending')
    setErrorMessage('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          company: formData.get('company'),
          subject: formData.get('subject'),
          message: formData.get('message'),
        }),
      })

      if (res.ok) {
        setStatus('sent')
        form.reset()
      } else {
        const data = await res.json().catch(() => null)
        setErrorMessage(data?.error ?? `Something went wrong. Please email ${CONTACT_EMAIL} directly.`)
        setStatus('error')
      }
    } catch {
      setErrorMessage(`Something went wrong. Please email ${CONTACT_EMAIL} directly.`)
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" aria-hidden="true" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Message sent</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Thanks for getting in touch. We reply within 24&ndash;48 hours.
        </p>
      </div>
    )
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            maxLength={200}
            className={inputClassName}
            placeholder="John Doe"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            maxLength={200}
            className={inputClassName}
            placeholder="john@company.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Company Name
        </label>
        <input
          type="text"
          id="company"
          name="company"
          maxLength={200}
          className={inputClassName}
          placeholder="Your Company Pvt Ltd"
        />
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Subject
        </label>
        <select id="subject" name="subject" required className={inputClassName}>
          <option value="">Select a topic</option>
          <option value="assessment">Assessment Questions</option>
          <option value="pricing">Pricing &amp; Plans</option>
          <option value="technical">Technical Support</option>
          <option value="partnership">Partnership Enquiry</option>
          <option value="feedback">Feedback</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          maxLength={5000}
          className={`${inputClassName} resize-none`}
          placeholder="Tell us how we can help..."
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600" role="alert">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white py-4 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'sending' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}
