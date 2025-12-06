import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { organizationProfile, responses } = body

    // Calculate scores
    const scoreResults = calculateDPDPScore(responses, organizationProfile)

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
            processesSensitiveData: organizationProfile.processesSensitiveData === 'yes'
          },
          assessment_type: 'dpdp_gap',
          responses,
          overall_score: scoreResults.overallScore,
          phase_scores: scoreResults.phaseScores,
          maturity_level: scoreResults.maturityLevel,
          risk_multipliers: scoreResults.riskMultipliers,
          action_items: scoreResults.actionItems
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
      ...scoreResults
    })
  } catch (error) {
    console.error('DPDP submission error:', error)
    return NextResponse.json(
      { error: 'Failed to process assessment' },
      { status: 500 }
    )
  }
}

// Scoring function
function calculateDPDPScore(
  responses: Record<string, string>,
  profile: any
) {
  const PHASE_WEIGHTS = {
    consent: 0.20,
    security: 0.20,
    rights: 0.10,
    breach: 0.15,
    children: 0.15,
    governance: 0.10
  }

  // Import questions (would need to be dynamic in real implementation)
  const ALL_QUESTIONS = [
    // Would import from dpdp-questions.ts
  ]

  let totalWeightedScore = 0
  let totalPossibleScore = 0
  const phaseScores: Record<string, any> = {}
  const actionItems: any[] = []

  // Calculate scores by phase
  const phases = ['consent', 'security', 'rights', 'breach', 'governance']
  
  // Add children phase if applicable
  if (profile.processesChildrenData === 'yes') {
    phases.push('children')
  }

  phases.forEach(phase => {
    let phasePoints = 0
    let maxPhasePoints = 0
    let phaseQuestions = 0

    Object.entries(responses).forEach(([questionId, answer]) => {
      if (questionId.startsWith(phase)) {
        phaseQuestions++
        const weight = 10 // Simplified - would get from question definition
        maxPhasePoints += weight

        // Check if answer is compliant
        const isCompliant = answer.includes('Yes,') || answer === 'yes' || answer.includes('AES-256')
        if (isCompliant) {
          phasePoints += weight
        } else {
          // Add to action items
          actionItems.push({
            priority: phase === 'security' || phase === 'breach' ? 'high' : 'medium',
            phase,
            text: `Improve ${phase} compliance`,
            questionId
          })
        }
      }
    })

    const phaseScore = maxPhasePoints > 0 ? (phasePoints / maxPhasePoints) * 100 : 100
    const phaseWeight = PHASE_WEIGHTS[phase as keyof typeof PHASE_WEIGHTS] || 0.10

    phaseScores[phase] = {
      score: Math.round(phaseScore),
      weight: phaseWeight,
      questionsAnswered: phaseQuestions
    }

    totalWeightedScore += (phaseScore / 100) * phaseWeight
    totalPossibleScore += phaseWeight
  })

  const overallScore = Math.round((totalWeightedScore / totalPossibleScore) * 100)
  
  // Determine maturity level
  let maturityLevel = 'Initial'
  if (overallScore >= 81) maturityLevel = 'Optimized'
  else if (overallScore >= 61) maturityLevel = 'Managed'
  else if (overallScore >= 41) maturityLevel = 'Defined'
  else if (overallScore >= 21) maturityLevel = 'Developing'

  // Calculate risk multipliers
  const riskMultipliers = []
  if (profile.processesChildrenData === 'yes') {
    riskMultipliers.push({ factor: "Children's Data", multiplier: 2.0, penalty: '₹200 crore' })
  }
  if (profile.processesHealthData === 'yes') {
    riskMultipliers.push({ factor: 'Health Data', multiplier: 1.8, penalty: '₹250 crore' })
  }
  if (profile.revenue === '₹500+ crore') {
    riskMultipliers.push({ factor: 'SDF Designation', multiplier: 2.0, penalty: 'Enhanced obligations' })
  }

  return {
    overallScore,
    maturityLevel,
    phaseScores,
    actionItems: actionItems.slice(0, 10), // Top 10 actions
    riskMultipliers
  }
}
