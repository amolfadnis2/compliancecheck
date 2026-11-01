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
  ReportSharedProps,
  DocumentGeneratedProps,
  FeatureGateHitProps,
  PricingPageViewedProps,
  CheckoutStartedProps,
  PaywallViewedProps,
  CheckoutAbandonedProps,
  PaymentSucceededProps,
  PaymentFailedProps,
  PromoRedeemedProps,
  PaidReportViewedProps,
  SubscriptionUpgradedProps,
  SubscriptionCancelledProps,
  UserSignedUpProps,
  UserLoggedInProps,
  OrganizationCreatedProps,
  UserInvitedProps,
  FeedbackSubmittedProps,
  PartnerModeToggledProps,
  PartnerDetailsPrefilledProps,
  PartnerLogoUploadedProps,
  PartnerDetailsSubmittedProps,
  BrandedReportGeneratedProps,
  BrandedReportEmailedProps,
  PartnerSubmissionMode,
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

export const trackReportShared = (props: ReportSharedProps) => {
  safeCapture(ANALYTICS_EVENTS.REPORT_SHARED, props);
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

export const trackPaywallViewed = (props: PaywallViewedProps) => {
  safeCapture(ANALYTICS_EVENTS.PAYWALL_VIEWED, props);
};

export const trackCheckoutAbandoned = (props: CheckoutAbandonedProps) => {
  safeCapture(ANALYTICS_EVENTS.CHECKOUT_ABANDONED, props);
};

export const trackPaymentSucceeded = (props: PaymentSucceededProps) => {
  safeCapture(ANALYTICS_EVENTS.PAYMENT_SUCCEEDED, {
    ...props,
    // PostHog revenue property — waivers record 0 so comped unlocks don't inflate revenue
    revenue: props.payment_method === 'waiver' ? 0 : props.amount_inr,
  });
};

export const trackPaymentFailed = (props: PaymentFailedProps) => {
  safeCapture(ANALYTICS_EVENTS.PAYMENT_FAILED, props);
};

export const trackPromoRedeemed = (props: PromoRedeemedProps) => {
  safeCapture(ANALYTICS_EVENTS.PROMO_REDEEMED, props);
};

export const trackPaidReportViewed = (props: PaidReportViewedProps) => {
  safeCapture(ANALYTICS_EVENTS.PAID_REPORT_VIEWED, props);
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
// PARTNER MODE TRACKING
// =============================================================================

/**
 * Super properties for partner mode: once registered they ride on every later
 * event (paywall, checkout, payment, download, share) so any funnel can be
 * broken down by partner. Cleared when the partner box is unticked.
 */
export interface PartnerContext {
  submission_mode: PartnerSubmissionMode;
  preparer_designation?: string;
  /** report_preparers.id — known once the first submit returns it. */
  preparer_id?: string;
}

export const registerPartnerContext = (ctx: PartnerContext | null) => {
  if (!isPostHogReady()) return;
  if (ctx && ctx.submission_mode !== 'self') {
    posthog.register({ ...ctx, is_partner: true });
  } else {
    posthog.unregister('submission_mode');
    posthog.unregister('preparer_designation');
    posthog.unregister('preparer_id');
    posthog.unregister('is_partner');
  }
};

/** Group analytics (paid PostHog add-on): one group per partner firm. */
export const setPartnerGroup = (preparerKey: string, props: { firm_name: string; designation: string; city?: string }) => {
  if (isPostHogReady()) {
    posthog.group('preparer', preparerKey, props);
  }
};

export const trackPartnerModeToggled = (props: PartnerModeToggledProps) => {
  safeCapture(ANALYTICS_EVENTS.PARTNER_MODE_TOGGLED, props);
};

export const trackPartnerDetailsPrefilled = (props: PartnerDetailsPrefilledProps) => {
  safeCapture(ANALYTICS_EVENTS.PARTNER_DETAILS_PREFILLED, props);
};

export const trackPartnerLogoUploaded = (props: PartnerLogoUploadedProps) => {
  safeCapture(ANALYTICS_EVENTS.PARTNER_LOGO_UPLOADED, props);
};

export const trackPartnerDetailsSubmitted = (props: PartnerDetailsSubmittedProps) => {
  safeCapture(ANALYTICS_EVENTS.PARTNER_DETAILS_SUBMITTED, props);
};

export const trackBrandedReportGenerated = (props: BrandedReportGeneratedProps) => {
  safeCapture(ANALYTICS_EVENTS.BRANDED_REPORT_GENERATED, props);
};

export const trackBrandedReportEmailed = (props: BrandedReportEmailedProps) => {
  safeCapture(ANALYTICS_EVENTS.BRANDED_REPORT_EMAILED, props);
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
  reportShared: trackReportShared,
  documentGenerated: trackDocumentGenerated,
  
  // Conversion
  featureGateHit: trackFeatureGateHit,
  pricingPageViewed: trackPricingPageViewed,
  checkoutStarted: trackCheckoutStarted,
  paywallViewed: trackPaywallViewed,
  checkoutAbandoned: trackCheckoutAbandoned,
  paymentSucceeded: trackPaymentSucceeded,
  paymentFailed: trackPaymentFailed,
  promoRedeemed: trackPromoRedeemed,
  paidReportViewed: trackPaidReportViewed,
  subscriptionUpgraded: trackSubscriptionUpgraded,
  subscriptionCancelled: trackSubscriptionCancelled,
  
  // User lifecycle
  userSignedUp: trackUserSignedUp,
  userLoggedIn: trackUserLoggedIn,
  organizationCreated: trackOrganizationCreated,
  userInvited: trackUserInvited,
  
  // Feedback
  feedbackSubmitted: trackFeedbackSubmitted,

  // Partner mode
  registerPartnerContext,
  setPartnerGroup,
  partnerModeToggled: trackPartnerModeToggled,
  partnerDetailsPrefilled: trackPartnerDetailsPrefilled,
  partnerLogoUploaded: trackPartnerLogoUploaded,
  partnerDetailsSubmitted: trackPartnerDetailsSubmitted,
  brandedReportGenerated: trackBrandedReportGenerated,
  brandedReportEmailed: trackBrandedReportEmailed,
  
  // Generic tracking
  trackEvent,
};

export default analytics;
