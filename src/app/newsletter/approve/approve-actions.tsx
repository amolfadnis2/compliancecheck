'use client'

import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Status = 'draft' | 'sending' | 'sent' | 'discarded'

export function ApproveActions({
  token,
  initialStatus,
  initialSentCount,
  activeSubscribers,
}: {
  token: string
  initialStatus: Status
  initialSentCount: number
  activeSubscribers: number
}) {
  const [status, setStatus] = useState<Status>(initialStatus)
  const [sentCount, setSentCount] = useState(initialSentCount)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const call = async (action: 'send' | 'discard') => {
    const res = await fetch('/api/newsletter/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Request failed')
    return data as { done?: boolean; sentCount?: number; discarded?: boolean }
  }

  const send = async () => {
    if (!window.confirm(`Send this newsletter to ${activeSubscribers} subscriber(s) now?`)) return
    setBusy(true)
    setError(null)
    setStatus('sending')
    try {
      // One batch per request until the server reports done.
      for (;;) {
        const data = await call('send')
        setSentCount(data.sentCount ?? 0)
        if (data.done) break
      }
      setStatus('sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sending failed')
    } finally {
      setBusy(false)
    }
  }

  const discard = async () => {
    if (!window.confirm('Discard this issue? It will not be sent.')) return
    setBusy(true)
    setError(null)
    try {
      await call('discard')
      setStatus('discarded')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Discard failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 p-5 space-y-4">
      {status === 'sent' ? (
        <p className="flex items-center gap-2 text-green-700 font-medium">
          <CheckCircle className="h-5 w-5" aria-hidden="true" /> Sent to {sentCount} subscriber(s).
        </p>
      ) : status === 'discarded' ? (
        <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
          <XCircle className="h-5 w-5" aria-hidden="true" /> Discarded. Nothing was sent.
        </p>
      ) : (
        <>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {status === 'sending'
              ? `Sending… ${sentCount} of about ${activeSubscribers} delivered so far. If this stops, press Send again to resume.`
              : `This issue will go to ${activeSubscribers} confirmed subscriber(s). Nothing has been sent yet.`}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={send} disabled={busy} className="bg-green-700 hover:bg-green-800 text-white">
              {busy && status === 'sending' ? 'Sending…' : status === 'sending' ? 'Resume sending' : 'Approve and send'}
            </Button>
            {status === 'draft' && (
              <Button onClick={discard} disabled={busy} variant="outline">
                Discard
              </Button>
            )}
          </div>
        </>
      )}
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
    </div>
  )
}
