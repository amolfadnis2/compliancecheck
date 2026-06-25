import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isValidAssessmentType } from '@/lib/constants/assessment-types'

let _supabase: ReturnType<typeof createClient> | null = null
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _supabase
}

export async function GET(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ paid: false }, { status: 200 })
    }

    const { searchParams } = new URL(request.url)
    const assessmentId = searchParams.get('assessmentId')
    const assessmentType = searchParams.get('assessmentType')

    if (!assessmentId || !assessmentType || !isValidAssessmentType(assessmentType)) {
      return NextResponse.json({ error: 'Missing or invalid params' }, { status: 400 })
    }

    const { data, error } = await getSupabase()
      .from('assessment_entitlements')
      .select('status')
      .eq('assessment_id', assessmentId)
      .eq('assessment_type', assessmentType)
      .in('status', ['paid', 'waived'])
      .maybeSingle()

    if (error) {
      console.error('[entitlement-status] query error:', error.message)
      return NextResponse.json({ paid: false }, { status: 200 })
    }

    return NextResponse.json({ paid: !!data })
  } catch (err) {
    console.error('[entitlement-status] error:', err)
    return NextResponse.json({ paid: false }, { status: 200 })
  }
}
