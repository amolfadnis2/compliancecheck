'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, CheckCircle, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { analytics } from '@/lib/analytics'
import { ANALYTICS_EVENTS } from '@/lib/analytics/events'

const CATEGORIES = [
  { value: 'improve_existing', label: 'Improve an existing assessment' },
  { value: 'new_assessment', label: 'Suggest a new assessment' },
  { value: 'new_tool', label: 'Suggest a new tool or calculator' },
  { value: 'bug_report', label: 'Report a bug or issue' },
  { value: 'other', label: 'Something else' },
] as const

type Category = (typeof CATEGORIES)[number]['value']

export default function SuggestionsPage() {
  const [suggestion, setSuggestion] = useState('')
  const [category, setCategory] = useState<Category>('improve_existing')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!suggestion.trim()) {
      setError('Please share your idea before submitting.')
      return
    }
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suggestion: suggestion.trim(),
          category,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Something went wrong')
      }

      analytics.trackEvent(ANALYTICS_EVENTS.SUGGESTION_SUBMITTED, {
        category,
        has_contact: Boolean(email.trim() || phone.trim()),
      })

      setSubmitted(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not submit your suggestion. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Header — consistent branding with site + theme toggle */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center">
                <Check className="w-6 h-6 text-white" strokeWidth={3} />
              </div>
              <div>
                <span className="font-semibold text-lg text-gray-900 dark:text-white">
                  ComplianceCheck
                </span>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Share an idea
                </div>
              </div>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {submitted ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Thank you!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Your suggestion has been received. We genuinely read every idea.
            </p>
            <Link
              href="/"
              className="inline-flex bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Back to home
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-md">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Share an idea
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Tell us how we can improve our assessments — or what you&apos;d like
              us to build next. Contact details are optional.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  What is this about?
                </label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as Category)}
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Suggestion */}
              <div>
                <label
                  htmlFor="suggestion"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Your idea <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="suggestion"
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  placeholder="Describe your suggestion or idea..."
                  rows={5}
                  className="w-full p-3 border border-input rounded-md bg-transparent text-sm text-gray-900 dark:text-white shadow-sm resize-none placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  required
                />
              </div>

              {/* Optional contact */}
              <div className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Contact details (optional)
                </p>
                <div>
                  <label htmlFor="name" className="sr-only">
                    Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="sr-only">
                    Phone
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {submitting ? 'Submitting...' : 'Submit suggestion'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
