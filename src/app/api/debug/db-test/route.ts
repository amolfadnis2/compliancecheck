import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Debug endpoint to test Supabase connectivity and table structure
 * GET /api/debug/db-test
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    environment: {},
    tables: {},
    errors: [],
  }

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  results.environment = {
    supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET',
    serviceKeySet: !!supabaseKey,
    serviceKeyLength: supabaseKey?.length || 0,
  }

  if (!supabaseUrl || !supabaseKey) {
    results.errors = ['Supabase credentials not configured']
    return NextResponse.json(results, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Test 1: Check users table structure
  try {
    const { data: usersSchema, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (error) {
      (results.errors as string[]).push(`Users table error: ${error.message} (code: ${error.code})`)
      results.tables = { ...results.tables as object, users: { error: error.message } }
    } else {
      const columns = usersSchema && usersSchema[0] ? Object.keys(usersSchema[0]) : []
      results.tables = { 
        ...results.tables as object, 
        users: { 
          accessible: true, 
          rowCount: usersSchema?.length || 0,
          columns: columns,
          hasCompanyFields: columns.includes('company_name'),
        } 
      }
    }
  } catch (e) {
    (results.errors as string[]).push(`Users table exception: ${e}`)
  }

  // Test 2: Check companies table
  try {
    const { data: companiesData, error } = await supabase
      .from('companies')
      .select('*')
      .limit(1)
    
    if (error) {
      (results.errors as string[]).push(`Companies table error: ${error.message}`)
      results.tables = { ...results.tables as object, companies: { error: error.message } }
    } else {
      const columns = companiesData && companiesData[0] ? Object.keys(companiesData[0]) : []
      results.tables = { 
        ...results.tables as object, 
        companies: { 
          accessible: true, 
          rowCount: companiesData?.length || 0,
          columns: columns,
        } 
      }
    }
  } catch (e) {
    (results.errors as string[]).push(`Companies table exception: ${e}`)
  }

  // Test 3: Try inserting a test user
  const testEmail = `test_${Date.now()}@debug.local`
  const testId = crypto.randomUUID()
  try {
    const { data: testUser, error } = await supabase
      .from('users')
      .insert({
        id: testId,
        email: testEmail,
        full_name: 'Debug Test User',
        is_deleted: false,
        marketing_consent: false,
      })
      .select()
      .single()
    
    if (error) {
      (results.errors as string[]).push(`User INSERT failed: ${error.message} (code: ${error.code})`)
      results.tables = { 
        ...results.tables as object, 
        userInsertTest: { 
          success: false, 
          error: error.message,
          code: error.code,
          hint: error.hint,
        } 
      }
    } else {
      // Clean up test user
      await supabase.from('users').delete().eq('id', testUser.id)
      results.tables = { 
        ...results.tables as object, 
        userInsertTest: { 
          success: true, 
          message: 'Insert and delete successful',
          createdId: testUser.id,
        } 
      }
    }
  } catch (e) {
    (results.errors as string[]).push(`User INSERT exception: ${e}`)
  }

  // Test 4: Check anonymous user exists
  try {
    const { data: anonUser, error } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .single()
    
    results.tables = { 
      ...results.tables as object, 
      anonymousUser: error ? { exists: false, error: error.message } : { exists: true, data: anonUser }
    }
  } catch (e) {
    (results.errors as string[]).push(`Anonymous user check exception: ${e}`)
  }

  return NextResponse.json(results)
}
