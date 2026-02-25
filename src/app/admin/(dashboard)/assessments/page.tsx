'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  ChevronDown, ChevronUp, RefreshCw, AlertCircle, Search, Download, X,
} from 'lucide-react'
import type { DashboardData, DateRange } from '@/types/admin'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}


function scoreColor(score: number | null): string {
  if (score === null) return 'text-gray-400'
  if (score >= 81) return 'text-green-600 dark:text-green-400'
  if (score >= 61) return 'text-blue-600 dark:text-blue-400'
  if (score >= 41) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

type SortKey = 'created_at' | 'user_email' | 'company_name' | 'assessment_type' | 'overall_score' | 'state'
type SortDir = 'asc' | 'desc'

export default function AdminAssessmentsPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dateRange, setDateRange] = useState<DateRange>('30')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  // Table controls
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)
  const pageSize = 25

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
        if (res.status === 403) { setError('Access denied.'); return }
        throw new Error('Failed to fetch')
      }
      const json: DashboardData = await res.json()
      setData(json)
      setPage(1)
    } catch {
      setError('Failed to load data.')
    } finally {
      setLoading(false)
    }
  }, [dateRange, customFrom, customTo])

  useEffect(() => {
    if (dateRange !== 'custom') fetchData()
  }, [dateRange, fetchData])

  // Get unique assessment types for filter dropdown
  const assessmentTypes = useMemo(() => {
    if (!data) return []
    const types = new Set(data.assessments.map(a => a.assessment_type))
    return Array.from(types).sort()
  }, [data])

  // Filter, search, sort
  const filtered = useMemo(() => {
    if (!data) return []
    let rows = [...data.assessments]

    // Type filter
    if (typeFilter !== 'all') {
      rows = rows.filter(a => a.assessment_type === typeFilter)
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(a =>
        a.user_email.toLowerCase().includes(q) ||
        a.company_name.toLowerCase().includes(q) ||
        (a.state && a.state.toLowerCase().includes(q)) ||
        (a.industry && a.industry.toLowerCase().includes(q)) ||
        a.assessment_type.toLowerCase().includes(q)
      )
    }

    // Sort
    rows.sort((a, b) => {
      let valA: string | number = ''
      let valB: string | number = ''

      switch (sortKey) {
        case 'created_at':
          valA = a.created_at; valB = b.created_at; break
        case 'user_email':
          valA = a.user_email.toLowerCase(); valB = b.user_email.toLowerCase(); break
        case 'company_name':
          valA = a.company_name.toLowerCase(); valB = b.company_name.toLowerCase(); break
        case 'assessment_type':
          valA = a.assessment_type; valB = b.assessment_type; break
        case 'overall_score':
          valA = a.overall_score ?? -1; valB = b.overall_score ?? -1; break
        case 'state':
          valA = (a.state || '').toLowerCase(); valB = (b.state || '').toLowerCase(); break
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1
      if (valA > valB) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return rows
  }, [data, typeFilter, search, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(key === 'created_at' ? 'desc' : 'asc')
    }
    setPage(1)
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronDown className="h-3 w-3 opacity-30" />
    return sortDir === 'asc'
      ? <ChevronUp className="h-3 w-3 text-blue-600" />
      : <ChevronDown className="h-3 w-3 text-blue-600" />
  }

  // CSV export
  function exportCSV() {
    const headers = ['Date', 'Email', 'Name', 'Company', 'Type', 'Score', 'State', 'Industry', 'Employees', 'Status']
    const csvRows = [headers.join(',')]
    filtered.forEach(a => {
      csvRows.push([
        a.created_at.split('T')[0],
        `"${a.user_email}"`,
        `"${a.user_name}"`,
        `"${a.company_name}"`,
        `"${a.assessment_type}"`,
        a.overall_score ?? '',
        `"${a.state || ''}"`,
        `"${a.industry || ''}"`,
        `"${a.employee_count || ''}"`,
        a.status,
      ].join(','))
    })
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `compliancecheck-assessments-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assessments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filtered.length} of {data.assessments.length} records
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Date range */}
          <div className="relative">
            <select value={dateRange}
              onChange={(e) => { const v = e.target.value as DateRange; setDateRange(v); setShowCustom(v === 'custom') }}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-8 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500">
              <option value="7">Last 7 days</option>
              <option value="15">Last 15 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="custom">Custom</option>
            </select>
            <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* CSV Export */}
          <button onClick={exportCSV} disabled={filtered.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors">
            <Download className="h-4 w-4" /> CSV
          </button>

          <button onClick={fetchData} disabled={loading}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
            <RefreshCw className={`h-4 w-4 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Custom date inputs */}
      {showCustom && (
        <div className="flex items-end gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)}
              className="px-3 py-1.5 border rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)}
              className="px-3 py-1.5 border rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" />
          </div>
          <button onClick={() => { if (customFrom && customTo) fetchData() }}
            disabled={!customFrom || !customTo}
            className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400">
            Apply
          </button>
        </div>
      )}

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search email, company, state, industry..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-2.5">
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <div className="relative">
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
            className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-8 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500">
            <option value="all">All types</option>
            {assessmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                {([
                  ['created_at', 'Date'],
                  ['user_email', 'Email'],
                  ['company_name', 'Company'],
                  ['assessment_type', 'Type'],
                  ['overall_score', 'Score'],
                  ['state', 'State'],
                ] as [SortKey, string][]).map(([key, label]) => (
                  <th key={key}
                    onClick={() => handleSort(key)}
                    className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none">
                    <span className="inline-flex items-center gap-1">
                      {label} <SortIcon col={key} />
                    </span>
                  </th>
                ))}
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Industry</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Employees</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {pageRows.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                  <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatDate(a.created_at)}</td>
                  <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300 max-w-[220px] truncate" title={a.user_email}>{a.user_email}</td>
                  <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300 max-w-[180px] truncate" title={a.company_name}>{a.company_name}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      {a.assessment_type}
                    </span>
                  </td>
                  <td className={`px-4 py-2.5 font-semibold ${scoreColor(a.overall_score)}`}>
                    {a.overall_score !== null ? `${a.overall_score}%` : '-'}
                  </td>
                  <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400 max-w-[120px] truncate">{a.state || '-'}</td>
                  <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400 max-w-[140px] truncate">{a.industry || '-'}</td>
                  <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{a.employee_count || '-'}</td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    {search || typeFilter !== 'all' ? 'No matching assessments found' : 'No assessments for this period'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400">
                Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let p: number
                if (totalPages <= 7) { p = i + 1 }
                else if (page <= 4) { p = i + 1 }
                else if (page >= totalPages - 3) { p = totalPages - 6 + i }
                else { p = page - 3 + i }
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`px-3 py-1 text-xs rounded ${p === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                    {p}
                  </button>
                )
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
