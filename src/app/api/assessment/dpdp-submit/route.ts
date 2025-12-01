import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import {
  calculateDPDPScore,
  generateDPDPActionItems,
  type DPDPProfile,
} from '@/lib/assessments/dpdp-questions'

// Initialize Supabase with service role for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Fallback anonymous user UUID
const ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userDetails, responses, assessmentType, filteredQuestionCount, profile } = body

    // Validate required fields
    if (!userDetails || !responses) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate scores using profile for filtered scoring
    const dpdpProfile: DPDPProfile | undefined = profile || (userDetails.industry && userDetails.dataPrincipalCount ? {
      industry: userDetails.industry,
      dataPrincipalCount: userDetails.dataPrincipalCount,
      processesChildrenData: userDetails.processesChildrenData || false,
      crossBorderTransfers: userDetails.crossBorderTransfers || false,
      isDigitalPlatform: userDetails.isDigitalPlatform || false,
    } : undefined)

    const { 
      overallScore, 
      categoryScores, 
      questionsAnswered, 
      totalQuestions,
      riskLevel,
      estimatedPenaltyExposure,
    } = calculateDPDPScore(responses, dpdpProfile)

    // Generate action items
    const actionItems = generateDPDPActionItems(responses, dpdpProfile)


    // Try to save to Supabase if credentials exist
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      const newUserId = randomUUID()
      let finalUserId = newUserId

      // Step 1: Create a new user record
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          id: newUserId,
          email: userDetails.contactEmail,
          full_name: userDetails.contactName,
          phone: userDetails.phone || null,
          company_name: userDetails.companyName,
          industry_type: userDetails.industry,
          employee_count: userDetails.dataPrincipalCount,
          registered_state: userDetails.state,
          is_deleted: false,
          marketing_consent: false,
        })
        .select()
        .single()

      if (userError) {
        console.error('User creation error:', userError)
        
        if (userError.code === '23505') {
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', userDetails.contactEmail)
            .single()
          
          if (existingUser) {
            finalUserId = existingUser.id
          } else {
            finalUserId = ANONYMOUS_USER_ID
          }
        } else {
          finalUserId = ANONYMOUS_USER_ID
        }
      }

      // Step 2: Create a company record
      let companyId: string | null = null
      
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          user_id: finalUserId,
          company_name: userDetails.companyName,
          industry_type: userDetails.industry,
          employee_count: userDetails.dataPrincipalCount,
          registered_state: userDetails.state,
        })
        .select()
        .single()

      if (!companyError) {
        companyId = newCompany.id
      }

      // Step 3: Create the assessment record
      const assessmentData = {
        user_id: finalUserId,
        company_id: companyId,
        payment_id: null,
        assessment_type: assessmentType || 'dpdp',
        status: 'completed',
        responses: {
          userDetails,
          answers: responses,
          filteredQuestionCount: filteredQuestionCount || totalQuestions,
          profile: dpdpProfile,
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
        return NextResponse.json({
          success: true,
          assessmentId: `temp_${Date.now()}`,
          overallScore,
          categoryScores,
          actionItems,
          questionsAnswered,
          totalQuestions,
          riskLevel,
          estimatedPenaltyExposure,
          companyDetails: {
            company_name: userDetails.companyName,
            industry: userDetails.industry,
            data_principal_count: userDetails.dataPrincipalCount,
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
        riskLevel,
        estimatedPenaltyExposure,
        companyDetails: {
          company_name: userDetails.companyName,
          industry: userDetails.industry,
          data_principal_count: userDetails.dataPrincipalCount,
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
      riskLevel,
      estimatedPenaltyExposure,
      companyDetails: {
        company_name: userDetails.companyName,
        industry: userDetails.industry,
        data_principal_count: userDetails.dataPrincipalCount,
        state: userDetails.state,
        contact_name: userDetails.contactName,
        email: userDetails.contactEmail,
      },
      message: 'Assessment calculated (database not configured)',
    })

  } catch (error) {
    console.error('DPDP submit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
