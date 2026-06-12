const _windows = new Map<string, number[]>()

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const existing = (_windows.get(key) ?? []).filter(t => now - t < windowMs)
  if (existing.length >= maxRequests) return false
  _windows.set(key, [...existing, now])
  return true
}
