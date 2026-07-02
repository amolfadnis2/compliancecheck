import { describe, it, expect, vi, beforeEach } from 'vitest'
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

import { POST } from '@/app/api/payment/verify/route'

const SECRET = 'test_razorpay_secret'

function signedPayload(overrides: Partial<Record<string, string>> = {}) {
  const razorpay_order_id = overrides.razorpay_order_id ?? 'order_123'
  const razorpay_payment_id = overrides.razorpay_payment_id ?? 'pay_456'
  const razorpay_signature = crypto
    .createHmac('sha256', SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')
  return {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    assessmentId: overrides.assessmentId ?? 'assessment-a',
    assessmentType: overrides.assessmentType ?? 'statutory_health',
    email: 'user@example.com',
  }
}

function post(body: unknown) {
  return POST(
    new Request('http://localhost/api/payment/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  )
}

describe('POST /api/payment/verify — order↔assessment binding', () => {
  beforeEach(() => {
    process.env.RAZORPAY_KEY_SECRET = SECRET
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role'
    mock.state.row = null
    mock.state.lastUpdate = null
    mock.state.updateFilter = null
  })

  it('rejects a tampered signature', async () => {
    mock.state.row = { assessment_id: 'assessment-a', assessment_type: 'statutory_health', status: 'initiated' }
    const body = signedPayload()
    body.razorpay_signature = 'f'.repeat(64)
    const res = await post(body)
    expect(res.status).toBe(400)
    expect(mock.state.lastUpdate).toBeNull()
  })

  it('rejects a valid signature for an order that has no entitlement row', async () => {
    mock.state.row = null
    const res = await post(signedPayload())
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/unknown payment order/i)
    expect(mock.state.lastUpdate).toBeNull()
  })

  it('rejects a replayed payment claimed against a different assessment', async () => {
    // Order was created for assessment-a / statutory_health…
    mock.state.row = { assessment_id: 'assessment-a', assessment_type: 'statutory_health', status: 'initiated' }
    // …but the client claims it pays for a different (pricier) assessment.
    const res = await post(signedPayload({ assessmentId: 'assessment-b', assessmentType: 'auto_dealer' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/does not match/i)
    expect(mock.state.lastUpdate).toBeNull()
  })

  it('marks the matching entitlement paid, keyed by order id', async () => {
    mock.state.row = { assessment_id: 'assessment-a', assessment_type: 'statutory_health', status: 'initiated' }
    const res = await post(signedPayload())
    expect(res.status).toBe(200)
    expect((await res.json()).success).toBe(true)
    expect(mock.state.lastUpdate).toMatchObject({ status: 'paid', razorpay_payment_id: 'pay_456' })
    expect(mock.state.updateFilter).toEqual({ column: 'razorpay_order_id', value: 'order_123' })
  })
})
