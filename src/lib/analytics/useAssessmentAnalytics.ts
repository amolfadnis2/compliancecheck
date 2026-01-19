/**
 * Assessment Analytics Hook
 * Provides easy-to-use tracking functions for assessment lifecycle events
 */

'use client'

import { useCallback, useRef, useEffect } from 'react'
import { analytics } from './tracking'
import type { AssessmentType, OrganizationSize, UserTier } from './events'

interface AssessmentContext {
  assessmentType: AssessmentType
  industry?: string
  employeeCount?: OrganizationSize
  state?: string
  questionCount: number
  userTier?: UserTier
}

interface UseAssessmentAnalyticsProps {
  assessmentType: AssessmentType
  userTier?: UserTier
}

export function useAssessmentAnalytics({ assessmentType, userTier = 'free' }: UseAssessmentAnalyticsProps) {
  const startTimeRef = useRef<number | null>(null)
  const hasTrackedStartRef = useRef(false)
  const lastMilestoneRef = useRef<number>(0)
  const contextRef = useRef<AssessmentContext | null>(null)

  // Reset on mount
  useEffect(() => {
    startTimeRef.current = null
    hasTrackedStartRef.current = false
    lastMilestoneRef.current = 0
    contextRef.current = null

    // Track abandonment on page unload
    const handleBeforeUnload = () => {
      if (hasTrackedStartRef.current && contextRef.current && lastMilestoneRef.current < 100) {
        const timeSpent = startTimeRef.current 
          ? Math.floor((Date.now() - startTimeRef.current) / 1000)
          : 0

        analytics.assessmentAbandoned({
          assessment_type: assessmentType,
          completion_percentage: lastMilestoneRef.current,
          time_spent_seconds: timeSpent,
          questions_answered: Math.floor((lastMilestoneRef.current / 100) * (contextRef.current?.questionCount || 0)),
        })
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [assessmentType])

  /**
   * Track when user starts the assessment (after Step 0 form submission)
   */
  const trackAssessmentStarted = useCallback((context: {
    industry?: string
    employeeCount?: string
    state?: string
    questionCount: number
  }) => {
    if (hasTrackedStartRef.current) return

    startTimeRef.current = Date.now()
    hasTrackedStartRef.current = true
    
    const orgSize = context.employeeCount as OrganizationSize | undefined
    
    contextRef.current = {
      assessmentType,
      industry: context.industry,
      employeeCount: orgSize,
      state: context.state,
      questionCount: context.questionCount,
      userTier,
    }

    analytics.assessmentStarted({
      assessment_type: assessmentType,
      organization_industry: context.industry,
      organization_size: orgSize,
      user_tier: userTier,
      question_count: context.questionCount,
    })
  }, [assessmentType, userTier])

  /**
   * Track progress at milestones (25%, 50%, 75%)
   */
  const trackProgress = useCallback((currentIndex: number, totalQuestions: number, currentCategory?: string) => {
    if (!hasTrackedStartRef.current) return

    const percentage = Math.round((currentIndex / totalQuestions) * 100)
    const milestone = percentage >= 75 ? 75 : percentage >= 50 ? 50 : percentage >= 25 ? 25 : 0

    // Only track if we've crossed a new milestone
    if (milestone > lastMilestoneRef.current) {
      lastMilestoneRef.current = milestone

      const timeSpent = startTimeRef.current 
        ? Math.floor((Date.now() - startTimeRef.current) / 1000)
        : 0

      analytics.assessmentProgress({
        assessment_type: assessmentType,
        completion_percentage: milestone,
        questions_answered: currentIndex,
        current_category: currentCategory,
        time_spent_seconds: timeSpent,
      })
    }
  }, [assessmentType])

  /**
   * Track when assessment is completed
   */
  const trackAssessmentCompleted = useCallback((results: {
    score: number
    gapCount: number
    highPriorityGaps?: number
    mediumPriorityGaps?: number
    lowPriorityGaps?: number
    questionsAnswered: number
    questionsSkipped?: number
  }) => {
    if (!hasTrackedStartRef.current) return

    const timeSpent = startTimeRef.current 
      ? Math.floor((Date.now() - startTimeRef.current) / 1000)
      : 0

    lastMilestoneRef.current = 100 // Mark as complete to prevent abandonment tracking

    analytics.assessmentCompleted({
      assessment_type: assessmentType,
      compliance_score: results.score,
      gap_count: results.gapCount,
      high_priority_gaps: results.highPriorityGaps || 0,
      medium_priority_gaps: results.mediumPriorityGaps,
      low_priority_gaps: results.lowPriorityGaps,
      time_to_complete_seconds: timeSpent,
      questions_answered: results.questionsAnswered,
      questions_skipped: results.questionsSkipped || 0,
      organization_industry: contextRef.current?.industry,
      organization_size: contextRef.current?.employeeCount,
    })
  }, [assessmentType])

  /**
   * Track when results page is viewed
   */
  const trackReportViewed = useCallback((params: {
    assessmentId?: string
    score: number
  }) => {
    analytics.reportViewed({
      assessment_type: assessmentType,
      compliance_score: params.score,
      assessment_id: params.assessmentId,
    })
  }, [assessmentType])

  /**
   * Track when PDF is downloaded
   */
  const trackReportDownloaded = useCallback((params: {
    assessmentId?: string
    score: number
  }) => {
    analytics.reportDownloaded({
      assessment_type: assessmentType,
      format: 'pdf',
      compliance_score: params.score,
      assessment_id: params.assessmentId,
      user_tier: userTier,
    })
  }, [assessmentType, userTier])

  /**
   * Track when report is emailed
   */
  const trackReportEmailed = useCallback((params: {
    assessmentId?: string
    score: number
  }) => {
    // Use generic tracking for email since it's not in the standard events
    analytics.trackEvent('report_emailed', {
      assessment_type: assessmentType,
      compliance_score: params.score,
      assessment_id: params.assessmentId,
      user_tier: userTier,
    })
  }, [assessmentType, userTier])

  return {
    trackAssessmentStarted,
    trackProgress,
    trackAssessmentCompleted,
    trackReportViewed,
    trackReportDownloaded,
    trackReportEmailed,
  }
}

export default useAssessmentAnalytics
