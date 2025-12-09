'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, ArrowRight, CheckCircle, Save, Loader2, Shield, AlertTriangle } from 'lucide-react'
import { AssessmentHeader } from '@/components/assessment/assessment-header'
import { 
  getRelevantQuestions,
  PHASE_INFO,
  REVENUE_OPTIONS,
  type DPDPQuestion
} from '@/lib/assessments/dpdp-questions'
import { INDIAN_STATES, EMPLOYEE_COUNT_OPTIONS, INDUSTRY_OPTIONS } from '@/lib/constants'
import { ASSESSMENT_TYPES, getLocalStorageKey } from '@/lib/constants/assessment-types'

// Form validation schema for organization profile
const organizationProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  companyName: z.string().min(2, 'Company name is required'),
  state: z.string().min(1, 'Please select your state'),
  employeeCount: z.string().min(1, 'Please select employee count'),
  industry: z.string().min(1, 'Please select your industry'),
  revenue: z.string().min(1, 'Please select annual revenue'),
  processesChildrenData: z.enum(['yes', 'no']),
  processesHealthData: z.enum(['yes', 'no']),
  processesSensitiveData: z.enum(['yes', 'no'])
})

type OrganizationProfile = z.infer<typeof organizationProfileSchema>
type AssessmentResponse = Record<string, string>

// Local storage key
const STORAGE_KEY = 'dpdp_assessment_progress'

interface SavedProgress {
  step: number
  currentQuestionIndex: number
  responses: AssessmentResponse
  organizationProfile: OrganizationProfile | null
  savedAt: string
}

export default function DPDPAssessmentPage() {
  const router = useRouter()
  const [step, setStep] = useState(0) // 0 = profile, 1 = questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<AssessmentResponse>({})
  const [organizationProfile, setOrganizationProfile] = useState<OrganizationProfile | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [relevantQuestions, setRelevantQuestions] = useState<DPDPQuestion[]>([])

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<OrganizationProfile>({
    resolver: zodResolver(organizationProfileSchema),
  })

  // Get relevant questions based on organization profile
  useEffect(() => {
    if (organizationProfile) {
      const processesChildren = organizationProfile.processesChildrenData === 'yes'
      const questions = getRelevantQuestions(processesChildren)
      setRelevantQuestions(questions)
    }
  }, [organizationProfile])

  const totalQuestions = relevantQuestions.length
  const currentQuestion = relevantQuestions[currentQuestionIndex]
  const progressPercentage = step === 0 ? 0 : Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)

  // Current phase info
  const currentPhase = currentQuestion?.phase
  const currentPhaseInfo = currentPhase ? PHASE_INFO[currentPhase] : null

  // Load saved progress
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const progress: SavedProgress = JSON.parse(saved)
        const savedTime = new Date(progress.savedAt).getTime()
        const now = Date.now()
        if (now - savedTime < 24 * 60 * 60 * 1000) {
          setStep(progress.step)
          setCurrentQuestionIndex(progress.currentQuestionIndex)
          setResponses(progress.responses)
          if (progress.organizationProfile) {
            setOrganizationProfile(progress.organizationProfile)
            reset(progress.organizationProfile)
          }
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
        organizationProfile,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (e) {
      console.error('Error saving progress:', e)
      setSaveStatus('idle')
    }
  }, [step, currentQuestionIndex, responses, organizationProfile])

  useEffect(() => {
    if (step > 0) {
      saveProgress()
    }
  }, [responses, step, saveProgress])

  // Handle organization profile submission
  const onProfileSubmit = (data: OrganizationProfile) => {
    setOrganizationProfile(data)
    setStep(1)
    const processesChildren = data.processesChildrenData === 'yes'
    const questions = getRelevantQuestions(processesChildren)
    setRelevantQuestions(questions)
  }

  // Handle question response with auto-advance
  const handleResponse = (questionId: string, value: string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }))
    
    // Auto-advance after 800ms (matching other assessments)
    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1)
      }
    }, 800)
  }

  // Navigation handlers
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  // Submit assessment
  const handleAssessmentSubmit = async () => {
    if (!organizationProfile) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/assessment/dpdp-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationProfile,
          responses
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Clear saved progress
        localStorage.removeItem(STORAGE_KEY)
        
        // Save to localStorage for results page (in case DB fetch fails)
        const storageKey = getLocalStorageKey(data.assessmentId)
        const assessmentLocalData = {
          id: data.assessmentId,
          assessment_type: ASSESSMENT_TYPES.DPDP,
          organizationProfile,
          userDetails: organizationProfile, // Also save as userDetails for consistency
          responses: { answers: responses },
          overall_score: data.overallScore,
          category_scores: data.categoryScores,
          action_items: data.actionItems,
          created_at: new Date().toISOString()
        }
        console.log('[DPDP] Saving to localStorage:', storageKey, assessmentLocalData.id)
        localStorage.setItem(storageKey, JSON.stringify(assessmentLocalData))
        console.log('[DPDP] Saved. Navigating to:', `/results/${data.assessmentId}?type=${ASSESSMENT_TYPES.DPDP}`)
        
        // Navigate to results
        router.push(`/results/${data.assessmentId}?type=${ASSESSMENT_TYPES.DPDP}`)
      } else {
        // Fallback: save to localStorage and navigate
        const localId = `local_${Date.now()}`
        const assessmentData = {
          id: localId,
          assessment_type: ASSESSMENT_TYPES.DPDP,
          organizationProfile,
          userDetails: organizationProfile, // Also save as userDetails for consistency
          responses: { answers: responses },
          timestamp: new Date().toISOString()
        }
        localStorage.setItem(getLocalStorageKey(localId), JSON.stringify(assessmentData))
        router.push(`/results/${localId}?type=${ASSESSMENT_TYPES.DPDP}`)
      }
    } catch (error) {
      console.error('Submission error:', error)
      // Fallback to localStorage
      const localId = `local_${Date.now()}`
      const assessmentData = {
        id: localId,
        assessment_type: ASSESSMENT_TYPES.DPDP,
        organizationProfile,
        userDetails: organizationProfile, // Also save as userDetails for consistency
        responses: { answers: responses },
        timestamp: new Date().toISOString()
      }
      localStorage.setItem(getLocalStorageKey(localId), JSON.stringify(assessmentData))
      router.push(`/results/${localId}?type=${ASSESSMENT_TYPES.DPDP}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <AssessmentHeader 
        title="ComplianceCheck"
        subtitle="DPDP Gap Assessment"
        badgeText="FREE during Beta"
        badgeVariant="free"
      />

      <div className="container mx-auto px-4 max-w-4xl py-8">
        {/* Progress Bar (only show during questions) */}
        {step > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                {currentPhaseInfo && `Phase ${currentQuestion.phaseNumber}: ${currentPhaseInfo.label}`}
              </span>
              <span className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" aria-label={`Assessment progress: ${progressPercentage}% complete`} />
            <p className="text-xs text-gray-500 mt-1">{progressPercentage}% complete</p>
          </div>
        )}

        {/* Step 0: Organization Profile */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                Organization Profile
              </CardTitle>
              <CardDescription>
                Tell us about your organization to personalize the assessment (7 questions)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-6">
                {/* Full Name */}
                <div>
                  <Label htmlFor="fullName">Your Full Name</Label>
                  <Input
                    id="fullName"
                    {...register('fullName')}
                    placeholder="John Doe"
                    className="mt-1"
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-600 mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="john@company.com"
                    className="mt-1"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex mt-1">
                    <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                      +91
                    </span>
                    <Input
                      id="phone"
                      {...register('phone')}
                      placeholder="9876543210"
                      className="rounded-l-none"
                      maxLength={10}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                  )}
                </div>

                {/* Company Name */}
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    {...register('companyName')}
                    placeholder="Acme Technologies Pvt Ltd"
                    className="mt-1"
                  />
                  {errors.companyName && (
                    <p className="text-sm text-red-600 mt-1">{errors.companyName.message}</p>
                  )}
                </div>

                {/* State */}
                <div>
                  <Label htmlFor="state">State/UT</Label>
                  <Select onValueChange={(value) => setValue('state', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.state && (
                    <p className="text-sm text-red-600 mt-1">{errors.state.message}</p>
                  )}
                </div>

                {/* Employee Count */}
                <div>
                  <Label htmlFor="employeeCount">Number of Employees</Label>
                  <Select onValueChange={(value) => setValue('employeeCount', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select employee count" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYEE_COUNT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.employeeCount && (
                    <p className="text-sm text-red-600 mt-1">{errors.employeeCount.message}</p>
                  )}
                </div>

                {/* Industry */}
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select onValueChange={(value) => setValue('industry', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.industry && (
                    <p className="text-sm text-red-600 mt-1">{errors.industry.message}</p>
                  )}
                </div>

                {/* Annual Revenue */}
                <div>
                  <Label htmlFor="revenue">Annual Revenue</Label>
                  <Select onValueChange={(value) => setValue('revenue', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select annual revenue" />
                    </SelectTrigger>
                    <SelectContent>
                      {REVENUE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.revenue && (
                    <p className="text-sm text-red-600 mt-1">{errors.revenue.message}</p>
                  )}
                </div>

                {/* Data Type Questions */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-gray-900">Data Processing Profile</h3>
                  
                  {/* Children's Data */}
                  <div>
                    <Label>Do you process data of individuals under 18 years?</Label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          {...register('processesChildrenData')}
                          value="yes"
                          className="mr-2"
                        />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          {...register('processesChildrenData')}
                          value="no"
                          className="mr-2"
                        />
                        No
                      </label>
                    </div>
                    {errors.processesChildrenData && (
                      <p className="text-sm text-red-600 mt-1">{errors.processesChildrenData.message}</p>
                    )}
                  </div>

                  {/* Health Data */}
                  <div>
                    <Label>Do you process health or medical data?</Label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          {...register('processesHealthData')}
                          value="yes"
                          className="mr-2"
                        />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          {...register('processesHealthData')}
                          value="no"
                          className="mr-2"
                        />
                        No
                      </label>
                    </div>
                    {errors.processesHealthData && (
                      <p className="text-sm text-red-600 mt-1">{errors.processesHealthData.message}</p>
                    )}
                  </div>

                  {/* Sensitive Financial Data */}
                  <div>
                    <Label>Do you process sensitive financial data (banking, payment info)?</Label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          {...register('processesSensitiveData')}
                          value="yes"
                          className="mr-2"
                        />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          {...register('processesSensitiveData')}
                          value="no"
                          className="mr-2"
                        />
                        No
                      </label>
                    </div>
                    {errors.processesSensitiveData && (
                      <p className="text-sm text-red-600 mt-1">{errors.processesSensitiveData.message}</p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" size="lg">
                  Continue to Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Questions */}
        {step === 1 && currentQuestion && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="mb-2">
                  Phase {currentQuestion.phaseNumber}: {currentQuestion.phaseLabel}
                </Badge>
                <Badge variant="secondary">
                  Weight: {currentPhaseInfo?.weight ? `${(currentPhaseInfo.weight * 100).toFixed(0)}%` : ''}
                </Badge>
              </div>
              <CardTitle>{currentQuestion.text}</CardTitle>
              {currentQuestion.helpText && (
                <CardDescription className="flex items-start gap-2 mt-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>{currentQuestion.helpText}</span>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Answer Options */}
              <div className="space-y-3">
                {currentQuestion.type === 'yes_no' ? (
                  <>
                    <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                      <input
                        type="radio"
                        name={currentQuestion.id}
                        value="yes"
                        checked={responses[currentQuestion.id] === 'yes'}
                        onChange={(e) => handleResponse(currentQuestion.id, e.target.value)}
                        className="mr-3 h-4 w-4"
                      />
                      <span className="text-base">Yes</span>
                    </label>
                    <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                      <input
                        type="radio"
                        name={currentQuestion.id}
                        value="no"
                        checked={responses[currentQuestion.id] === 'no'}
                        onChange={(e) => handleResponse(currentQuestion.id, e.target.value)}
                        className="mr-3 h-4 w-4"
                      />
                      <span className="text-base">No</span>
                    </label>
                  </>
                ) : (
                  currentQuestion.options?.map((option) => (
                    <label 
                      key={option}
                      className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <input
                        type="radio"
                        name={currentQuestion.id}
                        value={option}
                        checked={responses[currentQuestion.id] === option}
                        onChange={(e) => handleResponse(currentQuestion.id, e.target.value)}
                        className="mr-3 h-4 w-4 mt-0.5"
                      />
                      <span className="text-base">{option}</span>
                    </label>
                  ))
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                {currentQuestionIndex === totalQuestions - 1 ? (
                  <Button
                    type="button"
                    onClick={handleAssessmentSubmit}
                    disabled={isSubmitting || !responses[currentQuestion.id]}
                    className="min-w-[140px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Complete
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Auto-advancing...
                  </div>
                )}
              </div>

              {/* Save Status */}
              {saveStatus === 'saved' && (
                <p className="text-sm text-green-600 text-center pt-2">
                  <CheckCircle className="h-4 w-4 inline mr-1" />
                  Progress saved
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Risk Warning */}
        {step === 0 && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-900 mb-1">DPDP Compliance Deadline</h4>
                <p className="text-sm text-amber-800">
                  Full enforcement begins <strong>May 13, 2027</strong>. Penalties up to ₹250 crore per violation. 
                  This assessment helps identify gaps before the deadline.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
