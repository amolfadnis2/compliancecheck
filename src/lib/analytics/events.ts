/**
 * PostHog Event Schema for ComplianceCheck
 * Type-safe event definitions for all analytics tracking
 */

import { ASSESSMENT_TYPES, type AssessmentType as BaseAssessmentType } from '@/lib/constants/assessment-types';

// =============================================================================
// ASSESSMENT TYPES - Re-export from single source of truth
// =============================================================================

// Use the canonical types from constants file
export type AssessmentType = BaseAssessmentType | 'auto_dealer' | 'code_on_wages' | 'social_security' | 'osh_code' | 'industrial_relations';

// Re-export for convenience
export { ASSESSMENT_TYPES };

export type UserTier = 'free' | 'pro' | 'enterprise';

export type OrganizationSize = 
  | '1-10' 
  | '11-20' 
  | '21-50' 
  | '51-100' 
  | '101-250' 
  | '251-500' 
  | '500+';

export type IndustryType = 
  | 'technology'
  | 'manufacturing'
  | 'healthcare'
  | 'retail'
  | 'finance'
  | 'education'
  | 'hospitality'
  | 'construction'
  | 'logistics'
  | 'other';

// =============================================================================
// EVENT PROPERTY INTERFACES
// =============================================================================

export interface AssessmentStartedProps {
  assessment_type: AssessmentType;
  organization_industry?: string;
  organization_size?: OrganizationSize;
  user_tier: UserTier;
  question_count: number;
  filtered_question_count?: number;
}

export interface AssessmentProgressProps {
  assessment_type: AssessmentType;
  completion_percentage: number;
  questions_answered: number;
  current_category?: string;
  time_spent_seconds: number;
}

export interface AssessmentAbandonedProps {
  assessment_type: AssessmentType;
  completion_percentage: number;
  last_question_id?: string;
  last_category?: string;
  time_spent_seconds: number;
  questions_answered: number;
}


export interface AssessmentCompletedProps {
  assessment_type: AssessmentType;
  compliance_score: number;
  gap_count: number;
  high_priority_gaps: number;
  medium_priority_gaps?: number;
  low_priority_gaps?: number;
  time_to_complete_seconds: number;
  questions_answered: number;
  questions_skipped: number;
  organization_industry?: string;
  organization_size?: OrganizationSize;
}

export interface ReportViewedProps {
  assessment_type: AssessmentType;
  compliance_score: number;
  assessment_id?: string;
}

export interface ReportDownloadedProps {
  assessment_type: AssessmentType;
  format: 'pdf';
  compliance_score: number;
  assessment_id?: string;
  user_tier: UserTier;
}

export interface ReportEmailedProps {
  assessment_type: AssessmentType;
  compliance_score: number;
  assessment_id?: string;
  user_tier: UserTier;
}

export interface DocumentGeneratedProps {
  document_type: 'policy' | 'letter' | 'certificate' | 'consent_form';
  template_id: string;
  from_assessment: boolean;
  assessment_type?: AssessmentType;
}


// =============================================================================
// CONVERSION EVENTS
// =============================================================================

export interface FeatureGateHitProps {
  feature: 'pdf_export' | 'assessment_limit' | 'user_limit' | 'templates' | 'api_access';
  current_tier: UserTier;
  attempted_action: string;
  assessment_type?: AssessmentType;
}

export interface PricingPageViewedProps {
  source: 'feature_gate' | 'navbar' | 'dashboard_banner' | 'assessment_complete' | 'direct';
  current_tier: UserTier;
}

export interface CheckoutStartedProps {
  plan: 'pro' | 'enterprise';
  billing_cycle: 'monthly' | 'annual';
  source: string;
  current_tier: UserTier;
}

export interface SubscriptionUpgradedProps {
  from_tier: UserTier;
  to_tier: UserTier;
  billing_cycle: 'monthly' | 'annual';
  revenue_inr: number;
  payment_method?: string;
}

export interface SubscriptionCancelledProps {
  tier: UserTier;
  tenure_days: number;
  reason?: string;
  feedback?: string;
}


// =============================================================================
// USER LIFECYCLE EVENTS
// =============================================================================

export interface UserSignedUpProps {
  method: 'email' | 'google' | 'magic_link';
  referral_source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface UserLoggedInProps {
  method: 'email' | 'google' | 'magic_link';
}

export interface OrganizationCreatedProps {
  industry: string;
  employee_count: OrganizationSize;
  state: string;
  has_gstin: boolean;
}

export interface UserInvitedProps {
  inviter_role: 'admin' | 'editor';
  organization_size: number;
}

// =============================================================================
// FEEDBACK EVENTS
// =============================================================================

export interface FeedbackSubmittedProps {
  assessment_type: AssessmentType;
  nps_score: number;
  would_recommend: boolean;
  found_valuable?: boolean;
  ui_rating?: 'excellent' | 'good' | 'average' | 'poor';
  report_quality?: 'excellent' | 'good' | 'average' | 'poor';
  desired_features?: string[];
  has_comments: boolean;
}


// =============================================================================
// EVENT NAMES (for consistent naming across codebase)
// =============================================================================

export const ANALYTICS_EVENTS = {
  // Assessment lifecycle
  ASSESSMENT_STARTED: 'assessment_started',
  ASSESSMENT_PROGRESS: 'assessment_progress',
  ASSESSMENT_ABANDONED: 'assessment_abandoned',
  ASSESSMENT_COMPLETED: 'assessment_completed',
  
  // Reports & documents
  REPORT_VIEWED: 'report_viewed',
  REPORT_DOWNLOADED: 'report_downloaded',
  REPORT_EMAILED: 'report_emailed',
  DOCUMENT_GENERATED: 'document_generated',
  
  // Conversion funnel
  FEATURE_GATE_HIT: 'feature_gate_hit',
  PRICING_PAGE_VIEWED: 'pricing_page_viewed',
  CHECKOUT_STARTED: 'checkout_started',
  SUBSCRIPTION_UPGRADED: 'subscription_upgraded',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  
  // User lifecycle
  USER_SIGNED_UP: 'user_signed_up',
  USER_LOGGED_IN: 'user_logged_in',
  ORGANIZATION_CREATED: 'organization_created',
  USER_INVITED: 'user_invited',
  
  // Feedback
  FEEDBACK_SUBMITTED: 'feedback_submitted',
} as const;

export type AnalyticsEventName = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];
