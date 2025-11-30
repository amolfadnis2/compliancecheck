import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

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
  assessmentType: z.enum(['statutory_health', 'labour_code', 'dpdp']),
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

// Anonymous user UUID for free assessments (consistent across all free submissions)
// This is a fixed UUID that represents "anonymous/free" users
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
    const sanitizedUserDetails = sanitizeObject(userDetails as Record<string, unknown>)
    const sanitizedResponses = sanitizeObject(responses as Record<string, unknown>)

    // If Supabase is not configured, return a local storage ID
    if (!supabaseUrl || !supabaseKey) {
      // Generate a unique ID for local storage
      const localId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      console.log('Supabase not configured, using local ID:', localId)
      
      return NextResponse.json({
        success: true,
        assessmentId: localId,
        // Return the data so frontend can store it locally
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
        storageType: 'local', // Tell frontend to use localStorage
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // First, ensure the anonymous user exists in the users table
    // This is needed because assessments.user_id has a foreign key constraint
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', ANONYMOUS_USER_ID)
      .single()

    if (!existingUser) {
      // Create the anonymous user if it doesn't exist
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: ANONYMOUS_USER_ID,
          email: 'anonymous@compliancecheck.local',
          full_name: 'Anonymous User',
          is_deleted: false,
        })
        .select()
        .single()

      if (userError && userError.code !== '23505') { // 23505 = unique violation (already exists)
        console.error('Failed to create anonymous user:', userError)
        // Continue anyway - try to create assessment
      }
    }

    // Create assessment record with user_id
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        user_id: ANONYMOUS_USER_ID, // Required field - use anonymous user
        company_id: null, // Optional - no company for free users
        payment_id: null, // Optional - free assessment
        assessment_type: assessmentType,
        status: 'completed',
        responses: {
          userDetails: sanitizedUserDetails,
          answers: sanitizedResponses,
        },
        overall_score: null, // Will be calculated on results page
        category_scores: null,
        action_items: null,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (assessmentError) {
      console.error('Assessment creation error:', assessmentError)
      
      // If still failing due to user_id constraint, fall back to local storage
      if (assessmentError.code === '23502' || assessmentError.code === '23503') {
        const localId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        console.log('Database constraint error, falling back to local storage:', localId)
        
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
      
      return NextResponse.json(
        { error: 'Failed to create assessment', details: assessmentError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      assessmentId: assessment.id,
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
