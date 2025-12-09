import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { ASSESSMENT_TYPES } from '@/lib/constants/assessment-types'

// Server-side validation schema
const userDetailsSchema = z.object({
  fullName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  phone: z.string()
    .regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  companyName: z.string()
    .min(2, 'Company name is required')
    .max(200, 'Company name must be less than 200 characters'),
  state: z.string().min(1, 'State is required'),
  employeeCount: z.string().min(1, 'Employee count is required'),
  industry: z.string().min(1, 'Industry is required'),
})

const submissionSchema = z.object({
  userDetails: userDetailsSchema,
  responses: z.record(z.string(), z.string().max(1000)),
  assessmentType: z.enum([ASSESSMENT_TYPES.STATUTORY_HEALTH, ASSESSMENT_TYPES.LABOUR_CODE, ASSESSMENT_TYPES.DPDP]),
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

// Fallback anonymous user UUID (only used if user creation fails)
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

    const { userDetails, responses, assessmentType } = validationResult.data

    // Sanitize all string inputs
    const sanitizedUserDetails = sanitizeObject(userDetails as Record<string, unknown>) as {
      fullName: string
      email: string
      phone: string
      companyName: string
      state: string
      employeeCount: string
      industry: string
    }
    const sanitizedResponses = sanitizeObject(responses as Record<string, unknown>)

    // If Supabase is not configured, return a local storage ID
    if (!supabaseUrl || !supabaseKey) {
      const localId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      console.log('Supabase not configured, using local ID:', localId)
      
      return NextResponse.json({
        success: true,
        assessmentId: localId,
        assessmentData: {
          id: localId,
          assessment_type: assessmentType,
          status: 'completed',
          responses: {
            userDetails: sanitizedUserDetails,
            answers: sanitizedResponses,
          },
          created_at: new Date().toISOString(),
        },
        storageType: 'local',
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Generate a new UUID for this user
    const newUserId = randomUUID()
    let finalUserId = newUserId

    // Step 1: Create a new user record for this submission
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        id: newUserId,
        email: sanitizedUserDetails.email,
        full_name: sanitizedUserDetails.fullName,
        phone: sanitizedUserDetails.phone,
        company_name: sanitizedUserDetails.companyName,
        industry_type: sanitizedUserDetails.industry,
        employee_count: sanitizedUserDetails.employeeCount,
        registered_state: sanitizedUserDetails.state,
        is_deleted: false,
        marketing_consent: false,
      })
      .select()
      .single()

    if (userError) {
      console.error('User creation error:', userError)
      
      // If email already exists, try to find the existing user
      if (userError.code === '23505') { // Unique violation
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', sanitizedUserDetails.email)
          .single()
        
        if (existingUser) {
          finalUserId = existingUser.id
          console.log('Using existing user:', finalUserId)
        } else {
          // Fall back to anonymous user
          finalUserId = ANONYMOUS_USER_ID
          console.log('Falling back to anonymous user')
        }
      } else {
        // For other errors, fall back to anonymous user
        finalUserId = ANONYMOUS_USER_ID
        console.log('User creation failed, falling back to anonymous user:', userError.message)
      }
    } else {
      console.log('Created new user:', newUser.id)
    }

    // Step 2: Create a company record for this user
    let companyId: string | null = null
    
    const { data: newCompany, error: companyError } = await supabase
      .from('companies')
      .insert({
        user_id: finalUserId,
        company_name: sanitizedUserDetails.companyName,
        industry_type: sanitizedUserDetails.industry,
        employee_count: sanitizedUserDetails.employeeCount,
        registered_state: sanitizedUserDetails.state,
      })
      .select()
      .single()

    if (companyError) {
      console.error('Company creation error:', companyError)
      // Continue without company - it's optional
    } else {
      companyId = newCompany.id
      console.log('Created company:', companyId)
    }

    // Step 3: Create the assessment record linked to the user
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        user_id: finalUserId,
        company_id: companyId,
        payment_id: null, // Free assessment
        assessment_type: assessmentType,
        status: 'completed',
        responses: {
          userDetails: sanitizedUserDetails,
          answers: sanitizedResponses,
        },
        overall_score: null,
        category_scores: null,
        action_items: null,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (assessmentError) {
      console.error('Assessment creation error:', assessmentError)
      
      // Fall back to local storage
      const localId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      console.log('Database error, falling back to local storage:', localId)
      
      return NextResponse.json({
        success: true,
        assessmentId: localId,
        assessmentData: {
          id: localId,
          assessment_type: assessmentType,
          status: 'completed',
          responses: {
            userDetails: sanitizedUserDetails,
            answers: sanitizedResponses,
          },
          created_at: new Date().toISOString(),
        },
        storageType: 'local',
      })
    }

    return NextResponse.json({
      success: true,
      assessmentId: assessment.id,
      userId: finalUserId,
      companyId: companyId,
      storageType: 'database',
    })

  } catch (error) {
    console.error('Free submit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
