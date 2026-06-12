import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { checkRateLimit } from '@/lib/rate-limit'
import {
  calculateLabourCodeScore,
  generateLabourCodeActionItems,
  type IndustryType,
  type EmployeeCountRange,
} from '@/lib/assessments/labour-code-questions'
import { ASSESSMENT_TYPES } from '@/lib/constants/assessment-types'

// Initialize Supabase with service role for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Fallback anonymous user UUID (only used if user creation fails)
const ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000000'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
    if (!checkRateLimit(`submit:${ip}`, 10, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': '60' } })
    }

    const body = await request.json()
    const { userDetails, responses, assessmentType, filteredQuestionCount } = body

    // Validate required fields
    if (!userDetails || !responses) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Extract industry and employee count for filtered scoring
    const industry = userDetails.industry as IndustryType
    const employeeCount = userDetails.employeeCount as EmployeeCountRange

    // Calculate scores using filtered questions
    const { overallScore, categoryScores, questionsAnswered, totalQuestions } = 
      calculateLabourCodeScore(responses, industry, employeeCount)

    // Generate action items using filtered questions
    const actionItems = generateLabourCodeActionItems(responses, industry, employeeCount)

    // Try to save to Supabase if credentials exist
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      // Generate a new UUID for this user
      const newUserId = randomUUID()
      let finalUserId = newUserId

      // Step 1: Create a new user record for this submission
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          id: newUserId,
          email: userDetails.contactEmail,
          full_name: userDetails.contactName,
          phone: userDetails.phone || null,
          company_name: userDetails.companyName,
          industry_type: userDetails.industry,
          employee_count: userDetails.employeeCount,
          registered_state: userDetails.state,
          is_deleted: false,
          marketing_consent: false,
        })
        .select()
        .single()

      if (userError) {
        console.error('User creation error:', userError)
        
        // If email already exists, try to find the existing user
        if (userError.code === '23505') {
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', userDetails.contactEmail)
            .single()
          
          if (existingUser) {
            finalUserId = existingUser.id
            console.log('Using existing user:', finalUserId)
          } else {
            finalUserId = ANONYMOUS_USER_ID
            console.log('Falling back to anonymous user')
          }
        } else {
          finalUserId = ANONYMOUS_USER_ID
          console.log('User creation failed, falling back to anonymous user')
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
          company_name: userDetails.companyName,
          industry_type: userDetails.industry,
          employee_count: userDetails.employeeCount,
          registered_state: userDetails.state,
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

      // Step 3: Create the assessment record
      const assessmentData = {
        user_id: finalUserId,
        company_id: companyId,
        payment_id: null,
        assessment_type: assessmentType || ASSESSMENT_TYPES.LABOUR_CODE,
        status: 'completed',
        responses: {
          userDetails,
          answers: responses,
          filteredQuestionCount: filteredQuestionCount || totalQuestions,
        },
        overall_score: overallScore,
        category_scores: categoryScores,
        action_items: actionItems,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      }

      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .insert(assessmentData)
        .select()
        .single()

      if (assessmentError) {
        console.error('Supabase error:', assessmentError)
        // Return calculated results even if DB save fails
        return NextResponse.json({
          success: true,
          assessmentId: `temp_${Date.now()}`,
          overallScore,
          categoryScores,
          actionItems,
          questionsAnswered,
          totalQuestions,
          companyDetails: {
            company_name: userDetails.companyName,
            industry: userDetails.industry,
            employee_count: userDetails.employeeCount,
            state: userDetails.state,
            contact_name: userDetails.contactName,
            email: userDetails.contactEmail,
          },
          message: 'Assessment calculated (database save failed)',
        })
      }

      return NextResponse.json({
        success: true,
        assessmentId: assessment.id,
        userId: finalUserId,
        companyId: companyId,
        overallScore,
        categoryScores,
        actionItems,
        questionsAnswered,
        totalQuestions,
        companyDetails: {
          company_name: userDetails.companyName,
          industry: userDetails.industry,
          employee_count: userDetails.employeeCount,
          state: userDetails.state,
          contact_name: userDetails.contactName,
          email: userDetails.contactEmail,
        },
      })
    }

    // No Supabase configured - return calculated results with temp ID
    return NextResponse.json({
      success: true,
      assessmentId: `temp_${Date.now()}`,
      overallScore,
      categoryScores,
      actionItems,
      questionsAnswered,
      totalQuestions,
      companyDetails: {
        company_name: userDetails.companyName,
        industry: userDetails.industry,
        employee_count: userDetails.employeeCount,
        state: userDetails.state,
        contact_name: userDetails.contactName,
        email: userDetails.contactEmail,
      },
      message: 'Assessment calculated (database not configured)',
    })

  } catch (error) {
    console.error('Labour code submit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
