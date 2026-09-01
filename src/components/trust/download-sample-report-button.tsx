'use client'

import { useState } from 'react'
import { Download, Mail, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { analytics } from '@/lib/analytics/tracking'
import { getAssessmentDisplayName, type AssessmentType } from '@/lib/constants/assessment-types'

type SampleSource = 'homepage' | 'landing_page' | 'results_teaser' | 'samples_gallery'

interface DownloadSampleReportButtonProps {
  assessmentType: AssessmentType
  source: SampleSource
  className?: string
}

/**
 * Lets a visitor download a real, watermarked sample report before paying —
 * no email or signup required. An optional email field sends the same PDF as
 * an attachment for visitors who'd rather read it later; declining it never
 * blocks the download.
 */
export function DownloadSampleReportButton({ assessmentType, source, className }: DownloadSampleReportButtonProps) {
  const [showEmailField, setShowEmailField] = useState(false)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const href = `/samples/${assessmentType}-sample.pdf`
  const displayName = getAssessmentDisplayName(assessmentType)

  const handleDownloadClick = () => {
    analytics.sampleReportDownloaded({ assessment_type: assessmentType, source, email_provided: false })
  }

  const handleEmailSend = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    setSending(true)
    setError(null)
    try {
      const res = await fetch('/api/samples/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, assessmentType }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Could not send the sample report')
      }
      analytics.sampleReportDownloaded({ assessment_type: assessmentType, source, email_provided: true })
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the sample report')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className={className}>
      <a href={href} download onClick={handleDownloadClick}>
        <Button variant="outline" className="w-full sm:w-auto">
          <Download className="w-4 h-4 mr-2" aria-hidden="true" />
          Download sample {displayName} report
        </Button>
      </a>

      {!sent ? (
        !showEmailField ? (
          <button
            type="button"
            onClick={() => setShowEmailField(true)}
            className="block mt-2 text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Email me this + a checklist instead
          </button>
        ) : (
          <div className="mt-2 flex flex-col sm:flex-row gap-2 max-w-sm">
            <Input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={sending}
            />
            <Button type="button" size="sm" variant="secondary" onClick={handleEmailSend} disabled={sending}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            </Button>
          </div>
        )
      ) : (
        <p className="mt-2 text-xs text-green-600">Sent — check your inbox.</p>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
