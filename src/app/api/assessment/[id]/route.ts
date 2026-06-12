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

    // Ownership gate: caller must provide the email that matches this assessment
    const emailParam = request.nextUrl.searchParams.get('email')
    const assessmentEmail = assessment.users?.email ||
                            assessment.responses?.userDetails?.email ||
                            assessment.responses?.userDetails?.contactEmail ||
                            assessment.user_details?.email
    if (!emailParam || !assessmentEmail || emailParam.toLowerCase() !== assessmentEmail.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Format response with combined data
    // Check all possible locations for user details (different assessment types store differently)
    const responsesUserDetails = assessment.responses?.userDetails || {}
    const userDetailsField = assessment.user_details || {}
    
    const formattedResponse = {
      id: assessment.id,
      assessment_type: assessment.assessment_type,
      status: assessment.status,
      overall_score: assessment.overall_score,
      category_scores: assessment.category_scores || assessment.phase_scores,
      action_items: assessment.action_items,
      responses: assessment.responses,
      created_at: assessment.created_at,
      completed_at: assessment.completed_at,
      // Combine user and company details (check multiple field names across all assessment types)
      userDetails: {
        fullName: assessment.users?.full_name || 
                  responsesUserDetails.fullName || 
                  responsesUserDetails.contactName ||
                  userDetailsField.fullName,
        email: assessment.users?.email || 
               responsesUserDetails.email || 
               responsesUserDetails.contactEmail ||
               userDetailsField.email,
        phone: assessment.users?.phone || 
               responsesUserDetails.phone ||
               userDetailsField.phone,
        companyName: assessment.companies?.company_name || 
                     responsesUserDetails.companyName ||
                     userDetailsField.companyName,
        industry: assessment.companies?.industry_type || 
                  responsesUserDetails.industry ||
                  userDetailsField.industry,
        employeeCount: assessment.companies?.employee_count || 
                       responsesUserDetails.employeeCount ||
                       userDetailsField.employeeCount,
        state: assessment.companies?.registered_state || 
               responsesUserDetails.state ||
               userDetailsField.state,
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
