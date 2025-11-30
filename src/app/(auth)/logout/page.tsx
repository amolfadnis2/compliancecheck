'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const logout = async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    }
    logout()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <p className="text-gray-600">Signing out...</p>
    </div>
  )
}
