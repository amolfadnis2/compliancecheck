'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, CheckCircle, XCircle, Save, Loader2 } from 'lucide-react'
import { AssessmentHeader } from '@/components/assessment/assessment-header'
import { CompanyDetailsForm, type CompanyDetails } from '@/components/assessment/company-details-form'
import {
  STATUTORY_HEALTH_QUESTIONS,
  CATEGORY_INFO,
} from '@/lib/assessments/statutory-health-questions'
import { ASSESSMENT_TYPES, getLocalStorageKey } from '@/lib/constants/assessment-types'
import { useAssessmentTracking } from '@/lib/analytics'

type AssessmentResponse = Record<string, string>

// Local storage keys
const STORAGE_KEY = 'statutory_health_progress'

interface SavedProgress {
  step: number
  currentQuestionIndex: number
  responses: AssessmentResponse
  userDetails: CompanyDetails | null
  savedAt: string
}

export default function StatutoryHealthAssessmentPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<AssessmentResponse>({})
  const [userDetails, setUserDetails] = useState<CompanyDetails | null>(null)
  const [savedDetails, setSavedDetails] = useState<Partial<CompanyDetails> | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false)

  const totalQuestions = STATUTORY_HEALTH_QUESTIONS.length
  const currentQuestion = STATUTORY_HEALTH_QUESTIONS[currentQuestionIndex]

  // Initialize assessment tracking
  const assessmentTracking = useAssessmentTracking({
    assessmentType: ASSESSMENT_TYPES.STATUTORY_HEALTH,
    userTier: 'free',
    questionCount: totalQuestions,
    enableAutoAbandon: true,
  })


  // Load saved progress on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const progress: SavedProgress = JSON.parse(saved)
        // Only restore if saved within last 24 hours
        const savedTime = new Date(progress.savedAt).getTime()
        const now = Date.now()
        if (now - savedTime < 24 * 60 * 60 * 1000) {
          setStep(progress.step)
          setCurrentQuestionIndex(progress.currentQuestionIndex)
          setResponses(progress.responses)
          if (progress.userDetails) {
            setUserDetails(progress.userDetails)
            setSavedDetails(progress.userDetails)
          }
          setHasRestoredProgress(true)
        }
      }
    } catch (e) {
      console.error('Error loading saved progress:', e)
    }
  }, [])

  // Auto-save progress
  const saveProgress = useCallback(() => {
    setSaveStatus('saving')
    try {
      const progress: SavedProgress = {
        step,
        currentQuestionIndex,
        responses,
        userDetails,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (e) {
      console.error('Error saving progress:', e)
      setSaveStatus('idle')
    }
  }, [step, currentQuestionIndex, responses, userDetails])

  // Auto-save when responses change
  useEffect(() => {
    if (Object.keys(responses).length > 0) {
      const timer = setTimeout(saveProgress, 500)
      return () => clearTimeout(timer)
    }
  }, [responses, saveProgress])

  // Clear saved progress
  const clearProgress = () => {
    localStorage.removeItem(STORAGE_KEY)
  }

  // Calculate overall progress (for two-tier progress system)
  // Details: 0-10%, Questions: 10-90%, Summary: 90-100%
  const getProgress = () => {
    if (step === 1) return 5
    if (step === 2) return Math.round(10 + (currentQuestionIndex / totalQuestions) * 80)
    return 95
  }

  const onUserDetailsSubmit = (data: CompanyDetails) => {
    setUserDetails(data)
    setStep(2)
    saveProgress()
    assessmentTracking.trackStart()
  }

  // Handle question answer with 800ms auto-advance delay
  const handleAnswer = (answer: string) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }))

    // Track progress
    const answeredCount = Object.keys(responses).length + 1
    assessmentTracking.trackProgress(answeredCount, currentQuestion.category, currentQuestion.id)

    // Auto-advance after 800ms delay (consistent with other assessments)
    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1)
      } else {
        setStep(3)
      }
    }, 800)
  }

  // Go back to previous question
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    } else {
      setStep(1)
    }
  }

  // Calculate preliminary score
  const calculateScore = () => {
    let totalScore = 0
    let maxScore = 0

    STATUTORY_HEALTH_QUESTIONS.forEach(q => {
      maxScore += q.weight
      const answer = responses[q.id]
      
      if (q.complianceAnswer) {
        // Question has a defined compliance answer - check if user answered correctly
        if (answer === q.complianceAnswer) {
          totalScore += q.weight
        }
      } else {
        // Informational question (no compliance answer defined)
        // These are applicability questions - answering "yes" means you have the requirement
        // Give full score since there's no "wrong" answer for these
        totalScore += q.weight
      }
    })

    return Math.round((totalScore / maxScore) * 100)
  }

  // Handle free submission
  const handleFreeSubmit = async () => {
    setIsSubmitting(true)

    // Calculate score for PostHog tracking (client-side preview only)
    const score = calculateScore()
    const gapCount = STATUTORY_HEALTH_QUESTIONS.filter(q =>
      q.complianceAnswer && responses[q.id] !== q.complianceAnswer
    ).length

    assessmentTracking.trackComplete(
      score,
      { high: gapCount, medium: 0, low: 0 },
      Object.keys(responses).length,
      totalQuestions - Object.keys(responses).length
    )

    try {
      const response = await fetch('/api/assessment/statutory-health-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userDetails, responses }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save assessment')
      }

      // Fallback: DB unavailable — persist computed scores to localStorage so
      // LocalStorageResultsPage can render them from the temp_ ID.
      if (data.storageType === 'local' && data.assessmentData) {
        localStorage.setItem(
          getLocalStorageKey(data.assessmentId),
          JSON.stringify(data.assessmentData)
        )
      }

      clearProgress()
      router.push(`/results/${data.assessmentId}?type=${ASSESSMENT_TYPES.STATUTORY_HEALTH}`)
    } catch (error) {
      console.error('Submit error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get category scores for summary
  const getCategoryScores = () => {
    const scores: Record<string, { score: number; max: number; percentage: number }> = {}

    Object.keys(CATEGORY_INFO).forEach(cat => {
      const categoryQuestions = STATUTORY_HEALTH_QUESTIONS.filter(q => q.category === cat)
      let score = 0
      let max = 0

      categoryQuestions.forEach(q => {
        max += q.weight
        const answer = responses[q.id]
        if (q.complianceAnswer && answer === q.complianceAnswer) {
          // Compliance question answered correctly
          score += q.weight
        } else if (!q.complianceAnswer) {
          // Informational question - no wrong answer, give full points
          score += q.weight
        }
        // If compliance question answered wrong, score stays 0 for this question
      })

      scores[cat] = {
        score,
        max,
        percentage: Math.round((score / max) * 100)
      }
    })

    return scores
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <AssessmentHeader 
        title="ComplianceCheck"
        subtitle="Statutory Health Check"
        badgeText="FREE Assessment"
        badgeVariant="free"
      />

      <div className="max-w-2xl mx-auto py-8 px-4">

        {/* Progress Bar with Save Status */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <div className="flex items-center gap-2">
              {saveStatus === 'saving' && (
                <span className="flex items-center text-blue-600">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Saving...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="flex items-center text-green-600">
                  <Save className="w-3 h-3 mr-1" />
                  Saved
                </span>
              )}
              <span>{Math.round(getProgress())}%</span>
            </div>
          </div>
          <Progress value={getProgress()} className="h-3 [&>div]:bg-green-600" aria-label={`Assessment progress: ${Math.round(getProgress())}% complete`} />
        </div>

        {/* Restored Progress Notice */}
        {hasRestoredProgress && step === 1 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-center justify-between">
            <span>📝 Your previous progress has been restored.</span>
            <button 
              onClick={() => {
                clearProgress()
                setHasRestoredProgress(false)
                setStep(1)
                setCurrentQuestionIndex(0)
                setResponses({})
                setUserDetails(null)
              }}
              className="text-blue-600 hover:underline"
            >
              Start Fresh
            </button>
          </div>
        )}

        {/* Step 1: User Details */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">Statutory Health Check</CardTitle>
              <CardDescription>Quick 10-minute assessment for PF, ESI, PT, Gratuity &amp; Bonus compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyDetailsForm
                key={hasRestoredProgress ? 'restored' : 'fresh'}
                onSubmit={onUserDetailsSubmit}
                defaultValues={savedDetails}
                isLoading={isSubmitting}
              />
            </CardContent>
          </Card>
        )}

        {/* Step 2: Questions */}
        {step === 2 && currentQuestion && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                <span className="px-2 py-1 bg-blue-100 rounded">{currentQuestion.categoryLabel}</span>
                <span className="text-gray-400">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              </div>
              <CardTitle className="text-xl">{currentQuestion.text}</CardTitle>
              {currentQuestion.helpText && (
                <CardDescription>{currentQuestion.helpText}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {currentQuestion.type === 'yes_no' && (
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={responses[currentQuestion.id] === 'yes' ? 'default' : 'outline'}
                    aria-pressed={responses[currentQuestion.id] === 'yes'}
                    className={`h-16 text-lg ${
                      responses[currentQuestion.id] === 'yes'
                        ? 'bg-green-700 hover:bg-green-800 text-white'
                        : ''
                    }`}
                    onClick={() => handleAnswer('yes')}
                  >
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Yes
                  </Button>
                  <Button
                    variant={responses[currentQuestion.id] === 'no' ? 'default' : 'outline'}
                    aria-pressed={responses[currentQuestion.id] === 'no'}
                    className={`h-16 text-lg ${
                      responses[currentQuestion.id] === 'no'
                        ? 'bg-red-700 hover:bg-red-800 text-white'
                        : ''
                    }`}
                    onClick={() => handleAnswer('no')}
                  >
                    <XCircle className="mr-2 h-5 w-5" />
                    No
                  </Button>
                </div>
              )}

              <Button variant="ghost" onClick={handleBack} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </CardContent>
          </Card>
        )}


        {/* Step 3: Summary & Payment */}
        {step === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Complete!</CardTitle>
                <CardDescription>Review your preliminary results and get your free report</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Score Preview */}
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-5xl font-bold text-blue-600 mb-2">{calculateScore()}%</div>
                  <div className="text-gray-600">Preliminary Compliance Score</div>
                  <p className="text-sm text-gray-500 mt-2">
                    Get your detailed report with action items
                  </p>
                </div>

                {/* Category Breakdown */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Category Breakdown</h3>
                  {Object.entries(getCategoryScores()).map(([cat, data]) => (
                    <div key={cat} className="flex items-center justify-between">
                      <span className="text-gray-600">{CATEGORY_INFO[cat as keyof typeof CATEGORY_INFO].name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${data.percentage >= 70 ? 'bg-green-500' : data.percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${data.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12">{data.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Report Card - Free Access */}
            <Card className="border-2 border-green-600">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-semibold text-lg">Statutory Health Check Report</h3>
                    <p className="text-gray-600 text-sm">Detailed PDF report with action items</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">FREE</div>
                    <div className="text-sm text-gray-500 line-through">₹999</div>
                  </div>
                </div>

                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Detailed compliance score by category
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Priority action items (High/Medium/Low)
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Downloadable PDF report
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Email copy of report
                  </div>
                </div>

                <Button 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  size="lg"
                  onClick={handleFreeSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Get Free Report'
                  )}
                </Button>

                <p className="text-center text-xs text-gray-500 mt-4">
                  By continuing, you agree to our{' '}
                  <Link href="/terms" className="underline">Terms</Link> and{' '}
                  <Link href="/privacy" className="underline">Privacy Policy</Link>.
                </p>
              </CardContent>
            </Card>

            {/* Back Button */}
            <Button variant="ghost" onClick={() => setStep(2)} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" /> Review Answers
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
