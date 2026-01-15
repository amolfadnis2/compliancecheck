import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ASSESSMENT_TYPES } from '@/lib/constants/assessment-types'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      userDetails, 
      applicabilityResponses,
      applicabilityResults,
      responses, 
      score,
      categoryScores,
      actionItems,
    } = body

    // Validate input
    if (!userDetails || !responses) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Create or get user (upsert by email)
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert({
        email: userDetails.email,
        full_name: userDetails.fullName,
        phone: userDetails.phone,
        company_name: userDetails.companyName,
        // Store food business specific fields
        industry_type: 'food_business',
      }, { onConflict: 'email' })
      .select()
      .single()

    if (userError) {
      console.error('User upsert error:', userError)
      // Continue without user - will use null user_id
    }

    // Save assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        user_id: user?.id || null,
        company_name: userDetails.companyName,
        email: userDetails.email,
        assessment_type: ASSESSMENT_TYPES.FOOD_BUSINESS,
        status: 'completed',
        responses: {
          applicability: applicabilityResponses,
          main: responses,
        },
        overall_score: score,
        category_scores: categoryScores,
        action_items: actionItems,
        // Store applicability results for reporting
        metadata: {
          applicability_results: applicabilityResults,
          question_count: Object.keys(responses).length,
          completed_at: new Date().toISOString(),
        },
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (assessmentError) {
      console.error('Assessment insert error:', assessmentError)
      
      // Fallback: Generate a UUID and return success anyway
      // Data will be in localStorage
      const fallbackId = crypto.randomUUID()
      return NextResponse.json({
        success: true,
        assessmentId: fallbackId,
        source: 'fallback',
        warning: 'Database save failed, using local storage',
      })
    }

    return NextResponse.json({
      success: true,
      assessmentId: assessment.id,
      source: 'database',
    })

  } catch (error) {
    console.error('Food Business assessment submission error:', error)
    
    // Return success with fallback ID so frontend can use localStorage
    const fallbackId = crypto.randomUUID()
    return NextResponse.json({
      success: true,
      assessmentId: fallbackId,
      source: 'fallback',
      warning: 'Server error, using local storage',
    })
  }
}

// GET method to retrieve assessment by ID
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { error: 'Assessment ID required' },
      { status: 400 }
    )
  }

  try {
    const supabase = await createClient()

    const { data: assessment, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', id)
      .eq('assessment_type', ASSESSMENT_TYPES.FOOD_BUSINESS)
      .single()

    if (error || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      assessment,
    })

  } catch (error) {
    console.error('Error fetching assessment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assessment' },
      { status: 500 }
    )
  }
}
