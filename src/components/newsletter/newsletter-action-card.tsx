'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

/**
 * One-button confirm / unsubscribe card. The email link opens this page and
 * the person clicks the button, so link pre-fetching by mail scanners never
 * changes a subscription by itself.
 */
export function NewsletterActionCard({
  token,
  endpoint,
  title,
  description,
  buttonLabel,
  successTitle,
  successBody,
}: {
  token: string
  endpoint: string
  title: string
  description: string
  buttonLabel: string
  successTitle: string
  successBody: string
}) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>(token ? 'idle' : 'error')
  const [error, setError] = useState<string | null>(token ? null : 'This link is incomplete. Please use the link from your email.')

  const submit = async () => {
    setState('loading')
    setError(null)
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
      setState('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setState('error')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-16">
      <Card className="w-full max-w-md">
        {state === 'done' ? (
          <CardHeader className="text-center">
            <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-2" aria-hidden="true" />
            <CardTitle>{successTitle}</CardTitle>
            <CardDescription>{successBody}</CardDescription>
          </CardHeader>
        ) : (
          <>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <p className="flex items-start gap-2 text-sm text-red-600" role="alert">
                  <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  {error}
                </p>
              )}
              {token && (
                <Button onClick={submit} disabled={state === 'loading'} className="w-full bg-green-700 hover:bg-green-800 text-white">
                  {state === 'loading' ? 'Please wait…' : buttonLabel}
                </Button>
              )}
            </CardContent>
          </>
        )}
        <CardContent className="pt-0 text-center">
          <Link href="/" className="text-sm text-blue-700 hover:text-blue-800 underline">
            Go to ComplianceCheck
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}
