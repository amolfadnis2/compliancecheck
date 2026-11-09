'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { requestNewsletterSignup } from '@/lib/newsletter/client'

/** Home-page "subscribe to the weekly newsletter" section. */
export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    setState('loading')
    setError(null)
    const err = await requestNewsletterSignup(email.trim(), 'home')
    if (err) {
      setError(err)
      setState('idle')
    } else {
      setState('done')
    }
  }

  return (
    <section className="py-16 bg-white dark:bg-gray-900" aria-labelledby="newsletter-heading">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2 id="newsletter-heading" className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Get the weekly compliance newsletter
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          New calculators, assessments and compliance articles, once a week. Free, and you can unsubscribe in one click.
        </p>

        {state === 'done' ? (
          <p className="flex items-center justify-center gap-2 text-green-700 dark:text-green-500 font-medium" role="status">
            <CheckCircle className="h-5 w-5" aria-hidden="true" />
            Almost done: check your inbox and click the confirmation link.
          </p>
        ) : (
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" noValidate>
            <Input
              type="email"
              placeholder="you@company.com"
              aria-label="Email address for the weekly newsletter"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={state === 'loading'}
              className="h-11"
            />
            <Button type="submit" disabled={state === 'loading'} className="h-11 bg-green-700 hover:bg-green-800 text-white">
              {state === 'loading' ? 'Subscribing…' : 'Subscribe'}
            </Button>
          </form>
        )}

        {error && <p className="text-sm text-red-600 mt-3" role="alert">{error}</p>}

        <p className="text-xs text-gray-500 mt-4">
          We only use your email for this newsletter. See our{' '}
          <Link href="/privacy" className="underline">privacy policy</Link>.
        </p>
      </div>
    </section>
  )
}
