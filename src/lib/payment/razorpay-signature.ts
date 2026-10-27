/**
 * Razorpay HMAC-SHA256 signature checks, shared by /api/payment/verify and
 * /api/payment/webhook. Constant-time comparison so a signature can't be
 * recovered byte-by-byte from response timing.
 */

import crypto from 'crypto'

export function safeEqualHex(expected: string, received: string): boolean {
  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(received, 'utf8')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

/** Checkout handler signature: HMAC(order_id|payment_id, key_secret). */
export function isValidCheckoutSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  keySecret: string
): boolean {
  const expected = crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex')
  return safeEqualHex(expected, signature)
}

/** Webhook signature: HMAC(raw request body, webhook secret). */
export function isValidWebhookSignature(rawBody: string, signature: string, webhookSecret: string): boolean {
  const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex')
  return safeEqualHex(expected, signature)
}
