'use client'

import { useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, Mail } from 'lucide-react'

interface EmailInputProps {
  email: string
  onChange: (v: string) => void
  onSubmit: () => void
  isLoading: boolean
  error: string | null
  reason: string
  ctaLabel: string
}

export function EmailInput({
  email,
  onChange,
  onSubmit,
  isLoading,
  error,
  reason,
  ctaLabel,
}: EmailInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Mail className="h-4 w-4 shrink-0" />
        <span>{reason}</span>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="gate-email">Email address</Label>
        <Input
          id="gate-email"
          ref={inputRef}
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => onChange(e.target.value)}
          disabled={isLoading}
          aria-describedby={error ? 'gate-email-error' : undefined}
          aria-invalid={!!error}
          className="bg-background"
        />
        {error && (
          <p id="gate-email-error" role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            Sending code…
          </>
        ) : (
          ctaLabel
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        We&apos;ll send a 6-digit verification code. No passwords.
      </p>
    </form>
  )
}
