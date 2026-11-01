'use client'

/**
 * Cookie consent for non-essential cookies: PostHog analytics cookies and the
 * Google Ads tag.
 *
 * - No choice yet ('pending') or 'denied': PostHog runs in cookieless mode (see
 *   posthog-provider: opt_out_capturing_by_default + cookieless_mode
 *   'on_reject'), session recording stays off and the Google tag is not loaded.
 * - 'granted': PostHog uses cookies as usual, recordings can start, and the
 *   Google tag loads.
 *
 * The choice is stored in localStorage (wrapped in try/catch: blocked storage
 * just means the banner shows again next visit).
 */

import { useSyncExternalStore } from 'react'
import posthog from 'posthog-js'

export type ConsentStatus = 'granted' | 'denied' | 'pending'

const KEY = 'cc_cookie_consent_v1'
const listeners = new Set<() => void>()
let memory: ConsentStatus | null = null

function read(): ConsentStatus {
  if (memory) return memory
  try {
    const v = window.localStorage.getItem(KEY)
    memory = v === 'granted' || v === 'denied' ? v : 'pending'
  } catch {
    memory = 'pending'
  }
  return memory
}

export function getConsent(): ConsentStatus {
  if (typeof window === 'undefined') return 'pending'
  return read()
}

/** Apply the stored choice to PostHog (called on init and on every change). */
export function applyConsentToPostHog(status: ConsentStatus) {
  try {
    if (status === 'granted') {
      if (posthog.get_explicit_consent_status() !== 'granted') posthog.opt_in_capturing()
    } else if (status === 'denied') {
      if (posthog.get_explicit_consent_status() !== 'denied') posthog.opt_out_capturing()
      posthog.stopSessionRecording()
    }
  } catch {
    /* PostHog not loaded — nothing to apply */
  }
}

export function setConsent(status: 'granted' | 'denied') {
  memory = status
  try {
    window.localStorage.setItem(KEY, status)
  } catch {
    /* storage blocked — the choice holds for this page view */
  }
  applyConsentToPostHog(status)
  listeners.forEach((l) => l())
}

/** Re-open the banner (footer / privacy page "Cookie settings"). */
export function resetConsent() {
  memory = 'pending'
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useConsent(): ConsentStatus | null {
  // null on the server / first render, so nothing consent-dependent renders
  // until the stored choice is known.
  return useSyncExternalStore(subscribe, getConsent, () => null)
}
