'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import posthog from 'posthog-js'
import { analytics } from '@/lib/analytics/tracking'
import {
  ArrowLeft, Loader2, AlertCircle, CheckCircle2, AlertTriangle, XCircle,
  Download, Mail, Lock, ChevronDown, ChevronUp, ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AssessmentHeader } from '@/components/assessment/assessment-header'
import { ComplianceCalendar } from '@/components/auto-dealer/ComplianceCalendar'
import { DocumentationChecklist } from '@/components/auto-dealer/DocumentationChecklist'
import { StateAnnexure } from '@/components/auto-dealer/StateAnnexure'

import { APPLICABILITY_QUESTIONS } from '@/lib/assessments/auto-dealer/applicability-questions'
import { PHASE2_STATUTORY_QUESTIONS as PHASE_2_QUESTIONS } from '@/lib/assessments/auto-dealer/phase-2-statutory'
import { PHASE3_WORKSHOP_EHS_QUESTIONS as PHASE_3_QUESTIONS } from '@/lib/assessments/auto-dealer/phase-3-workshop-ehs'
import { PHASE4_DEALER_SPECIFIC_QUESTIONS as PHASE_4_QUESTIONS } from '@/lib/assessments/auto-dealer/phase-4-dealer-specific'
import { PHASE5_EPR_QUESTIONS as PHASE_5_QUESTIONS } from '@/lib/assessments/auto-dealer/phase-5-epr'
import { PHASE6_DATA_CORPORATE_QUESTIONS as PHASE_6_QUESTIONS } from '@/lib/assessments/auto-dealer/phase-6-data-corporate'
import {
  buildApplicabilityProfileFromResponses,
  computePhaseScores,
  computeOverallScore,
  generateGapAnalysis,
  generateApplicabilityChecks,
  generateComplianceCalendar,
} from '@/lib/assessments/auto-dealer/rules-engine'
import type {
  Responses,
  PhaseScore,
  OverallScore,
  GapItem,
  ApplicabilityProfile,
  ApplicabilityCheckResult,
  ComplianceCalendarEntry,
  PTSlab,
  StateAndE,
  GSTRate,
} from '@/types/auto-dealer'
import { PHASE_METADATA, PRICE_TIERS } from '@/types/auto-dealer'

// --------------------------------------------------------------------------
// Constants
// --------------------------------------------------------------------------

const ALL_QUESTIONS = [
  ...APPLICABILITY_QUESTIONS,
  ...PHASE_2_QUESTIONS,
  ...PHASE_3_QUESTIONS,
  ...PHASE_4_QUESTIONS,
  ...PHASE_5_QUESTIONS,
  ...PHASE_6_QUESTIONS,
]

const SEVERITY_COLOURS = {
  critical: 'bg-red-100 border-red-300 text-red-800',
  high: 'bg-orange-100 border-orange-300 text-orange-800',
  medium: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  low: 'bg-blue-50 border-blue-200 text-blue-700',
}

const SEVERITY_BADGE = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-white',
  low: 'bg-blue-500 text-white',
}

const TIMELINE_LABELS = {
  '30_days': '30 days',
  '90_days': '90 days',
  '365_days': '1 year',
  'prepare_by_2027': 'Prepare by 2027',
  'ongoing': 'Ongoing',
}

// --------------------------------------------------------------------------
// Sub-components
// --------------------------------------------------------------------------

function ScoreGauge({ score, status }: { score: number; status: string }) {
  const colour = status === 'green' ? 'text-green-700' : status === 'yellow' ? 'text-yellow-600' : 'text-red-700'
  const ring = status === 'green' ? 'border-green-500' : status === 'yellow' ? 'border-yellow-400' : 'border-red-500'
  return (
    <div className={`w-28 h-28 rounded-full border-8 ${ring} flex flex-col items-center justify-center`}>
      <span className={`text-3xl font-bold ${colour}`}>{score}</span>
      <span className="text-xs text-gray-500">/ 100</span>
    </div>
  )
}

function StatusBanner({ status }: { status: string }) {
  if (status === 'green') return (
    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" aria-hidden="true" />
      <p className="text-sm font-medium text-green-800">Strong compliance posture — maintain and monitor renewals.</p>
    </div>
  )
  if (status === 'yellow') return (
    <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" aria-hidden="true" />
      <p className="text-sm font-medium text-yellow-800">Moderate compliance — address highlighted gaps within 90 days.</p>
    </div>
  )
  return (
    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" aria-hidden="true" />
      <p className="text-sm font-medium text-red-800">Material compliance gaps — immediate action required on critical items.</p>
    </div>
  )
}

interface GapCardProps {
  gap: GapItem
}
function GapCard({ gap }: GapCardProps) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className={`border rounded-lg p-4 ${SEVERITY_COLOURS[gap.severity]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${SEVERITY_BADGE[gap.severity]}`}>
              {gap.severity.toUpperCase()}
            </span>
            <span className="text-xs text-gray-500">Phase {gap.phase} · {gap.complianceArea.replace(/_/g,' ')}</span>
            <span className="text-xs text-gray-400">Weight: {gap.weight}/10</span>
          </div>
          <p className="text-sm font-semibold">{gap.title}</p>
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex-shrink-0 p-1 hover:bg-white/50 rounded"
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse gap detail' : 'Expand gap detail'}
        >
          {expanded ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-2 text-sm">
          <div>
            <p className="font-medium text-gray-700">Finding</p>
            <p className="text-gray-600">{gap.finding}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Recommendation</p>
            <p className="text-gray-600">{gap.recommendation}</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="font-medium text-gray-700">Remediation timeline</p>
              <p className="text-gray-600">{TIMELINE_LABELS[gap.timeline] ?? gap.timeline}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Penalty exposure</p>
              <p className="text-gray-600">{gap.penaltyExposure}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">Source: {gap.source}</p>
        </div>
      )}
    </div>
  )
}

// --------------------------------------------------------------------------
// OTP / Email gate
// --------------------------------------------------------------------------

interface EmailGateProps {
  email: string
  assessmentId: string
  onVerified: () => void
}

function EmailGate({ email: initialEmail, assessmentId, onVerified }: EmailGateProps) {
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'request' | 'verify'>('request')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeEmail, setActiveEmail] = useState(initialEmail)
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [emailDraft, setEmailDraft] = useState(initialEmail)

  const applyEmailChange = () => {
    const trimmed = emailDraft.trim().toLowerCase()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.')
      return
    }
    setActiveEmail(trimmed)
    setEmailDraft(trimmed)
    setIsEditingEmail(false)
    setError(null)
  }

  const requestOtp = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: activeEmail, assessmentId }),
      })
      const json = await res.json() as { success?: boolean; error?: string }
      if (!json.success) throw new Error(json.error ?? 'Failed to send OTP')
      setStep('verify')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOtp = async () => {
    if (otp.length !== 6) { setError('Enter the 6-digit code from your email.'); return }
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: activeEmail, otp, assessmentId }),
      })
      const json = await res.json() as { success?: boolean; error?: string }
      if (!json.success) throw new Error(json.error ?? 'Invalid or expired OTP')
      try { posthog.identify(activeEmail) } catch { /* non-fatal */ }
      onVerified()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 mb-1">
          <Lock className="h-5 w-5 text-blue-700" aria-hidden="true" />
          <CardTitle className="text-base">Verify your email to view results</CardTitle>
        </div>
        <CardDescription>
          Your full compliance report is ready. Verify your email to unlock it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
            {error}
          </div>
        )}

        {step === 'request' && (
          <>
            {isEditingEmail ? (
              <div className="space-y-2">
                <label className="text-sm text-gray-600 font-medium">Email address</label>
                <input
                  type="email"
                  value={emailDraft}
                  onChange={e => setEmailDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') applyEmailChange() }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Email address"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button onClick={applyEmailChange} className="flex-1 bg-blue-700 hover:bg-blue-800 text-sm h-8">
                    Confirm
                  </Button>
                  <button
                    onClick={() => { setIsEditingEmail(false); setEmailDraft(activeEmail); setError(null) }}
                    className="flex-1 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg h-8"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
                <span className="text-sm text-gray-700 truncate">{activeEmail}</span>
                <button
                  onClick={() => { setIsEditingEmail(true); setEmailDraft(activeEmail) }}
                  className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline shrink-0"
                >
                  Change
                </button>
              </div>
            )}
            {!isEditingEmail && (
              <Button onClick={requestOtp} disabled={isLoading} className="w-full bg-blue-700 hover:bg-blue-800">
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Sending…</> : 'Send verification code'}
              </Button>
            )}
          </>
        )}

        {step === 'verify' && (
          <>
            <p className="text-sm text-gray-600">
              Enter the 6-digit code sent to <strong>{activeEmail}</strong>. Valid for 10 minutes.
            </p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="OTP verification code"
              placeholder="______"
            />
            <Button onClick={verifyOtp} disabled={isLoading || otp.length !== 6} className="w-full bg-blue-700 hover:bg-blue-800">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Verifying…</> : 'Verify and view report'}
            </Button>
            <button
              onClick={() => { setStep('request'); setOtp(''); setError(null) }}
              className="w-full text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Resend code or change email
            </button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// --------------------------------------------------------------------------
// Payment gate
// --------------------------------------------------------------------------

interface PaymentGateProps {
  assessmentId: string
  tier: 'basic' | 'standard' | 'premium'
  questionCount: number
  onPaid: () => void
}

function PaymentGate({ tier, questionCount, onPaid }: PaymentGateProps) {
  const tierInfo = PRICE_TIERS.find(t => t.id === tier) ?? PRICE_TIERS[1]

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-base">Unlock your full compliance report</CardTitle>
        <CardDescription>
          {questionCount} questions assessed · {tierInfo.label} plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-2xl font-bold text-blue-900">Rs.{tierInfo.priceINR.toLocaleString('en-IN')}</p>
          <p className="text-sm text-blue-700 mt-1">{tierInfo.description}</p>
        </div>
        <ul className="text-sm text-gray-600 space-y-1.5">
          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" aria-hidden="true" />Full gap analysis with remediation plan</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" aria-hidden="true" />12-month compliance calendar</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" aria-hidden="true" />Documentation checklist</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" aria-hidden="true" />Downloadable PDF report</li>
        </ul>
        <Button onClick={onPaid} className="w-full bg-blue-700 hover:bg-blue-800 h-12">
          Free in beta — View Report
        </Button>
        <p className="text-xs text-gray-400 text-center">Payment will be enabled in a future release.</p>
      </CardContent>
    </Card>
  )
}

// --------------------------------------------------------------------------
// Main results page
// --------------------------------------------------------------------------

interface ResultsData {
  email: string
  companyName: string | null
  fullName: string | null
  labourRegime: string
  responses: Responses
  phaseScores: PhaseScore[]
  overallScore: OverallScore
  gapAnalysis: GapItem[]
  applicabilityChecks: ApplicabilityCheckResult[]
  calendarEntries: ComplianceCalendarEntry[]
  profile: ApplicabilityProfile
  ptSlabs: PTSlab[]
  sandE: StateAndE[]
  gstRates: GSTRate[]
  emailVerified: boolean
  paymentStatus: string
  priceTier: 'basic' | 'standard' | 'premium'
  totalQuestions: number
}

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const assessmentId = params.id as string

  const [data, setData] = useState<ResultsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [emailVerified, setEmailVerified] = useState(false)
  const [paid, setPaid] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isEmailing, setIsEmailing] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>('gaps')

  const track = useCallback((event: string, props: Record<string, string | number | boolean> = {}) => {
    try { posthog.capture(event, { assessment_type: 'auto_dealer', ...props }) }
    catch { /* non-fatal */ }
  }, [])

  // Load results — first try Supabase, fall back to localStorage
  useEffect(() => {
    if (!assessmentId) { router.replace('/assessment/auto-dealer'); return }
    loadResults()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId])

  const loadResults = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Try server-side summary endpoint
      const res = await fetch(`/api/assessment/auto-dealer/${assessmentId}/report.pdf`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })

      if (res.ok) {
        const json = await res.json() as {
          email: string; companyName: string | null; fullName: string | null;
          labourRegime: string; responses: Responses; phaseScores: PhaseScore[];
          overallScore: OverallScore; gapAnalysis: GapItem[];
          applicabilityChecks: ApplicabilityCheckResult[];
          profile: ApplicabilityProfile; ptSlabs: PTSlab[];
          sandE: StateAndE[]; gstRates: GSTRate[];
          emailVerified: boolean; paymentStatus: string;
          priceTier: 'basic' | 'standard' | 'premium'; totalQuestions: number;
        }

        // Merge localStorage responses if they have more data than what the API returned
        // (can happen if a mid-assessment DB save failed but client continued locally)
        let finalResponses = json.responses
        let { phaseScores, overallScore, gapAnalysis, profile, applicabilityChecks } = json
        try {
          const stored = localStorage.getItem(`auto_dealer_profile_${assessmentId}`)
          if (stored) {
            const localResponses = JSON.parse(stored) as Responses
            if (Object.keys(localResponses).length > Object.keys(finalResponses).length) {
              finalResponses = { ...finalResponses, ...localResponses }
              profile = buildApplicabilityProfileFromResponses(finalResponses)
              phaseScores = computePhaseScores(profile, ALL_QUESTIONS, finalResponses)
              overallScore = computeOverallScore(phaseScores)
              gapAnalysis = generateGapAnalysis(profile, ALL_QUESTIONS, finalResponses)
              applicabilityChecks = generateApplicabilityChecks(profile)
            }
          }
        } catch { /* non-fatal */ }

        const calendar = generateComplianceCalendar(profile)
        setData({ ...json, responses: finalResponses, phaseScores, overallScore, gapAnalysis, profile, applicabilityChecks, calendarEntries: calendar })
        setEmailVerified(json.emailVerified)
        setPaid(prev => prev || json.paymentStatus === 'paid')
        track('auto_dealer_results_view', { score: overallScore.score })
        setIsLoading(false)
        return
      }
    } catch { /* fall through to localStorage */ }

    // Fallback: rebuild from localStorage
    try {
      const stored = localStorage.getItem(`auto_dealer_profile_${assessmentId}`)
      if (!stored) throw new Error('Assessment not found. Please start a new assessment.')

      const responses: Responses = JSON.parse(stored) as Responses
      const profile = buildApplicabilityProfileFromResponses(responses)
      const phaseScores = computePhaseScores(profile, ALL_QUESTIONS, responses)
      const overallScore = computeOverallScore(phaseScores)
      const gapAnalysis = generateGapAnalysis(profile, ALL_QUESTIONS, responses)
      const applicabilityChecks = generateApplicabilityChecks(profile)
      const calendarEntries = generateComplianceCalendar(profile)
      const totalQuestions = ALL_QUESTIONS.filter(q => q.phase !== 1 && q.appliesWhen(profile)).length

      const detailsRaw = localStorage.getItem('auto_dealer_details')
      const details = detailsRaw ? JSON.parse(detailsRaw) as { email: string; fullName: string; companyName: string } : null

      const tier = totalQuestions <= 35 ? 'basic' : totalQuestions <= 70 ? 'standard' : 'premium'

      setData({
        email: details?.email ?? '',
        companyName: details?.companyName ?? null,
        fullName: details?.fullName ?? null,
        labourRegime: String(responses.AD_APP_labour_regime ?? 'new'),
        responses,
        phaseScores,
        overallScore,
        gapAnalysis,
        applicabilityChecks,
        calendarEntries,
        profile,
        ptSlabs: [],
        sandE: [],
        gstRates: [],
        emailVerified: false,
        paymentStatus: 'pending',
        priceTier: tier,
        totalQuestions,
      })
      track('auto_dealer_results_view_local', { score: overallScore.score })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load results.')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadPdf = async () => {
    if (!data) return
    setIsDownloading(true)
    try {
      const res = await fetch(`/api/assessment/auto-dealer/${assessmentId}/report.pdf`, {
        method: 'GET',
        headers: { Accept: 'application/pdf' },
      })
      if (!res.ok) throw new Error('Failed to generate PDF')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `compliance-report-${assessmentId.slice(0, 8)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      track('auto_dealer_pdf_downloaded')
      analytics.reportDownloaded({
        assessment_type: 'auto_dealer',
        format: 'pdf',
        compliance_score: data.overallScore.score,
        assessment_id: assessmentId as string,
        user_tier: 'free',
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'PDF download failed.')
    } finally {
      setIsDownloading(false)
    }
  }

  const emailReport = async () => {
    if (!data) return
    setIsEmailing(true)
    setEmailSuccess(null)
    try {
      const res = await fetch(`/api/assessment/auto-dealer/${assessmentId}/report.pdf`)
      if (!res.ok) throw new Error('Failed to generate PDF')
      const blob = await res.blob()
      const pdfBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve((reader.result as string).split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
      const emailRes = await fetch('/api/email/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          pdfBase64,
          companyName: data.companyName,
          score: data.overallScore.score,
          assessmentType: 'auto_dealer',
        }),
      })
      const json = await emailRes.json()
      if (!json.success) throw new Error(json.error || 'Failed to send email')
      setEmailSuccess(data.email)
      track('auto_dealer_email_sent', { score: data.overallScore.score })
      analytics.reportEmailed({
        assessment_type: 'auto_dealer',
        compliance_score: data.overallScore.score,
        assessment_id: assessmentId as string,
        user_tier: 'free',
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Email failed. Please try again.')
    } finally {
      setIsEmailing(false)
    }
  }

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-700" aria-hidden="true" />
        <p className="mt-4 text-gray-600">Loading your compliance report…</p>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" aria-hidden="true" />
        <p className="text-gray-700">{error}</p>
        <Link href="/assessment/auto-dealer" className="text-blue-700 underline">Start a new assessment</Link>
      </div>
    )
  }

  if (!data) return null

  const { overallScore, phaseScores, gapAnalysis, applicabilityChecks, calendarEntries, profile, ptSlabs, sandE, gstRates } = data

  const criticalCount = gapAnalysis.filter(g => g.severity === 'critical').length
  const highCount = gapAnalysis.filter(g => g.severity === 'high').length

  // Show email gate if not verified
  if (!emailVerified) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AssessmentHeader title="Auto Dealership Compliance Assessment" subtitle="Results" />
        <main className="container mx-auto px-4 py-12">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-blue-700 hover:text-blue-800">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />Back to Assessments
            </Link>
          </div>
          {/* Teaser score */}
          <div className="max-w-md mx-auto mb-8 flex flex-col items-center">
            <ScoreGauge score={overallScore.score} status={overallScore.status} />
            <p className="mt-3 text-gray-600 text-sm">
              Your compliance score is ready — verify your email to unlock the full report.
            </p>
          </div>
          <EmailGate
            email={data.email}
            assessmentId={assessmentId}
            onVerified={() => { setEmailVerified(true); loadResults() }}
          />
        </main>
      </div>
    )
  }

  // Show payment gate if not paid
  if (!paid) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AssessmentHeader title="Auto Dealership Compliance Assessment" subtitle="Results" />
        <main className="container mx-auto px-4 py-12">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-blue-700 hover:text-blue-800">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />Back to Assessments
            </Link>
          </div>

          {/* Preview score summary */}
          <div className="max-w-2xl mx-auto mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <ScoreGauge score={overallScore.score} status={overallScore.status} />
                  <div className="flex-1 space-y-2">
                    <StatusBanner status={overallScore.status} />
                    <p className="text-sm text-gray-600">
                      {criticalCount > 0 && <><span className="font-semibold text-red-700">{criticalCount} critical</span>, </>}
                      {highCount > 0 && <><span className="font-semibold text-orange-700">{highCount} high</span>, </>}
                      {gapAnalysis.length} total gaps identified across {data.totalQuestions} questions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <PaymentGate
            assessmentId={assessmentId}
            tier={data.priceTier}
            questionCount={data.totalQuestions}
            onPaid={() => { setPaid(true) }}
          />
        </main>
      </div>
    )
  }

  // Full report
  return (
    <div className="min-h-screen bg-gray-50">
      <AssessmentHeader title="Auto Dealership Compliance Assessment" subtitle="Full Compliance Report" />

      <main className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center text-blue-700 hover:text-blue-800">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />Back
          </Link>
          <Button
            onClick={downloadPdf}
            disabled={isDownloading}
            className="bg-blue-700 hover:bg-blue-800"
          >
            {isDownloading
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Generating…</>
              : <><Download className="mr-2 h-4 w-4" aria-hidden="true" />Download PDF</>
            }
          </Button>
          <Button
            onClick={emailReport}
            disabled={isEmailing}
            variant="outline"
          >
            {isEmailing
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Sending…</>
              : <><Mail className="mr-2 h-4 w-4" aria-hidden="true" />Email Report</>
            }
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}
        {emailSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
            Report sent to <strong>{emailSuccess}</strong>
          </div>
        )}

        {/* Header card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <ScoreGauge score={overallScore.score} status={overallScore.status} />
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{data.companyName ?? 'Your Dealership'}</h2>
                  <p className="text-sm text-gray-500">{data.fullName} · {data.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Labour regime: {data.labourRegime === 'new' ? 'New Labour Codes (eff. 21 Nov 2025)' : 'Legacy Acts'} ·{' '}
                    Assessment ID: {assessmentId.slice(0, 8)}
                  </p>
                </div>
                <StatusBanner status={overallScore.status} />
                <p className="text-sm text-gray-600">
                  Score: <strong>{overallScore.totalEarned}</strong> / {overallScore.totalMax} points ·{' '}
                  {data.totalQuestions} questions
                </p>
              </div>
            </div>
            {/* Self-attested disclaimer */}
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3" role="note">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-amber-800">
                <strong>Self-attested score.</strong> This score is based entirely on your own responses and has not been independently verified by a legal or compliance professional. It is indicative only and should not be relied upon for regulatory filings, investor disclosures, or legal proceedings. We recommend a formal compliance audit by a qualified professional.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Phase scores */}
        <Card>
          <CardHeader>
            <CardTitle>Phase Scores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {phaseScores.map(ps => {
              const phaseInfo = PHASE_METADATA.find(m => m.phase === ps.phase)
              const barColour = ps.status === 'green' ? '[&>div]:bg-green-500' : ps.status === 'yellow' ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'
              return (
                <div key={ps.phase}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800">
                      Phase {ps.phase}: {phaseInfo?.name ?? ps.phaseName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">{ps.score}%</span>
                      <Badge className={
                        ps.status === 'green' ? 'bg-green-100 text-green-800' :
                        ps.status === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {ps.questionCount === 0 ? 'N/A' : ps.status.charAt(0).toUpperCase() + ps.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={ps.questionCount > 0 ? ps.score : 100} className={`h-2 ${barColour}`} aria-label={`Phase ${ps.phase} score: ${ps.score}%`} />
                  <p className="text-xs text-gray-400 mt-1">
                    {ps.compliantCount} / {ps.questionCount} compliant · {ps.earnedPoints}/{ps.maxPoints} pts
                  </p>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Applicability overview */}
        <Card>
          <CardHeader>
            <button
              className="flex items-center justify-between w-full text-left"
              onClick={() => setExpandedSection(s => s === 'applicability' ? null : 'applicability')}
              aria-expanded={expandedSection === 'applicability'}
            >
              <CardTitle>Applicability Overview</CardTitle>
              {expandedSection === 'applicability' ? <ChevronUp className="h-5 w-5 text-gray-500" aria-hidden="true" /> : <ChevronDown className="h-5 w-5 text-gray-500" aria-hidden="true" />}
            </button>
          </CardHeader>
          {expandedSection === 'applicability' && (
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm" aria-label="Applicability overview">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Area</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Phase</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Applies</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase hidden sm:table-cell">Trigger</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {applicabilityChecks.map(check => (
                      <tr key={check.complianceArea} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-800">{check.label}</td>
                        <td className="px-3 py-2 text-gray-500">Phase {check.phase}</td>
                        <td className="px-3 py-2">
                          {check.applies
                            ? <span className="flex items-center gap-1 text-green-700"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />Yes</span>
                            : <span className="text-gray-400">No</span>
                          }
                        </td>
                        <td className="px-3 py-2 text-gray-500 text-xs hidden sm:table-cell">{check.triggerReason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Gap analysis */}
        <Card>
          <CardHeader>
            <button
              className="flex items-center justify-between w-full text-left"
              onClick={() => setExpandedSection(s => s === 'gaps' ? null : 'gaps')}
              aria-expanded={expandedSection === 'gaps'}
            >
              <CardTitle>
                Gap Analysis
                {gapAnalysis.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">({gapAnalysis.length} findings)</span>
                )}
              </CardTitle>
              {expandedSection === 'gaps' ? <ChevronUp className="h-5 w-5 text-gray-500" aria-hidden="true" /> : <ChevronDown className="h-5 w-5 text-gray-500" aria-hidden="true" />}
            </button>
          </CardHeader>
          {expandedSection === 'gaps' && (
            <CardContent className="space-y-3">
              {gapAnalysis.length === 0 ? (
                <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />
                  <p className="text-green-800 font-medium">No compliance gaps identified. Excellent work!</p>
                </div>
              ) : (
                gapAnalysis.map(gap => <GapCard key={gap.questionId} gap={gap} />)
              )}
            </CardContent>
          )}
        </Card>

        {/* Compliance calendar */}
        <div>
          <button
            className="w-full text-left mb-2"
            onClick={() => setExpandedSection(s => s === 'calendar' ? null : 'calendar')}
            aria-expanded={expandedSection === 'calendar'}
            aria-label="Toggle compliance calendar"
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-base font-semibold text-gray-800">Compliance Calendar</span>
              {expandedSection === 'calendar' ? <ChevronUp className="h-5 w-5 text-gray-500" aria-hidden="true" /> : <ChevronDown className="h-5 w-5 text-gray-500" aria-hidden="true" />}
            </div>
          </button>
          {expandedSection === 'calendar' && <ComplianceCalendar entries={calendarEntries} />}
        </div>

        {/* Documentation checklist */}
        <div>
          <button
            className="w-full text-left mb-2"
            onClick={() => setExpandedSection(s => s === 'checklist' ? null : 'checklist')}
            aria-expanded={expandedSection === 'checklist'}
            aria-label="Toggle documentation checklist"
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-base font-semibold text-gray-800">Documentation Checklist</span>
              {expandedSection === 'checklist' ? <ChevronUp className="h-5 w-5 text-gray-500" aria-hidden="true" /> : <ChevronDown className="h-5 w-5 text-gray-500" aria-hidden="true" />}
            </div>
          </button>
          {expandedSection === 'checklist' && <DocumentationChecklist profile={profile} />}
        </div>

        {/* State annexure */}
        {(ptSlabs.length > 0 || sandE.length > 0 || gstRates.length > 0) && (
          <div>
            <button
              className="w-full text-left mb-2"
              onClick={() => setExpandedSection(s => s === 'annexure' ? null : 'annexure')}
              aria-expanded={expandedSection === 'annexure'}
              aria-label="Toggle state annexure"
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-base font-semibold text-gray-800">State Reference Annexure</span>
                {expandedSection === 'annexure' ? <ChevronUp className="h-5 w-5 text-gray-500" aria-hidden="true" /> : <ChevronDown className="h-5 w-5 text-gray-500" aria-hidden="true" />}
              </div>
            </button>
            {expandedSection === 'annexure' && (
              <StateAnnexure
                statesOfOperation={profile.statesOfOperation}
                ptSlabs={ptSlabs}
                sandE={sandE}
                gstRates={gstRates}
              />
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-xs text-amber-800">
            <strong>Disclaimer:</strong> This report provides general guidance based on central legislation and research current to May 2026.
            State-specific rules vary. DPDP Act 2023 substantive obligations take effect 13 May 2027 — questions marked &quot;Prepare by 2027&quot; are advisory.
            Always consult a qualified compliance professional before taking legal action.
          </p>
        </div>

        {/* Download CTA at bottom */}
        <div className="text-center pb-8">
          <Button
            onClick={downloadPdf}
            disabled={isDownloading}
            size="lg"
            className="bg-blue-700 hover:bg-blue-800"
          >
            {isDownloading
              ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />Generating PDF…</>
              : <><Download className="mr-2 h-5 w-5" aria-hidden="true" />Download Full PDF Report</>
            }
          </Button>
          <Button
            onClick={emailReport}
            disabled={isEmailing}
            variant="outline"
            size="lg"
            className="mt-3"
          >
            {isEmailing
              ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />Sending…</>
              : <><Mail className="mr-2 h-5 w-5" aria-hidden="true" />Email Report to {data.email}</>
            }
          </Button>
          {emailSuccess && (
            <p className="text-sm text-green-700 mt-2">Report sent to <strong>{emailSuccess}</strong></p>
          )}
          <p className="text-xs text-gray-400 mt-2">ASCII-safe report · <ExternalLink className="inline h-3 w-3" aria-hidden="true" /> No Unicode characters</p>
        </div>
      </main>
    </div>
  )
}
