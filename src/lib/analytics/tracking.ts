/**
 * PostHog Analytics Tracking Utilities
 * Type-safe wrappers for all analytics events
 */

import posthog from 'posthog-js';
import {
  ANALYTICS_EVENTS,
  AssessmentStartedProps,
  AssessmentProgressProps,
  AssessmentAbandonedProps,
  AssessmentCompletedProps,
  ReportViewedProps,
  ReportDownloadedProps,
  ReportEmailedProps,
  DocumentGeneratedProps,
  FeatureGateHitProps,
  PricingPageViewedProps,
  CheckoutStartedProps,
  SubscriptionUpgradedProps,
  SubscriptionCancelledProps,
  UserSignedUpProps,
  UserLoggedInProps,
  OrganizationCreatedProps,
  UserInvitedProps,
  FeedbackSubmittedProps,
  UserTier,
  OrganizationSize,
} from './events';

// =============================================================================
// HELPER: Check if PostHog is initialized
// =============================================================================

const isPostHogReady = (): boolean => {
  return typeof window !== 'undefined' && posthog.__loaded;
};

// Use generic type to accept our typed props while satisfying posthog.capture
const safeCapture = <T extends object>(event: string, properties?: T) => {
  if (isPostHogReady()) {
    posthog.capture(event, properties as Record<string, unknown>);
  } else if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${event}`, properties);
  }
};


// =============================================================================
// USER IDENTIFICATION
// =============================================================================

export interface UserProperties {
  email?: string;
  name?: string;
  organization_id?: string;
  organization_name?: string;
  organization_industry?: string;
  organization_size?: OrganizationSize;
  subscription_tier?: UserTier;
  state?: string;
  created_at?: string;
  [key: string]: unknown;
}

export const identifyUser = (userId: string, properties?: UserProperties) => {
  if (isPostHogReady()) {
    posthog.identify(userId, properties);
  }
};

export const resetUser = () => {
  if (isPostHogReady()) {
    posthog.reset();
  }
};

export const setUserProperties = (properties: Partial<UserProperties>) => {
  if (isPostHogReady()) {
    posthog.people.set(properties);
  }
};


// =============================================================================
// ASSESSMENT TRACKING
// =============================================================================

export const trackAssessmentStarted = (props: AssessmentStartedProps) => {
  safeCapture(ANALYTICS_EVENTS.ASSESSMENT_STARTED, props);
};

export const trackAssessmentProgress = (props: AssessmentProgressProps) => {
  // Only track at 25%, 50%, 75% milestones to avoid event spam
  const milestones = [25, 50, 75];
  if (milestones.includes(props.completion_percentage)) {
    safeCapture(ANALYTICS_EVENTS.ASSESSMENT_PROGRESS, props);
  }
};

export const trackAssessmentAbandoned = (props: AssessmentAbandonedProps) => {
  safeCapture(ANALYTICS_EVENTS.ASSESSMENT_ABANDONED, props);
};

export const trackAssessmentCompleted = (props: AssessmentCompletedProps) => {
  safeCapture(ANALYTICS_EVENTS.ASSESSMENT_COMPLETED, props);
};

// =============================================================================
// REPORT & DOCUMENT TRACKING
// =============================================================================

export const trackReportViewed = (props: ReportViewedProps) => {
  safeCapture(ANALYTICS_EVENTS.REPORT_VIEWED, props);
};

export const trackReportDownloaded = (props: ReportDownloadedProps) => {
  safeCapture(ANALYTICS_EVENTS.REPORT_DOWNLOADED, props);
};

export const trackReportEmailed = (props: ReportEmailedProps) => {
  safeCapture(ANALYTICS_EVENTS.REPORT_EMAILED, props);
};

export const trackDocumentGenerated = (props: DocumentGeneratedProps) => {
  safeCapture(ANALYTICS_EVENTS.DOCUMENT_GENERATED, props);
};


// =============================================================================
// CONVERSION TRACKING
// =============================================================================

export const trackFeatureGateHit = (props: FeatureGateHitProps) => {
  safeCapture(ANALYTICS_EVENTS.FEATURE_GATE_HIT, props);
};

export const trackPricingPageViewed = (props: PricingPageViewedProps) => {
  safeCapture(ANALYTICS_EVENTS.PRICING_PAGE_VIEWED, props);
};

export const trackCheckoutStarted = (props: CheckoutStartedProps) => {
  safeCapture(ANALYTICS_EVENTS.CHECKOUT_STARTED, props);
};

export const trackSubscriptionUpgraded = (props: SubscriptionUpgradedProps) => {
  safeCapture(ANALYTICS_EVENTS.SUBSCRIPTION_UPGRADED, {
    ...props,
    // PostHog revenue tracking
    $set: { subscription_tier: props.to_tier },
  });
};

export const trackSubscriptionCancelled = (props: SubscriptionCancelledProps) => {
  safeCapture(ANALYTICS_EVENTS.SUBSCRIPTION_CANCELLED, props);
};

// =============================================================================
// USER LIFECYCLE TRACKING
// =============================================================================

export const trackUserSignedUp = (props: UserSignedUpProps) => {
  safeCapture(ANALYTICS_EVENTS.USER_SIGNED_UP, props);
};

export const trackUserLoggedIn = (props: UserLoggedInProps) => {
  safeCapture(ANALYTICS_EVENTS.USER_LOGGED_IN, props);
};

export const trackOrganizationCreated = (props: OrganizationCreatedProps) => {
  safeCapture(ANALYTICS_EVENTS.ORGANIZATION_CREATED, props);
};

export const trackUserInvited = (props: UserInvitedProps) => {
  safeCapture(ANALYTICS_EVENTS.USER_INVITED, props);
};


// =============================================================================
// FEEDBACK TRACKING
// =============================================================================

export const trackFeedbackSubmitted = (props: FeedbackSubmittedProps) => {
  safeCapture(ANALYTICS_EVENTS.FEEDBACK_SUBMITTED, props);
};

// =============================================================================
// UNIFIED ANALYTICS OBJECT (for cleaner imports)
// =============================================================================

// =============================================================================
// GENERIC EVENT TRACKING (for calculators and other features)
// =============================================================================

export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
  safeCapture(eventName, properties);
};

export const analytics = {
  // User
  identify: identifyUser,
  reset: resetUser,
  setUserProperties,
  
  // Assessment
  assessmentStarted: trackAssessmentStarted,
  assessmentProgress: trackAssessmentProgress,
  assessmentAbandoned: trackAssessmentAbandoned,
  assessmentCompleted: trackAssessmentCompleted,
  
  // Reports
  reportViewed: trackReportViewed,
  reportDownloaded: trackReportDownloaded,
  reportEmailed: trackReportEmailed,
  documentGenerated: trackDocumentGenerated,
  
  // Conversion
  featureGateHit: trackFeatureGateHit,
  pricingPageViewed: trackPricingPageViewed,
  checkoutStarted: trackCheckoutStarted,
  subscriptionUpgraded: trackSubscriptionUpgraded,
  subscriptionCancelled: trackSubscriptionCancelled,
  
  // User lifecycle
  userSignedUp: trackUserSignedUp,
  userLoggedIn: trackUserLoggedIn,
  organizationCreated: trackOrganizationCreated,
  userInvited: trackUserInvited,
  
  // Feedback
  feedbackSubmitted: trackFeedbackSubmitted,
  
  // Generic tracking
  trackEvent,
};

export default analytics;
