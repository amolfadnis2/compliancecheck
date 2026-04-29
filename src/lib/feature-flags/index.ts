/**
 * Feature flags backed by env vars — no runtime dependency, tree-shakeable.
 *
 * NEXT_PUBLIC_FF_CTC_EMAIL_GATE:
 *   'off'   → existing behavior, no gate (control — default)
 *   'on'    → gate shown to everyone
 *   'split' → stable 50/50 per session based on a session cookie hash
 */

type FlagValue = 'off' | 'on' | 'split'

function djb2(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i)
  }
  return hash >>> 0
}

function getOrCreateSessionId(): string {
  if (typeof document === 'undefined') return ''

  const cookieName = 'cc_session_id'
  const existing = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${cookieName}=`))
    ?.split('=')[1]

  if (existing) return existing

  const id = Math.random().toString(36).slice(2) + Date.now().toString(36)
  const maxAge = 30 * 24 * 60 * 60 // 30 days
  document.cookie = `${cookieName}=${id}; path=/; max-age=${maxAge}; SameSite=Lax`
  return id
}

export function getCTCEmailGateFlag(): FlagValue {
  const raw = process.env.NEXT_PUBLIC_FF_CTC_EMAIL_GATE
  if (raw === 'on') return 'on'
  if (raw === 'split') return 'split'
  return 'off'
}

/**
 * Returns true if the email gate should be shown for this session.
 * Stable per-session (deterministic for 'split', always-true for 'on').
 */
export function shouldShowCTCEmailGate(): boolean {
  const flag = getCTCEmailGateFlag()
  if (flag === 'off') return false
  if (flag === 'on') return true

  // 'split' — hash session ID for stable assignment
  const sessionId = getOrCreateSessionId()
  if (!sessionId) return false
  return djb2(sessionId) % 2 === 0
}
