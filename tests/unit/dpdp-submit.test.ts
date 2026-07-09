import { describe, it, expect, vi, beforeEach } from 'vitest'

const mock = vi.hoisted(() => {
  const state = {
    usersUpsertCalls: 0,
    insertedRow: null as null | Record<string, unknown>,
  }
  const client = {
    from: (table: string) => {
      if (table === 'users') {
        return {
          upsert: () => {
            state.usersUpsertCalls += 1
            return {
              select: () => ({
                single: async () => ({ data: { id: 'user-1' }, error: null }),
              }),
            }
          },
        }
      }
      return {
        insert: (row: Record<string, unknown>) => {
          state.insertedRow = row
          return {
            select: () => ({
              single: async () => ({ data: { id: 'assessment-1', ...row }, error: null }),
            }),
          }
        },
      }
    },
  }
  return { state, client }
})

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => mock.client,
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: () => true,
}))

import { POST } from '@/app/api/assessment/dpdp-submit/route'

function post(body: unknown) {
  return POST(
    new Request('http://localhost/api/assessment/dpdp-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  )
}

const BASE_PROFILE = {
  state: 'Maharashtra',
  employeeCount: '50-99 employees',
  industry: 'it_services',
  revenue: '₹5-10 crore',
  processesChildrenData: 'no',
  processesHealthData: 'no',
  processesSensitiveData: 'no',
  crossBorderTransfers: 'no',
}

describe('POST /api/assessment/dpdp-submit — contact info is optional', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role'
    mock.state.usersUpsertCalls = 0
    mock.state.insertedRow = null
  })

  it('accepts a payload with no contact info and does not upsert a users row', async () => {
    const res = await post({ organizationProfile: BASE_PROFILE, responses: {} })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(mock.state.usersUpsertCalls).toBe(0)
    expect(mock.state.insertedRow?.user_id).toBeNull()
  })

  it('still upserts a users row when email is present', async () => {
    const res = await post({
      organizationProfile: { ...BASE_PROFILE, email: 'user@example.com', fullName: 'Test User' },
      responses: {},
    })
    expect(res.status).toBe(200)
    expect(mock.state.usersUpsertCalls).toBe(1)
    expect(mock.state.insertedRow?.user_id).toBe('user-1')
  })
})
