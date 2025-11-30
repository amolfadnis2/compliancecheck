import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Lazy initialization - don't create client at module level
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userDetails, responses, assessmentType } = body

    // Validate required fields
    if (!userDetails || !responses || !assessmentType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // If Supabase is not configured, return a temporary ID
    if (!supabaseUrl || !supabaseKey) {
      const tempId = `temp_${Date.now()}`
      console.log('Supabase not configured, using temp ID:', tempId)
      return NextResponse.json({
        success: true,
        assessmentId: tempId,
      })
    }

    // Create client inside the function
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Create assessment record directly (free mode - no payment)
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        assessment_type: assessmentType,
        status: 'completed',
        responses: {
          userDetails,
          answers: responses,
        },
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (assessmentError) {
      console.error('Assessment creation error:', assessmentError)
      return NextResponse.json(
        { error: 'Failed to create assessment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      assessmentId: assessment.id,
    })

  } catch (error) {
    console.error('Free submit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
