import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import {
  calculateStatutoryHealthScore,
  generateStatutoryHealthActionItems,
} from '@/lib/assessments/statutory-health-questions'
import { ASSESSMENT_TYPES } from '@/lib/constants/assessment-types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userDetails, responses } = body as {
      userDetails: {
        fullName: string
        email: string
        phone: string
        companyName: string
        state: string
        employeeCount: string
        industry: string
      }
      responses: Record<string, string>
    }

    if (!userDetails || !responses) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { overallScore, categoryScores, questionsAnswered, totalQuestions } =
      calculateStatutoryHealthScore(responses)

    const actionItems = generateStatutoryHealthActionItems(responses)

    const companyDetails = {
      company_name: userDetails.companyName,
      industry: userDetails.industry,
      employee_count: userDetails.employeeCount,
      state: userDetails.state,
      contact_name: userDetails.fullName,
      email: userDetails.email,
    }

    // No Supabase configured — return a temp ID the results page can handle
    if (!supabaseUrl || !supabaseServiceKey) {
      const tempId = `temp_${Date.now()}`
      return NextResponse.json({
        success: true,
        assessmentId: tempId,
        storageType: 'local',
        assessmentData: {
          id: tempId,
          assessment_type: ASSESSMENT_TYPES.STATUTORY_HEALTH,
          status: 'completed',
          overall_score: overallScore,
          category_scores: categoryScores,
          action_items: actionItems,
          responses: { userDetails, answers: responses },
          created_at: new Date().toISOString(),
        },
        overallScore,
        categoryScores,
        actionItems,
        questionsAnswered,
        totalQuestions,
        companyDetails,
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Step 1: upsert user
    const newUserId = randomUUID()
    let finalUserId = newUserId

    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        id: newUserId,
        email: userDetails.email,
        full_name: userDetails.fullName,
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
      if (userError.code === '23505') {
        const { data: existing } = await supabase
          .from('users')
          .select('id')
          .eq('email', userDetails.email)
          .single()
        finalUserId = existing?.id ?? ANONYMOUS_USER_ID
      } else {
        finalUserId = ANONYMOUS_USER_ID
      }
    } else {
      finalUserId = newUser.id
    }

    // Step 2: create company record
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

    if (!companyError) companyId = newCompany.id

    // Step 3: create assessment record with computed scores
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        user_id: finalUserId,
        company_id: companyId,
        payment_id: null,
        assessment_type: ASSESSMENT_TYPES.STATUTORY_HEALTH,
        status: 'completed',
        responses: {
          userDetails,
          answers: responses,
        },
        overall_score: overallScore,
        category_scores: categoryScores,
        action_items: actionItems,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (assessmentError) {
      // DB write failed — fall back to temp ID so the page can save locally
      const tempId = `temp_${Date.now()}`
      return NextResponse.json({
        success: true,
        assessmentId: tempId,
        storageType: 'local',
        assessmentData: {
          id: tempId,
          assessment_type: ASSESSMENT_TYPES.STATUTORY_HEALTH,
          status: 'completed',
          overall_score: overallScore,
          category_scores: categoryScores,
          action_items: actionItems,
          responses: { userDetails, answers: responses },
          created_at: new Date().toISOString(),
        },
        overallScore,
        categoryScores,
        actionItems,
        questionsAnswered,
        totalQuestions,
        companyDetails,
        message: 'Assessment calculated (database save failed)',
      })
    }

    return NextResponse.json({
      success: true,
      assessmentId: assessment.id,
      storageType: 'database',
      userId: finalUserId,
      companyId,
      overallScore,
      categoryScores,
      actionItems,
      questionsAnswered,
      totalQuestions,
      companyDetails,
    })
  } catch (error) {
    console.error('Statutory health submit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
