'use client'

import { useState } from 'react'
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
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
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

export default function StatutoryHealthAssessmentPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: User Details, 2: Questions, 3: Summary
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<AssessmentResponse>({})
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<UserDetails>({
    resolver: zodResolver(userDetailsSchema),
  })

  const totalQuestions = STATUTORY_HEALTH_QUESTIONS.length
  const currentQuestion = STATUTORY_HEALTH_QUESTIONS[currentQuestionIndex]

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
      setStep(3) // Go to summary
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

  // Calculate preliminary score (shown in summary)
  const calculateScore = () => {
    let totalScore = 0
    let maxScore = 0

    STATUTORY_HEALTH_QUESTIONS.forEach(q => {
      maxScore += q.weight
      const answer = responses[q.id]
      
      if (q.complianceAnswer) {
        // Question has a "correct" compliance answer
        if (answer === q.complianceAnswer) {
          totalScore += q.weight
        }
      } else {
        // Applicability question - no right/wrong, just info
        totalScore += q.weight * 0.5 // Neutral score
      }
    })

    return Math.round((totalScore / maxScore) * 100)
  }

  // Handle free submission (no payment required for now)
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
          score += q.weight
        } else if (!q.complianceAnswer) {
          score += q.weight * 0.5
        }
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Statutory Health Check</h1>
          <p className="text-gray-600">
            <span className="text-green-600 font-semibold">FREE</span>
            <span className="text-gray-400 line-through ml-2">₹999</span>
            <span className="mx-2">•</span>
            ~10 minutes
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(getProgress())}%</span>
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>

        {/* Step 1: User Details */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Details</CardTitle>
              <CardDescription>We need some basic information to generate your report</CardDescription>
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
                      <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-r-0 rounded-l-md">
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
                <CardDescription>Review your preliminary results and proceed to payment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Score Preview */}
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-5xl font-bold text-blue-600 mb-2">{calculateScore()}%</div>
                  <div className="text-gray-600">Preliminary Compliance Score</div>
                  <p className="text-sm text-gray-500 mt-2">
                    Complete payment to unlock detailed report with action items
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
                  {isSubmitting ? 'Processing...' : 'Get Free Report'}
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
