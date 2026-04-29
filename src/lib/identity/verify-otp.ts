'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Step 1: Send OTP to the given email, linking it to the current anonymous session.
 * Supabase will upgrade the anonymous user to an email-linked user on verify.
 */
export async function sendOtp(email: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  })

  if (error) {
    if (error.message.includes('rate') || error.status === 429) {
      throw new Error('TOO_MANY_REQUESTS')
    }
    throw new Error(error.message)
  }
}

/**
 * Step 2: Verify the 6-digit OTP code entered by the user.
 * On success Supabase upgrades the anonymous session and fires the
 * on_auth_user_email_verified trigger which updates the profiles row.
 */
export async function verifyOtp(email: string, token: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error) {
    if (error.message.includes('expired') || error.message.includes('invalid')) {
      throw new Error('INVALID_OR_EXPIRED')
    }
    throw new Error(error.message)
  }

  return data.user
}
