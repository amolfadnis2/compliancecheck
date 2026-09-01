'use client'

import { useState } from 'react'
import { PhoneCall } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { analytics } from '@/lib/analytics/tracking'
import type { AssessmentType } from '@/lib/analytics/events'

interface ExpertCallCTAProps {
  assessmentId: string
  assessmentType: AssessmentType
  defaultEmail?: string
}

/**
 * Included with a paid report (not an upsell) so the demand signal reflects
 * genuine interest rather than price friction. Copy deliberately avoids
 * claiming a named/credentialed expert — there isn't one on staff yet.
 */
export function ExpertCallCTA({ assessmentId, assessmentType, defaultEmail = '' }: ExpertCallCTAProps) {
  const [email, setEmail] = useState(defaultEmail)
  const [state, setState] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    setState('loading')
    setError(null)
    try {
      const res = await fetch('/api/expert-call/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId, assessmentType, email }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Something went wrong')
      }
      analytics.expertCallRequested({ assessment_type: assessmentType, assessment_id: assessmentId })
      setState('sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setState('error')
    }
  }

  if (state === 'sent') {
    return (
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6 flex items-start gap-3">
          <PhoneCall className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900">
            Got it — a compliance specialist will review your results and follow up within 2 business days.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <PhoneCall className="w-5 h-5" />
          Talk to a compliance specialist
        </CardTitle>
        <CardDescription className="text-blue-800">
          Included with your report. A compliance specialist will review your results and follow up — no extra charge.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-2 max-w-md">
          <Input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={state === 'loading'}
          />
          <Button onClick={handleSubmit} disabled={state === 'loading'} className="bg-blue-700 hover:bg-blue-800">
            {state === 'loading' ? 'Sending…' : 'Request a call'}
          </Button>
        </div>
        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      </CardContent>
    </Card>
  )
}
