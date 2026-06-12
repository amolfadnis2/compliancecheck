'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AssessmentHeader } from '@/components/assessment/assessment-header'
import { PhaseQuestionnaire } from '@/components/auto-dealer/PhaseQuestionnaire'

import { APPLICABILITY_QUESTIONS } from '@/lib/assessments/auto-dealer/applicability-questions'
import { PHASE2_STATUTORY_QUESTIONS as PHASE_2_QUESTIONS } from '@/lib/assessments/auto-dealer/phase-2-statutory'
import { PHASE3_WORKSHOP_EHS_QUESTIONS as PHASE_3_QUESTIONS } from '@/lib/assessments/auto-dealer/phase-3-workshop-ehs'
import { PHASE4_DEALER_SPECIFIC_QUESTIONS as PHASE_4_QUESTIONS } from '@/lib/assessments/auto-dealer/phase-4-dealer-specific'
import { PHASE5_EPR_QUESTIONS as PHASE_5_QUESTIONS } from '@/lib/assessments/auto-dealer/phase-5-epr'
import { PHASE6_DATA_CORPORATE_QUESTIONS as PHASE_6_QUESTIONS } from '@/lib/assessments/auto-dealer/phase-6-data-corporate'
import {
  getApplicableQuestionsByPhase,
  buildApplicabilityProfileFromResponses,
} from '@/lib/assessments/auto-dealer/rules-engine'
import type { Responses, AutoDealerQuestion } from '@/types/auto-dealer'
import { PHASE_METADATA } from '@/types/auto-dealer'
import { analytics } from '@/lib/analytics/tracking'
import { ASSESSMENT_TYPES } from '@/lib/constants/assessment-types'

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

const PHASE_PROGRESS_BANDS = {
  2: { start: 35, end: 51 },
  3: { start: 51, end: 67 },
  4: { start: 67, end: 80 },
  5: { start: 80, end: 89 },
  6: { start: 89, end: 97 },
} as const

type ValidPhase = 2 | 3 | 4 | 5 | 6

function parsePhase(raw: string | string[] | undefined): ValidPhase | null {
  const n = parseInt(String(raw ?? ''), 10)
  if ([2, 3, 4, 5, 6].includes(n)) return n as ValidPhase
  return null
}

// --------------------------------------------------------------------------
// Page
// --------------------------------------------------------------------------

export default function PhasePlayerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()

  const assessmentId = searchParams.get('id')
  const phase = parsePhase(params.n as string)

  // Load responses + profile from localStorage on mount
  const [responses, setResponses] = useState<Responses>({})
  const [questions, setQuestions] = useState<AutoDealerQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const startTimeRef = useRef(Date.now())


  // Initialise questions from stored profile
  useEffect(() => {
    if (!assessmentId || !phase) {
      router.replace('/assessment/auto-dealer')
      return
    }

    // Load applicability responses from localStorage
    const stored = localStorage.getItem(`auto_dealer_profile_${assessmentId}`)
    const profileResponses: Responses = stored ? (JSON.parse(stored) as Responses) : {}
    const profile = buildApplicabilityProfileFromResponses(profileResponses)

    // Load phase responses if any (from a previous partial visit)
    const phaseStored = localStorage.getItem(`auto_dealer_phase${phase}_${assessmentId}`)
    const phaseResponses: Responses = phaseStored ? (JSON.parse(phaseStored) as Responses) : {}
    const merged: Responses = { ...profileResponses, ...phaseResponses }

    const applicable = getApplicableQuestionsByPhase(profile, ALL_QUESTIONS, phase)
    setQuestions(applicable)
    setResponses(merged)

    // Find where we left off
    const firstUnanswered = applicable.findIndex(q => !merged[q.id])
    setCurrentIndex(firstUnanswered >= 0 ? firstUnanswered : 0)
    setIsLoading(false)
    analytics.trackEvent('assessment_phase_view', { assessment_type: ASSESSMENT_TYPES.AUTO_DEALER, phase: phase as number, question_count: applicable.length })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId, phase])

  const overallProgress = (() => {
    if (!phase || !PHASE_PROGRESS_BANDS[phase as keyof typeof PHASE_PROGRESS_BANDS]) return 35
    const band = PHASE_PROGRESS_BANDS[phase as keyof typeof PHASE_PROGRESS_BANDS]
    const fraction = questions.length > 0 ? currentIndex / questions.length : 0
    return Math.round(band.start + fraction * (band.end - band.start))
  })()

  const persistToLocalStorage = useCallback((newResponses: Responses) => {
    if (!assessmentId || !phase) return
    const profileStored = localStorage.getItem(`auto_dealer_profile_${assessmentId}`)
    const profileResponses: Responses = profileStored ? (JSON.parse(profileStored) as Responses) : {}
    const phaseOnly: Responses = {}
    for (const q of questions) {
      if (newResponses[q.id] !== undefined) phaseOnly[q.id] = newResponses[q.id]
    }
    localStorage.setItem(`auto_dealer_phase${phase}_${assessmentId}`, JSON.stringify(phaseOnly))
    localStorage.setItem(`auto_dealer_profile_${assessmentId}`, JSON.stringify({ ...profileResponses, ...newResponses }))
  }, [assessmentId, phase, questions])

  const advancePhase = useCallback(async (newResponses: Responses) => {
    const nextIndex = currentIndex + 1
    if (nextIndex < questions.length) {
      setCurrentIndex(nextIndex)
    } else {
      await persistPhaseAndNavigate(newResponses)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, questions])

  const handleAnswer = useCallback((questionId: string, value: string | string[]) => {
    const newResponses: Responses = { ...responses, [questionId]: value }
    setResponses(newResponses)
    analytics.trackEvent('question_answered', { assessment_type: ASSESSMENT_TYPES.AUTO_DEALER, question_id: questionId })
    persistToLocalStorage(newResponses)

    const currentQuestion = questions[currentIndex]
    // Multi-choice questions use a Continue button — don't auto-advance
    if (currentQuestion?.type === 'multi_choice') return

    setTimeout(() => { void advancePhase(newResponses) }, 600)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responses, currentIndex, questions, persistToLocalStorage, advancePhase])

  const handlePhaseContinue = useCallback(() => {
    void advancePhase(responses)
  }, [responses, advancePhase])

  const persistPhaseAndNavigate = async (finalResponses: Responses) => {
    if (!assessmentId || !phase) return
    setIsSaving(true)
    setError(null)

    const duration = Math.round((Date.now() - startTimeRef.current) / 1000)

    try {
      const res = await fetch('/api/assessment/auto-dealer/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId, phase, responses: finalResponses, durationSeconds: duration }),
      })
      const json = await res.json() as { success?: boolean; error?: string }
      if (!json.success) throw new Error(json.error ?? 'Failed to save phase')

      analytics.assessmentProgress({ assessment_type: ASSESSMENT_TYPES.AUTO_DEALER, completion_percentage: phase ? Math.round(((phase as number) - 1) * 20) : 0, questions_answered: Object.keys(finalResponses).length, time_spent_seconds: duration })

      // Navigate to next phase or results
      const nextPhase = (phase as number) + 1
      if (nextPhase <= 6) {
        router.push(`/assessment/auto-dealer/phase/${nextPhase}?id=${assessmentId}`)
      } else {
        router.push(`/assessment/auto-dealer/results/${assessmentId}`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save your answers. Please try again.')
      setIsSaving(false)
    }
  }

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    } else {
      // Go to previous phase or back to landing
      const prevPhase = phase ? (phase as number) - 1 : 1
      if (prevPhase >= 2) {
        router.push(`/assessment/auto-dealer/phase/${prevPhase}?id=${assessmentId}`)
      } else {
        router.push(`/assessment/auto-dealer?resume=${assessmentId ?? ''}`)
      }
    }
  }, [currentIndex, phase, assessmentId, router])

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  if (!phase) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Invalid phase. <Link href="/assessment/auto-dealer" className="text-blue-700 underline">Start over</Link></p>
      </div>
    )
  }

  const phaseInfo = PHASE_METADATA.find(m => m.phase === phase)

  return (
    <div className="min-h-screen bg-gray-50">
      <AssessmentHeader
        title="Auto Dealership Compliance Assessment"
        subtitle="2-Wheeler & 4-Wheeler Dealers — Labour, Transport & EHS Compliance"
      />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <Link href="/" className="inline-flex items-center text-blue-700 hover:text-blue-800">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Back to Assessments
          </Link>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" aria-hidden="true" />
              <p className="text-red-700">{error}</p>
              <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">Dismiss</Button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="h-12 w-12 animate-spin text-blue-700" aria-hidden="true" />
            <p className="mt-4 text-gray-600">Loading {phaseInfo?.name ?? `Phase ${phase}`}…</p>
          </div>
        )}

        {isSaving && (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="h-12 w-12 animate-spin text-blue-700" aria-hidden="true" />
            <p className="mt-4 text-gray-600">Saving your answers…</p>
          </div>
        )}

        {!isLoading && !isSaving && questions.length === 0 && (
          <div className="max-w-2xl mx-auto text-center py-16">
            <p className="text-gray-600 mb-4">
              No questions applicable for Phase {phase} based on your profile.
            </p>
            <Button
              onClick={() => {
                const nextPhase = (phase as number) + 1
                if (nextPhase <= 6) {
                  router.push(`/assessment/auto-dealer/phase/${nextPhase}?id=${assessmentId}`)
                } else {
                  router.push(`/assessment/auto-dealer/results/${assessmentId}`)
                }
              }}
              className="bg-blue-700 hover:bg-blue-800"
            >
              Continue to {(phase as number) < 6 ? `Phase ${(phase as number) + 1}` : 'Results'}
            </Button>
          </div>
        )}

        {!isLoading && !isSaving && questions.length > 0 && (
          <PhaseQuestionnaire
            phase={phase}
            questions={questions}
            responses={responses}
            currentIndex={currentIndex}
            overallProgress={overallProgress}
            onAnswer={handleAnswer}
            onContinue={handlePhaseContinue}
            onBack={handleBack}
          />
        )}
      </main>
    </div>
  )
}
