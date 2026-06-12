import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { ASSESSMENT_TYPES } from '@/lib/constants/assessment-types'
import { checkRateLimit } from '@/lib/rate-limit'

// Lazy-init Supabase — module-level init breaks Netlify build when env vars are absent
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

// ============================================================================
// ZOD SCHEMA VALIDATION
// ============================================================================

const userDetailsSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  companyName: z.string().min(2).max(200),
  state: z.string().min(1),
  employeeCount: z.string().min(1),
})

const submitBodySchema = z.object({
  userDetails: userDetailsSchema,
  applicabilityResponses: z.record(z.string(), z.string()).default({}),
  applicabilityResults: z.array(z.unknown()).default([]),
  responses: z.record(z.string(), z.string()),
  score: z.number().min(0).max(100),
  categoryScores: z.record(z.string(), z.unknown()).default({}),
  actionItems: z.array(z.unknown()).default([]),
  assessmentType: z.string().default(ASSESSMENT_TYPES.FOOD_BUSINESS),
})

// ============================================================================
// EMAIL NOTIFICATION (non-blocking)
// ============================================================================

async function sendCompletionEmail(
  email: string,
  fullName: string,
  companyName: string,
  score: number,
  assessmentId: string
) {
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) return

  const statusText = score >= 90 ? 'Compliant' : score >= 70 ? 'Needs Attention' : 'Non-Compliant'

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ComplianceCheck <noreply@compliancecheck.co.in>',
        to: [email],
        subject: `Your Food Business Compliance Report — ${statusText} (${score}%)`,
        html: `
          <h2>Hi ${fullName},</h2>
          <p>Your Restaurant &amp; Food Business compliance assessment for <strong>${companyName}</strong> is complete.</p>
          <p><strong>Overall Score: ${score}% — ${statusText}</strong></p>
          <p>View your full report with detailed remediation steps, legal references, and action items:</p>
          <p><a href="https://compliancecheck.co.in/results/${assessmentId}?type=food_business">View Your Report</a></p>
          <p>Questions? Reply to this email.</p>
          <p>— ComplianceCheck Team</p>
        `,
      }),
    })
  } catch {
    // Email failures must not break the assessment flow
  }
}

// ============================================================================
// POST — Save assessment
// ============================================================================

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
    if (!checkRateLimit(`submit:${ip}`, 10, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': '60' } })
    }

    const rawBody = await request.json()

    const parseResult = submitBodySchema.safeParse(rawBody)
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const { userDetails, applicabilityResponses, applicabilityResults, responses, score, categoryScores, actionItems } =
      parseResult.data

    // Check env vars — return local fallback if Supabase unconfigured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const fallbackId = `local_${Date.now()}`
      return NextResponse.json({ success: true, assessmentId: fallbackId, source: 'fallback' })
    }

    const supabase = getSupabase()

    // Upsert user by email
    const { data: user } = await supabase
      .from('users')
      .upsert(
        {
          email: userDetails.email,
          full_name: userDetails.fullName,
          phone: userDetails.phone,
          company_name: userDetails.companyName,
          industry_type: 'food_business',
          employee_count: userDetails.employeeCount,
          registered_state: userDetails.state,
        },
        { onConflict: 'email' }
      )
      .select('id')
      .single()

    // Insert assessment — store all details in responses JSONB
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        user_id: user?.id ?? null,
        assessment_type: ASSESSMENT_TYPES.FOOD_BUSINESS,
        status: 'completed',
        responses: {
          userDetails,
          applicability: applicabilityResponses,
          applicabilityResults,
          answers: responses,
        },
        overall_score: score,
        category_scores: categoryScores,
        action_items: actionItems,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (assessmentError) {
      // DB save failed — fall back to local ID so frontend can use localStorage
      const fallbackId = `local_${Date.now()}`
      return NextResponse.json({ success: true, assessmentId: fallbackId, source: 'fallback' })
    }

    // Send email in background (non-blocking)
    sendCompletionEmail(
      userDetails.email,
      userDetails.fullName,
      userDetails.companyName,
      score,
      assessment.id
    )

    return NextResponse.json({ success: true, assessmentId: assessment.id, source: 'database' })
  } catch {
    const fallbackId = `local_${Date.now()}`
    return NextResponse.json({ success: true, assessmentId: fallbackId, source: 'fallback' })
  }
}

// ============================================================================
// GET — Retrieve assessment by ID
// ============================================================================

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Assessment ID required' }, { status: 400 })
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    const supabase = getSupabase()
    const { data: assessment, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', id)
      .eq('assessment_type', ASSESSMENT_TYPES.FOOD_BUSINESS)
      .single()

    if (error || !assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, assessment })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch assessment' }, { status: 500 })
  }
}
