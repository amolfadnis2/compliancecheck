import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit } from '@/lib/rate-limit'

/**
 * Suggestions / Ideas Submission API
 *
 * POST /api/suggestions
 *
 * Saves a user suggestion or idea to Supabase. Contact details are optional
 * and unverified. Never returns a 500 on missing env vars — falls back to a
 * local ID so the client can still confirm submission (see CLAUDE.md section 11).
 */

const VALID_CATEGORIES = [
  'improve_existing',
  'new_assessment',
  'new_tool',
  'bug_report',
  'other',
] as const

// Lazy-init Supabase — module-level init breaks Netlify build when env vars are absent
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabase(): any {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  if (!_supabase) {
    _supabase = createClient(url, key)
  }
  return _supabase
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
    if (!checkRateLimit(`feedback:${ip}`, 5, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': '60' } })
    }

    const body = await request.json()

    const suggestion = typeof body.suggestion === 'string' ? body.suggestion.trim() : ''
    const category = VALID_CATEGORIES.includes(body.category) ? body.category : 'other'
    const name = typeof body.name === 'string' ? body.name.trim() || null : null
    const email = typeof body.email === 'string' ? body.email.trim() || null : null
    const phone = typeof body.phone === 'string' ? body.phone.trim() || null : null

    // The suggestion text is the only required field
    if (!suggestion) {
      return NextResponse.json(
        { success: false, error: 'Suggestion text is required' },
        { status: 400 }
      )
    }

    const id = crypto.randomUUID()

    const supabase = getSupabase()

    // No DB configured — return a local fallback ID instead of erroring
    if (!supabase) {
      return NextResponse.json({
        success: true,
        id: `local_${Date.now()}`,
        savedToDb: false,
        message: 'Suggestion received. Database sync pending.',
      })
    }

    const { data, error } = await supabase
      .from('suggestions')
      .insert([
        {
          id,
          suggestion,
          category,
          name,
          email,
          phone,
          created_at: new Date().toISOString(),
        },
      ])
      .select('id')
      .single()

    if (error) {
      console.error('Suggestion insert error:', error)
      return NextResponse.json({
        success: true,
        id: `local_${Date.now()}`,
        savedToDb: false,
        message: 'Suggestion received. Database sync pending.',
      })
    }

    return NextResponse.json({
      success: true,
      id: data?.id || id,
      savedToDb: true,
    })
  } catch (error) {
    console.error('Suggestion submission error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save suggestion',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
