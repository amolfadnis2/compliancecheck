import Script from 'next/script'
import { GOOGLE_ADS_ID } from '@/lib/analytics/google-ads'

/**
 * Loads the Google tag (gtag.js) for Google Ads when NEXT_PUBLIC_GOOGLE_ADS_ID
 * is set. It is loaded on every page so the ad click id (gclid) captured on
 * the landing page is still known when the purchase happens later.
 */
export function GoogleAdsTag() {
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
