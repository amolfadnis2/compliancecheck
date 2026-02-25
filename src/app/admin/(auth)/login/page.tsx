'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        return
      }

      if (!data.user) {
        setError('Login failed. Please try again.')
        return
      }

      // Refresh server state first so middleware picks up the session cookie
      router.refresh()

      // Small delay to ensure cookies are synced before navigation
      await new Promise((resolve) => setTimeout(resolve, 500))

      router.push('/admin')
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Admin Access
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              ComplianceCheck Dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input id="email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                autoComplete="email"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input id="password" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)} required
                autoComplete="current-password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-md transition-colors">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
