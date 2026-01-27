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
import { jsPDF } from 'jspdf'
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
  FileText,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Building2,
  Shield,
  ClipboardCheck,
  AlertCircle,
  HelpCircle
} from 'lucide-react'
import { AssessmentHeader } from '@/components/assessment/assessment-header'
import posthog from 'posthog-js'

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

function getCategoryDisplayName(category: POSHCategory): string {
  return POSH_CATEGORIES[category]?.name || category
}

function getStatusColor(status: 'compliant' | 'needs_attention' | 'non_compliant'): string {
  const colors = {
    compliant: 'text-green-600',
    needs_attention: 'text-amber-500',
    non_compliant: 'text-red-600',
  }
  return colors[status]
}

function getStatusBgColor(status: 'compliant' | 'needs_attention' | 'non_compliant'): string {
  const colors = {
    compliant: 'bg-green-100',
    needs_attention: 'bg-amber-100',
    non_compliant: 'bg-red-100',
  }
  return colors[status]
}

function getRiskLevelColor(level: 'low' | 'medium' | 'high' | 'critical'): string {
  const colors = {
    low: 'text-green-600',
    medium: 'text-amber-500',
    high: 'text-orange-600',
    critical: 'text-red-600',
  }
  return colors[level]
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
  
  // Results
  const [results, setResults] = useState<AssessmentResults | null>(null)
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedHelpText, setExpandedHelpText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isEmailingSaving, setIsEmailingSaving] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null)
  
  // Timing
  const [startTime] = useState(Date.now())
  const [phaseStartTime, setPhaseStartTime] = useState(Date.now())
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const lastCategoryRef = useRef<string | null>(null)
  const categoryScoresRef = useRef<Record<string, { earned: number; max: number }>>({})
  
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
    ? (currentApplicabilityIndex / visibleApplicabilityQuestions.length) * 100
    : 0
    
  const complianceProgress = filteredQuestions.length > 0
    ? (currentComplianceIndex / filteredQuestions.length) * 100
    : 0

  // -------------------------------------------------------------------------
  // POSTHOG TRACKING
  // -------------------------------------------------------------------------
  
  const trackEvent = useCallback((event: string, properties: Record<string, string | number | boolean | undefined> = {}) => {
    try {
      posthog.capture(event, {
        assessment_type: 'posh_compliance',
        ...properties,
      })
    } catch (err) {
      console.error('PostHog tracking error:', err)
    }
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
  
  // Handle applicability question answer
  const handleApplicabilityAnswer = (questionId: string, value: string) => {
    const timeOnQuestion = Math.floor((Date.now() - questionStartTime) / 1000)
    
    setApplicabilityResponses(prev => ({ ...prev, [questionId]: value }))
    
    // Track question answered
    trackEvent(POSTHOG_EVENTS.QUESTION_ANSWERED, {
      question_id: questionId,
      phase: 'applicability',
      category: currentApplicabilityQuestion?.category,
      time_on_question_seconds: timeOnQuestion,
    })
    
    // Auto-advance after 800ms
    setTimeout(() => {
      // Recalculate visible questions after response
      const newVisibleQuestions = POSH_APPLICABILITY_QUESTIONS.filter(q => {
        if (!q.conditionalOn) return true
        const { questionId: condId, values } = q.conditionalOn
        const responses = { ...applicabilityResponses, [questionId]: value }
        return values.includes(responses[condId])
      })
      
      const currentIdx = newVisibleQuestions.findIndex(q => q.id === questionId)
      
      if (currentIdx < newVisibleQuestions.length - 1) {
        setCurrentApplicabilityIndex(currentIdx + 1)
        setQuestionStartTime(Date.now())
      } else {
        // Complete applicability phase
        completeApplicabilityPhase({ ...applicabilityResponses, [questionId]: value })
      }
    }, 800)
  }
  
  // Complete applicability phase and transition to compliance
  const completeApplicabilityPhase = (responses: Record<string, string>) => {
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
      // Show LCC info instead of full assessment
      setPhase('results')
      setResults({
        overallScore: 100,
        riskLevel: 'low',
        categoryScores: [],
        actionItems: [],
        compliantItems: [],
        nonCompliantItems: [],
        applicabilityResults: results,
        profile,
      })
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
        posthog.identify(companyDetails.email, {
          $set: {
            last_posh_score: assessmentResults.overallScore,
            last_posh_risk_level: assessmentResults.riskLevel,
          },
          $set_once: {
            first_posh_assessment_date: new Date().toISOString(),
          },
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
          assessmentType: 'posh_compliance',
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

  // Download PDF report
  const handleDownloadReport = async () => {
    if (!results || !companyDetails) return
    
    trackEvent(POSTHOG_EVENTS.REPORT_DOWNLOADED, {
      score: results.overallScore,
      risk_level: results.riskLevel,
      format: 'pdf',
    })
    
    try {
      // Generate PDF using jsPDF (client-side)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20
      const contentWidth = pageWidth - 2 * margin
      let yPos = margin

      // Helper function for page breaks
      const checkPageBreak = (requiredSpace: number) => {
        if (yPos + requiredSpace > 270) {
          doc.addPage()
          yPos = margin
        }
      }

      // Header
      doc.setFontSize(24)
      doc.setTextColor(30, 64, 175)
      doc.text('POSH Compliance Assessment Report', margin, yPos)
      yPos += 10

      doc.setFontSize(10)
      doc.setTextColor(107, 114, 128)
      doc.text(`Sexual Harassment of Women at Workplace Act, 2013`, margin, yPos)
      yPos += 15

      // Company details
      doc.setFontSize(12)
      doc.setTextColor(17, 24, 39)
      doc.text(`Company: ${companyDetails.companyName}`, margin, yPos)
      yPos += 7
      doc.text(`Assessment Date: ${new Date().toLocaleDateString('en-IN')}`, margin, yPos)
      yPos += 15

      // Overall Score
      doc.setFontSize(16)
      doc.text('Overall Compliance Score', margin, yPos)
      yPos += 10

      const scoreColor = results.overallScore >= 90 ? [5, 150, 105] : 
                         results.overallScore >= 60 ? [217, 119, 6] : [220, 38, 38]
      doc.setFontSize(48)
      doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2])
      doc.text(`${results.overallScore}%`, margin, yPos)
      yPos += 15

      const statusText = results.overallScore >= 90 ? 'Fully Compliant' :
                         results.overallScore >= 60 ? 'Substantially Compliant' : 'Non-Compliant'
      doc.setFontSize(14)
      doc.text(statusText, margin, yPos)
      yPos += 15

      // Risk Level
      doc.setFontSize(12)
      doc.setTextColor(17, 24, 39)
      doc.text(`Risk Level: ${RISK_LEVEL_INFO[results.riskLevel]?.label}`, margin, yPos)
      yPos += 6
      doc.setFontSize(10)
      doc.setTextColor(107, 114, 128)
      doc.text(`Penalty Exposure: ${RISK_LEVEL_INFO[results.riskLevel]?.penaltyExposure}`, margin, yPos)
      yPos += 15

      // Category Scores
      checkPageBreak(80)
      doc.setFontSize(14)
      doc.setTextColor(17, 24, 39)
      doc.text('Category-wise Compliance', margin, yPos)
      yPos += 10

      doc.setFontSize(10)
      results.categoryScores.forEach((cat) => {
        checkPageBreak(15)
        const catColor = cat.percentage >= 90 ? [5, 150, 105] : 
                         cat.percentage >= 60 ? [217, 119, 6] : [220, 38, 38]
        
        doc.setTextColor(17, 24, 39)
        doc.text(`${cat.categoryName}:`, margin, yPos)
        doc.setTextColor(catColor[0], catColor[1], catColor[2])
        doc.text(`${cat.percentage}%`, margin + 100, yPos)
        yPos += 7
      })
      yPos += 10

      // Action Items
      if (results.actionItems.length > 0) {
        checkPageBreak(50)
        doc.setFontSize(14)
        doc.setTextColor(17, 24, 39)
        doc.text('Priority Action Items', margin, yPos)
        yPos += 10

        doc.setFontSize(9)
        results.actionItems.forEach((item, index) => {
          if (index >= 15) return // Limit to 15 items for PDF space
          
          checkPageBreak(20)
          const priorityColor = item.priority === 'high' ? [220, 38, 38] : 
                               item.priority === 'medium' ? [217, 119, 6] : [107, 114, 128]
          
          doc.setTextColor(priorityColor[0], priorityColor[1], priorityColor[2])
          doc.text(`${index + 1}. [${item.priority.toUpperCase()}]`, margin, yPos)
          
          doc.setTextColor(17, 24, 39)
          const lines = doc.splitTextToSize(item.description || item.title, contentWidth - 15)
          doc.text(lines, margin + 15, yPos)
          yPos += lines.length * 5 + 3
        })
      }

      // Footer
      yPos = 280
      doc.setFontSize(8)
      doc.setTextColor(107, 114, 128)
      doc.text('Generated by ComplianceCheck.co.in', margin, yPos)
      doc.text(new Date().toLocaleString('en-IN'), pageWidth - margin - 40, yPos)

      // Download
      const filename = `POSH_Compliance_Report_${companyDetails.companyName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
      doc.save(filename)
      
    } catch (err) {
      console.error('PDF generation error:', err)
      setError('Failed to generate report. Please try again.')
    }
  }

  // Email PDF report
  const handleEmailReport = async () => {
    if (!results || !companyDetails) return
    
    setIsEmailingSaving(true)
    setEmailSuccess(null)
    setError(null)
    
    try {
      // Generate PDF using jsPDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20
      const contentWidth = pageWidth - 2 * margin
      let yPos = margin

      // Helper function for page breaks
      const checkPageBreak = (requiredSpace: number) => {
        if (yPos + requiredSpace > 270) {
          doc.addPage()
          yPos = margin
        }
      }

      // Header
      doc.setFontSize(24)
      doc.setTextColor(30, 64, 175)
      doc.text('POSH Compliance Assessment Report', margin, yPos)
      yPos += 10

      doc.setFontSize(10)
      doc.setTextColor(107, 114, 128)
      doc.text('Sexual Harassment of Women at Workplace Act, 2013', margin, yPos)
      yPos += 15

      // Company details
      doc.setFontSize(12)
      doc.setTextColor(17, 24, 39)
      doc.text(`Company: ${companyDetails.companyName}`, margin, yPos)
      yPos += 7
      doc.text(`Assessment Date: ${new Date().toLocaleDateString('en-IN')}`, margin, yPos)
      yPos += 15

      // Overall Score
      doc.setFontSize(16)
      doc.text('Overall Compliance Score', margin, yPos)
      yPos += 10

      const scoreColor = results.overallScore >= 90 ? [5, 150, 105] : 
                         results.overallScore >= 60 ? [217, 119, 6] : [220, 38, 38]
      doc.setFontSize(48)
      doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2])
      doc.text(`${results.overallScore}%`, margin, yPos)
      yPos += 15

      const statusText = results.overallScore >= 90 ? 'Fully Compliant' :
                         results.overallScore >= 60 ? 'Substantially Compliant' : 'Non-Compliant'
      doc.setFontSize(14)
      doc.text(statusText, margin, yPos)
      yPos += 15

      // Risk Level
      doc.setFontSize(12)
      doc.setTextColor(17, 24, 39)
      doc.text(`Risk Level: ${RISK_LEVEL_INFO[results.riskLevel]?.label}`, margin, yPos)
      yPos += 6
      doc.setFontSize(10)
      doc.setTextColor(107, 114, 128)
      doc.text(`Penalty Exposure: ${RISK_LEVEL_INFO[results.riskLevel]?.penaltyExposure}`, margin, yPos)
      yPos += 15

      // Category Scores
      checkPageBreak(80)
      doc.setFontSize(14)
      doc.setTextColor(17, 24, 39)
      doc.text('Category-wise Compliance', margin, yPos)
      yPos += 10

      doc.setFontSize(10)
      results.categoryScores.forEach((cat) => {
        checkPageBreak(15)
        const catColor = cat.percentage >= 90 ? [5, 150, 105] : 
                         cat.percentage >= 60 ? [217, 119, 6] : [220, 38, 38]
        
        doc.setTextColor(17, 24, 39)
        doc.text(`${cat.categoryName}:`, margin, yPos)
        doc.setTextColor(catColor[0], catColor[1], catColor[2])
        doc.text(`${cat.percentage}%`, margin + 100, yPos)
        yPos += 7
      })
      yPos += 10

      // Action Items
      if (results.actionItems.length > 0) {
        checkPageBreak(50)
        doc.setFontSize(14)
        doc.setTextColor(17, 24, 39)
        doc.text('Priority Action Items', margin, yPos)
        yPos += 10

        doc.setFontSize(9)
        results.actionItems.slice(0, 20).forEach((item, index) => {
          checkPageBreak(20)
          const priorityColor = item.priority === 'high' ? [220, 38, 38] : 
                               item.priority === 'medium' ? [217, 119, 6] : [107, 114, 128]
          
          doc.setTextColor(priorityColor[0], priorityColor[1], priorityColor[2])
          doc.text(`${index + 1}. [${item.priority.toUpperCase()}]`, margin, yPos)
          
          doc.setTextColor(17, 24, 39)
          const lines = doc.splitTextToSize(item.description || item.title, contentWidth - 15)
          doc.text(lines, margin + 15, yPos)
          yPos += lines.length * 5 + 3
        })
      }

      // Government References
      checkPageBreak(40)
      doc.setFontSize(14)
      doc.setTextColor(17, 24, 39)
      doc.text('Government References', margin, yPos)
      yPos += 10
      
      doc.setFontSize(9)
      doc.setTextColor(107, 114, 128)
      doc.text('Ministry of Women & Child Development:', margin, yPos)
      yPos += 5
      doc.text('https://wcd.nic.in', margin + 5, yPos)
      yPos += 8
      doc.text('State Labour Department Portal:', margin, yPos)
      yPos += 5
      doc.text('Contact your State Labour Commissioner office', margin + 5, yPos)
      yPos += 15

      // Footer
      yPos = 280
      doc.setFontSize(8)
      doc.setTextColor(107, 114, 128)
      doc.text('Generated by ComplianceCheck.co.in', margin, yPos)
      doc.text(new Date().toLocaleString('en-IN'), pageWidth - margin - 40, yPos)

      // Convert to base64
      const pdfBase64 = doc.output('datauristring').split(',')[1]

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
        
        trackEvent(POSTHOG_EVENTS.REPORT_DOWNLOADED, {
          score: results.overallScore,
          risk_level: results.riskLevel,
          format: 'email',
          email_sent: true,
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
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Phase 1: Applicability Check
            </span>
            <span className="text-sm text-gray-500">
              {currentApplicabilityIndex + 1} of {visibleApplicabilityQuestions.length}
            </span>
          </div>
          <Progress 
            value={applicabilityProgress} 
            aria-label="Applicability check progress"
            className="h-2 mb-4"
          />
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
      </Card>
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
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              {categoryInfo?.name || question.category}
            </span>
            <span className="text-sm text-gray-500">
              {currentComplianceIndex + 1} of {filteredQuestions.length}
            </span>
          </div>
          <Progress 
            value={complianceProgress} 
            aria-label="Compliance assessment progress"
            className="h-2 mb-4"
          />
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
                variant={complianceResponses[question.id] === 'yes' ? 'default' : 'outline'}
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
                variant={complianceResponses[question.id] === 'no' ? 'default' : 'outline'}
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
      </Card>
    )
  }

  // -------------------------------------------------------------------------
  // RENDER: RESULTS (Phase: results)
  // -------------------------------------------------------------------------
  
  const renderResults = () => {
    if (!results) return null
    
    // Handle LCC redirect case
    if (results.profile?.redirectToLCC) {
      return renderLCCInfo()
    }
    
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Score Summary Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">POSH Compliance Assessment Results</CardTitle>
                <CardDescription>{companyDetails?.companyName}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleDownloadReport} 
                  className="bg-blue-700 hover:bg-blue-800"
                  disabled={isEmailingSaving}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
                <Button 
                  onClick={handleEmailReport} 
                  variant="outline"
                  className="border-blue-700 text-blue-700 hover:bg-blue-50"
                  disabled={isEmailingSaving}
                >
                  {isEmailingSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Email Report
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Success/Error Messages */}
            {emailSuccess && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-700">
                  Report successfully sent to <strong>{emailSuccess}</strong>
                </p>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Score */}
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className={`text-5xl font-bold ${
                  results.overallScore >= 90 ? 'text-green-600' :
                  results.overallScore >= 70 ? 'text-amber-500' : 'text-red-600'
                }`}>
                  {results.overallScore}%
                </div>
                <p className="text-gray-500 mt-2">Overall Compliance Score</p>
              </div>
              
              {/* Risk Level */}
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${getRiskLevelColor(results.riskLevel)}`}>
                  {RISK_LEVEL_INFO[results.riskLevel]?.label || results.riskLevel}
                </div>
                <p className="text-gray-500 mt-2">Risk Level</p>
                <p className="text-sm text-gray-400 mt-1">
                  {RISK_LEVEL_INFO[results.riskLevel]?.penaltyExposure}
                </p>
              </div>
              
              {/* Action Items Count */}
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-5xl font-bold text-gray-800">
                  {results.actionItems.length}
                </div>
                <p className="text-gray-500 mt-2">Action Items</p>
                <p className="text-sm text-red-500 mt-1">
                  {results.actionItems.filter(a => a.priority === 'high').length} High Priority
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Category-wise Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.categoryScores.map((cat) => (
                <div key={cat.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{cat.categoryName}</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm px-2 py-1 rounded ${getStatusBgColor(cat.status)} ${getStatusColor(cat.status)}`}>
                        {cat.percentage}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {cat.compliantCount}/{cat.questionCount} compliant
                      </span>
                    </div>
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

        {/* Action Items */}
        {results.actionItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Action Items ({results.actionItems.length})
              </CardTitle>
              <CardDescription>Prioritized list of compliance gaps to address</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.actionItems.map((item, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border-l-4 ${
                      item.priority === 'high' ? 'border-red-500 bg-red-50' :
                      item.priority === 'medium' ? 'border-amber-500 bg-amber-50' :
                      'border-blue-500 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            item.priority === 'high' ? 'bg-red-200 text-red-800' :
                            item.priority === 'medium' ? 'bg-amber-200 text-amber-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {item.priority.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">{getCategoryDisplayName(item.category as POSHCategory)}</span>
                        </div>
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        
                        {item.remediation && item.remediation.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-semibold text-gray-700 mb-1">Steps to Address:</p>
                            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                              {item.remediation.slice(0, 3).map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                          {item.deadline && (
                            <span>Deadline: {item.deadline}</span>
                          )}
                          {item.penalty && (
                            <span className="text-red-600">Penalty: {item.penalty}</span>
                          )}
                          {item.governmentRef && (
                            <span>Ref: {item.governmentRef}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Compliant Items */}
        {results.compliantItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Compliant Areas ({results.compliantItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {results.compliantItems.map((item) => (
                  <div key={item.questionId} className="flex items-start gap-2 p-2 bg-green-50 rounded">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <h4 className="font-medium">Download Your Report</h4>
                  <p className="text-sm text-gray-600">Get a detailed PDF report with all findings and remediation steps.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="h-5 w-5 text-green-700" />
                </div>
                <div>
                  <h4 className="font-medium">Address High Priority Items First</h4>
                  <p className="text-sm text-gray-600">Focus on high-priority action items to reduce immediate penalty risk.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ClipboardCheck className="h-5 w-5 text-purple-700" />
                </div>
                <div>
                  <h4 className="font-medium">Re-assess After Remediation</h4>
                  <p className="text-sm text-gray-600">After addressing gaps, take the assessment again to track improvement.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
            onClick={() => router.push('/assessments')} 
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
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/assessments" className="inline-flex items-center text-blue-700 hover:text-blue-800">
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
