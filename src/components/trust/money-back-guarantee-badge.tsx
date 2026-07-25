'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { analytics } from '@/lib/analytics/tracking'
import type { AssessmentType } from '@/lib/analytics/events'

interface MoneyBackGuaranteeBadgeProps {
  assessmentType: AssessmentType
  source: 'checkout' | 'results'
  className?: string
}

/**
 * Only render this where payment is actually live for the assessment type —
 * showing a refund guarantee on a flow that doesn't take payment yet would
 * be misleading. Callers are responsible for checking isPaymentLive().
 */
export function MoneyBackGuaranteeBadge({ assessmentType, source, className }: MoneyBackGuaranteeBadgeProps) {
  useEffect(() => {
    analytics.guaranteeViewed({ assessment_type: assessmentType, source })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Link
      href="/guarantee"
      className={`inline-flex items-center gap-2 text-xs font-medium text-green-700 hover:text-green-800 bg-green-50 border border-green-200 rounded-full px-3 py-1.5 ${className ?? ''}`}
    >
      <ShieldCheck className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      7-day no-questions money-back guarantee
    </Link>
  )
}
