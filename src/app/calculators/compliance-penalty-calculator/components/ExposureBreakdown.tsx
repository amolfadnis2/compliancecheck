'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { LawExposure } from '@/lib/calculators/penalty-exposure/types'
import { formatRupees } from '@/lib/calculators/penalty-exposure/calculator'

interface Props {
  exposures: LawExposure[]
}

const COLORS_TYPICAL = '#1E40AF'
const COLORS_ADDITIONAL = '#D97706'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <p className="mb-2 font-semibold text-gray-900 dark:text-white">{label}</p>
      {payload.map((entry: { name: string; value: number; color: string }, i: number) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatRupees(entry.value)}
        </p>
      ))}
    </div>
  )
}

export function ExposureBreakdown({ exposures }: Props) {
  const chartData = exposures
    .filter((e) => e.typicalAnnualRisk > 0 || e.maxStatutoryPenalty > 0)
    .slice(0, 10)
    .map((e) => ({
      name: e.law,
      typical: e.typicalAnnualRisk,
      additional: Math.max(0, e.maxStatutoryPenalty - e.typicalAnnualRisk),
    }))

  if (chartData.length === 0) return null

  return (
    <div>
      <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
        Exposure by Law
      </h3>
      <ResponsiveContainer width="100%" height={Math.max(220, chartData.length * 44)}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 20, left: 8, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
          <XAxis
            type="number"
            tickFormatter={(v: number) => formatRupees(v)}
            tick={{ fontSize: 11, fill: '#6B7280' }}
            width={70}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: '#374151' }}
            width={110}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value: string) =>
              value === 'typical' ? 'Typical Annual Risk' : 'Additional Max Exposure'
            }
            wrapperStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="typical" name="typical" stackId="a" fill={COLORS_TYPICAL} radius={[0, 0, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS_TYPICAL} />
            ))}
          </Bar>
          <Bar dataKey="additional" name="additional" stackId="a" fill={COLORS_ADDITIONAL} radius={[0, 4, 4, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS_ADDITIONAL} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
