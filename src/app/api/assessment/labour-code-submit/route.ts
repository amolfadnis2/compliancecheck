import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import {
  calculateLabourCodeScore,
  generateLabourCodeActionItems,
  type IndustryType,
  type EmployeeCountRange,
} from '@/lib/assessments/labour-code-questions'

// Initialize Supabase with service role for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Anonymous user UUID for free assessments
const ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000000'

export async function POST(request: NextRequest) {
  try {
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

    // Prepare assessment data
    const assessmentData = {
      user_id: ANONYMOUS_USER_ID, // Required for FK constraint
      assessment_type: assessmentType || 'labour_code',
      status: 'completed',
      responses: {
        userDetails,
        answers: responses,
        filteredQuestionCount: filteredQuestionCount || totalQuestions,
      },
      overall_score: overallScore,
      category_scores: categoryScores,
      action_items: actionItems,
      company_details: {
        company_name: userDetails.companyName,
        industry: userDetails.industry,
        employee_count: userDetails.employeeCount,
        state: userDetails.state,
        contact_name: userDetails.contactName,
        email: userDetails.contactEmail,
      },
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    }

    // Try to save to Supabase if credentials exist
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
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
          companyDetails: assessmentData.company_details,
          message: 'Assessment calculated (database save failed)',
        })
      }

      return NextResponse.json({
        success: true,
        assessmentId: assessment.id,
        overallScore,
        categoryScores,
        actionItems,
        questionsAnswered,
        totalQuestions,
        companyDetails: assessmentData.company_details,
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
      companyDetails: assessmentData.company_details,
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
