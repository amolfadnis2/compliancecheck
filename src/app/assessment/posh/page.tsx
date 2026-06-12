'use client'

/**
 * ComplianceCheck - POSH Act 2013 Compliance Assessment Page
 * 
 * Two-phase assessment:
 * - Phase 1: Applicability questions (determine what applies)
 * - Phase 2: Compliance questions (assess current compliance)
 * 
 * Features:
 * - Dynamic question filtering based on company profile
 * - Auto-advance navigation
 * - PostHog event tracking
 * - Category-wise scoring
 * - Risk level assessment
 * - PDF report generation
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { generateUnifiedReportBlob } from '@/lib/pdf/unified-report-generator'
import { adaptPOSHResult } from '@/lib/pdf/report-data-adapter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Download, 
  Mail,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Building2,
  AlertCircle,
  HelpCircle
} from 'lucide-react'
import { AssessmentHeader } from '@/components/assessment/assessment-header'
import { POSHProgressSection } from '@/components/assessment/posh-progress-section'
import { EmailGate } from '@/components/identity/EmailGate'
import { PaymentGate } from '@/components/results/payment-gate'
import { shouldRequireEmailVerification } from '@/lib/feature-flags'
import { ASSESSMENT_TYPES } from '@/lib/constants/assessment-types'
import { analytics } from '@/lib/analytics/tracking'

// Import POSH data files
import {
  POSH_APPLICABILITY_QUESTIONS,
  determinePOSHApplicability,
  generatePOSHAssessmentProfile,
  type ApplicabilityResult,
  type POSHAssessmentProfile
} from '@/lib/assessments/posh/posh-applicability-questions'

import {
  ALL_POSH_QUESTIONS,
  POSH_CATEGORIES,
  RISK_LEVEL_INFO,
  type POSHQuestion,
  type POSHCategory
} from '@/lib/assessments/posh/posh-compliance-questions'

import {
  getRuleByQuestionId,
} from '@/lib/assessments/posh/posh-compliance-rules'

import {
  calculateProgressData,
  type ProgressData
} from '@/lib/assessments/posh/posh-progress-helpers'

// ============================================================================
// TYPES
// ============================================================================

interface CompanyDetails {
  fullName: string
  email: string
  phone: string
  companyName: string
}

interface CategoryScore {
  category: POSHCategory
  categoryName: string
  earnedPoints: number
  maxPoints: number
  percentage: number
  status: 'compliant' | 'needs_attention' | 'non_compliant'
  questionCount: number
  compliantCount: number
}

interface ActionItem {
  priority: 'high' | 'medium' | 'low'
  category: string
  questionId: string
  title: string
  description: string
  remediation: string[]
  governmentRef?: string
  officialLink?: string
  penalty?: string
  deadline?: string
}

interface AssessmentResults {
  overallScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  categoryScores: CategoryScore[]
  actionItems: ActionItem[]
  compliantItems: { questionId: string; category: string; text: string }[]
  nonCompliantItems: { questionId: string; category: string; text: string }[]
  applicabilityResults: ApplicabilityResult[]
  profile: POSHAssessmentProfile
}

// ============================================================================
// CONSTANTS
// ============================================================================

// PostHog event names
const POSTHOG_EVENTS = {
  ASSESSMENT_STARTED: 'posh_assessment_started',
  APPLICABILITY_COMPLETED: 'posh_applicability_completed',
  QUESTION_ANSWERED: 'posh_question_answered',
  CATEGORY_COMPLETED: 'posh_category_completed',
  ASSESSMENT_COMPLETED: 'posh_assessment_completed',
  ASSESSMENT_ABANDONED: 'posh_assessment_abandoned',
  REPORT_DOWNLOADED: 'posh_report_downloaded',
  REPORT_EMAILED: 'posh_report_emailed',
  ASSESSMENT_ERROR: 'posh_assessment_error',
}

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const companyDetailsSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  companyName: z.string().min(2, 'Company name is required').max(200),
})

type CompanyDetailsForm = z.infer<typeof companyDetailsSchema>

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getStatusColor(status: 'compliant' | 'needs_attention' | 'non_compliant'): string {
  const colors = {
    compliant: 'text-green-600',
    needs_attention: 'text-amber-500',
    non_compliant: 'text-red-600',
  }
  return colors[status]
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function POSHAssessmentPage() {
  const router = useRouter()
  
  // -------------------------------------------------------------------------
  // STATE
  // -------------------------------------------------------------------------
  
  // Phase tracking: 'details' | 'applicability' | 'compliance' | 'results'
  const [phase, setPhase] = useState<'details' | 'applicability' | 'compliance' | 'results'>('details')
  
  // Company details
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null)
  
  // Applicability phase
  const [applicabilityResponses, setApplicabilityResponses] = useState<Record<string, string>>({})
  const [currentApplicabilityIndex, setCurrentApplicabilityIndex] = useState(0)
  const [applicabilityResults, setApplicabilityResults] = useState<ApplicabilityResult[]>([])
  const [assessmentProfile, setAssessmentProfile] = useState<POSHAssessmentProfile | null>(null)
  
  // Compliance phase
  const [complianceResponses, setComplianceResponses] = useState<Record<string, string>>({})
  const [currentComplianceIndex, setCurrentComplianceIndex] = useState(0)
  const [filteredQuestions, setFilteredQuestions] = useState<POSHQuestion[]>([])
  
  // Navigation history for back button
  const [canGoBack, setCanGoBack] = useState(false)
  
  // Results
  const [results, setResults] = useState<AssessmentResults | null>(null)
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedHelpText, setExpandedHelpText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isEmailingSaving, setIsEmailingSaving] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null)

  // Email gate: POSH is a paid assessment, always requires verification
  const gateRequired = shouldRequireEmailVerification(ASSESSMENT_TYPES.POSH)
  const [gateCleared, setGateCleared] = useState(false)
  const [paymentCleared, setPaymentCleared] = useState(false)
  
  // Timing
  const [startTime] = useState(Date.now())
  const [phaseStartTime, setPhaseStartTime] = useState(Date.now())
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const lastCategoryRef = useRef<string | null>(null)
  const categoryScoresRef = useRef<Record<string, { earned: number; max: number }>>({})
  const isCompletingRef = useRef(false)
  
  // Form
  const { register, handleSubmit, formState: { errors } } = useForm<CompanyDetailsForm>({
    resolver: zodResolver(companyDetailsSchema),
  })

  // -------------------------------------------------------------------------
  // DERIVED STATE
  // -------------------------------------------------------------------------
  
  // Get visible applicability questions (filter based on conditional logic)
  const visibleApplicabilityQuestions = POSH_APPLICABILITY_QUESTIONS.filter(q => {
    if (!q.conditionalOn) return true
    const { questionId, values } = q.conditionalOn
    return values.includes(applicabilityResponses[questionId])
  })
  
  const currentApplicabilityQuestion = visibleApplicabilityQuestions[currentApplicabilityIndex]
  const currentComplianceQuestion = filteredQuestions[currentComplianceIndex]
  
  // Progress calculation
  const applicabilityProgress = visibleApplicabilityQuestions.length > 0
    ? ((currentApplicabilityIndex + 1) / visibleApplicabilityQuestions.length) * 100
    : 0

  const complianceProgress = filteredQuestions.length > 0
    ? ((currentComplianceIndex + 1) / filteredQuestions.length) * 100
    : 0

  // Overall progress calculation (for two-tier progress system)
  // Details: 0%, Applicability: 5-30%, Compliance: 30-90%, Results: 100%
  const overallProgress = (() => {
    if (phase === 'details') return 0
    if (phase === 'applicability') return Math.round(5 + (applicabilityProgress * 0.25))
    if (phase === 'compliance') return Math.round(30 + (complianceProgress * 0.60))
    return 100 // results phase
  })()

  // Calculate enhanced progress data for compliance phase
  const progressData: ProgressData | null = phase === 'compliance' && filteredQuestions.length > 0
    ? calculateProgressData(filteredQuestions, currentComplianceIndex)
    : null

  // -------------------------------------------------------------------------
  // POSTHOG TRACKING
  // -------------------------------------------------------------------------
  
  const trackEvent = useCallback((event: string, properties: Record<string, string | number | boolean | undefined> = {}) => {
    analytics.trackEvent(event, { assessment_type: ASSESSMENT_TYPES.POSH, ...properties })
  }, [])

  // Track assessment start
  useEffect(() => {
    trackEvent(POSTHOG_EVENTS.ASSESSMENT_STARTED, {
      source: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      timestamp: new Date().toISOString(),
    })
    
    // Track abandonment on page leave
    const handleBeforeUnload = () => {
      if (phase !== 'results') {
        trackEvent(POSTHOG_EVENTS.ASSESSMENT_ABANDONED, {
          phase,
          last_question_id: phase === 'applicability' 
            ? currentApplicabilityQuestion?.id 
            : currentComplianceQuestion?.id,
          category: phase === 'compliance' ? currentComplianceQuestion?.category : undefined,
          completion_percentage: phase === 'applicability' 
            ? applicabilityProgress 
            : complianceProgress,
          time_spent_seconds: Math.floor((Date.now() - startTime) / 1000),
        })
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [phase, currentApplicabilityQuestion, currentComplianceQuestion, applicabilityProgress, complianceProgress, startTime, trackEvent])

  // Update canGoBack state based on current phase and question index
  useEffect(() => {
    // Always allow back navigation in applicability and compliance phases
    // Even from Q1, we can go back to previous phase
    const newCanGoBack = phase === 'applicability' || phase === 'compliance'
    console.log('[POSH] Back nav state update:', { phase, newCanGoBack, currentApplicabilityIndex, currentComplianceIndex })
    setCanGoBack(newCanGoBack)
  }, [phase, currentApplicabilityIndex, currentComplianceIndex])

  // -------------------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------------------
  
  // Handle company details submission
  const onCompanyDetailsSubmit = (data: CompanyDetailsForm) => {
    setCompanyDetails(data)
    setPhase('applicability')
    setPhaseStartTime(Date.now())
    setQuestionStartTime(Date.now())
  }
  
  // Handle back navigation - Applicability Phase
  const handleApplicabilityBack = () => {
    if (currentApplicabilityIndex > 0) {
      // Go to previous applicability question
      setCurrentApplicabilityIndex(prev => prev - 1)
      setQuestionStartTime(Date.now())
      
      trackEvent(POSTHOG_EVENTS.QUESTION_ANSWERED, {
        action: 'back_navigation',
        phase: 'applicability',
        from_question: currentApplicabilityIndex,
        to_question: currentApplicabilityIndex - 1,
      })
    } else {
      // Back from first applicability question goes to company details
      setPhase('details')
      
      trackEvent(POSTHOG_EVENTS.ASSESSMENT_ABANDONED, {
        reason: 'back_to_company_details',
        phase: 'applicability',
      })
    }
  }
  
  // Handle back navigation - Compliance Phase
  const handleComplianceBack = () => {
    if (currentComplianceIndex > 0) {
      // Go to previous compliance question
      setCurrentComplianceIndex(prev => prev - 1)
      setQuestionStartTime(Date.now())
      
      trackEvent(POSTHOG_EVENTS.QUESTION_ANSWERED, {
        action: 'back_navigation',
        phase: 'compliance',
        from_question: currentComplianceIndex,
        to_question: currentComplianceIndex - 1,
        category: currentComplianceQuestion?.category,
      })
    } else {
      // Back from first compliance question goes to applicability
      setPhase('applicability')
      setCurrentApplicabilityIndex(visibleApplicabilityQuestions.length - 1)
      
      trackEvent(POSTHOG_EVENTS.ASSESSMENT_ABANDONED, {
        reason: 'back_to_applicability',
        phase: 'compliance',
      })
    }
  }
  
  // Remove saved responses for conditional questions whose parent condition is no longer satisfied.
  // Must be called whenever an applicability answer changes, to avoid stale data reaching
  // determinePOSHApplicability() when the user navigates back and changes a parent answer.
  const cleanConditionalResponses = (responses: Record<string, string>): Record<string, string> => {
    const cleaned = { ...responses }
    POSH_APPLICABILITY_QUESTIONS.forEach(q => {
      if (q.conditionalOn) {
        const { questionId: condId, values } = q.conditionalOn
        if (!values.includes(cleaned[condId])) {
          delete cleaned[q.id]
        }
      }
    })
    return cleaned
  }

  // Handle applicability question answer
  const handleApplicabilityAnswer = (questionId: string, value: string) => {
    const timeOnQuestion = Math.floor((Date.now() - questionStartTime) / 1000)

    // Build updated responses and strip any now-hidden conditional answers
    const cleanedResponses = cleanConditionalResponses({ ...applicabilityResponses, [questionId]: value })
    setApplicabilityResponses(cleanedResponses)

    // Track question answered
    trackEvent(POSTHOG_EVENTS.QUESTION_ANSWERED, {
      question_id: questionId,
      phase: 'applicability',
      category: currentApplicabilityQuestion?.category,
      time_on_question_seconds: timeOnQuestion,
    })

    // Auto-advance after 800ms
    setTimeout(() => {
      // Recalculate visible questions using the cleaned responses
      const newVisibleQuestions = POSH_APPLICABILITY_QUESTIONS.filter(q => {
        if (!q.conditionalOn) return true
        const { questionId: condId, values } = q.conditionalOn
        return values.includes(cleanedResponses[condId])
      })

      const currentIdx = newVisibleQuestions.findIndex(q => q.id === questionId)

      if (currentIdx < newVisibleQuestions.length - 1) {
        setCurrentApplicabilityIndex(currentIdx + 1)
        setQuestionStartTime(Date.now())
      } else {
        // Complete applicability phase with clean, consistent responses
        completeApplicabilityPhase(cleanedResponses)
      }
    }, 800)
  }
  
  // Complete applicability phase and transition to compliance
  const completeApplicabilityPhase = async (responses: Record<string, string>) => {
    const timeSpent = Math.floor((Date.now() - phaseStartTime) / 1000)

    // Determine applicability
    const results = determinePOSHApplicability(responses)
    const profile = generatePOSHAssessmentProfile(responses)

    setApplicabilityResults(results)
    setAssessmentProfile(profile)

    // Track applicability completed
    trackEvent(POSTHOG_EVENTS.APPLICABILITY_COMPLETED, {
      employee_count: responses['POSH_APP_001'],
      industry: responses['POSH_APP_008'],
      state: responses['POSH_APP_006'],
      applicable_codes: results.filter(r => r.applies).map(r => r.code).join(','),
      time_spent_seconds: timeSpent,
      requires_full_assessment: profile.requiresFullAssessment,
      redirect_to_lcc: profile.redirectToLCC,
    })

    // Check if assessment is required
    if (profile.redirectToLCC) {
      const lccResults = {
        overallScore: 100,
        riskLevel: 'low' as const,
        categoryScores: [],
        actionItems: [],
        compliantItems: [],
        nonCompliantItems: [],
        applicabilityResults: results,
        profile,
      }
      setResults(lccResults)
      setPhase('results')
      // Save LCC assessment — awaited so errors surface in console
      try {
        await fetch('/api/assessment/posh-submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyDetails,
            applicabilityResponses: responses,
            complianceResponses: {},
            results: lccResults,
            assessmentType: ASSESSMENT_TYPES.POSH,
          }),
        })
      } catch (err) {
        console.error('LCC assessment save error:', err)
      }
      return
    }
    
    // Filter questions based on applicability
    const applicableCodes = results.filter(r => r.applies).map(r => r.code)
    const filtered = filterQuestionsForApplicability(applicableCodes, responses)
    setFilteredQuestions(filtered)
    
    // Transition to compliance phase
    setPhase('compliance')
    setPhaseStartTime(Date.now())
    setQuestionStartTime(Date.now())
    lastCategoryRef.current = null
    categoryScoresRef.current = {}
  }
  
  // Filter questions based on applicability results
  const filterQuestionsForApplicability = (
    applicableCodes: string[], 
    responses: Record<string, string>
  ): POSHQuestion[] => {
    // Start with all questions
    let questions = [...ALL_POSH_QUESTIONS]
    
    // Filter based on applicability codes
    questions = questions.filter(q => {
      // Always include core questions
      if (!q.applicabilityCode) return true
      // Include if matching applicability code
      return applicableCodes.includes(q.applicabilityCode)
    })
    
    // Filter based on conditional logic
    questions = questions.filter(q => {
      if (!q.conditionalOn) return true
      const { questionId, values } = q.conditionalOn
      // Check if condition question was answered with matching value
      return values.includes(responses[questionId]) || 
             values.includes(complianceResponses[questionId])
    })
    
    return questions
  }

  // Handle compliance question answer
  const handleComplianceAnswer = (questionId: string, value: string) => {
    const timeOnQuestion = Math.floor((Date.now() - questionStartTime) / 1000)
    const question = currentComplianceQuestion
    
    // Check if compliant
    const isCompliant = question?.compliantAnswers.includes(value) || false
    const isPartiallyCompliant = question?.partiallyCompliantAnswers?.includes(value) || false
    
    setComplianceResponses(prev => ({ ...prev, [questionId]: value }))
    
    // Update category scores
    if (question) {
      const cat = question.category
      if (!categoryScoresRef.current[cat]) {
        categoryScoresRef.current[cat] = { earned: 0, max: 0 }
      }
      categoryScoresRef.current[cat].max += question.weight
      if (isCompliant) {
        categoryScoresRef.current[cat].earned += question.weight
      } else if (isPartiallyCompliant) {
        categoryScoresRef.current[cat].earned += question.weight * 0.5
      }
    }
    
    // Track question answered
    trackEvent(POSTHOG_EVENTS.QUESTION_ANSWERED, {
      question_id: questionId,
      phase: 'compliance',
      category: question?.category,
      is_compliant: isCompliant,
      is_partially_compliant: isPartiallyCompliant,
      time_on_question_seconds: timeOnQuestion,
    })
    
    // Check for category completion
    if (lastCategoryRef.current && lastCategoryRef.current !== question?.category) {
      trackCategoryCompletion(lastCategoryRef.current)
    }
    lastCategoryRef.current = question?.category || null
    
    // Auto-advance after 800ms
    setTimeout(() => {
      if (currentComplianceIndex < filteredQuestions.length - 1) {
        setCurrentComplianceIndex(prev => prev + 1)
        setQuestionStartTime(Date.now())
      } else {
        // Track final category
        if (question?.category) {
          trackCategoryCompletion(question.category)
        }
        // Complete assessment
        completeAssessment()
      }
    }, 800)
  }
  
  // Track category completion
  const trackCategoryCompletion = (category: string) => {
    const scores = categoryScoresRef.current[category]
    if (!scores) return
    
    const percentage = scores.max > 0 ? Math.round((scores.earned / scores.max) * 100) : 100
    
    trackEvent(POSTHOG_EVENTS.CATEGORY_COMPLETED, {
      category,
      score: scores.earned,
      max_score: scores.max,
      compliance_percentage: percentage,
    })
  }
  
  // Complete assessment and calculate results
  const completeAssessment = async () => {
    if (isCompletingRef.current) return
    isCompletingRef.current = true
    setIsSubmitting(true)
    const totalTime = Math.floor((Date.now() - startTime) / 1000)
    
    try {
      // Calculate scores
      const assessmentResults = calculateResults()
      setResults(assessmentResults)
      
      // Track completion
      trackEvent(POSTHOG_EVENTS.ASSESSMENT_COMPLETED, {
        total_score: assessmentResults.overallScore,
        risk_level: assessmentResults.riskLevel,
        category_scores_json: JSON.stringify(assessmentResults.categoryScores.reduce((acc, cat) => ({
          ...acc,
          [cat.category]: cat.percentage,
        }), {})),
        total_time_seconds: totalTime,
        questions_answered: Object.keys(complianceResponses).length,
        action_items_count: assessmentResults.actionItems.length,
        high_priority_items: assessmentResults.actionItems.filter(a => a.priority === 'high').length,
      })
      
      // Set user properties
      if (companyDetails?.email) {
        analytics.identify(companyDetails.email, {
          last_posh_score: assessmentResults.overallScore,
          last_posh_risk_level: assessmentResults.riskLevel,
          first_posh_assessment_date: new Date().toISOString(),
        })
      }
      
      // Save to database
      await saveAssessment(assessmentResults)
      
      setPhase('results')
    } catch (err) {
      console.error('Assessment completion error:', err)
      trackEvent(POSTHOG_EVENTS.ASSESSMENT_ERROR, {
        error_type: 'completion_error',
        error_message: err instanceof Error ? err.message : 'Unknown error',
      })
      setError('Failed to complete assessment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Calculate assessment results
  const calculateResults = (): AssessmentResults => {
    const categoryScores: CategoryScore[] = []
    const actionItems: ActionItem[] = []
    const compliantItems: { questionId: string; category: string; text: string }[] = []
    const nonCompliantItems: { questionId: string; category: string; text: string }[] = []
    
    // Calculate per-category scores
    Object.entries(POSH_CATEGORIES).forEach(([categoryKey, categoryInfo]) => {
      const category = categoryKey as POSHCategory
      const categoryQuestions = filteredQuestions.filter(q => q.category === category)
      
      if (categoryQuestions.length === 0) return
      
      let earnedPoints = 0
      let maxPoints = 0
      let compliantCount = 0
      
      categoryQuestions.forEach(question => {
        const response = complianceResponses[question.id]
        maxPoints += question.weight
        
        const isCompliant = question.compliantAnswers.includes(response)
        const isPartiallyCompliant = question.partiallyCompliantAnswers?.includes(response) || false
        
        if (isCompliant) {
          earnedPoints += question.weight
          compliantCount++
          compliantItems.push({
            questionId: question.id,
            category: question.category,
            text: question.text,
          })
        } else if (isPartiallyCompliant) {
          earnedPoints += question.weight * 0.5
          nonCompliantItems.push({
            questionId: question.id,
            category: question.category,
            text: question.text,
          })
          
          // Generate action item
          const rule = getRuleByQuestionId(question.id)
          if (rule) {
            actionItems.push({
              priority: question.weight >= 4 ? 'high' : question.weight >= 2 ? 'medium' : 'low',
              category: question.category,
              questionId: question.id,
              title: rule.requirement,
              description: question.text,
              remediation: rule.actionIfNonCompliant,
              governmentRef: rule.governmentRef,
              officialLink: rule.officialLink,
              penalty: rule.penalty,
              deadline: rule.deadline,
            })
          }
        } else {
          nonCompliantItems.push({
            questionId: question.id,
            category: question.category,
            text: question.text,
          })
          
          // Generate action item
          const rule = getRuleByQuestionId(question.id)
          if (rule) {
            actionItems.push({
              priority: question.weight >= 4 ? 'high' : question.weight >= 2 ? 'medium' : 'low',
              category: question.category,
              questionId: question.id,
              title: rule.requirement,
              description: question.text,
              remediation: rule.actionIfNonCompliant,
              governmentRef: rule.governmentRef,
              officialLink: rule.officialLink,
              penalty: rule.penalty,
              deadline: rule.deadline,
            })
          }
        }
      })
      
      const percentage = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 100
      
      categoryScores.push({
        category,
        categoryName: categoryInfo.name,
        earnedPoints,
        maxPoints,
        percentage,
        status: percentage >= 90 ? 'compliant' : percentage >= 70 ? 'needs_attention' : 'non_compliant',
        questionCount: categoryQuestions.length,
        compliantCount,
      })
    })
    
    // Calculate overall score
    const totalEarned = categoryScores.reduce((sum, cat) => sum + cat.earnedPoints, 0)
    const totalMax = categoryScores.reduce((sum, cat) => sum + cat.maxPoints, 0)
    const overallScore = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 100
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical'
    if (overallScore >= 90) riskLevel = 'low'
    else if (overallScore >= 75) riskLevel = 'medium'
    else if (overallScore >= 60) riskLevel = 'high'
    else riskLevel = 'critical'
    
    // Sort action items by priority
    actionItems.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 }
      return order[a.priority] - order[b.priority]
    })
    
    return {
      overallScore,
      riskLevel,
      categoryScores,
      actionItems,
      compliantItems,
      nonCompliantItems,
      applicabilityResults,
      profile: assessmentProfile!,
    }
  }
  
  // Save assessment to database
  const saveAssessment = async (assessmentResults: AssessmentResults) => {
    try {
      const response = await fetch('/api/assessment/posh-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyDetails,
          applicabilityResponses,
          complianceResponses,
          results: assessmentResults,
          assessmentType: ASSESSMENT_TYPES.POSH,
        }),
      })
      
      const data = await response.json()
      
      if (data.success && data.assessmentId) {
        // Store in localStorage for results page
        localStorage.setItem(
          `posh_assessment_${data.assessmentId}`,
          JSON.stringify({
            companyDetails,
            applicabilityResponses,
            complianceResponses,
            results: assessmentResults,
            completedAt: new Date().toISOString(),
          })
        )
      }
      
      return data
    } catch (err) {
      console.error('Save assessment error:', err)
      throw err
    }
  }

  // Toggle help text expansion
  const toggleHelpText = (questionId: string) => {
    setExpandedHelpText(prev => prev === questionId ? null : questionId)
  }

  // Download PDF report - Uses comprehensive PDF generator
  const handleDownloadReport = async () => {
    if (!results || !companyDetails) return
    
    trackEvent(POSTHOG_EVENTS.REPORT_DOWNLOADED, {
      score: results.overallScore,
      risk_level: results.riskLevel,
      format: 'pdf',
    })
    analytics.reportDownloaded({
      assessment_type: 'posh',
      format: 'pdf',
      compliance_score: results.overallScore,
      user_tier: 'free',
    })

    try {
      // Map results to PDF generator format
      const poshResult = {
        overallScore: results.overallScore,
        riskLevel: RISK_LEVEL_INFO[results.riskLevel]?.label || results.riskLevel,
        penaltyExposure: RISK_LEVEL_INFO[results.riskLevel]?.penaltyExposure || 'Unknown',
        categoryScores: results.categoryScores.map(cat => ({
          category: cat.categoryName,
          score: cat.percentage,
          status: cat.status,
          questionCount: cat.questionCount,
          compliantCount: cat.compliantCount,
        })),
        actionItems: results.actionItems,
        compliantItems: results.compliantItems,
      }

      // Map applicability response values to readable labels
      const employeeCountLabels: Record<string, string> = {
        'below_10': 'Less than 10 employees',
        '10_to_49': '10-49 employees',
        '50_to_199': '50-199 employees',
        '200_to_499': '200-499 employees',
        '500_plus': '500+ employees',
      }
      
      const stateLabels: Record<string, string> = {
        'andhra_pradesh': 'Andhra Pradesh', 'assam': 'Assam', 'bihar': 'Bihar',
        'chhattisgarh': 'Chhattisgarh', 'delhi': 'Delhi NCT', 'goa': 'Goa',
        'gujarat': 'Gujarat', 'haryana': 'Haryana', 'himachal_pradesh': 'Himachal Pradesh',
        'jharkhand': 'Jharkhand', 'karnataka': 'Karnataka', 'kerala': 'Kerala',
        'madhya_pradesh': 'Madhya Pradesh', 'maharashtra': 'Maharashtra',
        'manipur': 'Manipur', 'meghalaya': 'Meghalaya', 'mizoram': 'Mizoram',
        'nagaland': 'Nagaland', 'odisha': 'Odisha', 'punjab': 'Punjab',
        'rajasthan': 'Rajasthan', 'sikkim': 'Sikkim', 'tamil_nadu': 'Tamil Nadu',
        'telangana': 'Telangana', 'tripura': 'Tripura', 'uttar_pradesh': 'Uttar Pradesh',
        'uttarakhand': 'Uttarakhand', 'west_bengal': 'West Bengal', 'other_ut': 'Other UT',
      }
      
      const industryLabels: Record<string, string> = {
        'it_services': 'IT Services / Software', 'bpo_ites': 'BPO / ITES',
        'manufacturing': 'Manufacturing', 'healthcare': 'Healthcare',
        'hospitality': 'Hospitality', 'retail': 'Retail / E-commerce',
        'education': 'Education', 'media_entertainment': 'Media / Entertainment',
        'banking_finance': 'Banking / Finance', 'construction': 'Construction',
        'logistics': 'Logistics', 'professional_services': 'Professional Services',
        'agriculture': 'Agriculture', 'ngo_nonprofit': 'NGO / Non-profit', 'other': 'Other',
      }

      const userDetails = {
        fullName: companyDetails.fullName,
        email: companyDetails.email,
        phone: companyDetails.phone,
        companyName: companyDetails.companyName,
        state: stateLabels[applicabilityResponses['POSH_APP_006']] || applicabilityResponses['POSH_APP_006'] || 'India',
        employeeCount: employeeCountLabels[applicabilityResponses['POSH_APP_001']] || applicabilityResponses['POSH_APP_001'] || 'Not specified',
        industry: industryLabels[applicabilityResponses['POSH_APP_008']] || applicabilityResponses['POSH_APP_008'] || 'Not specified',
      }

      const blob = generateUnifiedReportBlob(adaptPOSHResult(poshResult, userDetails))
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'POSH-Compliance-Report.pdf'
      a.click()
      URL.revokeObjectURL(url)

    } catch (err) {
      console.error('PDF generation error:', err)
      setError('Failed to generate report. Please try again.')
    }
  }

  // Email PDF report - Uses comprehensive PDF generator
  const handleEmailReport = async () => {
    if (!results || !companyDetails) return
    
    setIsEmailingSaving(true)
    setEmailSuccess(null)
    setError(null)
    
    try {
      // Map results to PDF generator format
      const poshResult = {
        overallScore: results.overallScore,
        riskLevel: RISK_LEVEL_INFO[results.riskLevel]?.label || results.riskLevel,
        penaltyExposure: RISK_LEVEL_INFO[results.riskLevel]?.penaltyExposure || 'Unknown',
        categoryScores: results.categoryScores.map(cat => ({
          category: cat.categoryName,
          score: cat.percentage,
          status: cat.status,
          questionCount: cat.questionCount,
          compliantCount: cat.compliantCount,
        })),
        actionItems: results.actionItems,
        compliantItems: results.compliantItems,
      }

      // Map applicability response values to readable labels
      const employeeCountLabels: Record<string, string> = {
        'below_10': 'Less than 10 employees',
        '10_to_49': '10-49 employees',
        '50_to_199': '50-199 employees',
        '200_to_499': '200-499 employees',
        '500_plus': '500+ employees',
      }
      
      const stateLabels: Record<string, string> = {
        'andhra_pradesh': 'Andhra Pradesh', 'assam': 'Assam', 'bihar': 'Bihar',
        'chhattisgarh': 'Chhattisgarh', 'delhi': 'Delhi NCT', 'goa': 'Goa',
        'gujarat': 'Gujarat', 'haryana': 'Haryana', 'himachal_pradesh': 'Himachal Pradesh',
        'jharkhand': 'Jharkhand', 'karnataka': 'Karnataka', 'kerala': 'Kerala',
        'madhya_pradesh': 'Madhya Pradesh', 'maharashtra': 'Maharashtra',
        'manipur': 'Manipur', 'meghalaya': 'Meghalaya', 'mizoram': 'Mizoram',
        'nagaland': 'Nagaland', 'odisha': 'Odisha', 'punjab': 'Punjab',
        'rajasthan': 'Rajasthan', 'sikkim': 'Sikkim', 'tamil_nadu': 'Tamil Nadu',
        'telangana': 'Telangana', 'tripura': 'Tripura', 'uttar_pradesh': 'Uttar Pradesh',
        'uttarakhand': 'Uttarakhand', 'west_bengal': 'West Bengal', 'other_ut': 'Other UT',
      }
      
      const industryLabels: Record<string, string> = {
        'it_services': 'IT Services / Software', 'bpo_ites': 'BPO / ITES',
        'manufacturing': 'Manufacturing', 'healthcare': 'Healthcare',
        'hospitality': 'Hospitality', 'retail': 'Retail / E-commerce',
        'education': 'Education', 'media_entertainment': 'Media / Entertainment',
        'banking_finance': 'Banking / Finance', 'construction': 'Construction',
        'logistics': 'Logistics', 'professional_services': 'Professional Services',
        'agriculture': 'Agriculture', 'ngo_nonprofit': 'NGO / Non-profit', 'other': 'Other',
      }

      const userDetails = {
        fullName: companyDetails.fullName,
        email: companyDetails.email,
        phone: companyDetails.phone,
        companyName: companyDetails.companyName,
        state: stateLabels[applicabilityResponses['POSH_APP_006']] || applicabilityResponses['POSH_APP_006'] || 'India',
        employeeCount: employeeCountLabels[applicabilityResponses['POSH_APP_001']] || applicabilityResponses['POSH_APP_001'] || 'Not specified',
        industry: industryLabels[applicabilityResponses['POSH_APP_008']] || applicabilityResponses['POSH_APP_008'] || 'Not specified',
      }

      const pdfBlob = generateUnifiedReportBlob(adaptPOSHResult(poshResult, userDetails))
      
      // Convert blob to base64
      const reader = new FileReader()
      const pdfBase64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1]
          resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(pdfBlob)
      })

      // Send email via API
      const response = await fetch('/api/email/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: companyDetails.email,
          pdfBase64,
          companyName: companyDetails.companyName,
          score: results.overallScore,
          assessmentType: 'posh',
        }),
      })

      const data = await response.json()

      if (data.success) {
        setEmailSuccess(companyDetails.email)
        
        trackEvent(POSTHOG_EVENTS.REPORT_EMAILED, {
          score: results.overallScore,
          risk_level: results.riskLevel,
          format: 'email',
          email_sent: true,
        })
        analytics.reportEmailed({
          assessment_type: 'posh',
          compliance_score: results.overallScore,
          user_tier: 'free',
        })
      } else {
        throw new Error(data.error || 'Failed to send email')
      }
      
    } catch (err) {
      console.error('Email send error:', err)
      setError('Failed to send email. Please try again or download the report.')
    } finally {
      setIsEmailingSaving(false)
    }
  }

  // -------------------------------------------------------------------------
  // RENDER: COMPANY DETAILS FORM (Phase: details)
  // -------------------------------------------------------------------------
  
  const renderCompanyDetailsForm = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <CardTitle>Company Details</CardTitle>
            <CardDescription>Tell us about your organization to personalize the assessment</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onCompanyDetailsSubmit)} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input 
              id="fullName" 
              {...register('fullName')} 
              placeholder="John Doe" 
              aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            />
            {errors.fullName && (
              <p id="fullName-error" className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input 
              id="email" 
              type="email" 
              {...register('email')} 
              placeholder="john@company.com" 
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number *</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                +91
              </span>
              <Input 
                id="phone" 
                {...register('phone')} 
                placeholder="9876543210" 
                className="rounded-l-none" 
                aria-describedby={errors.phone ? 'phone-error' : undefined}
              />
            </div>
            {errors.phone && (
              <p id="phone-error" className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input 
              id="companyName" 
              {...register('companyName')} 
              placeholder="ABC Pvt Ltd" 
              aria-describedby={errors.companyName ? 'companyName-error' : undefined}
            />
            {errors.companyName && (
              <p id="companyName-error" className="text-sm text-red-500">{errors.companyName.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800">
            Start Assessment
          </Button>
        </form>
      </CardContent>
    </Card>
  )

  // -------------------------------------------------------------------------
  // RENDER: APPLICABILITY QUESTIONS (Phase: applicability)
  // -------------------------------------------------------------------------
  
  const renderApplicabilityQuestion = () => {
    const question = currentApplicabilityQuestion
    if (!question) return null
    
    console.log('[POSH] Rendering applicability question:', { canGoBack, phase, currentApplicabilityIndex })
    
    return (
      <>
        {/* Enhanced Progress Section for Applicability */}
        <div className="bg-white border-b p-4 sticky top-0 z-10 shadow-sm">
          {/* Overall Progress */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 font-medium">Applicability Check Progress</span>
            <span className="text-sm font-semibold text-gray-900">
              {Math.round(applicabilityProgress)}%
            </span>
          </div>
          
          <div 
            className="relative h-2 bg-gray-200 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(applicabilityProgress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Applicability check progress: ${Math.round(applicabilityProgress)}%`}
          >
            {/* Progress fill */}
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${applicabilityProgress}%` }}
            />
          </div>
          
          {/* Current Question Indicator */}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-800">
              Question {currentApplicabilityIndex + 1} of {visibleApplicabilityQuestions.length}
            </span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
              Phase 1: Applicability
            </span>
          </div>
        </div>
        
        <Card className="max-w-2xl mx-auto mt-6">
          <CardHeader>
            <CardTitle className="text-lg">{question.text}</CardTitle>
          {question.helpText && (
            <div className="mt-2">
              <button
                onClick={() => toggleHelpText(question.id)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                aria-expanded={expandedHelpText === question.id}
              >
                <HelpCircle className="h-4 w-4" />
                {expandedHelpText === question.id ? 'Hide details' : 'More details'}
                {expandedHelpText === question.id ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {expandedHelpText === question.id && (
                <CardDescription className="mt-2 p-3 bg-blue-50 rounded-lg">
                  {question.helpText}
                </CardDescription>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {question.type === 'yes_no' && (
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleApplicabilityAnswer(question.id, 'yes')}
                variant={applicabilityResponses[question.id] === 'yes' ? 'default' : 'outline'}
                aria-pressed={applicabilityResponses[question.id] === 'yes'}
                className={`h-16 text-lg ${
                  applicabilityResponses[question.id] === 'yes'
                    ? 'bg-green-700 hover:bg-green-800 text-white'
                    : ''
                }`}
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                Yes
              </Button>
              <Button
                onClick={() => handleApplicabilityAnswer(question.id, 'no')}
                variant={applicabilityResponses[question.id] === 'no' ? 'default' : 'outline'}
                aria-pressed={applicabilityResponses[question.id] === 'no'}
                className={`h-16 text-lg ${
                  applicabilityResponses[question.id] === 'no'
                    ? 'bg-red-700 hover:bg-red-800 text-white'
                    : ''
                }`}
              >
                <XCircle className="mr-2 h-5 w-5" />
                No
              </Button>
            </div>
          )}
          
          {question.type === 'single_choice' && question.options && (
            <div className="space-y-3">
              {question.options.map((option) => (
                <Button
                  key={option.value}
                  onClick={() => handleApplicabilityAnswer(question.id, option.value)}
                  variant={applicabilityResponses[question.id] === option.value ? 'default' : 'outline'}
                  className={`w-full h-auto py-4 px-4 text-left justify-start whitespace-normal ${
                    applicabilityResponses[question.id] === option.value 
                      ? 'bg-blue-700 hover:bg-blue-800 text-white' 
                      : ''
                  }`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
        
        {/* Back Button */}
        {canGoBack && (
          <div className="px-6 pb-6">
            <button
              onClick={handleApplicabilityBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 
                         transition-colors focus:outline-none focus:ring-2 
                         focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2"
              aria-label={
                currentApplicabilityIndex === 0
                  ? "Go back to company details"
                  : "Go to previous question"
              }
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back</span>
            </button>
          </div>
        )}
      </Card>
      </>
    )
  }

  // -------------------------------------------------------------------------
  // RENDER: COMPLIANCE QUESTIONS (Phase: compliance)
  // -------------------------------------------------------------------------
  
  const renderComplianceQuestion = () => {
    const question = currentComplianceQuestion
    if (!question) return null
    
    const categoryInfo = POSH_CATEGORIES[question.category]
    
    return (
      <>
        {/* Enhanced Progress Section - Sticky at top */}
        {progressData && (
          <POSHProgressSection {...progressData} />
        )}
        
        <Card className="max-w-2xl mx-auto mt-6">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                {categoryInfo?.name || question.category}
              </span>
              <span className="text-sm text-gray-500">
                {currentComplianceIndex + 1} of {filteredQuestions.length}
              </span>
            </div>
            <CardTitle className="text-lg">{question.text}</CardTitle>
            {question.helpText && (
              <div className="mt-2">
                <button
                  onClick={() => toggleHelpText(question.id)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  aria-expanded={expandedHelpText === question.id}
                >
                  <HelpCircle className="h-4 w-4" />
                  {expandedHelpText === question.id ? 'Hide details' : 'More details'}
                  {expandedHelpText === question.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {expandedHelpText === question.id && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">{question.helpText}</p>
                    {question.governmentRef && (
                      <p className="text-xs text-gray-500 mt-2">
                        Reference: {question.governmentRef}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardHeader>
        <CardContent>
          {question.type === 'yes_no' && (
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleComplianceAnswer(question.id, 'yes')}
                disabled={isSubmitting}
                variant={complianceResponses[question.id] === 'yes' ? 'default' : 'outline'}
                aria-pressed={complianceResponses[question.id] === 'yes'}
                className={`h-16 text-lg ${
                  complianceResponses[question.id] === 'yes'
                    ? 'bg-green-700 hover:bg-green-800 text-white'
                    : ''
                }`}
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                Yes
              </Button>
              <Button
                onClick={() => handleComplianceAnswer(question.id, 'no')}
                disabled={isSubmitting}
                variant={complianceResponses[question.id] === 'no' ? 'default' : 'outline'}
                aria-pressed={complianceResponses[question.id] === 'no'}
                className={`h-16 text-lg ${
                  complianceResponses[question.id] === 'no'
                    ? 'bg-red-700 hover:bg-red-800 text-white'
                    : ''
                }`}
              >
                <XCircle className="mr-2 h-5 w-5" />
                No
              </Button>
            </div>
          )}


          {question.type === 'single_choice' && question.options && (
            <div className="space-y-3">
              {question.options.map((option) => (
                <Button
                  key={option.value}
                  onClick={() => handleComplianceAnswer(question.id, option.value)}
                  disabled={isSubmitting}
                  variant={complianceResponses[question.id] === option.value ? 'default' : 'outline'}
                  className={`w-full h-auto py-4 px-4 text-left justify-start whitespace-normal ${
                    complianceResponses[question.id] === option.value
                      ? 'bg-blue-700 hover:bg-blue-800 text-white'
                      : ''
                  }`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
        
        {/* Back Button */}
        {canGoBack && (
          <div className="px-6 pb-6">
            <button
              onClick={handleComplianceBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 
                         transition-colors focus:outline-none focus:ring-2 
                         focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2"
              aria-label={
                currentComplianceIndex === 0
                  ? "Go back to applicability questions"
                  : "Go to previous question"
              }
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back</span>
            </button>
          </div>
        )}
      </Card>
      </>
    )
  }

  // -------------------------------------------------------------------------
  // RENDER: RESULTS (Phase: results) - CONDENSED VIEW (P0-002)
  // Shows summary only; full details in PDF report
  // -------------------------------------------------------------------------
  
  const TOP_ITEMS_TO_SHOW = 3
  const highPriorityCount = results?.actionItems.filter(a => a.priority === 'high').length || 0
  
  const renderResults = () => {
    if (!results) return null

    // LCC redirect — no email/payment gate needed for "not applicable" result
    if (results.profile?.redirectToLCC) {
      return renderLCCInfo()
    }

    // Determine what the report CTA section should render.
    // Score, breakdown, and top-3 preview are ALWAYS shown so the user
    // sees value from the 20+ minutes they just invested before being asked
    // to verify email or pay.
    const renderReportCTA = () => {
      if (gateRequired && !gateCleared) {
        return (
          <div className="mt-4 space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              Verify your email to download the full report with detailed remediation steps, deadlines, and legal references.
            </div>
            <EmailGate
              source="posh_assessment"
              reason="Email me my POSH compliance report so I can refer back to it"
              onVerified={() => setGateCleared(true)}
              showMarketingConsent
              showDeadlineRemindersConsent
              ctaLabel="Verify email & get full report"
            />
          </div>
        )
      }

      if (!paymentCleared) {
        return (
          <div className="mt-4">
            <PaymentGate
              title="Download your full POSH compliance report"
              description="POSH Act 2013 compliance assessment"
              priceINR={999}
              features={[
                'Full gap analysis with remediation plan',
                'Priority-ranked action items',
                'POSH policy templates',
                'Downloadable PDF report',
                'Email report to your inbox',
              ]}
              onPaid={() => setPaymentCleared(true)}
            />
          </div>
        )
      }

      return (
        <>
          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleDownloadReport}
              className="flex-1 bg-blue-700 hover:bg-blue-800 h-12"
              disabled={isEmailingSaving}
            >
              <Download className="mr-2 h-5 w-5" />
              Download Full Report
            </Button>
            <Button
              onClick={handleEmailReport}
              variant="outline"
              className="flex-1 border-blue-700 text-blue-700 hover:bg-blue-50 h-12"
              disabled={isEmailingSaving}
            >
              {isEmailingSaving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-5 w-5" />
                  Email Report
                </>
              )}
            </Button>
          </div>
          {emailSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 mt-4">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700">
                Report sent to <strong>{emailSuccess}</strong>
              </p>
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 mt-4">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </>
      )
    }

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Score Card — always visible */}
        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">POSH Compliance Assessment Results</CardTitle>
            <CardDescription>{companyDetails?.companyName}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Overall Score */}
            <div className="text-center py-6">
              <div className={`text-6xl font-bold ${
                results.overallScore >= 90 ? 'text-green-600' :
                results.overallScore >= 70 ? 'text-amber-500' : 'text-red-600'
              }`}>
                {results.overallScore}%
              </div>
              <p className="text-gray-500 mt-2">Overall Compliance</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  results.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                  results.riskLevel === 'medium' ? 'bg-amber-100 text-amber-700' :
                  results.riskLevel === 'high' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {RISK_LEVEL_INFO[results.riskLevel]?.label || results.riskLevel}
                </span>
                <span className="text-sm text-gray-500">
                  · {RISK_LEVEL_INFO[results.riskLevel]?.penaltyExposure}
                </span>
              </div>
            </div>

            {/* Report CTA — email gate → payment gate → download buttons */}
            {renderReportCTA()}
          </CardContent>
        </Card>

        {/* Category Breakdown - Visual Bars Only */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.categoryScores.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate mr-2">{cat.categoryName}</span>
                    <span className={`font-semibold ${getStatusColor(cat.status)}`}>
                      {cat.percentage}%
                    </span>
                  </div>
                  <Progress 
                    value={cat.percentage} 
                    className={`h-2 ${
                      cat.status === 'compliant' ? '[&>div]:bg-green-500' :
                      cat.status === 'needs_attention' ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500'
                    }`}
                    aria-label={`${cat.categoryName} compliance: ${cat.percentage}%`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Items Preview - TOP 3 ONLY (Title + Reference) */}
        {results.actionItems.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
                {highPriorityCount} High Priority Issues Found
              </CardTitle>
              <CardDescription>
                Preview of top {Math.min(TOP_ITEMS_TO_SHOW, results.actionItems.length)} (full details in PDF):
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {results.actionItems.slice(0, TOP_ITEMS_TO_SHOW).map((item, index) => (
                  <div key={index} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded flex-shrink-0 ${
                        item.priority === 'high' ? 'bg-red-200 text-red-800' :
                        item.priority === 'medium' ? 'bg-amber-200 text-amber-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        {item.governmentRef && (
                          <p className="text-sm text-gray-500 mt-0.5">
                            → Ref: {item.governmentRef}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* NO steps, deadlines, penalties shown here */}
                  </div>
                ))}
              </div>
              
              {results.actionItems.length > TOP_ITEMS_TO_SHOW && (
                <p className="text-sm text-gray-500 mt-4 pt-3 border-t">
                  + {results.actionItems.length - TOP_ITEMS_TO_SHOW} more action items in full report
                </p>
              )}
              
              <Button 
                onClick={handleDownloadReport} 
                className="mt-4 w-full bg-blue-700 hover:bg-blue-800"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Full Report for Details
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Compliant Areas - COUNT ONLY */}
        {results.compliantItems.length > 0 && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-700 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {results.compliantItems.length} Areas Already Compliant
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              See full list in PDF report
            </p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-xs text-amber-800">
            <strong>Note:</strong> This assessment provides general guidance based on POSH Act 2013 requirements. 
            For comprehensive compliance, download the full report with detailed remediation steps, 
            deadlines, and legal references.
          </p>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // RENDER: LCC INFO (For organizations with <10 employees)
  // -------------------------------------------------------------------------
  
  const renderLCCInfo = () => (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <CardTitle>ICC Not Required</CardTitle>
              <CardDescription>Based on your employee count</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">Good News!</h4>
            <p className="text-sm text-green-700">
              Organizations with fewer than 10 employees are not required to constitute an 
              Internal Complaints Committee (ICC) under the POSH Act 2013.
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">What You Should Know</h4>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-2">
              <li>Complaints should be directed to the district-level Local Complaints Committee (LCC)</li>
              <li>Display LCC contact information at your workplace</li>
              <li>Inform all employees about the LCC complaint mechanism</li>
              <li>Maintain a safe and harassment-free workplace</li>
            </ul>
          </div>
          
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <h4 className="font-medium text-amber-800 mb-2">Important</h4>
            <p className="text-sm text-amber-700">
              If your employee count reaches 10 or more (including contract workers, interns, 
              and trainees), you will be required to constitute an ICC. Consider taking this 
              assessment again when your workforce grows.
            </p>
          </div>
          
          <Button 
            onClick={() => router.push('/')}
            className="w-full bg-blue-700 hover:bg-blue-800"
          >
            Explore Other Assessments
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  // -------------------------------------------------------------------------
  // RENDER: LOADING STATE
  // -------------------------------------------------------------------------
  
  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="h-12 w-12 animate-spin text-blue-700" />
      <p className="mt-4 text-gray-600">Processing your assessment...</p>
    </div>
  )

  // -------------------------------------------------------------------------
  // MAIN RENDER
  // -------------------------------------------------------------------------
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AssessmentHeader 
        title="POSH Compliance Assessment"
        subtitle="Sexual Harassment of Women at Workplace Act, 2013"
      />

      {/* Overall Progress Bar - Two-tier system */}
      {phase !== 'results' && (
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span className="font-medium">Overall Progress</span>
                <span className="font-semibold">{overallProgress}%</span>
              </div>
              <Progress 
                value={overallProgress} 
                className="h-3 [&>div]:bg-green-600"
                aria-label={`Overall assessment progress: ${overallProgress}% complete`}
              />
            </div>
          </div>
        </div>
      )}
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-700 hover:text-blue-800">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assessments
          </Link>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-700">{error}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setError(null)}
                className="ml-auto"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}
        
        {/* Phase-specific Content */}
        {isSubmitting && renderLoading()}
        
        {!isSubmitting && phase === 'details' && renderCompanyDetailsForm()}
        
        {!isSubmitting && phase === 'applicability' && renderApplicabilityQuestion()}
        
        {!isSubmitting && phase === 'compliance' && renderComplianceQuestion()}
        
        {!isSubmitting && phase === 'results' && renderResults()}
      </main>
    </div>
  )
}
