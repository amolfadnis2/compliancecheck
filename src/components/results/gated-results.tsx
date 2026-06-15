'use client'

import { useState, useCallback } from 'react'
import { EmailGate } from '@/components/identity/EmailGate'
import { getGateConfig } from '@/lib/results/gate-config'
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

// getGateConfig now lives in a server-safe module (see import above).
// Re-exported here for backward compatibility with existing client imports.
export { getGateConfig }
