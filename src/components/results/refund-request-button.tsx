'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { analytics } from '@/lib/analytics/tracking'
import type { AssessmentType } from '@/lib/analytics/events'

interface RefundRequestButtonProps {
  assessmentId: string
  assessmentType: AssessmentType
}

export function RefundRequestButton({ assessmentId, assessmentType }: RefundRequestButtonProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'requested' | 'closed' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleClick = async () => {
    setState('loading')
    setErrorMessage(null)
    try {
      const res = await fetch('/api/payment/request-refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId, assessmentType }),
      })
      const data = await res.json()

      if (res.ok) {
        analytics.refundRequested({ assessment_type: assessmentType, assessment_id: assessmentId, within_window: true })
        setState('requested')
        return
      }
      if (data.error === 'window_closed') {
        analytics.refundRequested({ assessment_type: assessmentType, assessment_id: assessmentId, within_window: false })
        setState('closed')
        return
      }
      setErrorMessage(data.error || 'Something went wrong')
      setState('error')
    } catch {
      setErrorMessage('Something went wrong')
      setState('error')
    }
  }

  if (state === 'requested') {
    return <p className="text-sm text-green-700">Refund requested — we&apos;ll process it within 2 business days.</p>
  }
  if (state === 'closed') {
    return <p className="text-sm text-gray-500">The 7-day guarantee window has closed for this purchase.</p>
  }

  return (
    <div>
      <Button variant="outline" size="sm" onClick={handleClick} disabled={state === 'loading'}>
        {state === 'loading' ? 'Requesting…' : 'Request a refund'}
      </Button>
      {state === 'error' && errorMessage && <p className="text-xs text-red-600 mt-1">{errorMessage}</p>}
    </div>
  )
}
