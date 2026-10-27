/**
 * Server-side PostHog capture — the backstop for revenue events.
 *
 * Browser events are lost to ad-blockers and closed tabs, which is exactly
 * when a payment can still complete (Razorpay webhook). The payment routes
 * call this so every paid/waived unlock is recorded regardless of the client.
 *
 * Plain fetch to PostHog's /capture/ endpoint — no extra dependency, no
 * module-level client (CLAUDE.md §3). Never throws: analytics must not fail a
 * payment.
 */

import { ANALYTICS_EVENTS } from './events'
import type { PaymentSucceededProps, PaymentFailedProps } from './events'

type ServerEventName =
  | typeof ANALYTICS_EVENTS.PAYMENT_SUCCEEDED
  | typeof ANALYTICS_EVENTS.PAYMENT_FAILED

export async function captureServerEvent(
  event: ServerEventName,
  distinctId: string,
  properties: PaymentSucceededProps | PaymentFailedProps
): Promise<void> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (!apiKey) return
    const host = (process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com').replace(/\/$/, '')
    // A relative host (reverse proxy path) is only reachable from the browser.
    if (!host.startsWith('http')) return

    const revenue =
      event === ANALYTICS_EVENTS.PAYMENT_SUCCEEDED && 'payment_method' in properties
        ? properties.payment_method === 'waiver' ? 0 : properties.amount_inr
        : undefined

    await fetch(`${host}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        event,
        distinct_id: distinctId,
        properties: { ...properties, ...(revenue !== undefined ? { revenue } : {}), $lib: 'server' },
        timestamp: new Date().toISOString(),
      }),
    })
  } catch (err) {
    console.error('[analytics/server] capture failed:', err)
  }
}
