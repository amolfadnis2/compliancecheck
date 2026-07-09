import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit } from '@/lib/rate-limit'
import {
  calculateDPDPScore,
  generateDPDPActionItems,
  calculateRiskMultipliers
} from '@/lib/assessments/dpdp-questions'
import { ASSESSMENT_TYPES } from '@/lib/constants/assessment-types'

// Lazy-init admin client — module-level init breaks Netlify build when env vars are absent
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabase(): any {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
  }
  return _supabase
}

// Type definition for organization profile.
// fullName/email/phone/companyName are optional: DPDP no longer collects them
// before the assessment — they're captured post-completion via the results
// page's email-OTP gate (GatedResults/EmailGate), so this route must accept a
// payload that omits them entirely.
interface OrganizationProfile {
  fullName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
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
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
    if (!checkRateLimit(`submit:${ip}`, 10, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': '60' } })
    }

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
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Supabase not configured')
      }

      const supabase = getSupabase()

      // Contact info is optional now — only upsert a users row when an email
      // is actually present, so this never fires an upsert with an empty
      // email (which would collide against the `onConflict: 'email'` unique
      // constraint for every anonymous submission).
      let userId: string | null = null
      if (organizationProfile.email) {
        const { data: user } = await supabase
          .from('users')
          .upsert(
            {
              email: organizationProfile.email,
              full_name: organizationProfile.fullName,
              phone: organizationProfile.phone || null,
              company_name: organizationProfile.companyName,
              employee_count: organizationProfile.employeeCount,
              registered_state: organizationProfile.state,
              industry_type: organizationProfile.industry,
            },
            { onConflict: 'email' }
          )
          .select('id')
          .single()
        userId = user?.id ?? null
      }

      const { data, error } = await supabase
        .from('assessments')
        .insert({
          user_id: userId,
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
