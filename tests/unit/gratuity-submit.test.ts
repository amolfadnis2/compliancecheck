import { describe, it, expect, vi, beforeEach } from 'vitest'

const mock = vi.hoisted(() => {
  // route.ts reads NEXT_PUBLIC_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY into
  // module-level consts, evaluated when `import { POST }` below runs. Static
  // imports are hoisted above beforeEach, so these must be set here (vi.hoisted
  // callbacks run before imports) rather than in beforeEach.
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role'

  const state = {
    usersInsertCalls: 0,
    insertedAssessment: null as null | Record<string, unknown>,
  }
  const client = {
    from: (table: string) => {
      if (table === 'users') {
        return {
          insert: () => {
            state.usersInsertCalls += 1
            return {
              select: () => ({
                single: async () => ({ data: null, error: null }),
              }),
            }
          },
        }
      }
      return {
        insert: (row: Record<string, unknown>) => {
          state.insertedAssessment = row
          return {
            select: () => ({
              single: async () => ({ data: { id: 'calc-1', ...row }, error: null }),
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

import { POST } from '@/app/api/calculator/gratuity-submit/route'

const BASE_INPUTS = {
  employmentType: 'regular' as const,
  basicDA: 50000,
  dateOfJoining: '2015-01-01',
  lastWorkingDate: '2026-01-01',
}

const BASE_RESULT = {
  isEligible: true,
  eligibilityReason: 'Completed 5+ years',
  calculatedAmount: 317307,
  cappedAmount: 317307,
  formula: '(50000 x 15 x 11) / 26',
  breakdown: { dailyWage: 1923, totalDays: 165, grossAmount: 317307 },
  serviceDetails: { years: 11, months: 0, days: 0, totalYearsForCalculation: 11 },
  effectiveYears: 11,
  isCapped: false,
  compliance: {
    paymentDueDate: '2026-01-31',
    paymentDeadline: 'Within 30 days',
    employerInsuranceRequired: false,
    taxExemption: 'Fully exempt',
  },
}

function post(body: unknown) {
  return POST(
    new Request('http://localhost/api/calculator/gratuity-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  )
}

describe('POST /api/calculator/gratuity-submit — anonymous by default', () => {
  beforeEach(() => {
    mock.state.usersInsertCalls = 0
    mock.state.insertedAssessment = null
  })

  it('accepts a payload with no userDetails and does not insert a users row', async () => {
    const res = await post({ inputs: BASE_INPUTS, result: BASE_RESULT })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(mock.state.usersInsertCalls).toBe(0)
    expect((mock.state.insertedAssessment?.responses as { userDetails: unknown }).userDetails).toBeNull()
  })

  it('still inserts a users row when userDetails is present', async () => {
    const res = await post({
      userDetails: { fullName: 'Test User', email: 'user@example.com', phone: '9876543210' },
      inputs: BASE_INPUTS,
      result: BASE_RESULT,
    })
    expect(res.status).toBe(200)
    expect(mock.state.usersInsertCalls).toBe(1)
  })
})
