/**
 * Analytics Module - Public API
 * 
 * Usage:
 * 
 * // Import the unified analytics object
 * import { analytics } from '@/lib/analytics';
 * analytics.assessmentStarted({ ... });
 * 
 * // Or import specific functions
 * import { trackAssessmentStarted, identifyUser } from '@/lib/analytics';
 * 
 * // Or use React hooks
 * import { useAssessmentTracking } from '@/lib/analytics';
 * const { trackStart, trackProgress, trackComplete } = useAssessmentTracking({ ... });
 */

// Export all tracking functions
export {
  analytics,
  identifyUser,
  resetUser,
  setUserProperties,
  trackAssessmentStarted,
  trackAssessmentProgress,
  trackAssessmentAbandoned,
  trackAssessmentCompleted,
  trackReportViewed,
  trackReportDownloaded,
  trackDocumentGenerated,
  trackFeatureGateHit,
  trackPricingPageViewed,
  trackCheckoutStarted,
  trackSubscriptionUpgraded,
  trackSubscriptionCancelled,
  trackUserSignedUp,
  trackUserLoggedIn,
  trackOrganizationCreated,
  trackUserInvited,
  trackFeedbackSubmitted,
} from './tracking';

// Export types from events
export type {
  AssessmentType,
  UserTier,
  OrganizationSize,
  IndustryType,
} from './events';

// Export types from tracking
export type { UserProperties } from './tracking';

// Export event names constant
export { ANALYTICS_EVENTS } from './events';

// Export all event property types
export type {
  AssessmentStartedProps,
  AssessmentProgressProps,
  AssessmentAbandonedProps,
  AssessmentCompletedProps,
  ReportViewedProps,
  ReportDownloadedProps,
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
} from './events';

// Export React hooks
export {
  useAssessmentTracking,
  useFeatureGate,
  usePageTracking,
} from './hooks';
