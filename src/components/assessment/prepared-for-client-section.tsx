'use client'

/**
 * Partner mode block for Step 0 of the 7 paid assessments.
 *
 * A tick box — "I'm a CA / CS / lawyer / consultant filling this in for a
 * client" — that reveals the partner's details to show on the report (firm,
 * designation, logo, colour...). State lives in `@/lib/partner/partner-store`
 * so the host page only validates (`validatePartnerStep`) and submits
 * (`partnerSubmitFields`). When the host form already collects name / email /
 * phone those become the partner's own (relabelled via `usePartnerMode`);
 * pass `includeContact` when it does not (DPDP).
 */

import { useEffect, useRef, useState } from 'react'
import { Briefcase, Upload, X } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PREPARER_DESIGNATIONS } from '@/lib/constants/india'
import type { AssessmentType } from '@/lib/constants/assessment-types'
import { PARTNER_ATTESTATION_TEXT } from '@/lib/partner/types'
import {
  getPartnerState,
  setPartnerAttested,
  setPartnerEnabled,
  updatePartnerDetails,
  usePartnerState,
} from '@/lib/partner/partner-store'
import { analytics } from '@/lib/analytics/tracking'

const SWATCHES = ['#1E40AF', '#0F766E', '#15803D', '#B91C1C', '#7C3AED', '#C2410C', '#334155', '#000000']

export function PreparedForClientSection({
  assessmentType,
  includeContact = false,
}: {
  assessmentType: AssessmentType
  /** Ask for the partner's name / email / phone here (host form lacks them). */
  includeContact?: boolean
}) {
  const { enabled, attested, details, prefilled } = usePartnerState()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const prefillTracked = useRef(false)

  // Arriving from the /for-professionals page (`?partner=1`): tick the box
  // for them so they don't have to find it. Read once on mount; window is
  // used instead of useSearchParams so host pages need no Suspense boundary.
  useEffect(() => {
    try {
      if (new URLSearchParams(window.location.search).get('partner') === '1' && !getPartnerState().enabled) {
        setPartnerEnabled(true)
      }
    } catch {
      /* ignore malformed URLs */
    }
  }, [])

  useEffect(() => {
    if (enabled && prefilled && !prefillTracked.current) {
      prefillTracked.current = true
      analytics.partnerDetailsPrefilled({ assessment_type: assessmentType })
    }
  }, [enabled, prefilled, assessmentType])

  const toggle = (on: boolean) => {
    setPartnerEnabled(on)
    analytics.partnerModeToggled({ on, assessment_type: assessmentType })
  }

  const field = (key: keyof typeof details) => ({
    value: details[key] ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => updatePartnerDetails({ [key]: e.target.value }),
  })

  const onLogo = async (file: File | undefined) => {
    if (!file) return
    setUploadError(null)
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setUploadError('Use a PNG or JPG image')
      return
    }
    if (file.size > 300 * 1024) {
      setUploadError('Logo must be 300 KB or smaller')
      return
    }
    setUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/partner/logo', { method: 'POST', body })
      const json = await res.json()
      if (!res.ok || !json.url) throw new Error(json.error || 'Upload failed')
      updatePartnerDetails({ logoUrl: json.url })
      analytics.partnerLogoUploaded({ size_kb: json.sizeKb ?? Math.round(file.size / 1024), file_type: json.fileType ?? file.type })
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-4">
      <label className="flex items-start gap-3 cursor-pointer">
        <Checkbox
          checked={enabled}
          onCheckedChange={(v) => toggle(v === true)}
          className="mt-0.5"
          aria-describedby="partner-mode-help"
        />
        <span>
          <span className="flex items-center gap-2 font-medium text-foreground">
            <Briefcase className="w-4 h-4 text-muted-foreground" />
            I&apos;m a CA / CS / lawyer / consultant filling this in for a client
          </span>
          <span id="partner-mode-help" className="block text-sm text-muted-foreground mt-0.5">
            The summary and report will carry your firm&apos;s name and logo. Same price; you bill your client.
          </span>
        </span>
      </label>

      {enabled && (
        <div className="space-y-4 border-t border-border pt-4">
          <p className="text-sm font-semibold text-foreground">Your details (shown on the report)</p>

          {includeContact && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pb-name">Your name *</Label>
                <Input id="pb-name" placeholder="Asha Rao" {...field('preparerName')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pb-email">Your email * (report is sent here)</Label>
                <Input id="pb-email" type="email" placeholder="asha@raoassociates.in" {...field('email')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pb-phone">Your phone</Label>
                <Input id="pb-phone" placeholder="98765 43210" {...field('phone')} />
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pb-firm">Firm name *</Label>
              <Input id="pb-firm" placeholder="Rao & Associates" {...field('firmName')} />
            </div>
            <div className="space-y-2">
              <Label>Designation *</Label>
              <Select
                value={details.designation || undefined}
                onValueChange={(v) => updatePartnerDetails({ designation: v })}
              >
                <SelectTrigger aria-label="Designation">
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  {PREPARER_DESIGNATIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pb-city">City</Label>
              <Input id="pb-city" placeholder="Pune" {...field('city')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pb-website">Website</Label>
              <Input id="pb-website" placeholder="raoassociates.in" {...field('website')} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Logo (PNG or JPG, up to 300 KB)</Label>
              <div className="flex items-center gap-3">
                {details.logoUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={details.logoUrl} alt="Your logo" className="h-10 max-w-[120px] object-contain bg-white border rounded p-1" />
                    <button
                      type="button"
                      onClick={() => updatePartnerDetails({ logoUrl: '' })}
                      className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Remove
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-md bg-background text-foreground hover:bg-muted disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Upload logo'}
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={(e) => onLogo(e.target.files?.[0])}
                />
              </div>
              {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pb-color">Brand colour</Label>
              <div className="flex flex-wrap items-center gap-2">
                {SWATCHES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Use colour ${c}`}
                    onClick={() => updatePartnerDetails({ brandColor: c })}
                    className={`w-6 h-6 rounded-full border-2 ${details.brandColor?.toUpperCase() === c ? 'border-foreground' : 'border-background shadow'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <Input
                  id="pb-color"
                  className="w-28"
                  placeholder="#1E40AF"
                  maxLength={7}
                  {...field('brandColor')}
                />
              </div>
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={attested}
              onCheckedChange={(v) => setPartnerAttested(v === true)}
              className="mt-0.5"
            />
            <span className="text-sm text-foreground">{PARTNER_ATTESTATION_TEXT} *</span>
          </label>

          <p className="text-xs text-muted-foreground">
            {includeContact
              ? 'The rest of this form is about your client.'
              : 'Below, your name, email and phone are yours (the report is sent to you); company, state, size and industry are your client’s.'}
          </p>
        </div>
      )}
    </div>
  )
}
