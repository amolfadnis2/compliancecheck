import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch assessment with related company data
    const { data: assessment, error } = await supabase
      .from('assessments')
      .select(`
        *,
        companies (
          company_name,
          industry_type,
          employee_count,
          registered_state
        ),
        users (
          email,
          full_name,
          phone
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching assessment:', error)
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    // Format response with combined data
    const formattedResponse = {
      id: assessment.id,
      assessment_type: assessment.assessment_type,
      status: assessment.status,
      overall_score: assessment.overall_score,
      category_scores: assessment.category_scores,
      action_items: assessment.action_items,
      responses: assessment.responses,
      created_at: assessment.created_at,
      completed_at: assessment.completed_at,
      // Combine user and company details
      userDetails: {
        fullName: assessment.users?.full_name || assessment.responses?.userDetails?.fullName,
        email: assessment.users?.email || assessment.responses?.userDetails?.email,
        phone: assessment.users?.phone || assessment.responses?.userDetails?.phone,
        companyName: assessment.companies?.company_name || assessment.responses?.userDetails?.companyName,
        industry: assessment.companies?.industry_type || assessment.responses?.userDetails?.industry,
        employeeCount: assessment.companies?.employee_count || assessment.responses?.userDetails?.employeeCount,
        state: assessment.companies?.registered_state || assessment.responses?.userDetails?.state,
      }
    }

    return NextResponse.json(formattedResponse)
  } catch (error) {
    console.error('Assessment fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
