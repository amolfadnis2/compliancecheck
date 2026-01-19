'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowRight,
  CheckCircle, 
  XCircle, 
  Loader2, 
  Download, 
  Utensils,
  AlertTriangle,
  Info,
  Clock,
  Shield
} from 'lucide-react'
import { AssessmentHeader } from '@/components/assessment/assessment-header'
import { ASSESSMENT_TYPES, getLocalStorageKey } from '@/lib/constants/assessment-types'
import { useAssessmentTracking } from '@/lib/analytics'

// Import questions and applicability
import {
  FOOD_BUSINESS_APPLICABILITY_QUESTIONS,
  ApplicabilityResult,
  calculateApplicability,
  generateApplicabilitySummary,
  COMPLIANCE_AREAS,
  TOTAL_POSSIBLE_QUESTIONS,
} from '@/lib/assessments/food-business-applicability'

import {
  Question,
  filterQuestionsByApplicability,
  calculateFoodBusinessScore,
  FOOD_BUSINESS_CATEGORIES,
} from '@/lib/assessments/food-business-questions'

// ============================================================================
// SCHEMAS & TYPES
// ============================================================================

const userDetailsSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  companyName: z.string().min(2, 'Business name is required').max(200),
})

type UserDetails = z.infer<typeof userDetailsSchema>

type Step = 'details' | 'applicability' | 'summary' | 'questions' | 'results'

// ============================================================================
// COMPONENT
// ============================================================================

export default function FoodBusinessAssessmentPage() {
  const router = useRouter()
  
  // Step management
  const [currentStep, setCurrentStep] = useState<Step>('details')
  
  // User details
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  
  // Applicability
  const [applicabilityIndex, setApplicabilityIndex] = useState(0)
  const [applicabilityResponses, setApplicabilityResponses] = useState<Record<string, string>>({})
  const [applicabilityResults, setApplicabilityResults] = useState<ApplicabilityResult[]>([])
  
  // Main questions
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  
  // Results
  const [results, setResults] = useState<{
    overallScore: number
    categoryScores: Record<string, { score: number; maxScore: number; percentage: number }>
    complianceStatus: 'compliant' | 'needs_attention' | 'non_compliant'
    actionItems: Array<{ questionId: string; category: string; text: string; priority: 'high' | 'medium' | 'low' }>
  } | null>(null)
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  
  // Form
  const { register, handleSubmit, formState: { errors } } = useForm<UserDetails>({
    resolver: zodResolver(userDetailsSchema),
  })

  // Current applicability question
  const currentApplicabilityQuestion = FOOD_BUSINESS_APPLICABILITY_QUESTIONS[applicabilityIndex]
  
  // Current main question
  const currentQuestion = filteredQuestions[currentQuestionIndex]
  
  // Estimated question count based on current applicability responses
  const [estimatedQuestionCount, setEstimatedQuestionCount] = useState(TOTAL_POSSIBLE_QUESTIONS)
  
  // Initialize assessment tracking
  const assessmentTracking = useAssessmentTracking({
    assessmentType: ASSESSMENT_TYPES.FOOD_BUSINESS,
    userTier: 'free',
    questionCount: filteredQuestions.length || estimatedQuestionCount,
    enableAutoAbandon: true,
  })
  
  // Update estimated question count when applicability responses change
  useEffect(() => {
    if (Object.keys(applicabilityResponses).length > 0) {
      const tempResults = calculateApplicability(applicabilityResponses)
      const applicable = tempResults.filter(r => r.applies)
      const count = applicable.reduce((sum, r) => sum + r.questionCount, 0)
      setEstimatedQuestionCount(count || TOTAL_POSSIBLE_QUESTIONS)
    }
  }, [applicabilityResponses])

  // Auto-skip conditional applicability questions
  useEffect(() => {
    if (currentStep !== 'applicability') return
    
    const q = currentApplicabilityQuestion
    let shouldSkip = false
    
    if (q.id === 'alcohol_type' || q.id === 'alcohol_timing') {
      shouldSkip = applicabilityResponses.serves_alcohol !== 'yes'
    }
    if (q.id === 'women_count') {
      shouldSkip = applicabilityResponses.employs_women !== 'yes'
    }
    
    if (shouldSkip) {
      setApplicabilityResponses(prev => ({ ...prev, [q.id]: 'not_applicable' }))
      setTimeout(() => {
        if (applicabilityIndex < FOOD_BUSINESS_APPLICABILITY_QUESTIONS.length - 1) {
          setApplicabilityIndex(prev => prev + 1)
        }
      }, 100)
    }
  }, [applicabilityIndex, currentStep, currentApplicabilityQuestion, applicabilityResponses])

  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  // Step 0: User Details Submit
  const onUserDetailsSubmit = (data: UserDetails) => {
    setUserDetails(data)
    setCurrentStep('applicability')
    
    // Track assessment start
    assessmentTracking.trackStart()
  }
  
  // Applicability answer handler
  const handleApplicabilityAnswer = (answer: string) => {
    const questionId = currentApplicabilityQuestion.id
    setApplicabilityResponses(prev => ({ ...prev, [questionId]: answer }))
    
    // Auto-advance after 600ms
    setTimeout(() => {
      if (applicabilityIndex < FOOD_BUSINESS_APPLICABILITY_QUESTIONS.length - 1) {
        setApplicabilityIndex(prev => prev + 1)
      } else {
        // Calculate applicability and move to summary
        const results = calculateApplicability({ ...applicabilityResponses, [questionId]: answer })
        setApplicabilityResults(results)
        setCurrentStep('summary')
      }
    }, 600)
  }
  
  // Start main assessment from summary
  const handleStartMainAssessment = () => {
    const applicableCodes = applicabilityResults.filter(r => r.applies).map(r => r.code)
    const questions = filterQuestionsByApplicability(applicableCodes)
    setFilteredQuestions(questions)
    setCurrentStep('questions')
  }
  
  // Main question answer handler
  const handleAnswer = (answer: string) => {
    setResponses(prev => ({ ...prev, [currentQuestion.id]: answer }))
    
    // Track progress
    const answeredCount = Object.keys(responses).length + 1
    assessmentTracking.trackProgress(answeredCount, currentQuestion.category, currentQuestion.id)
    
    // Auto-advance after 800ms
    setTimeout(() => {
      if (currentQuestionIndex < filteredQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1)
      } else {
        handleSubmitAssessment()
      }
    }, 800)
  }
  
  // Submit assessment
  const handleSubmitAssessment = async () => {
    setIsSubmitting(true)
    
    try {
      const calculatedResults = calculateFoodBusinessScore(filteredQuestions, responses)
      setResults(calculatedResults)
      
      // Track completion using the assessment tracking hook
      assessmentTracking.trackComplete(
        calculatedResults.overallScore,
        { 
          high: calculatedResults.actionItems.filter(a => a.priority === 'high').length, 
          medium: calculatedResults.actionItems.filter(a => a.priority === 'medium').length, 
          low: calculatedResults.actionItems.filter(a => a.priority === 'low').length 
        },
        Object.keys(responses).length,
        filteredQuestions.length - Object.keys(responses).length
      )
      
      // Submit to API
      const response = await fetch('/api/assessment/food-business-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userDetails,
          applicabilityResponses,
          applicabilityResults,
          responses,
          score: calculatedResults.overallScore,
          categoryScores: calculatedResults.categoryScores,
          actionItems: calculatedResults.actionItems,
          assessmentType: ASSESSMENT_TYPES.FOOD_BUSINESS,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setAssessmentId(data.assessmentId)
        
        // Store in localStorage for results page
        localStorage.setItem(getLocalStorageKey(data.assessmentId), JSON.stringify({
          userDetails,
          applicabilityResponses,
          applicabilityResults,
          responses,
          score: calculatedResults.overallScore,
          categoryScores: calculatedResults.categoryScores,
          actionItems: calculatedResults.actionItems,
          completedAt: new Date().toISOString(),
          assessmentType: ASSESSMENT_TYPES.FOOD_BUSINESS,
        }))
        
        // Redirect directly to results page instead of showing inline results
        router.push(`/results/${data.assessmentId}?type=${ASSESSMENT_TYPES.FOOD_BUSINESS}`)
      } else {
        // Fallback to localStorage only
        const fallbackId = 'local_' + crypto.randomUUID()
        setAssessmentId(fallbackId)
        localStorage.setItem(getLocalStorageKey(fallbackId), JSON.stringify({
          userDetails,
          applicabilityResponses,
          applicabilityResults,
          responses,
          score: calculatedResults.overallScore,
          categoryScores: calculatedResults.categoryScores,
          actionItems: calculatedResults.actionItems,
          completedAt: new Date().toISOString(),
          assessmentType: ASSESSMENT_TYPES.FOOD_BUSINESS,
        }))
        // Redirect directly to results page
        router.push(`/results/${fallbackId}?type=${ASSESSMENT_TYPES.FOOD_BUSINESS}`)
      }
    } catch (error) {
      console.error('Submission error:', error)
      // Fallback to localStorage
      const calculatedResults = calculateFoodBusinessScore(filteredQuestions, responses)
      setResults(calculatedResults)
      const fallbackId = 'local_' + crypto.randomUUID()
      setAssessmentId(fallbackId)
      localStorage.setItem(getLocalStorageKey(fallbackId), JSON.stringify({
        userDetails,
        applicabilityResponses,
        applicabilityResults,
        responses,
        score: calculatedResults.overallScore,
        categoryScores: calculatedResults.categoryScores,
        actionItems: calculatedResults.actionItems,
        completedAt: new Date().toISOString(),
        assessmentType: ASSESSMENT_TYPES.FOOD_BUSINESS,
      }))
      // Redirect directly to results page
      router.push(`/results/${fallbackId}?type=${ASSESSMENT_TYPES.FOOD_BUSINESS}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================
  
  // Step 0: User Details Form
  const renderDetailsForm = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <Utensils className="h-8 w-8 text-orange-600" />
        </div>
        <CardTitle className="text-2xl">Restaurant & Food Business Compliance Check</CardTitle>
        <CardDescription className="text-base">
          Complete compliance assessment for FSSAI, GST, Fire Safety, Labour Laws, and Liquor Licensing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onUserDetailsSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Your Full Name *</Label>
            <Input id="fullName" {...register('fullName')} placeholder="John Doe" />
            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register('email')} placeholder="john@restaurant.com" />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number *</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                +91
              </span>
              <Input id="phone" {...register('phone')} placeholder="9876543210" className="rounded-l-none" />
            </div>
            {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Restaurant / Business Name *</Label>
            <Input id="companyName" {...register('companyName')} placeholder="The Food Hub" />
            {errors.companyName && <p className="text-sm text-red-500">{errors.companyName.message}</p>}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">What to expect:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>First, we will ask about your business to determine applicable regulations</li>
                  <li>Then, you will answer {TOTAL_POSSIBLE_QUESTIONS} compliance questions (filtered to your profile)</li>
                  <li>Get instant compliance score with detailed gap analysis</li>
                  <li>Download PDF report with remediation steps</li>
                </ul>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-lg">
            Start Assessment
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Shield className="h-4 w-4" />
            FREE during beta • Usually Rs. 999
          </span>
        </p>
      </CardFooter>
    </Card>
  )
  
  // Step 1: Applicability Questions
  const renderApplicabilityQuestion = () => {
    const q = currentApplicabilityQuestion
    const progress = ((applicabilityIndex + 1) / FOOD_BUSINESS_APPLICABILITY_QUESTIONS.length) * 100
    
    // Check if this is a conditional question that should be skipped
    const shouldSkip = () => {
      if (q.id === 'alcohol_type' || q.id === 'alcohol_timing') {
        return applicabilityResponses.serves_alcohol !== 'yes'
      }
      if (q.id === 'women_count') {
        return applicabilityResponses.employs_women !== 'yes'
      }
      return false
    }
    
    if (shouldSkip()) {
      return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-orange-600" /></div>
    }
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
              Step 1: Business Profile
            </span>
            <span className="text-sm text-gray-500">
              {applicabilityIndex + 1} of {FOOD_BUSINESS_APPLICABILITY_QUESTIONS.length}
            </span>
          </div>
          <Progress value={progress} aria-label="Applicability progress" className="h-2 mb-4" />
          <CardTitle className="text-lg">{q.text}</CardTitle>
          {q.helpText && (
            <CardDescription className="flex items-start gap-2 mt-2">
              <Info className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              {q.helpText}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {q.type === 'yes_no' && (
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleApplicabilityAnswer('yes')}
                variant={applicabilityResponses[q.id] === 'yes' ? 'default' : 'outline'}
                className={`h-16 text-lg ${
                  applicabilityResponses[q.id] === 'yes' 
                    ? 'bg-green-700 hover:bg-green-800 text-white' 
                    : ''
                }`}
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                Yes
              </Button>
              <Button
                onClick={() => handleApplicabilityAnswer('no')}
                variant={applicabilityResponses[q.id] === 'no' ? 'default' : 'outline'}
                className={`h-16 text-lg ${
                  applicabilityResponses[q.id] === 'no' 
                    ? 'bg-red-700 hover:bg-red-800 text-white' 
                    : ''
                }`}
              >
                <XCircle className="mr-2 h-5 w-5" />
                No
              </Button>
            </div>
          )}
          
          {(q.type === 'single_choice' || q.type === 'multiple_choice') && q.options && (
            <div className="space-y-2">
              {q.options.map((opt) => (
                <Button
                  key={opt.value}
                  onClick={() => handleApplicabilityAnswer(opt.value)}
                  variant={applicabilityResponses[q.id] === opt.value ? 'default' : 'outline'}
                  className={`w-full justify-start h-auto py-3 px-4 text-left ${
                    applicabilityResponses[q.id] === opt.value 
                      ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                      : ''
                  }`}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-between border-t pt-4">
          <div className="text-sm text-gray-500">
            <Clock className="h-4 w-4 inline mr-1" />
            Est. {Math.ceil(estimatedQuestionCount * 0.5)} min remaining
          </div>
          <div className="text-sm text-gray-500">
            ~{estimatedQuestionCount} questions based on your profile
          </div>
        </CardFooter>
      </Card>
    )
  }
  
  // Step 2: Summary Page
  const renderSummary = () => {
    const summary = generateApplicabilitySummary(applicabilityResults)
    const hasProhibitionWarning = applicabilityResults.find(
      r => r.code === 'LIQUOR' && r.reason.includes('PROHIBITED')
    )
    
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Your Compliance Profile</CardTitle>
            <CardDescription>
              Based on your answers, here are the compliance areas applicable to your food business
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Warning for prohibition states */}
            {hasProhibitionWarning && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-800">Alcohol Prohibition Notice</p>
                    <p className="text-sm text-red-700 mt-1">
                      Your state has alcohol prohibition. Liquor licence cannot be obtained.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-orange-600">{summary.totalQuestions}</p>
                <p className="text-sm text-gray-600">Questions for You</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{summary.applicableAreas.length}</p>
                <p className="text-sm text-gray-600">Applicable Areas</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">{summary.estimatedTime}</p>
                <p className="text-sm text-gray-600">Estimated Time</p>
              </div>
            </div>
            
            {/* Applicable Areas */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Applicable Compliance Areas</h3>
              <div className="grid gap-3">
                {summary.applicableAreas.map((area) => {
                  const areaInfo = COMPLIANCE_AREAS.find(a => a.code === area.code)
                  return (
                    <div 
                      key={area.code} 
                      className="flex items-center justify-between p-4 bg-white border rounded-lg hover:border-orange-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{areaInfo?.icon || '📋'}</span>
                        <div>
                          <p className="font-medium">{area.name}</p>
                          <p className="text-sm text-gray-500">{area.reason}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {area.questionCount} questions
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Not Applicable Areas */}
            {summary.notApplicableAreas.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="font-semibold text-lg text-gray-600">Not Applicable (Skipped)</h3>
                <div className="flex flex-wrap gap-2">
                  {summary.notApplicableAreas.map((area) => (
                    <span 
                      key={area.code}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600"
                    >
                      {area.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button 
              onClick={handleStartMainAssessment}
              className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-lg"
            >
              Continue to Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-gray-500 text-center">
              You can go back to change your answers or proceed to the compliance assessment
            </p>
          </CardFooter>
        </Card>
      </div>
    )
  }
  
  // Step 3: Main Questions
  const renderQuestion = () => {
    const q = currentQuestion
    const progress = ((currentQuestionIndex + 1) / filteredQuestions.length) * 100
    const categoryInfo = FOOD_BUSINESS_CATEGORIES[q.category]
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
              {categoryInfo?.name || q.category}
            </span>
            <span className="text-sm text-gray-500">
              {currentQuestionIndex + 1} of {filteredQuestions.length}
            </span>
          </div>
          <Progress value={progress} aria-label="Assessment progress" className="h-2 mb-4" />
          <CardTitle className="text-lg">{q.text}</CardTitle>
          {q.helpText && (
            <CardDescription className="flex items-start gap-2 mt-2">
              <Info className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              {q.helpText}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {q.type === 'yes_no' && (
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleAnswer('yes')}
                variant={responses[q.id] === 'yes' ? 'default' : 'outline'}
                className={`h-16 text-lg ${
                  responses[q.id] === 'yes' 
                    ? 'bg-green-700 hover:bg-green-800 text-white' 
                    : ''
                }`}
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                Yes
              </Button>
              <Button
                onClick={() => handleAnswer('no')}
                variant={responses[q.id] === 'no' ? 'default' : 'outline'}
                className={`h-16 text-lg ${
                  responses[q.id] === 'no' 
                    ? 'bg-red-700 hover:bg-red-800 text-white' 
                    : ''
                }`}
              >
                <XCircle className="mr-2 h-5 w-5" />
                No
              </Button>
            </div>
          )}
          
          {q.type === 'multiple_choice' && q.options && (
            <div className="space-y-2">
              {q.options.map((opt) => (
                <Button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  variant={responses[q.id] === opt ? 'default' : 'outline'}
                  className={`w-full justify-start h-auto py-3 px-4 text-left ${
                    responses[q.id] === opt 
                      ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                      : ''
                  }`}
                >
                  {opt}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
  
  // Step 4: Results
  const renderResults = () => {
    if (!results) return null
    
    const getScoreColor = (score: number) => {
      if (score >= 80) return 'text-green-600'
      if (score >= 60) return 'text-amber-500'
      return 'text-red-600'
    }
    
    const getScoreBg = (score: number) => {
      if (score >= 80) return 'bg-green-100'
      if (score >= 60) return 'bg-amber-100'
      return 'bg-red-100'
    }
    
    const getStatusText = (status: string) => {
      switch (status) {
        case 'compliant': return 'Compliant'
        case 'needs_attention': return 'Needs Attention'
        case 'non_compliant': return 'Non-Compliant'
        default: return status
      }
    }
    
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Score Card */}
        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Assessment Complete!</CardTitle>
            <CardDescription>
              Restaurant & Food Business Compliance Check for {userDetails?.companyName}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBg(results.overallScore)} mb-4`}>
              <span className={`text-5xl font-bold ${getScoreColor(results.overallScore)}`}>
                {results.overallScore}%
              </span>
            </div>
            <p className={`text-xl font-semibold ${getScoreColor(results.overallScore)}`}>
              {getStatusText(results.complianceStatus)}
            </p>
          </CardContent>
        </Card>
        
        {/* Category Scores */}
        <Card>
          <CardHeader>
            <CardTitle>Category-wise Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(results.categoryScores).map(([category, scores]) => {
                const categoryInfo = FOOD_BUSINESS_CATEGORIES[category]
                return (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{categoryInfo?.name || category}</span>
                      <span className={getScoreColor(scores.percentage)}>{scores.percentage}%</span>
                    </div>
                    <Progress 
                      value={scores.percentage} 
                      className="h-2"
                      aria-label={`${category} compliance`}
                    />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Action Items */}
        {results.actionItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Priority Action Items ({results.actionItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.actionItems.slice(0, 10).map((item) => (
                  <div 
                    key={item.questionId}
                    className={`p-3 rounded-lg border-l-4 ${
                      item.priority === 'high' 
                        ? 'border-red-500 bg-red-50' 
                        : item.priority === 'medium'
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-blue-500 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        item.priority === 'high' 
                          ? 'bg-red-100 text-red-700' 
                          : item.priority === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">{FOOD_BUSINESS_CATEGORIES[item.category]?.name}</span>
                    </div>
                    <p className="mt-1 text-sm">{item.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => assessmentId && router.push(`/results/${assessmentId}`)}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                <Download className="mr-2 h-4 w-4" />
                View Full Report & Download PDF
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/')}
                className="flex-1"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AssessmentHeader 
        title="Restaurant & Food Business Compliance Check"
        subtitle="FSSAI, GST, Fire Safety, Labour & Liquor Compliance"
      />
      
      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {isSubmitting && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-80">
              <CardContent className="pt-6 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
                <p className="font-medium">Analysing your responses...</p>
                <p className="text-sm text-gray-500 mt-1">Generating compliance report</p>
              </CardContent>
            </Card>
          </div>
        )}
        
        {currentStep === 'details' && renderDetailsForm()}
        {currentStep === 'applicability' && renderApplicabilityQuestion()}
        {currentStep === 'summary' && renderSummary()}
        {currentStep === 'questions' && renderQuestion()}
        {currentStep === 'results' && renderResults()}
      </main>
    </div>
  )
}
