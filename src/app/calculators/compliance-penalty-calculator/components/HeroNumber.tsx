'use client'

import { useEffect, useRef, useState } from 'react'
import { formatRupees } from '@/lib/calculators/penalty-exposure/calculator'

interface HeroNumberProps {
  typicalRisk: number
  maxExposure: number
}

function useCountUp(target: number, duration = 1200): number {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number>(0)
  const startRef = useRef<number | null>(null)
  const prevTargetRef = useRef(0)

  useEffect(() => {
    const from = prevTargetRef.current
    prevTargetRef.current = target
    startRef.current = null

    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      }
    }

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return value
}

export function HeroNumber({ typicalRisk, maxExposure }: HeroNumberProps) {
  const animatedTypical = useCountUp(typicalRisk)
  const animatedMax = useCountUp(maxExposure)

  return (
    <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/60 p-6 dark:border-blue-800 dark:from-blue-950/60 dark:to-blue-900/40">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
          Your Typical Annual Risk
        </p>
        <p
          className="mt-1 text-5xl font-bold tabular-nums text-blue-700 dark:text-blue-300"
          aria-live="polite"
          aria-label={`Typical annual risk: ${formatRupees(typicalRisk)}`}
        >
          {formatRupees(animatedTypical)}
        </p>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Up to{' '}
          <span className="font-semibold text-red-600 dark:text-red-400">
            {formatRupees(animatedMax)}
          </span>{' '}
          in maximum statutory exposure
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
          Probability-weighted across applicable Indian laws
        </p>
      </div>
    </div>
  )
}
