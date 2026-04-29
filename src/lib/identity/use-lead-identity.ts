'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { identifyUser } from '@/lib/analytics/tracking'
import type { User, Profile } from './types'

interface LeadIdentityState {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isVerified: boolean
}

export function useLeadIdentity(): LeadIdentityState {
  const [state, setState] = useState<LeadIdentityState>({
    user: null,
    profile: null,
    isLoading: true,
    isVerified: false,
  })

  const fetchProfile = useCallback(async (userId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return data as Profile | null
  }, [])

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        setState({ user: null, profile: null, isLoading: false, isVerified: false })
        return
      }
      const profile = await fetchProfile(session.user.id)
      const isVerified = !!profile?.email_verified_at
      setState({ user: session.user, profile, isLoading: false, isVerified })

      identifyUser(session.user.id, {
        email: profile?.email ?? undefined,
        subscription_tier: undefined,
      })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session?.user) {
          setState({ user: null, profile: null, isLoading: false, isVerified: false })
          return
        }

        const profile = await fetchProfile(session.user.id)
        const isVerified = !!profile?.email_verified_at
        setState({ user: session.user, profile, isLoading: false, isVerified })

        identifyUser(session.user.id, {
          email: profile?.email ?? undefined,
          subscription_tier: undefined,
        })
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  return state
}
