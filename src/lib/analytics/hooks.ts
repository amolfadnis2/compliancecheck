/**
 * React Hooks for PostHog Analytics
 * Convenient hooks for tracking within React components
 */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from './tracking';
import type { AssessmentType, UserTier, OrganizationSize } from './events';

// =============================================================================
// ASSESSMENT TRACKING HOOK
// =============================================================================

interface UseAssessmentTrackingOptions {
  assessmentType: AssessmentType;
  userTier?: UserTier;
  organizationIndustry?: string;
  organizationSize?: OrganizationSize;
  questionCount: number;
}

export function useAssessmentTracking(options: UseAssessmentTrackingOptions) {
  const startTimeRef = useRef<number>(Date.now());
  const hasStartedRef = useRef(false);
  const lastProgressRef = useRef(0);

  // Track assessment start (only once)
  const trackStart = useCallback(() => {
    if (hasStartedRef.current) return;
    
    hasStartedRef.current = true;
    startTimeRef.current = Date.now();
    
    analytics.assessmentStarted({
      assessment_type: options.assessmentType,
      user_tier: options.userTier || 'free',
      organization_industry: options.organizationIndustry,
      organization_size: options.organizationSize,
      question_count: options.questionCount,
    });
  }, [options]);


  // Track progress milestones
  const trackProgress = useCallback((
    questionsAnswered: number,
    currentCategory?: string
  ) => {
    const percentage = Math.round((questionsAnswered / options.questionCount) * 100);
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    
    // Only track at milestones and avoid duplicate tracking
    const milestones = [25, 50, 75];
    const currentMilestone = milestones.find(m => percentage >= m && lastProgressRef.current < m);
    
    if (currentMilestone) {
      lastProgressRef.current = currentMilestone;
      analytics.assessmentProgress({
        assessment_type: options.assessmentType,
        completion_percentage: currentMilestone,
        questions_answered: questionsAnswered,
        current_category: currentCategory,
        time_spent_seconds: timeSpent,
      });
    }
  }, [options]);

  // Track completion
  const trackComplete = useCallback((
    score: number,
    gaps: { high: number; medium?: number; low?: number },
    questionsAnswered: number,
    questionsSkipped: number
  ) => {
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    
    analytics.assessmentCompleted({
      assessment_type: options.assessmentType,
      compliance_score: score,
      gap_count: gaps.high + (gaps.medium || 0) + (gaps.low || 0),
      high_priority_gaps: gaps.high,
      medium_priority_gaps: gaps.medium,
      low_priority_gaps: gaps.low,
      time_to_complete_seconds: timeSpent,
      questions_answered: questionsAnswered,
      questions_skipped: questionsSkipped,
      organization_industry: options.organizationIndustry,
      organization_size: options.organizationSize,
    });
  }, [options]);


  // Track abandonment (call on unmount or navigation away)
  const trackAbandon = useCallback((
    questionsAnswered: number,
    lastQuestionId?: string,
    lastCategory?: string
  ) => {
    if (!hasStartedRef.current) return;
    
    const percentage = Math.round((questionsAnswered / options.questionCount) * 100);
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    
    // Don't track as abandoned if completed (100%)
    if (percentage < 100) {
      analytics.assessmentAbandoned({
        assessment_type: options.assessmentType,
        completion_percentage: percentage,
        last_question_id: lastQuestionId,
        last_category: lastCategory,
        time_spent_seconds: timeSpent,
        questions_answered: questionsAnswered,
      });
    }
  }, [options]);

  return {
    trackStart,
    trackProgress,
    trackComplete,
    trackAbandon,
    getTimeSpent: () => Math.round((Date.now() - startTimeRef.current) / 1000),
  };
}


// =============================================================================
// FEATURE GATE HOOK
// =============================================================================

interface UseFeatureGateOptions {
  feature: 'pdf_export' | 'assessment_limit' | 'user_limit' | 'templates' | 'api_access';
  currentTier: UserTier;
}

export function useFeatureGate(options: UseFeatureGateOptions) {
  const trackGateHit = useCallback((attemptedAction: string, assessmentType?: AssessmentType) => {
    analytics.featureGateHit({
      feature: options.feature,
      current_tier: options.currentTier,
      attempted_action: attemptedAction,
      assessment_type: assessmentType,
    });
  }, [options]);

  return { trackGateHit };
}

// =============================================================================
// PAGE VIEW TRACKING (for custom page views beyond auto-tracking)
// =============================================================================

export function usePageTracking(pageName: string) {
  const pathname = usePathname();
  
  useEffect(() => {
    // PostHog auto-tracks page views, but this allows custom naming
    if (typeof window !== 'undefined') {
      // Any additional page-specific tracking can go here
    }
  }, [pathname, pageName]);
}
