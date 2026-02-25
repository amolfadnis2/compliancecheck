'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  ClipboardCheck, Users, TrendingUp, Star, Percent,
  ChevronDown, RefreshCw, AlertCircle,
} from 'lucide-react'
import type { DashboardData, DateRange } from '@/types/admin'

const CHART_COLORS = ['#1E40AF', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0891B2']
const SCORE_COLORS = ['#DC2626', '#D97706', '#EAB308', '#059669', '#1E40AF']

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}


// ────────────────── Helper Components ──────────────────

function KPICard({
  icon, label, value, sub, color,
}: {
  icon: React.ReactNode; label: string; value: string; sub?: string
  color: 'blue' | 'green' | 'purple' | 'amber' | 'cyan'
}) {
  const bg: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    cyan: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${bg[color]}`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{label}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
          {sub && <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{sub}</p>}
        </div>
      </div>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{title}</h3>
      {children}
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-[250px] text-sm text-gray-400">
      No data for this period
    </div>
  )
}

function scoreColor(score: number | null): string {
  if (score === null) return 'text-gray-400'
  if (score >= 81) return 'text-green-600 dark:text-green-400'
  if (score >= 61) return 'text-blue-600 dark:text-blue-400'
  if (score >= 41) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

// ────────────────── Main Dashboard Component ──────────────────

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dateRange, setDateRange] = useState<DateRange>('30')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      let url = `/api/admin/stats?days=${dateRange}`
      if (dateRange === 'custom' && customFrom && customTo) {
        url = `/api/admin/stats?from=${customFrom}&to=${customTo}`
      }

      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) {
        if (res.status === 403) {
          setError('Access denied. Please log in as admin.')
          return
        }
        throw new Error('Failed to fetch')
      }

      const json: DashboardData = await res.json()
      setData(json)
    } catch {
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [dateRange, customFrom, customTo])

  useEffect(() => {
    if (dateRange !== 'custom') fetchData()
  }, [dateRange, fetchData])

  function handleCustomApply() {
    if (customFrom && customTo) fetchData()
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading dashboard...</span>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button onClick={fetchData}
            className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { stats, assessments, typeBreakdown, scoreBuckets, stateBreakdown, industryBreakdown, dailyTrend } = data

  // Pie chart data for assessment types
  const pieData = typeBreakdown.map((t) => ({
    name: t.assessment_type,
    value: t.total,
  }))

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header + Date Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {stats.periodLabel} &middot; {stats.totalAssessments} assessment{stats.totalAssessments !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => {
                const val = e.target.value as DateRange
                setDateRange(val)
                setShowCustom(val === 'custom')
              }}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-8 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="15">Last 15 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="custom">Custom range</option>
            </select>
            <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Custom date inputs */}
      {showCustom && (
        <div className="flex items-end gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">From</label>
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">To</label>
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <button onClick={handleCustomApply} disabled={!customFrom || !customTo}
            className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400">
            Apply
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard icon={<ClipboardCheck className="h-5 w-5" />} label="Total Assessments"
          value={stats.totalAssessments.toString()} sub={`${stats.completedAssessments} completed`} color="blue" />
        <KPICard icon={<Users className="h-5 w-5" />} label="Unique Users"
          value={stats.uniqueUsers.toString()} color="green" />
        <KPICard icon={<TrendingUp className="h-5 w-5" />} label="Avg Score"
          value={stats.averageScore !== null ? `${stats.averageScore}%` : '-'} color="purple" />
        <KPICard icon={<Percent className="h-5 w-5" />} label="Completion Rate"
          value={`${stats.completionRate}%`} color="amber" />
        <KPICard icon={<Star className="h-5 w-5" />} label="NPS Score"
          value={stats.npsScore !== null ? stats.npsScore.toString() : '-'}
          sub={stats.npsResponses > 0 ? `${stats.npsResponses} responses` : 'No data'} color="cyan" />
      </div>

      {/* Charts Row 1: Trend + Type Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Daily Assessments">
          {dailyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => {
                  const d = new Date(v); return `${d.getDate()}/${d.getMonth() + 1}`
                }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={(v) => formatDate(v as string)} />
                <Line type="monotone" dataKey="count" stroke="#1E40AF" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>

        <ChartCard title="Assessment Type Split">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>
      </div>

      {/* Charts Row 2: Score Distribution + Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Score Distribution">
          {scoreBuckets.some(b => b.count > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={scoreBuckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="bucket" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: number | undefined) => [`${val ?? 0} assessments`]} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {scoreBuckets.map((_, i) => <Cell key={i} fill={SCORE_COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>

        <ChartCard title="By Assessment Type">
          {typeBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={typeBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis dataKey="assessment_type" type="category" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="total" fill="#1E40AF" radius={[0, 4, 4, 0]} name="Total" />
                <Bar dataKey="completed" fill="#059669" radius={[0, 4, 4, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>
      </div>

      {/* State + Industry Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Top States">
          {stateBreakdown.length > 0 ? (
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {stateBreakdown.slice(0, 15).map((s) => (
                <div key={s.state} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300 truncate flex-1">{s.state}</span>
                  <span className="text-gray-500 dark:text-gray-400 mx-3">avg: {s.avg_score ?? '-'}%</span>
                  <span className="font-semibold text-gray-900 dark:text-white w-8 text-right">{s.total}</span>
                </div>
              ))}
            </div>
          ) : <EmptyChart />}
        </ChartCard>

        <ChartCard title="Top Industries">
          {industryBreakdown.length > 0 ? (
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {industryBreakdown.slice(0, 15).map((ind) => (
                <div key={ind.industry} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300 truncate flex-1">{ind.industry}</span>
                  <span className="text-gray-500 dark:text-gray-400 mx-3">avg: {ind.avg_score ?? '-'}%</span>
                  <span className="font-semibold text-gray-900 dark:text-white w-8 text-right">{ind.total}</span>
                </div>
              ))}
            </div>
          ) : <EmptyChart />}
        </ChartCard>
      </div>

      {/* Recent Assessments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Recent Assessments ({assessments.length})
          </h3>
          <a href="/admin/assessments"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
            View all &rarr;
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Company</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Score</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {assessments.slice(0, 15).map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {formatDate(a.created_at)}
                  </td>
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-300 max-w-[200px] truncate">
                    {a.user_email}
                  </td>
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-300 max-w-[180px] truncate">
                    {a.company_name}
                  </td>
                  <td className="px-4 py-2">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      {a.assessment_type}
                    </span>
                  </td>
                  <td className={`px-4 py-2 font-semibold ${scoreColor(a.overall_score)}`}>
                    {a.overall_score !== null ? `${a.overall_score}%` : '-'}
                  </td>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
                    {a.state || '-'}
                  </td>
                </tr>
              ))}
              {assessments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No assessments found for this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
