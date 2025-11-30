import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Supabase with service role for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    // Create assessment record directly (free mode - no payment)
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        assessment_type: assessmentType,
        status: 'completed', // Mark as completed immediately
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
