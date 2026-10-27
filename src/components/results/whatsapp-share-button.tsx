'use client'

import { useState } from 'react'
import { MessageCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { analytics } from '@/lib/analytics/tracking'
import { getAssessmentDisplayName, type AssessmentType } from '@/lib/constants/assessment-types'
import { normalizeIndianMobile } from '@/lib/identity/phone'
import { whatsappUrl } from '@/lib/report/whatsapp'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * "Send on WhatsApp" for a paid report. Asks the server for a signed 30-day
 * link to the PDF (only the owner's email gets one), then offers a wa.me link
 * with the message prefilled — to the user's own number (from checkout or
 * Step 0, editable) or, with the number left blank, to any chat (e.g. their
 * CA). No WhatsApp Business API: the user taps Send in WhatsApp.
 *
 * Only for saved assessments (UUID ids) — local fallbacks have no server copy.
 */
export function WhatsAppShareButton({
  assessmentId,
  assessmentType,
  email,
  defaultPhone,
}: {
  assessmentId: string
  assessmentType: AssessmentType
  /** Owner email; asked for when not known on this page. */
  email?: string | null
  defaultPhone?: string | null
}) {
  const [open, setOpen] = useState(false)
  const [emailInput, setEmailInput] = useState(email ?? '')
  const [phone, setPhone] = useState(defaultPhone ?? '')
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!UUID_PATTERN.test(assessmentId)) return null

  const fetchLink = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/report/share-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId, assessmentType, email: emailInput.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(
          res.status === 402 ? 'Unlock the detailed report to share it.' :
          res.status === 403 ? 'That email does not match this assessment.' :
          'Could not create a link. Please try again.'
        )
        return
      }
      setShareUrl(data.url)
      if (!phone && data.phone) setPhone(String(data.phone).replace(/^91/, ''))
    } catch {
      setError('Could not create a link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = () => {
    setOpen(true)
    if (!shareUrl && emailInput.trim()) void fetchLink()
  }

  const phoneValid = !phone.trim() || !!normalizeIndianMobile(phone)
  const message =
    `My ${getAssessmentDisplayName(assessmentType)} report from ComplianceCheck ` +
    `(score, gaps and a step-by-step action plan with legal references):\n${shareUrl ?? ''}\n\n` +
    'The link opens the PDF and works for 30 days.'

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={handleOpen}
        className="w-full border-green-600 text-green-700 hover:bg-green-50"
      >
        <MessageCircle className="w-4 h-4 mr-2" aria-hidden="true" />
        Send on WhatsApp
      </Button>
    )
  }

  return (
    <div className="border border-green-200 bg-green-50 rounded-lg p-4 space-y-3">
      <p className="font-medium text-green-900 flex items-center gap-2">
        <MessageCircle className="w-4 h-4" aria-hidden="true" />
        Send your report on WhatsApp
      </p>

      {!shareUrl && (
        <div className="space-y-2">
          {!email && (
            <Input
              type="email"
              placeholder="Email you used for this assessment"
              aria-label="Email you used for this assessment"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              disabled={loading}
            />
          )}
          <Button
            type="button"
            onClick={() => void fetchLink()}
            disabled={loading || !emailInput.trim()}
            className="w-full bg-green-700 hover:bg-green-800 text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" /> : null}
            {loading ? 'Preparing link…' : 'Get my report link'}
          </Button>
        </div>
      )}

      {shareUrl && (
        <div className="space-y-2">
          <Input
            type="tel"
            inputMode="tel"
            placeholder="WhatsApp number (blank: choose a chat)"
            aria-label="WhatsApp number to send the report to"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {!phoneValid && (
            <p className="text-sm text-red-600">Enter a 10-digit Indian mobile number, or leave it blank.</p>
          )}
          <a
            href={phoneValid ? whatsappUrl(message, phone) : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!phoneValid}
            onClick={(e) => {
              if (!phoneValid) {
                e.preventDefault()
                return
              }
              analytics.reportShared({
                assessment_type: assessmentType,
                channel: 'whatsapp',
                assessment_id: assessmentId,
                has_phone: !!normalizeIndianMobile(phone),
              })
            }}
            className={`flex items-center justify-center w-full h-10 rounded-md text-white font-medium ${phoneValid ? 'bg-green-700 hover:bg-green-800' : 'bg-gray-400 cursor-not-allowed'}`}
          >
            <MessageCircle className="w-4 h-4 mr-2" aria-hidden="true" />
            Open WhatsApp
          </a>
          <p className="text-xs text-green-800">
            WhatsApp opens with the message ready &mdash; tap Send. The link works for 30 days.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
