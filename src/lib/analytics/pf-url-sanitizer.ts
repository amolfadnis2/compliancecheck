/**
 * The PF calculator keeps its state in the URL (?b=<basic>&o=<balance>…) and
 * share slugs (?s=) resolve to exact inputs. PostHog stamps the page URL and
 * referrer on every event, so without this those values would leave the
 * browser. This before_send hook strips the query from any /calculator/pf
 * URL, keeping only utm_* params.
 */

const URL_KEYS = ['$current_url', '$referrer', '$initial_current_url', '$initial_referrer', '$prev_pageview_pathname'] as const

function isPfPath(pathname: string) {
  return pathname === '/calculator/pf' || pathname === '/calculator/pf/'
}

/** Remove every non-utm query param from a /calculator/pf URL; other URLs pass through. */
export function stripPfQuery(value: string): string {
  try {
    const u = new URL(value)
    if (!isPfPath(u.pathname) || !u.search) return value
    const keep = new URLSearchParams()
    u.searchParams.forEach((v, k) => {
      if (k.startsWith('utm_')) keep.set(k, v)
    })
    u.search = keep.toString()
    return u.toString()
  } catch {
    return value
  }
}

function scrub(obj: Record<string, unknown> | undefined) {
  if (!obj) return
  for (const k of URL_KEYS) {
    const v = obj[k]
    if (typeof v === 'string') obj[k] = stripPfQuery(v)
  }
}

interface CaptureLike {
  properties?: Record<string, unknown>
  $set?: Record<string, unknown>
  $set_once?: Record<string, unknown>
}

/** posthog.init({ before_send }) hook. Mutates and returns the event. */
export function pfBeforeSend<T extends CaptureLike | null>(event: T): T {
  if (!event) return event
  scrub(event.properties)
  scrub(event.$set)
  scrub(event.$set_once)
  if (event.properties) {
    scrub(event.properties.$set as Record<string, unknown> | undefined)
    scrub(event.properties.$set_once as Record<string, unknown> | undefined)
  }
  return event
}
