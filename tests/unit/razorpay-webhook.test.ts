import { describe, it, expect, beforeEach, vi } from 'vitest'
import crypto from 'crypto'

// The route creates its Supabase client inline; intercept it with a chainable
// mock whose entitlement row and update-capture are controlled per test.
const mock = vi.hoisted(() => {
  const state = {
    row: null as null | { assessment_id: string; assessment_type: string; status: string },
    lastUpdate: null as null | Record<string, unknown>,
    updateFilter: null as null | { column: string; value: string },
  }
  const client = {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: state.row, error: null }),
        }),
      }),
      update: (values: Record<string, unknown>) => ({
        eq: async (column: string, value: string) => {
          state.lastUpdate = values
          state.updateFilter = { column, value }
          return { error: null }
        },
      }),
    }),
  }
  return { state, client }
})

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => mock.client,
}))

import { POST } from '@/app/api/payment/razorpay-webhook/route'

const WEBHOOK_SECRET = 'test_webhook_secret'
// The dashboard webhook secret is a different credential from the API key
// secret — signing with the wrong one must not authenticate a payment.
const KEY_SECRET = 'test_razorpay_key_secret'

function capturedEvent(overrides: Record<string, unknown> = {}) {
  return {
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_456',
          order_id: 'order_123',
          notes: {
            assessmentId: 'assessment-a',
            assessmentType: 'statutory_health',
            email: 'user@example.com',
          },
          ...overrides,
        },
      },
    },
  }
}

function post(payload: unknown, opts: { secret?: string | null; signature?: string } = {}) {
  const rawBody = JSON.stringify(payload)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }

  if (opts.signature !== undefined) {
    headers['X-Razorpay-Signature'] = opts.signature
  } else if (opts.secret !== null) {
    headers['X-Razorpay-Signature'] = crypto
      .createHmac('sha256', opts.secret ?? WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex')
  }

  return POST(
    new Request('http://localhost/api/payment/razorpay-webhook', {
      method: 'POST',
      headers,
      body: rawBody,
    })
  )
}

describe('POST /api/payment/razorpay-webhook', () => {
  beforeEach(() => {
    process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET
    process.env.RAZORPAY_KEY_SECRET = KEY_SECRET
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role'
    mock.state.row = null
    mock.state.lastUpdate = null
    mock.state.updateFilter = null
  })

  it('records a captured payment against the matching entitlement', async () => {
    mock.state.row = { assessment_id: 'assessment-a', assessment_type: 'statutory_health', status: 'initiated' }
    const res = await post(capturedEvent())
    expect(res.status).toBe(200)
    expect((await res.json()).success).toBe(true)
    expect(mock.state.lastUpdate).toMatchObject({
      status: 'paid',
      payment_method: 'razorpay',
      razorpay_payment_id: 'pay_456',
      email: 'user@example.com',
    })
    expect(mock.state.updateFilter).toEqual({ column: 'razorpay_order_id', value: 'order_123' })
  })

  it('rejects a body whose signature does not match', async () => {
    mock.state.row = { assessment_id: 'assessment-a', assessment_type: 'statutory_health', status: 'initiated' }
    const res = await post(capturedEvent(), { signature: 'f'.repeat(64) })
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/invalid webhook signature/i)
    expect(mock.state.lastUpdate).toBeNull()
  })

  it('rejects a body signed with the API key secret instead of the webhook secret', async () => {
    mock.state.row = { assessment_id: 'assessment-a', assessment_type: 'statutory_health', status: 'initiated' }
    const res = await post(capturedEvent(), { secret: KEY_SECRET })
    expect(res.status).toBe(400)
    expect(mock.state.lastUpdate).toBeNull()
  })

  it('rejects a request with no signature header at all', async () => {
    mock.state.row = { assessment_id: 'assessment-a', assessment_type: 'statutory_health', status: 'initiated' }
    const res = await post(capturedEvent(), { secret: null })
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/missing webhook signature/i)
    expect(mock.state.lastUpdate).toBeNull()
  })

  it('rejects a payment whose order notes name a different assessment', async () => {
    // Order was created for assessment-a / statutory_health…
    mock.state.row = { assessment_id: 'assessment-a', assessment_type: 'statutory_health', status: 'initiated' }
    // …but the event claims it pays for a different (pricier) assessment.
    const res = await post(
      capturedEvent({ notes: { assessmentId: 'assessment-b', assessmentType: 'auto_dealer' } })
    )
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/does not match/i)
    expect(mock.state.lastUpdate).toBeNull()
  })

  it('rejects a captured payment for an order we never created', async () => {
    mock.state.row = null
    const res = await post(capturedEvent())
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/unknown payment order/i)
    expect(mock.state.lastUpdate).toBeNull()
  })

  it('is idempotent: a retry against an already-paid row writes nothing', async () => {
    mock.state.row = { assessment_id: 'assessment-a', assessment_type: 'statutory_health', status: 'paid' }
    const res = await post(capturedEvent())
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ success: true, alreadyRecorded: true })
    expect(mock.state.lastUpdate).toBeNull()
  })

  it('never downgrades a waived entitlement', async () => {
    mock.state.row = { assessment_id: 'assessment-a', assessment_type: 'statutory_health', status: 'waived' }
    const res = await post(capturedEvent())
    expect(res.status).toBe(200)
    expect(mock.state.lastUpdate).toBeNull()
  })

  it('acknowledges events it does not handle without touching the row', async () => {
    mock.state.row = { assessment_id: 'assessment-a', assessment_type: 'statutory_health', status: 'initiated' }
    const res = await post({ ...capturedEvent(), event: 'payment.failed' })
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ ignored: true, event: 'payment.failed' })
    expect(mock.state.lastUpdate).toBeNull()
  })
})
