'use client'

import Script from 'next/script'
import { GOOGLE_ADS_ID } from '@/lib/analytics/google-ads'
import { useConsent } from '@/lib/consent'

/**
 * Loads the Google tag (gtag.js) for Google Ads when NEXT_PUBLIC_GOOGLE_ADS_ID
 * is set AND the visitor has accepted cookies (see @/lib/consent). It is loaded
 * on every page so the ad click id (gclid) captured on the landing page is
 * still known when the purchase happens later. Without consent nothing loads,
 * and trackGoogleAdsPurchase is a no-op because window.gtag is missing.
 */
export function GoogleAdsTag() {
  const consent = useConsent()
  if (consent !== 'granted') return null
  if (!GOOGLE_ADS_ID || !/^AW-\d+$/.test(GOOGLE_ADS_ID)) return null
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-gtag" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GOOGLE_ADS_ID}');`}
      </Script>
    </>
  )
}
