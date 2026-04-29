'use client'

import { useEffect, useRef, useState } from 'react'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw } from 'lucide-react'

const RESEND_COOLDOWN_SECONDS = 30

interface OTPInputProps {
  email: string
  onVerify: (code: string) => void
  onResend: () => void
  isVerifying: boolean
  error: string | null
}

export function OTPInput({ email, onVerify, onResend, isVerifying, error }: OTPInputProps) {
  const [value, setValue] = useState('')
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current!)
  }, [])

  const handleResend = () => {
    if (cooldown > 0) return
    setCooldown(RESEND_COOLDOWN_SECONDS)
    intervalRef.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!)
          return 0
        }
        return s - 1
      })
    }, 1000)
    onResend()
  }

  const handleComplete = (code: string) => {
    setValue(code)
    onVerify(code)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Enter the 6-digit code sent to <strong className="text-foreground">{email}</strong>
      </p>

      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={value}
          onChange={setValue}
          onComplete={handleComplete}
          disabled={isVerifying}
          aria-label="One-time password"
        >
          <InputOTPGroup>
            {Array.from({ length: 6 }).map((_, i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive text-center">
          {error}
        </p>
      )}

      {isVerifying && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Verifying…
        </div>
      )}

      <div className="text-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={cooldown > 0 || isVerifying}
          onClick={handleResend}
          className="text-xs"
        >
          <RefreshCw className="mr-1.5 h-3 w-3" aria-hidden />
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Code expires in 10 minutes. Check your spam folder if you don&apos;t see it.
      </p>
    </div>
  )
}
