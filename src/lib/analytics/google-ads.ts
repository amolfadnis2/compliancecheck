/**
 * Google Ads conversion tracking.
 *
 * Google Ads cannot import conversions from PostHog, so paid purchases are
 * reported to Google Ads directly from the browser with the Google tag
 * (gtag.js). Everything is a no-op unless both env vars are set, so the tag
 * stays off until an Ads account exists:
 *
 *   NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXXX
 *   NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL=xxxxxxxxxxxxxxxxx
 *
 * The tag itself is loaded by <GoogleAdsTag /> in the root layout.
 */

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID
const PURCHASE_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL

/**
 * Report a completed Razorpay purchase as a Google Ads conversion.
 * `transactionId` (the Razorpay payment id) lets Google drop duplicates.
 * Promo / waiver redemptions are not reported: they earn no revenue.
 */
export function trackGoogleAdsPurchase({
  valueInr,
  transactionId,
}: {
  valueInr: number
  transactionId: string
}) {
  if (typeof window === 'undefined' || !GOOGLE_ADS_ID || !PURCHASE_LABEL) return
  if (typeof window.gtag !== 'function') return
  try {
    window.gtag('event', 'conversion', {
      send_to: `${GOOGLE_ADS_ID}/${PURCHASE_LABEL}`,
      value: valueInr,
      currency: 'INR',
      transaction_id: transactionId,
    })
  } catch {
    /* never let ad tracking break checkout */
  }
}
