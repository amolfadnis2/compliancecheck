'use client'

import { useEffect, useState, useCallback } from 'react'
import { CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmailInput } from './EmailInput'
import { OTPInput } from './OTPInput'
import { ConsentCheckboxes } from './ConsentCheckboxes'
import { useLeadIdentity } from '@/lib/identity/use-lead-identity'
import { ensureAnonUser } from '@/lib/identity/ensure-anon-user'
import { sendOtp, verifyOtp } from '@/lib/identity/verify-otp'
import { appendSource } from '@/lib/identity/update-profile'
import { updateProfile } from '@/lib/identity/update-profile'
import { logEvent } from '@/lib/identity/log-event'
import posthog from 'posthog-js'
import type { User } from '@/lib/identity/types'

type GateStep =
  | 'idle'
  | 'ensuring_anon'
  | 'email_input'
  | 'otp_sent'
  | 'verifying'
  | 'verified'

interface EmailGateProps {
  source: string
  reason: string
  onVerified: (user: User) => void
  showMarketingConsent?: boolean
  showDeadlineRemindersConsent?: boolean
  ctaLabel?: string
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function humanizeOtpError(code: string): string {
  if (code === 'TOO_MANY_REQUESTS') return 'Too many attempts. Please wait a minute and try again.'
  if (code === 'INVALID_OR_EXPIRED') return 'Invalid or expired code. Please request a new one.'
  return 'Something went wrong. Please try again.'
}

export function EmailGate({
  source,
  reason,
  onVerified,
  showMarketingConsent = true,
  showDeadlineRemindersConsent = false,
  ctaLabel = 'Continue',
}: EmailGateProps) {
  const { user, isVerified, isLoading } = useLeadIdentity()

  const [step, setStep] = useState<GateStep>('idle')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [otpError, setOtpError] = useState<string | null>(null)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [deadlineConsent, setDeadlineConsent] = useState(showDeadlineRemindersConsent)
  const [editCount, setEditCount] = useState(0)

  // If already verified on mount, call onVerified immediately
  useEffect(() => {
    if (!isLoading && isVerified && user) {
      onVerified(user)
    }
  }, [isLoading, isVerified, user, onVerified])

  // Silently ensure anon user exists once identity state is ready
  useEffect(() => {
    if (!isLoading && !user && step === 'idle') {
      setStep('ensuring_anon')
      ensureAnonUser()
        .then(() => setStep('email_input'))
        .catch(() => setStep('email_input'))
    }
    if (!isLoading && user && !isVerified && step === 'idle') {
      setStep('email_input')
    }
  }, [isLoading, user, isVerified, step])

  const handleEmailSubmit = useCallback(async () => {
    const trimmed = email.trim()
    if (!validateEmail(trimmed)) {
      setEmailError('Please enter a valid email address.')
      return
    }
    setEmailError(null)
    setStep('otp_sent')

    try {
      await sendOtp(trimmed)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown'
      setEmailError(humanizeOtpError(msg))
      setStep('email_input')
    }
  }, [email])

  const handleOtpVerify = useCallback(async (code: string) => {
    setOtpError(null)
    setStep('verifying')

    try {
      const verifiedUser = await verifyOtp(email.trim(), code)
      if (!verifiedUser) throw new Error('INVALID_OR_EXPIRED')

      // PostHog alias to link pre-verification anonymous session
      posthog.alias(verifiedUser.id)

      // Record source, consents, and event
      await Promise.all([
        appendSource(source),
        updateProfile({
          ...(marketingConsent ? { marketing_consent_at: new Date().toISOString() } : {}),
          ...(deadlineConsent ? { deadline_reminders_consent_at: new Date().toISOString() } : {}),
        }),
        logEvent('email_verified', { source, marketing_consent: marketingConsent, deadline_consent: deadlineConsent }),
      ])

      setStep('verified')
      setTimeout(() => onVerified(verifiedUser), 1500)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown'
      setOtpError(humanizeOtpError(msg))
      setStep('otp_sent')
    }
  }, [email, source, marketingConsent, deadlineConsent, onVerified])

  const handleResend = useCallback(async () => {
    try {
      await sendOtp(email.trim())
    } catch {
      setOtpError('Failed to resend. Please wait a moment and try again.')
    }
  }, [email])

  const handleEditEmail = useCallback(() => {
    const newCount = editCount + 1
    setEditCount(newCount)
    setStep('email_input')
    setOtpError(null)
    const domain = email.includes('@') ? email.split('@')[1] : 'unknown'
    posthog.capture('email_edit_attempted', { source, edit_count: newCount, email_domain: domain })
  }, [editCount, email, source])

  // Don't render while checking existing auth state
  if (isLoading || isVerified) return null

  if (step === 'verified') {
    return (
      <Card className="border-green-500 dark:border-green-700">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <CheckCircle className="h-10 w-10 text-green-500" aria-hidden />
            <div>
              <p className="font-semibold text-foreground">Email verified!</p>
              <p className="text-sm text-muted-foreground">Loading your results…</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Verify your email to continue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {(step === 'idle' || step === 'ensuring_anon' || step === 'email_input') && (
          <>
            <EmailInput
              email={email}
              onChange={setEmail}
              onSubmit={handleEmailSubmit}
              isLoading={step === 'ensuring_anon'}
              error={emailError}
              reason={reason}
              ctaLabel={ctaLabel}
            />
            <ConsentCheckboxes
              showMarketing={showMarketingConsent}
              showDeadlineReminders={showDeadlineRemindersConsent}
              marketingChecked={marketingConsent}
              deadlineRemindersChecked={deadlineConsent}
              onMarketingChange={setMarketingConsent}
              onDeadlineRemindersChange={setDeadlineConsent}
            />
          </>
        )}

        {(step === 'otp_sent' || step === 'verifying') && (
          <>
            <OTPInput
              email={email.trim()}
              onVerify={handleOtpVerify}
              onResend={handleResend}
              isVerifying={step === 'verifying'}
              error={otpError}
            />
            {editCount < 3 && (
              <button
                type="button"
                onClick={handleEditEmail}
                className="text-xs text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                aria-label="Go back and change your email address"
              >
                ← Wrong email? Edit it
              </button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
