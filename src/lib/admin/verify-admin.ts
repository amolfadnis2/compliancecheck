import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * True when the signed-in Supabase user is ADMIN_EMAIL. Same check as
 * /api/admin/stats (which keeps its own copy).
 */
export async function verifyAdmin(): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return false

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch { /* Server Component */ }
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  return user?.email === adminEmail
}
