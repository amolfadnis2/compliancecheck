'use client'

import { useState, useCallback } from 'react'
import { EmailGate } from '@/components/identity/EmailGate'
import type { User } from '@/lib/identity/types'

interface GatedResultsProps {
  /** PostHog source string, e.g. "dpdp_assessment" */
  source: string
  /** Short reason shown inside the gate card */
  reason: string
  children: React.ReactNode
}

/**
 * Wraps any results page with the shared EmailGate OTP flow.
 * Children are only mounted after the user verifies their email — so
 * localStorage reads and heavy renders inside children are deferred until
 * after verification.
 *
 * Usage in a server component:
 *   <GatedResults source="dpdp_assessment" reason="...">
 *     <DPDPResultsView assessment={assessment} />
 *   </GatedResults>
 *
 * If the user's identity is already verified (useLeadIdentity returns
 * isVerified=true), EmailGate calls onVerified immediately and the gate
 * is never shown — making re-visits seamless.
 */
export function GatedResults({ source, reason, children }: GatedResultsProps) {
  const [cleared, setCleared] = useState(false)

  const handleVerified = useCallback((_user: User) => {
    setCleared(true)
  }, [])

  if (!cleared) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-center">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Assessment complete — verify your email to unlock your compliance report
            </p>
          </div>
          <EmailGate
            source={source}
            reason={reason}
            onVerified={handleVerified}
            showMarketingConsent
            showDeadlineRemindersConsent
            ctaLabel="Verify & view results"
          />
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// ============================================================================
// Per-assessment gate config
// ============================================================================

const GATE_CONFIG: Record<string, { source: string; reason: string }> = {
  statutory_health: {
    source: 'statutory_health_assessment',
    reason: 'Email me my Statutory Health Check report so I can refer back to it',
  },
  labour_code: {
    source: 'labour_code_assessment',
    reason: 'Email me my Labour Code Readiness report so I can refer back to it',
  },
  dpdp: {
    source: 'dpdp_assessment',
    reason: 'Email me my DPDP Gap Assessment report so I can refer back to it',
  },
  state_wise_compliance: {
    source: 'state_wise_assessment',
    reason: 'Email me my State-Wise Compliance report so I can refer back to it',
  },
  food_business: {
    source: 'food_business_assessment',
    reason: 'Email me my Food Business Compliance report so I can refer back to it',
  },
  posh: {
    source: 'posh_assessment',
    reason: 'Email me my POSH Compliance report so I can refer back to it',
  },
}

export function getGateConfig(assessmentType: string) {
  return (
    GATE_CONFIG[assessmentType] ?? {
      source: `${assessmentType}_assessment`,
      reason: 'Verify your email to view your compliance report',
    }
  )
}
