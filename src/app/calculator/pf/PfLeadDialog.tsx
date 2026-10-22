'use client'

import { useId, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PF_LEAD_CONSENT, TEAM_SIZE_BANDS } from '@/lib/calculators/epf/consent'
import { CONTACT_EMAIL } from '@/lib/seo/site'
import { capturePfLead } from './actions'

export type LeadPurpose = 'pdf_report' | 'employer_pack'

interface Props {
  open: boolean
  purpose: LeadPurpose
  /** 'optional' shows "Skip and download"; 'required' doesn't. Employer pack is always email-led. */
  gate: 'optional' | 'required'
  sessionId: string | null
  /** Current PF wage ceiling, formatted (from params). */
  ceilingLabel: string
  onOpenChange: (open: boolean) => void
  /** Called after a lead is stored (captured=true) or skipped (captured=false). */
  onDone: (r: { captured: boolean; teamSizeBand: string | null }) => void
}

const field = 'h-11 text-base'
const selectCls =
  'flex h-11 w-full rounded-md border border-input bg-transparent px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 dark:bg-gray-900'

export function PfLeadDialog({ open, purpose, gate, sessionId, ceilingLabel, onOpenChange, onDone }: Props) {
  const id = useId()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [team, setTeam] = useState('')
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; consent?: string; form?: string }>({})
  const [busy, setBusy] = useState(false)

  const employer = purpose === 'employer_pack'
  const canSkip = gate === 'optional' && !employer

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter a valid email address.'
    if (!consent) next.consent = 'Tick the box to agree before we store your email.'
    setErrors(next)
    if (next.email || next.consent) return
    setBusy(true)
    const res = await capturePfLead({
      email: email.trim(),
      name,
      company,
      teamSizeBand: team || undefined,
      purpose,
      consent: true,
      consentVersion: PF_LEAD_CONSENT.version,
      sessionId: sessionId ?? undefined,
    })
    setBusy(false)
    if (!res.ok) {
      setErrors({ form: res.reason === 'rate_limited' ? 'Too many attempts. Try again in a while.' : 'We couldn’t save that. Please try again.' })
      return
    }
    onDone({ captured: true, teamSizeBand: team || null })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{employer ? 'Get the employer pack' : 'Email me this PF report'}</DialogTitle>
          <DialogDescription>
            {employer
              ? `A PF summary for your team with the cost impact of the ${ceilingLabel} wage ceiling. We’ll email it to you.`
              : canSkip
                ? 'Optional. Leave your email to get a copy and updates when the PF rules change, or skip and download.'
                : 'Enter your email to download the PDF.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} noValidate className="space-y-4">
          <div>
            <Label htmlFor={`${id}-email`}>Email</Label>
            <Input id={`${id}-email`} type="email" autoComplete="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email} aria-describedby={errors.email ? `${id}-email-err` : undefined} required />
            {errors.email && <p id={`${id}-email-err`} className="mt-1 text-sm text-red-700 dark:text-red-400">{errors.email}</p>}
          </div>
          {employer && (
            <>
              <div>
                <Label htmlFor={`${id}-name`}>Your name (optional)</Label>
                <Input id={`${id}-name`} autoComplete="name" className={field} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor={`${id}-company`}>Company (optional)</Label>
                <Input id={`${id}-company`} autoComplete="organization" className={field} value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
              <div>
                <Label htmlFor={`${id}-team`}>Team size (optional)</Label>
                <select id={`${id}-team`} className={selectCls} value={team} onChange={(e) => setTeam(e.target.value)}>
                  <option value="">Select</option>
                  {TEAM_SIZE_BANDS.map((b) => <option key={b} value={b}>{b} employees</option>)}
                </select>
              </div>
            </>
          )}

          <fieldset className="rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700">
            <legend className="px-1 font-medium">How we’ll use your details</legend>
            <ul className="list-disc space-y-1 pl-5 text-gray-700 dark:text-gray-300">
              {PF_LEAD_CONSENT.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {PF_LEAD_CONSENT.notShared} {PF_LEAD_CONSENT.withdrawal}{' '}
              Write to <a className="underline" href={`mailto:${CONTACT_EMAIL}?subject=Withdraw%20consent`}>{CONTACT_EMAIL}</a>. See our{' '}
              <Link href="/privacy" className="underline">privacy policy</Link>.
            </p>
            <label className="mt-3 flex min-h-[44px] items-start gap-3">
              <input type="checkbox" className="mt-1 h-5 w-5 flex-none accent-green-700" checked={consent} onChange={(e) => setConsent(e.target.checked)}
                aria-invalid={!!errors.consent} aria-describedby={errors.consent ? `${id}-consent-err` : undefined} />
              <span>I agree to the uses listed above. <span className="text-gray-500">(Consent version {PF_LEAD_CONSENT.version})</span></span>
            </label>
            {errors.consent && <p id={`${id}-consent-err`} className="text-sm text-red-700 dark:text-red-400">{errors.consent}</p>}
          </fieldset>

          {errors.form && <p role="alert" className="text-sm text-red-700 dark:text-red-400">{errors.form}</p>}

          <DialogFooter className="gap-2 sm:gap-2">
            {canSkip && (
              <Button type="button" variant="outline" className="min-h-[44px]" onClick={() => onDone({ captured: false, teamSizeBand: null })}>
                Skip and download
              </Button>
            )}
            <Button type="submit" disabled={busy} className="min-h-[44px] bg-green-700 text-white hover:bg-green-800">
              {busy ? 'Saving…' : employer ? 'Send me the pack' : 'Email me and download'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
