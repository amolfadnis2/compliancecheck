'use client'

import { useState } from 'react'
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { trackEvent } from '@/lib/analytics'
import type { BusinessInput, PenaltyExposureResult } from '@/lib/calculators/penalty-exposure/types'
import { generatePenaltyPDF } from '@/lib/calculators/penalty-exposure/pdf-generator'

interface Props {
  input: BusinessInput
  result: PenaltyExposureResult
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export function EmailGate({ input, result }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid email address.')
      return
    }

    setStatus('loading')
    setErrorMsg('')

    try {
      trackEvent('penalty_pdf_requested', { email_domain: email.split('@')[1] })

      const pdfDataUri = generatePenaltyPDF(input, result)
      // Strip the data URI prefix to get pure base64
      const base64 = pdfDataUri.split(',')[1]

      const res = await fetch('/api/calculators/penalty-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pdfBase64: base64 }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to send report')
      }

      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
        <div>
          <p className="font-semibold text-green-800 dark:text-green-300">Report sent!</p>
          <p className="text-sm text-green-700 dark:text-green-400">
            Check your inbox at <strong>{email}</strong> for your 6-page penalty exposure report.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-950/30">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Get the full 6-page report</h3>
      </div>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Includes per-law breakdown, remediation steps, government portal links, and methodology.
        Delivered as a PDF — no account required.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="report-email" className="sr-only">Email address</Label>
          <Input
            id="report-email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading'}
            className="bg-white dark:bg-gray-900"
          />
        </div>
        <Button
          type="submit"
          disabled={status === 'loading'}
          className="bg-blue-700 hover:bg-blue-800 text-white flex-shrink-0"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : (
            'Email me the report'
          )}
        </Button>
      </form>
      {errorMsg && (
        <div className="mt-2 flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4" />
          {errorMsg}
        </div>
      )}
      <p className="mt-2 text-xs text-gray-400">
        No spam. We send only the report you requested.
      </p>
    </div>
  )
}
