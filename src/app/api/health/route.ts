import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const checks = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    supabase: {
      url_configured: !!supabaseUrl,
      key_configured: !!supabaseKey,
      connection: 'not_tested',
      tables: {} as Record<string, number | string>,
      anonymous_user: false,
    },
    status: 'unknown' as 'healthy' | 'degraded' | 'unhealthy',
    errors: [] as string[],
  }

  // Check if Supabase is configured
  if (!supabaseUrl || !supabaseKey) {
    checks.supabase.connection = 'not_configured'
    checks.errors.push('Supabase environment variables not set')
    checks.status = 'unhealthy'
    return NextResponse.json(checks, { status: 503 })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test connection by counting records in each table
    const tables = ['users', 'assessments', 'feedback', 'companies', 'payments']
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        checks.supabase.tables[table] = `error: ${error.message}`
        checks.errors.push(`Table '${table}': ${error.message}`)
      } else {
        checks.supabase.tables[table] = count ?? 0
      }
    }

    // Check if anonymous user exists
    const { data: anonUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .single()

    checks.supabase.anonymous_user = !!anonUser

    if (!anonUser) {
      checks.errors.push('Anonymous user not found - run migration 001_initial_schema.sql')
    }

    // Determine overall status
    if (checks.errors.length === 0) {
      checks.supabase.connection = 'connected'
      checks.status = 'healthy'
    } else if (Object.values(checks.supabase.tables).some(v => typeof v === 'number')) {
      checks.supabase.connection = 'connected'
      checks.status = 'degraded'
    } else {
      checks.supabase.connection = 'error'
      checks.status = 'unhealthy'
    }

  } catch (error) {
    checks.supabase.connection = 'error'
    checks.errors.push(error instanceof Error ? error.message : 'Unknown error')
    checks.status = 'unhealthy'
  }

  const httpStatus = checks.status === 'healthy' ? 200 : checks.status === 'degraded' ? 200 : 503
  return NextResponse.json(checks, { status: httpStatus })
}
