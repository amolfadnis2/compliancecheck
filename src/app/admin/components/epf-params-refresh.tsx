'use client'

import { useState } from 'react'

/** Admin button: re-read EPF statutory params from Supabase (busts the 'epf-params' cache tag). */
export function EpfParamsRefresh() {
  const [status, setStatus] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')

  const refresh = async () => {
    setStatus('busy')
    try {
      const res = await fetch('/api/admin/revalidate-epf-params', { method: 'POST' })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <button
      onClick={refresh}
      disabled={status === 'busy'}
      className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      title="Reload PF calculator statutory params from Supabase"
    >
      {status === 'busy' ? 'Refreshing…' : status === 'done' ? 'PF params refreshed' : status === 'error' ? 'Refresh failed' : 'Refresh PF params'}
    </button>
  )
}
