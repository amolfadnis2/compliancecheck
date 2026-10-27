/**
 * Indian mobile numbers for WhatsApp delivery. Accepts what people type —
 * "98765 43210", "+91-98765-43210", "098765 43210" — and returns the wa.me /
 * E.164-without-plus form "919876543210", or null when it is not a valid
 * Indian mobile (10 digits starting 6-9, the same rule as every Step 0 form).
 */
export function normalizeIndianMobile(input: string | null | undefined): string | null {
  if (!input) return null
  let digits = input.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2)
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1)
  return /^[6-9]\d{9}$/.test(digits) ? `91${digits}` : null
}
