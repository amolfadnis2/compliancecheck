'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, CheckCircle, Save, Loader2 } from 'lucide-react'
import { 
  STATUTORY_HEALTH_QUESTIONS, 
  INDIAN_STATES, 
  EMPLOYEE_COUNT_OPTIONS, 
  INDUSTRY_OPTIONS,
  CATEGORY_INFO,
} from '@/lib/assessments/statutory-health-questions'

// Form validation schema
const userDetailsSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  companyName: z.string().min(2, 'Company name is required'),
  state: z.string().min(1, 'Please select your state'),
  employeeCount: z.string().min(1, 'Please select employee count'),
  industry: z.string().min(1, 'Please select your industry'),
})

type UserDetails = z.infer<typeof userDetailsSchema>
type AssessmentResponse = Record<string, string>

// Local storage keys
const STORAGE_KEY = 'statutory_health_progress'

interface SavedProgress {
  step: number
  currentQuestionIndex: number
  responses: AssessmentResponse
  userDetails: UserDetails | null
  savedAt: string
}

export default function StatutoryHealthAssessmentPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<AssessmentResponse>({})
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<UserDetails>({
    resolver: zodResolver(userDetailsSchema),
  })

  const totalQuestions = STATUTORY_HEALTH_QUESTIONS.length
  const currentQuestion = STATUTORY_HEALTH_QUESTIONS[currentQuestionIndex]

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
            reset(progress.userDetails)
          }
          setHasRestoredProgress(true)
        }
      }
    } catch (e) {
      console.error('Error loading saved progress:', e)
    }
  }, [reset])

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

  // Calculate progress
  const getProgress = () => {
    if (step === 1) return 5
    if (step === 2) return 10 + (currentQuestionIndex / totalQuestions) * 70
    return 90
  }

  // Handle user details submission
  const onUserDetailsSubmit = (data: UserDetails) => {
    setUserDetails(data)
    setStep(2)
    saveProgress()
  }

  // Handle question answer
  const handleAnswer = (answer: string) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }))

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      setStep(3)
    }
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
    
    try {
      const response = await fetch('/api/assessment/free-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userDetails,
          responses,
          assessmentType: 'statutory_health',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save assessment')
      }

      // If using local storage (database not available), save the assessment data locally
      if (data.storageType === 'local' && data.assessmentData) {
        // Store assessment data in localStorage for results page to read
        localStorage.setItem(`assessment_${data.assessmentId}`, JSON.stringify({
          ...data.assessmentData,
          overall_score: calculateScore(),
          category_scores: getCategoryScores(),
          userDetails,
        }))
      }

      // Clear saved progress on successful submission
      clearProgress()

      // Redirect to results page
      router.push(`/results/${data.assessmentId}`)

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-semibold text-lg">ComplianceCheck</span>
                <div className="text-xs text-gray-600">Statutory Health Check</div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              FREE Assessment
            </Badge>
          </div>
        </div>
      </header>

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
          <Progress value={getProgress()} className="h-2" aria-label="Assessment progress" />
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
              <CardDescription>Quick 10-minute assessment for PF, ESI, PT, Gratuity & Bonus compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onUserDetailsSubmit)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" {...register('fullName')} placeholder="John Doe" />
                    {errors.fullName && <p className="text-sm text-red-600">{errors.fullName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" {...register('email')} placeholder="john@company.com" />
                    {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-gray-600 bg-gray-100 border border-r-0 rounded-l-md">
                        +91
                      </span>
                      <Input id="phone" {...register('phone')} placeholder="9876543210" className="rounded-l-none" />
                    </div>
                    {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input id="companyName" {...register('companyName')} placeholder="Acme Pvt Ltd" />
                    {errors.companyName && <p className="text-sm text-red-600">{errors.companyName.message}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <select
                      id="state"
                      {...register('state')}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Select state</option>
                      {INDIAN_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    {errors.state && <p className="text-sm text-red-600">{errors.state.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeCount">Employee Count *</Label>
                    <select
                      id="employeeCount"
                      {...register('employeeCount')}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Select range</option>
                      {EMPLOYEE_COUNT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {errors.employeeCount && <p className="text-sm text-red-600">{errors.employeeCount.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <select
                    id="industry"
                    {...register('industry')}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">Select industry</option>
                    {INDUSTRY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {errors.industry && <p className="text-sm text-red-600">{errors.industry.message}</p>}
                </div>

                <Button type="submit" className="w-full">
                  Continue to Assessment <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
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
                    className="h-16 text-lg"
                    onClick={() => handleAnswer('yes')}
                  >
                    Yes
                  </Button>
                  <Button
                    variant={responses[currentQuestion.id] === 'no' ? 'default' : 'outline'}
                    className="h-16 text-lg"
                    onClick={() => handleAnswer('no')}
                  >
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
