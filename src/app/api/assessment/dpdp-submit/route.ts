import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  calculateDPDPScore, 
  generateDPDPActionItems,
  calculateRiskMultipliers 
} from '@/lib/assessments/dpdp-questions'
import { ASSESSMENT_TYPES } from '@/lib/constants/assessment-types'

// Type definition for organization profile
interface OrganizationProfile {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  state: string;
  employeeCount: string;
  industry: string;
  revenue: string;
  processesChildrenData: string;
  processesHealthData: string;
  processesSensitiveData: string;
  crossBorderTransfers: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { organizationProfile, responses } = body as {
      organizationProfile: OrganizationProfile;
      responses: Record<string, string>;
    }

    // Calculate scores using shared function
    const scoreResults = calculateDPDPScore(responses, {
      processesChildrenData: organizationProfile.processesChildrenData,
      processesHealthData: organizationProfile.processesHealthData,
      processesSensitiveData: organizationProfile.processesSensitiveData
    })

    // Generate action items
    const actionItems = generateDPDPActionItems(responses, {
      processesChildrenData: organizationProfile.processesChildrenData,
      processesHealthData: organizationProfile.processesHealthData
    })

    // Calculate risk multipliers
    const riskMultipliers = calculateRiskMultipliers({
      processesChildrenData: organizationProfile.processesChildrenData === 'yes',
      processesHealthData: organizationProfile.processesHealthData === 'yes',
      processesFinancialData: organizationProfile.processesSensitiveData === 'yes',
      crossBorderTransfers: organizationProfile.crossBorderTransfers === 'yes',
      revenue: organizationProfile.revenue
    })

    // Try to save to database
    let assessmentId = `local_${Date.now()}`
    
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from('assessments')
        .insert({
          user_details: {
            fullName: organizationProfile.fullName,
            email: organizationProfile.email,
            phone: organizationProfile.phone,
            companyName: organizationProfile.companyName,
            state: organizationProfile.state,
            employeeCount: organizationProfile.employeeCount,
            industry: organizationProfile.industry,
            revenue: organizationProfile.revenue,
            processesChildrenData: organizationProfile.processesChildrenData === 'yes',
            processesHealthData: organizationProfile.processesHealthData === 'yes',
            processesSensitiveData: organizationProfile.processesSensitiveData === 'yes',
            crossBorderTransfers: organizationProfile.crossBorderTransfers === 'yes'
          },
          assessment_type: ASSESSMENT_TYPES.DPDP,
          responses,
          overall_score: scoreResults.overallScore,
          category_scores: scoreResults.phaseScores,
          maturity_level: scoreResults.maturityLevel,
          risk_multipliers: riskMultipliers,
          action_items: actionItems
        })
        .select()
        .single()

      if (data && !error) {
        assessmentId = data.id
      }
    } catch (dbError) {
      console.error('Database error:', dbError)
      // Continue with local ID - results will use localStorage
    }

    return NextResponse.json({
      success: true,
      assessmentId,
      overallScore: scoreResults.overallScore,
      categoryScores: scoreResults.phaseScores,
      maturityLevel: scoreResults.maturityLevel,
      questionsAnswered: scoreResults.questionsAnswered,
      totalQuestions: scoreResults.totalQuestions,
      actionItems,
      riskMultipliers
    })
  } catch (error) {
    console.error('DPDP submission error:', error)
    return NextResponse.json(
      { error: 'Failed to process assessment' },
      { status: 500 }
    )
  }
}
