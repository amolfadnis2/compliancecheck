import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type {
  DashboardData,
  DashboardStats,
  AssessmentRow,
  AssessmentTypeBreakdown,
  ScoreBucket,
  StateBreakdown,
  IndustryBreakdown,
  DailyTrend,
} from '@/types/admin'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL

/** Verify the caller is the admin user */
async function verifyAdmin(): Promise<boolean> {
  if (!ADMIN_EMAIL) return false

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch { /* Server Component */ }
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  return user?.email === ADMIN_EMAIL
}

export async function GET(request: NextRequest) {
  // Auth check
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const searchParams = request.nextUrl.searchParams
  const days = parseInt(searchParams.get('days') || '30', 10)
  const fromDate = searchParams.get('from')
  const toDate = searchParams.get('to')

  // Calculate date filter
  let dateFrom: string
  let dateTo: string = new Date().toISOString()

  if (fromDate && toDate) {
    dateFrom = new Date(fromDate).toISOString()
    dateTo = new Date(toDate + 'T23:59:59.999Z').toISOString()
  } else {
    const from = new Date()
    from.setDate(from.getDate() - days)
    dateFrom = from.toISOString()
  }

  const periodLabel = fromDate && toDate
    ? `${fromDate} to ${toDate}`
    : `Last ${days} days`

  try {
    const supabase = createAdminClient()

    // 1. Fetch assessments with user details (joined via user_id)
    const { data: rawAssessments, error: assessmentError } = await supabase
      .from('assessments')
      .select(`
        id,
        assessment_type,
        status,
        overall_score,
        responses,
        created_at,
        completed_at,
        user_id,
        users!assessments_user_id_fkey (
          email,
          full_name,
          company_name,
          registered_state,
          industry_type,
          employee_count
        )
      `)
      .gte('created_at', dateFrom)
      .lte('created_at', dateTo)
      .order('created_at', { ascending: false })

    if (assessmentError) {
      console.error('Assessment fetch error:', assessmentError)
      return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 })
    }

    const allAssessments = rawAssessments || []

    // 2. Map to flat AssessmentRow[]
    const assessments: AssessmentRow[] = allAssessments.map((a) => {
      const user = a.users as unknown as Record<string, string | null> | null
      return {
        id: a.id,
        user_email: user?.email || extractEmail(a.responses) || 'N/A',
        user_name: user?.full_name || extractName(a.responses) || 'N/A',
        company_name: user?.company_name || extractCompany(a.responses) || 'N/A',
        assessment_type: formatAssessmentType(a.assessment_type),
        status: a.status || 'unknown',
        overall_score: a.overall_score,
        state: user?.registered_state || extractState(a.responses) || null,
        industry: user?.industry_type || extractIndustry(a.responses) || null,
        employee_count: user?.employee_count || null,
        created_at: a.created_at,
        completed_at: a.completed_at,
      }
    })

    // 3. Compute KPI stats
    const completed = allAssessments.filter((a) => a.status === 'completed')
    const scores = completed
      .map((a) => a.overall_score)
      .filter((s): s is number => s !== null && s !== undefined)

    const uniqueEmails = new Set(
      assessments.map((a) => a.user_email).filter((e) => e !== 'N/A')
    )

    // 4. Fetch NPS from feedback table
    const { data: feedbackData } = await supabase
      .from('feedback')
      .select('nps_score')
      .gte('submitted_at', dateFrom)
      .lte('submitted_at', dateTo)
      .not('nps_score', 'is', null)

    let npsScore: number | null = null
    const npsResponses = feedbackData?.length || 0
    if (feedbackData && feedbackData.length > 0) {
      const promoters = feedbackData.filter((f) => f.nps_score >= 9).length
      const detractors = feedbackData.filter((f) => f.nps_score <= 6).length
      npsScore = Math.round(((promoters - detractors) / feedbackData.length) * 100)
    }

    const stats: DashboardStats = {
      totalAssessments: allAssessments.length,
      completedAssessments: completed.length,
      uniqueUsers: uniqueEmails.size,
      averageScore: scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null,
      completionRate: allAssessments.length > 0
        ? Math.round((completed.length / allAssessments.length) * 100)
        : 0,
      npsScore,
      npsResponses,
      periodLabel,
    }

    // 5. Assessment type breakdown
    const typeMap = new Map<string, { total: number; completed: number; scores: number[] }>()
    allAssessments.forEach((a) => {
      const type = formatAssessmentType(a.assessment_type)
      const entry = typeMap.get(type) || { total: 0, completed: 0, scores: [] }
      entry.total++
      if (a.status === 'completed') {
        entry.completed++
        if (a.overall_score !== null) entry.scores.push(a.overall_score)
      }
      typeMap.set(type, entry)
    })
    const typeBreakdown: AssessmentTypeBreakdown[] = Array.from(typeMap.entries()).map(
      ([type, data]) => ({
        assessment_type: type,
        total: data.total,
        completed: data.completed,
        avg_score: data.scores.length > 0
          ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
          : null,
      })
    )

    // 6. Score distribution buckets
    const buckets = [
      { label: '0-20 (Critical)', min: 0, max: 20, count: 0 },
      { label: '21-40 (Poor)', min: 21, max: 40, count: 0 },
      { label: '41-60 (Fair)', min: 41, max: 60, count: 0 },
      { label: '61-80 (Good)', min: 61, max: 80, count: 0 },
      { label: '81-100 (Excellent)', min: 81, max: 100, count: 0 },
    ]
    scores.forEach((s) => {
      const bucket = buckets.find((b) => s >= b.min && s <= b.max)
      if (bucket) bucket.count++
    })
    const scoreBuckets: ScoreBucket[] = buckets.map((b) => ({
      bucket: b.label,
      count: b.count,
      percentage: scores.length > 0 ? Math.round((b.count / scores.length) * 100) : 0,
    }))

    // 7. State breakdown
    const stateMap = new Map<string, { total: number; scores: number[] }>()
    assessments.forEach((a) => {
      if (!a.state) return
      const entry = stateMap.get(a.state) || { total: 0, scores: [] }
      entry.total++
      if (a.overall_score !== null) entry.scores.push(a.overall_score)
      stateMap.set(a.state, entry)
    })
    const stateBreakdown: StateBreakdown[] = Array.from(stateMap.entries())
      .map(([state, data]) => ({
        state,
        total: data.total,
        avg_score: data.scores.length > 0
          ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
          : null,
      }))
      .sort((a, b) => b.total - a.total)

    // 8. Industry breakdown
    const industryMap = new Map<string, { total: number; scores: number[] }>()
    assessments.forEach((a) => {
      if (!a.industry) return
      const entry = industryMap.get(a.industry) || { total: 0, scores: [] }
      entry.total++
      if (a.overall_score !== null) entry.scores.push(a.overall_score)
      industryMap.set(a.industry, entry)
    })
    const industryBreakdown: IndustryBreakdown[] = Array.from(industryMap.entries())
      .map(([industry, data]) => ({
        industry,
        total: data.total,
        avg_score: data.scores.length > 0
          ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
          : null,
      }))
      .sort((a, b) => b.total - a.total)

    // 9. Daily trend (group by date)
    const trendMap = new Map<string, number>()
    allAssessments.forEach((a) => {
      const date = a.created_at.split('T')[0]
      trendMap.set(date, (trendMap.get(date) || 0) + 1)
    })
    const dailyTrend: DailyTrend[] = Array.from(trendMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const data: DashboardData = {
      stats,
      assessments,
      typeBreakdown,
      scoreBuckets,
      stateBreakdown,
      industryBreakdown,
      dailyTrend,
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// --- Helper functions to extract data from JSONB responses ---

function extractEmail(responses: Record<string, unknown> | null): string | null {
  if (!responses) return null
  const ud = responses.userDetails as Record<string, string> | undefined
  return ud?.email || null
}

function extractName(responses: Record<string, unknown> | null): string | null {
  if (!responses) return null
  const ud = responses.userDetails as Record<string, string> | undefined
  return ud?.fullName || null
}

function extractCompany(responses: Record<string, unknown> | null): string | null {
  if (!responses) return null
  const ud = responses.userDetails as Record<string, string> | undefined
  return ud?.companyName || null
}

function extractState(responses: Record<string, unknown> | null): string | null {
  if (!responses) return null
  const ud = responses.userDetails as Record<string, string> | undefined
  return ud?.state || null
}

function extractIndustry(responses: Record<string, unknown> | null): string | null {
  if (!responses) return null
  const ud = responses.userDetails as Record<string, string> | undefined
  return ud?.industry || null
}

function formatAssessmentType(type: string): string {
  const map: Record<string, string> = {
    statutory_health: 'Statutory Health',
    labour_code: 'Labour Code',
    labor_code: 'Labour Code',
    dpdp: 'DPDP',
    posh: 'POSH Act',
    state_wise: 'State-Wise',
    state_wise_compliance: 'State-Wise',
    food_business: 'Food Business',
    document: 'Document',
    ctc_calculator: 'CTC Calculator',
    gratuity_calculator: 'Gratuity Calculator',
  }
  return map[type] || type
}
