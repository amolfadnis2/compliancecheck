'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { identifyUser, resetUser } from '@/lib/analytics/tracking'
import { pfBeforeSend } from '@/lib/analytics/pf-url-sanitizer'

// Initialize PostHog only on client side
if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    capture_pageview: false,
    capture_pageleave: true,
    // Session recording and surveys are switched on after the browser is idle
    // or the user first interacts (see DeferredFeatures). Pageviews and other
    // events are captured from init as before.
    disable_session_recording: true,
    disable_surveys: true,
    // Strip PF calculator state (exact salary/balance) from URLs on every event.
    before_send: pfBeforeSend,
  })
}

// Re-enable recording + surveys on first idle period or user interaction.
// set_config re-runs each feature's start-up, and project settings (sampling,
// linked flags, survey targeting) still decide whether they actually run.
function DeferredFeatures() {
  useEffect(() => {
    let done = false
    const events = ['pointerdown', 'keydown', 'scroll'] as const
    const enable = () => {
      if (done) return
      done = true
      cleanup()
      posthog.set_config({ disable_session_recording: false, disable_surveys: false })
    }
    const idleId =
      'requestIdleCallback' in window
        ? window.requestIdleCallback(enable, { timeout: 5000 })
        : undefined
    const timeoutId = idleId === undefined ? window.setTimeout(enable, 3000) : undefined
    events.forEach((e) => window.addEventListener(e, enable, { once: true, passive: true }))
    function cleanup() {
      if (idleId !== undefined) window.cancelIdleCallback(idleId)
      if (timeoutId !== undefined) window.clearTimeout(timeoutId)
      events.forEach((e) => window.removeEventListener(e, enable))
    }
    return cleanup
  }, [])

  return null
}

// Page view tracker component - uses useSearchParams which requires Suspense
function PostHogPageViewInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }
      posthog.capture('$pageview', { '$current_url': url })
    }
  }, [pathname, searchParams])

  return null
}

// Wrap in Suspense boundary (required for useSearchParams in Next.js 14)
function PostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageViewInner />
    </Suspense>
  )
}

function AuthIdentifier() {
  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        identifyUser(session.user.id, { email: session.user.email })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        identifyUser(session.user.id, { email: session.user.email })
      } else if (event === 'SIGNED_OUT') {
        resetUser()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return null
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      <AuthIdentifier />
      <DeferredFeatures />
      {children}
    </PHProvider>
  )
}

// Export posthog for manual event tracking
export { posthog }
