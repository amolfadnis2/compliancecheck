'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import posthog from 'posthog-js'
import { ArrowLeft, Building2, Car, AlertCircle, Loader2, ArrowRight, Info, ToggleLeft, ToggleRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AssessmentHeader } from '@/components/assessment/assessment-header'
import { ApplicabilityForm } from '@/components/auto-dealer/ApplicabilityForm'

import { APPLICABILITY_QUESTIONS } from '@/lib/assessments/auto-dealer/applicability-questions'

import type { Responses, LabourRegime } from '@/types/auto-dealer'

// --------------------------------------------------------------------------
// Validation
// --------------------------------------------------------------------------

const detailsSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  companyName: z.string().min(2, 'Dealership name is required').max(200),
})
type DetailsForm = z.infer<typeof detailsSchema>

// --------------------------------------------------------------------------
// Constants
// --------------------------------------------------------------------------

const PHASE_WEIGHTS = {
  details: { start: 0, end: 5 },
  applicability: { start: 5, end: 35 },
}

export default function AutoDealerLandingPage() {
  const router = useRouter()

  // Assessment state
  const [phase, setPhase] = useState<'details' | 'applicability' | 'processing'>('details')
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [responses, setResponses] = useState<Responses>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [labourRegime, setLabourRegime] = useState<LabourRegime>('new')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<DetailsForm>({
    resolver: zodResolver(detailsSchema),
  })

  // Visible questions respecting responses
  const visibleQuestions = APPLICABILITY_QUESTIONS

  // Overall progress
  const overallProgress = phase === 'details' ? 0
    : phase === 'applicability'
      ? Math.round(PHASE_WEIGHTS.applicability.start + (currentIndex / visibleQuestions.length) * 30)
      : 35

  // --------------------------------------------------------------------------
  // PostHog tracking
  // --------------------------------------------------------------------------

  const track = useCallback((event: string, props: Record<string, string | number | boolean> = {}) => {
    try { posthog.capture(event, { assessment_type: 'auto_dealer', ...props }) }
    catch { /* non-fatal */ }
  }, [])

  useEffect(() => {
    track('auto_dealer_landing_view')
  }, [track])

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------

  const onDetailsSubmit = async (data: DetailsForm) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/assessment/auto-dealer/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: data.fullName, email: data.email, phone: data.phone, companyName: data.companyName }),
      })
      const json = await res.json()
      if (!json.assessmentId) throw new Error('Failed to start assessment')
      setAssessmentId(json.assessmentId)
      // Persist to localStorage as transient fallback
      localStorage.setItem('auto_dealer_assessment_id', json.assessmentId)
      localStorage.setItem('auto_dealer_details', JSON.stringify(data))
      setPhase('applicability')
      track('auto_dealer_phase1_start', { email: data.email })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApplicabilityAnswer = useCallback((questionId: string, value: string) => {
    const newResponses: Responses = { ...responses, [questionId]: value, AD_APP_labour_regime: labourRegime }
    setResponses(newResponses)
    track('auto_dealer_question_answered', { question_id: questionId, phase: 1 })

    setTimeout(async () => {
      const nextIndex = currentIndex + 1
      if (nextIndex < visibleQuestions.length) {
        setCurrentIndex(nextIndex)
      } else {
        // Phase 1 complete — persist to Supabase and navigate to Phase 2
        setPhase('processing')
        try {
          const res = await fetch('/api/assessment/auto-dealer/applicability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assessmentId, responses: newResponses }),
          })
          const json = await res.json()
          if (!json.success) throw new Error('Failed to persist applicability')
          track('auto_dealer_phase1_complete', {
            applicable_phases: json.applicablePhases?.join(',') ?? '',
            question_count: json.totalQuestions ?? 0,
          })
          localStorage.setItem(`auto_dealer_profile_${assessmentId}`, JSON.stringify(newResponses))
          router.push(`/assessment/auto-dealer/phase/2?id=${assessmentId}`)
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Failed to process applicability')
          setPhase('applicability')
        }
      }
    }, 600)
  }, [responses, currentIndex, visibleQuestions.length, assessmentId, router, track, labourRegime])

  const handleApplicabilityBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    } else {
      setPhase('details')
    }
  }, [currentIndex])

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50">
      <AssessmentHeader
        title="Auto Dealership Compliance Assessment"
        subtitle="2-Wheeler & 4-Wheeler Dealers — Labour, Transport & EHS Compliance"
      />

      {/* Overall progress */}
      {phase !== 'details' && (
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span className="font-medium">Overall Progress</span>
                <span className="font-semibold">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-3 [&>div]:bg-blue-600" aria-label="Overall assessment progress" />
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-700 hover:text-blue-800">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Back to Assessments
          </Link>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" aria-hidden="true" />
              <p className="text-red-700">{error}</p>
              <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">Dismiss</Button>
            </div>
          </div>
        )}

        {phase === 'processing' && (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="h-12 w-12 animate-spin text-blue-700" aria-hidden="true" />
            <p className="mt-4 text-gray-600">Processing your applicability profile…</p>
          </div>
        )}

        {phase === 'details' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Hero */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Car className="h-6 w-6 text-blue-700" aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle>Auto Dealership Compliance Assessment</CardTitle>
                    <CardDescription>6-phase assessment — 50 to 100 questions based on your profile</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-900">25 min</p>
                    <p className="text-gray-500">Avg. time</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-900">6 phases</p>
                    <p className="text-gray-500">Coverage</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-900">PDF report</p>
                    <p className="text-gray-500">Deliverable</p>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
                  <Info className="h-5 w-5 text-blue-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm text-blue-800">
                    This assessment covers Labour Codes, CMVR Trade Certificate, SPCB / Hazardous Waste,
                    IRDAI MISP (EoM Regulations 2024), ELV Rules 2025, GST 2.0, and DPDP Act 2023.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Labour regime toggle */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Labour Law Regime</CardTitle>
                <CardDescription>
                  New Labour Codes (eff. 21 Nov 2025) are the default. Toggle to Legacy if your state has not yet gazetted state rules.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setLabourRegime(r => r === 'new' ? 'legacy' : 'new')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-pressed={labourRegime === 'new'}
                    aria-label="Toggle Labour Codes regime"
                  >
                    {labourRegime === 'new'
                      ? <ToggleRight className="h-6 w-6 text-green-600" aria-hidden="true" />
                      : <ToggleLeft className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    }
                    <span className="text-sm font-medium">
                      {labourRegime === 'new' ? 'New Labour Codes (default)' : 'Legacy Acts'}
                    </span>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Details form */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Building2 className="h-5 w-5 text-gray-700" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-base">Your Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onDetailsSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" {...register('fullName')} placeholder="Rajesh Kumar" aria-describedby={errors.fullName ? 'fullName-err' : undefined} />
                    {errors.fullName && <p id="fullName-err" className="text-sm text-red-500">{errors.fullName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" {...register('email')} placeholder="rajesh@dealership.com" aria-describedby={errors.email ? 'email-err' : undefined} />
                    {errors.email && <p id="email-err" className="text-sm text-red-500">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Mobile Number *</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">+91</span>
                      <Input id="phone" {...register('phone')} placeholder="9876543210" className="rounded-l-none" aria-describedby={errors.phone ? 'phone-err' : undefined} />
                    </div>
                    {errors.phone && <p id="phone-err" className="text-sm text-red-500">{errors.phone.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Dealership Name *</Label>
                    <Input id="companyName" {...register('companyName')} placeholder="Krishna Motors Pvt Ltd" aria-describedby={errors.companyName ? 'company-err' : undefined} />
                    {errors.companyName && <p id="company-err" className="text-sm text-red-500">{errors.companyName.message}</p>}
                  </div>
                  <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 h-12" disabled={isSubmitting}>
                    {isSubmitting
                      ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />Starting…</>
                      : <><ArrowRight className="mr-2 h-5 w-5" aria-hidden="true" />Start Applicability Check</>
                    }
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-800">
                <strong>Disclaimer:</strong> This assessment provides general guidance based on central legislation and research current to May 2026.
                State-specific rules vary and change with Budgets. Always consult a qualified compliance professional for legal advice.
              </p>
            </div>
          </div>
        )}

        {phase === 'applicability' && (
          <ApplicabilityForm
            questions={visibleQuestions}
            responses={responses}
            currentIndex={currentIndex}
            onAnswer={handleApplicabilityAnswer}
            onBack={handleApplicabilityBack}
          />
        )}
      </main>
    </div>
  )
}
