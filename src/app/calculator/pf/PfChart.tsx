'use client'

import { forwardRef, useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useTheme } from 'next-themes'
import { compact, type ChartPoint } from '@/lib/calculators/epf/view'

// Prototype series colours (Tailwind blue-800 / blue-400 / green-700; dark: blue-400 / blue-200 / green-500).
export const SERIES = {
  light: { own: '#1E40AF', er: '#60A5FA', int: '#15803D', grid: '#E5E7EB', text: '#6B7280' },
  dark: { own: '#60A5FA', er: '#BFDBFE', int: '#22C55E', grid: '#334155', text: '#94A3B8' },
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

interface TipProps {
  active?: boolean
  payload?: { payload: ChartPoint }[]
}

function ChartTooltip({ active, payload }: TipProps) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="min-w-[180px] rounded-lg border border-gray-300 bg-white p-2.5 text-sm shadow-lg dark:border-gray-600 dark:bg-gray-800">
      <div className="mb-1 font-semibold">FY {p.fy} · age {p.age}</div>
      <div className="flex justify-between gap-3"><span>Balance</span><b className="tabular-nums">{compact(p.total)}</b></div>
      <div className="flex justify-between gap-3"><span>You put in</span><span className="tabular-nums">{compact(p.own)}</span></div>
      <div className="flex justify-between gap-3"><span>Employer</span><span className="tabular-nums">{compact(p.er)}</span></div>
      <div className="flex justify-between gap-3"><span>Interest</span><span className="tabular-nums">{compact(p.int)}</span></div>
    </div>
  )
}

/** Stacked area of PF balance by year. The year table is its text alternative. */
export const PfChart = forwardRef<HTMLDivElement, { points: ChartPoint[] }>(function PfChart({ points }, ref) {
  const { resolvedTheme } = useTheme()
  const c = resolvedTheme === 'dark' ? SERIES.dark : SERIES.light
  const reduced = usePrefersReducedMotion()
  const anim = !reduced

  return (
    <div ref={ref} role="img" aria-label="Stacked area chart of PF balance by year. The same data is in the year-by-year table." className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
          <CartesianGrid stroke={c.grid} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: c.text, fontSize: 11 }} tickLine={false} axisLine={{ stroke: c.grid }} minTickGap={16} />
          <YAxis tickFormatter={(v: number) => compact(v)} tick={{ fill: c.text, fontSize: 11 }} tickLine={false} axisLine={false} width={72} />
          <Tooltip content={<ChartTooltip />} />
          <Area type="linear" dataKey="own" stackId="1" stroke="none" fill={c.own} fillOpacity={1} isAnimationActive={anim} name="Your contributions" />
          <Area type="linear" dataKey="er" stackId="1" stroke="none" fill={c.er} fillOpacity={1} isAnimationActive={anim} name="Employer’s share to PF" />
          <Area type="linear" dataKey="int" stackId="1" stroke="none" fill={c.int} fillOpacity={1} isAnimationActive={anim} name="Interest earned" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
})
