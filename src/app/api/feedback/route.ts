import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Helper to validate UUID format
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const {
      assessmentType,
      assessmentId,
      userId, // Can be passed directly
      npsScore,
      valueProvided,
      wouldRecommend,
      uiExperience,
      reportQuality,
      timeSpent,
      desiredFeatures,
      additionalComments,
      submittedAt,
    } = body

    // Validate required fields
    if (npsScore === null || npsScore === undefined) {
      return NextResponse.json(
        { error: 'NPS score is required' },
        { status: 400 }
      )
    }

    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('Supabase not configured, feedback not saved to DB')
      return NextResponse.json(
        { success: true, warning: 'Database not configured' },
        { status: 200 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Validate assessment_id - only use if valid UUID
    const validAssessmentId = assessmentId && isValidUUID(assessmentId) ? assessmentId : null

    // Get user_id from assessment if not provided directly
    let finalUserId: string | null = userId && isValidUUID(userId) ? userId : null

    if (!finalUserId && validAssessmentId) {
      // Look up user_id from the assessment
      const { data: assessment } = await supabase
        .from('assessments')
        .select('user_id')
        .eq('id', validAssessmentId)
        .single()

      if (assessment?.user_id) {
        finalUserId = assessment.user_id
      }
    }

    // Insert feedback into database
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        user_id: finalUserId,
        assessment_id: validAssessmentId,
        assessment_type: assessmentType,
        nps_score: npsScore,
        value_provided: valueProvided,
        would_recommend: wouldRecommend,
        ui_experience: uiExperience,
        report_quality: reportQuality,
        time_spent: timeSpent,
        desired_features: desiredFeatures,
        additional_comments: additionalComments,
        submitted_at: submittedAt || new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving feedback:', error)
      return NextResponse.json(
        { success: true, warning: 'Saved to analytics only', error: error.message },
        { status: 200 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Feedback saved successfully'
    })

  } catch (error) {
    console.error('Feedback API error:', error)
    return NextResponse.json(
      { success: true, warning: 'Saved to analytics only' },
      { status: 200 }
    )
  }
}
