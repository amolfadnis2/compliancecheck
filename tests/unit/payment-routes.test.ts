import { describe, it, expect, vi, beforeEach } from 'vitest'
import crypto from 'crypto'

// Generic chainable Supabase mock: every builder method returns the chain,
// maybeSingle() resolves to the row configured for the table, and awaiting the
// chain (update/upsert/insert) resolves to { error: null }. Writes are recorded.
const mock = vi.hoisted(() => {
  const state = {
    rows: {} as Record<string, unknown>,
    writes: [] as { table: string; op: string; values: unknown }[],
    orders: 0,
  }
  function chain(table: string) {
    const c: Record<string, unknown> = {}
    const self = () => c
    ;['select', 'eq', 'neq', 'in'].forEach((m) => { c[m] = self })
    ;['update', 'upsert', 'insert'].forEach((op) => {
      c[op] = (values: unknown) => {
        state.writes.push({ table, op, values })
        return c
      }
    })
    c.maybeSingle = async () => ({ data: state.rows[table] ?? null, error: null })
    c.single = c.maybeSingle
    c.then = (resolve: (v: unknown) => void) => resolve({ error: null })
    return c
  }
  return { state, client: { from: (table: string) => chain(table) } }
})

vi.mock('@supabase/supabase-js', () => ({ createClient: () => mock.client }))
vi.mock('razorpay', () => ({
  default: class {
    orders = {
      create: async (o: { amount: number }) => {
        mock.state.orders += 1
        return { id: 'order_new', amount: o.amount, currency: 'INR' }
      },
    }
  },
}))

import { POST as webhook } from '@/app/api/payment/webhook/route'
import { POST as verify } from '@/app/api/payment/verify/route'
import { POST as redeemWaiver } from '@/app/api/payment/redeem-waiver/route'
import { POST as createOrder } from '@/app/api/payment/create-order/route'

const WEBHOOK_SECRET = 'whsec_test'
const KEY_SECRET = 'key_secret_test'

function jsonRequest(url: string, body: unknown, headers: Record<string, string> = {}) {
  return new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

function signedWebhook(payload: unknown, secret = WEBHOOK_SECRET) {
  const raw = JSON.stringify(payload)
  const sig = crypto.createHmac('sha256', secret).update(raw).digest('hex')
  return webhook(jsonRequest('http://localhost/api/payment/webhook', raw, { 'x-razorpay-signature': sig }))
}

const captured = (orderId = 'order_1') => ({
  event: 'payment.captured',
  payload: { payment: { entity: { id: 'pay_1', order_id: orderId, email: 'a@b.com' } } },
})

const entitlementWrites = () =>
  mock.state.writes.filter((w) => w.table === 'assessment_entitlements')

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role'
  process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET
  process.env.RAZORPAY_KEY_ID = 'rzp_test'
  process.env.RAZORPAY_KEY_SECRET = KEY_SECRET
  delete process.env.NEXT_PUBLIC_POSTHOG_KEY // no analytics network calls
  mock.state.rows = {}
  mock.state.writes = []
  mock.state.orders = 0
})

describe('POST /api/payment/webhook', () => {
  it('rejects a bad signature', async () => {
    const res = await signedWebhook(captured(), 'wrong-secret')
    expect(res.status).toBe(400)
    expect(entitlementWrites()).toHaveLength(0)
  })

  it('marks an initiated entitlement paid on payment.captured', async () => {
    mock.state.rows.assessment_entitlements = {
      assessment_id: 'a1', assessment_type: 'labour_code', status: 'initiated', amount_paise: 99900, email: 'a@b.com',
    }
    const res = await signedWebhook(captured())
    expect(res.status).toBe(200)
    const [w] = entitlementWrites()
    expect(w.op).toBe('update')
    expect(w.values).toMatchObject({ status: 'paid', razorpay_payment_id: 'pay_1' })
  })

  it('is idempotent when already paid', async () => {
    mock.state.rows.assessment_entitlements = { assessment_id: 'a1', assessment_type: 'dpdp', status: 'paid', amount_paise: 249900 }
    const res = await signedWebhook(captured())
    expect(res.status).toBe(200)
    expect(entitlementWrites()).toHaveLength(0)
  })

  it('marks initiated orders failed, never downgrades a paid one', async () => {
    const failed = { event: 'payment.failed', payload: { payment: { entity: { id: 'pay_x', order_id: 'order_1' } } } }
    mock.state.rows.assessment_entitlements = { assessment_id: 'a1', assessment_type: 'posh', status: 'initiated', amount_paise: 199900 }
    await signedWebhook(failed)
    expect(entitlementWrites()[0].values).toMatchObject({ status: 'failed' })

    mock.state.writes = []
    mock.state.rows.assessment_entitlements = { assessment_id: 'a1', assessment_type: 'posh', status: 'paid', amount_paise: 199900 }
    await signedWebhook(failed)
    expect(entitlementWrites()).toHaveLength(0)
  })

  it('acknowledges orders it does not know', async () => {
    const res = await signedWebhook(captured('order_unknown'))
    expect(res.status).toBe(200)
    expect(entitlementWrites()).toHaveLength(0)
  })
})

describe('POST /api/payment/verify', () => {
  function verifyBody(signature?: string) {
    const sig = signature ?? crypto.createHmac('sha256', KEY_SECRET).update('order_1|pay_1').digest('hex')
    return {
      razorpay_order_id: 'order_1', razorpay_payment_id: 'pay_1', razorpay_signature: sig,
      assessmentId: 'a1', assessmentType: 'food_business', email: 'a@b.com',
    }
  }

  it('rejects a signature of the wrong length without throwing', async () => {
    mock.state.rows.assessment_entitlements = { assessment_id: 'a1', assessment_type: 'food_business', status: 'initiated', amount_paise: 99900 }
    const res = await verify(jsonRequest('http://localhost/api/payment/verify', verifyBody('short')))
    expect(res.status).toBe(400)
  })

  it('does not rewrite an entitlement the webhook already paid', async () => {
    mock.state.rows.assessment_entitlements = { assessment_id: 'a1', assessment_type: 'food_business', status: 'paid', amount_paise: 99900 }
    const res = await verify(jsonRequest('http://localhost/api/payment/verify', verifyBody()))
    expect(res.status).toBe(200)
    expect(entitlementWrites()).toHaveLength(0)
  })
})

describe('POST /api/payment/redeem-waiver', () => {
  const body = { assessmentId: 'a1', assessmentType: 'state_wise_compliance', code: 'testfree', email: 'a@b.com' }
  const promo = { id: 'p1', code: 'TESTFREE', active: true, applies_to: ['all'], max_uses: null, used_count: 0, expires_at: null }

  it('404s for an assessment that does not exist', async () => {
    mock.state.rows.promo_codes = promo
    const res = await redeemWaiver(jsonRequest('http://localhost/api/payment/redeem-waiver', body))
    expect(res.status).toBe(404)
    expect(entitlementWrites()).toHaveLength(0)
  })

  it('never overwrites a paid entitlement or burns a use', async () => {
    mock.state.rows.promo_codes = promo
    mock.state.rows.assessments = { id: 'a1' }
    mock.state.rows.assessment_entitlements = { status: 'paid' }
    const res = await redeemWaiver(jsonRequest('http://localhost/api/payment/redeem-waiver', body))
    expect(res.status).toBe(200)
    expect(mock.state.writes).toHaveLength(0)
  })

  it('waives an existing, unpaid assessment', async () => {
    mock.state.rows.promo_codes = promo
    mock.state.rows.assessments = { id: 'a1' }
    const res = await redeemWaiver(jsonRequest('http://localhost/api/payment/redeem-waiver', body))
    expect(res.status).toBe(200)
    expect(entitlementWrites()[0]).toMatchObject({ op: 'upsert', values: { status: 'waived', promo_code: 'TESTFREE' } })
  })
})

describe('POST /api/payment/create-order', () => {
  it('refuses to charge for an assessment that does not exist', async () => {
    const res = await createOrder(jsonRequest('http://localhost/api/payment/create-order', {
      assessmentId: 'local_123', assessmentType: 'labour_code', email: 'a@b.com',
    }))
    expect(res.status).toBe(404)
    expect(mock.state.orders).toBe(0)
  })

  it('charges the configured price, looking the row up in the type\'s own table', async () => {
    mock.state.rows.auto_dealer_assessments = { id: 'ad1' }
    const res = await createOrder(jsonRequest('http://localhost/api/payment/create-order', {
      assessmentId: 'ad1', assessmentType: 'auto_dealer', email: 'a@b.com',
    }))
    expect(res.status).toBe(200)
    expect((await res.json()).amount).toBe(299900)
  })
})
