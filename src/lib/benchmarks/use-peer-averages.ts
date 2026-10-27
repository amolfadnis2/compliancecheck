'use client'

import { useEffect, useState } from 'react'
import type { AssessmentType } from '@/lib/constants/assessment-types'
import type { PeerAverages } from './peer-averages'

/**
 * Client-side peer averages for results pages rendered in the browser (POSH,
 * Auto Dealer). Resolves to null while loading, on error, or when there are not
 * enough peers — the summary then simply omits the comparison.
 */
export function usePeerAverages(type: AssessmentType, assessmentId: string | null | undefined): PeerAverages | null {
  const [peers, setPeers] = useState<PeerAverages | null>(null)
  useEffect(() => {
    if (!assessmentId) return
    let cancelled = false
    fetch(`/api/benchmarks?type=${encodeURIComponent(type)}&id=${encodeURIComponent(assessmentId)}`)
      .then((res) => (res.ok ? res.json() : { peers: null }))
      .then((data: { peers: PeerAverages | null }) => {
        if (!cancelled) setPeers(data.peers ?? null)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [type, assessmentId])
  return peers
}
