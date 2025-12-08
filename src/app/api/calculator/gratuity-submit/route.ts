import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { randomUUID } from 'crypto'

// Server-side validation schema - simplified
const userDetailsSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email().max(255),
  phone: z.string().regex(/^[6-9]\d{9}$/),
})

const calculatorInputsSchema = z.object({
  employmentType: z.enum(['regular', 'fixed_term', 'journalist']),
  basicDA: z.number().positive(),
  dateOfJoining: z.string(), // ISO date string
  lastWorkingDate: z.string(), // ISO date string
})

const resultSchema = z.object({
  isEligible: z.boolean(),
  eligibilityReason: z.string(),
  calculatedAmount: z.number(),
  cappedAmount: z.number(),
  formula: z.string(),
  breakdown: z.object({
    dailyWage: z.number(),
    totalDays: z.number(),
    grossAmount: z.number(),
  }),
  serviceDetails: z.object({
    years: z.number(),
    months: z.number(),
    days: z.number(),
    totalYearsForCalculation: z.number(),
  }),
  effectiveYears: z.number(),
  isCapped: z.boolean(),
  compliance: z.object({
    paymentDueDate: z.string(),
    paymentDeadline: z.string(),
    employerInsuranceRequired: z.boolean(),
    taxExemption: z.string(),
  }),
})

const submissionSchema = z.object({
  userDetails: userDetailsSchema,
  inputs: calculatorInputsSchema,
  result: resultSchema,
})

// Sanitize input to prevent XSS
function sanitizeString(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
}

function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value)
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Server-side validation
    const validationResult = submissionSchema.safeParse(body)
    
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      }))
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    const { userDetails, inputs, result } = validationResult.data

    // Sanitize inputs
    const sanitizedUserDetails = sanitizeObject(userDetails as Record<string, unknown>)
    const sanitizedInputs = sanitizeObject(inputs as Record<string, unknown>)

    // If Supabase is not configured, return success without saving
    if (!supabaseUrl || !supabaseKey) {
      const localId = `local_calc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      console.log('Supabase not configured, using local ID:', localId)
      
      return NextResponse.json({
        success: true,
        calculationId: localId,
        storageType: 'local',
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Generate new user ID
    const newUserId = randomUUID()
    let finalUserId = newUserId

    // Create or find user - simplified (no company info)
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: newUserId,
        email: sanitizedUserDetails.email,
        full_name: sanitizedUserDetails.fullName,
        phone: sanitizedUserDetails.phone,
        is_deleted: false,
        marketing_consent: false,
      })
      .select()
      .single()

    if (userError) {
      console.error('User creation error:', userError)
      
      if (userError.code === '23505') {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', sanitizedUserDetails.email)
          .single()
        
        if (existingUser) {
          finalUserId = existingUser.id
        } else {
          finalUserId = ANONYMOUS_USER_ID
        }
      } else {
        finalUserId = ANONYMOUS_USER_ID
      }
    }

    // Create calculator record in assessments table
    const { data: calculation, error: calcError } = await supabase
      .from('assessments')
      .insert({
        user_id: finalUserId,
        company_id: null,
        payment_id: null,
        assessment_type: 'gratuity_calculator',
        status: 'completed',
        responses: {
          userDetails: sanitizedUserDetails,
          inputs: sanitizedInputs,
          result: result,
        },
        overall_score: null,
        category_scores: null,
        action_items: null,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (calcError) {
      console.error('Calculator save error:', calcError)
      
      // Fall back to local storage response
      const localId = `local_calc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      
      return NextResponse.json({
        success: true,
        calculationId: localId,
        storageType: 'local',
      })
    }

    return NextResponse.json({
      success: true,
      calculationId: calculation.id,
      userId: finalUserId,
      storageType: 'database',
    })

  } catch (error) {
    console.error('Gratuity calculator submit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
