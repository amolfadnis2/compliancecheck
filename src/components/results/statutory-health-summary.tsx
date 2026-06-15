'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, Lock, Building } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PaymentGate } from '@/components/results/payment-gate'

export interface StatutoryHealthSummaryData {
  overallScore: number
  riskLabel: string
  riskColor: 'green' | 'amber' | 'red'
  categoryScores: Array<{
    key: string
    name: string
    percentage: number
    status: 'compliant' | 'needs-attention' | 'non-compliant'
  }>
  gapsCount: number
  highPriorityCount: number
  penaltyRange: string
  topIssues: Array<{ priority: string; category: string }>
  companyName: string
}

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-blue-100 text-blue-700',
  critical: 'bg-red-200 text-red-900',
}

export function StatutoryHealthSummary({
  assessmentId,
  summary,
}: {
  assessmentId: string
  summary: StatutoryHealthSummaryData
}) {
  const router = useRouter()
  const [unlocking, setUnlocking] = useState(false)

  const { overallScore, riskLabel, riskColor, categoryScores, gapsCount, highPriorityCount, penaltyRange, topIssues, companyName } = summary

  const scoreColor =
    riskColor === 'green' ? 'text-green-600' :
    riskColor === 'amber' ? 'text-amber-600' : 'text-red-600'

  const scoreRingColor =
    riskColor === 'green' ? 'bg-green-100' :
    riskColor === 'amber' ? 'bg-amber-100' : 'bg-red-100'

  const statusIcon =
    riskColor === 'green' ? <CheckCircle className={`w-5 h-5 ${scoreColor}`} /> :
    riskColor === 'amber' ? <AlertTriangle className={`w-5 h-5 ${scoreColor}`} /> :
    <XCircle className={`w-5 h-5 ${scoreColor}`} />

  const handleUnlocked = () => {
    setUnlocking(true)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <Badge className="bg-green-100 text-green-700 mb-2">Statutory Health Check</Badge>
          <h1 className="text-2xl font-bold text-gray-900">Your Compliance Summary</h1>
          {companyName && (
            <div className="flex items-center gap-2 text-gray-600 mt-1">
              <Building className="w-4 h-4" />
              <span>{companyName}</span>
            </div>
          )}
        </div>

        {/* Score card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Overall Compliance Score</h2>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${scoreRingColor}`}>
                  {statusIcon}
                  <span className={`font-semibold ${scoreColor}`}>{riskLabel}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Based on your answers across all statutory requirements
                </p>
              </div>
              <div className="text-center">
                <div className={`text-6xl font-bold ${scoreColor}`}>{overallScore}%</div>
                <div className="text-gray-500 text-sm">Compliance Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category breakdown */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Where you stand across each statutory area</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryScores.map((cat) => {
              const catColor =
                cat.status === 'compliant' ? 'text-green-600' :
                cat.status === 'needs-attention' ? 'text-amber-600' : 'text-red-600'
              const barColor =
                cat.status === 'compliant' ? 'bg-green-500' :
                cat.status === 'needs-attention' ? 'bg-amber-500' : 'bg-red-500'
              const catIcon =
                cat.status === 'compliant' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                cat.status === 'needs-attention' ? <AlertTriangle className="w-5 h-5 text-amber-600" /> :
                <XCircle className="w-5 h-5 text-red-600" />

              return (
                <div key={cat.key} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      {catIcon}
                      <span className={`font-bold ${catColor}`}>{cat.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor}`} style={{ width: `${cat.percentage}%` }} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Gap & penalty summary */}
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">
                  {gapsCount} compliance gap{gapsCount !== 1 ? 's' : ''} found
                  {highPriorityCount > 0 && ` — ${highPriorityCount} high priority`}
                </p>
                <p className="text-sm text-amber-800 mt-1">{penaltyRange}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Locked issues preview */}
        {topIssues.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Top Issues Found
                <Lock className="w-4 h-4 text-gray-400" />
              </CardTitle>
              <CardDescription>Unlock to see exact remediation steps and legal references</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {topIssues.map((issue, i) => (
                <div key={i} className="flex items-start gap-3 p-3 border rounded-lg relative">
                  <div className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${PRIORITY_STYLES[issue.priority] ?? 'bg-gray-100 text-gray-700'}`}>
                    {(issue.priority ?? 'low').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{issue.category}</p>
                    <p className="text-sm text-gray-300 select-none mt-0.5">
                      ████████████████████████████████
                    </p>
                  </div>
                  <Lock className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                </div>
              ))}
              {gapsCount > topIssues.length && (
                <p className="text-sm text-gray-500 text-center">
                  +{gapsCount - topIssues.length} more issues in full report
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Value proposition */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-semibold text-blue-900 mb-2">What you get after unlocking:</p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
              Full remediation steps for all {gapsCount} gap{gapsCount !== 1 ? 's' : ''}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
              Exact legal provisions and sections to cite
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
              Priority-ranked action plan you can hand to your team
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
              Downloadable branded PDF report
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
              Optional emailed copy (on request)
            </li>
          </ul>
        </div>

        {/* Payment gate */}
        {unlocking ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600">Unlocking your full report…</p>
            </CardContent>
          </Card>
        ) : (
          <PaymentGate
            assessmentId={assessmentId}
            assessmentType="statutory_health"
            priceINR={499}
            onPaid={handleUnlocked}
          />
        )}

        <p className="text-xs text-gray-400 text-center mt-4">
          Secure payment powered by Razorpay · 256-bit encryption
        </p>
      </div>
    </div>
  )
}
