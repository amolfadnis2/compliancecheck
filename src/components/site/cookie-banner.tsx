'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { resetConsent, setConsent, useConsent } from '@/lib/consent'

/** Bottom banner asking for consent to analytics and advertising cookies. */
export function CookieBanner() {
  const consent = useConsent()
  if (consent !== 'pending') return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg"
    >
      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
        <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">
          We use cookies for analytics (PostHog) and to measure our Google Ads. Essential cookies for login
          and checkout are always on. Without your consent we only count visits anonymously, without cookies.{' '}
          <Link href="/privacy#cookies" className="underline text-blue-700 dark:text-blue-400">
            Privacy policy
          </Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={() => setConsent('denied')} className="flex-1 md:flex-none">
            Reject
          </Button>
          <Button onClick={() => setConsent('granted')} className="flex-1 md:flex-none bg-blue-700 hover:bg-blue-800 text-white">
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}

/** Link-styled button that re-opens the banner so a visitor can change their choice. */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={resetConsent} className={className}>
      Cookie settings
    </button>
  )
}
