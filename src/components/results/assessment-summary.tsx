'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, AlertTriangle, CheckCircle, XCircle, Lock, Building, Scale, Users, ListChecks,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PaymentGate } from '@/components/results/payment-gate'
import type { UnifiedSummaryData } from '@/lib/payment/summary-data'

const PRIORITY_STYLES: Record<string, string> = {
  critical: 'bg-red-200 text-red-900',
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-blue-100 text-blue-700',
}

/**
 * Shared summary page for every paid assessment, shown before payment. Same
 * sections, same order, for all seven assessments:
 *   1. Overall score            4. Category scores vs other companies
 *   2. Critical gaps            5. Relevant legal references (Acts)
 *   3. Top three actions        6. Pay for the detailed report
 * Driven entirely by `UnifiedSummaryData`, which never carries remediation
 * steps, section-level citations or per-issue penalties — those stay in the
 * paid report. On a successful pay/waiver `onPaid` runs (default:
 * router.refresh(), so the server re-checks the entitlement and swaps in the
 * full report).
 */
export function AssessmentSummary({
  assessmentId,
  summary,
  defaultEmail,
  defaultPhone,
  onPaid,
}: {
  assessmentId: string
  summary: UnifiedSummaryData
  /** Prefill the checkout contact fields from details captured earlier. */
  defaultEmail?: string
  defaultPhone?: string
  /** Override what happens once paid (client-rendered results pages). */
  onPaid?: () => void
}) {
  const router = useRouter()
  const [unlocking, setUnlocking] = useState(false)

  const {
    assessmentType,
    displayName,
    priceINR,
    overallScore,
    riskLabel,
    riskColor,
    categoryScores,
    gapsCount,
    highPriorityCount,
    penaltyRange,
    topActions,
    legalReferences,
    peers,
    companyName,
  } = summary

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
    if (onPaid) onPaid()
    else router.refresh()
  }

  const peerLabel = peers
    ? peers.scope === 'industry' && peers.industry
      ? `${peers.sampleSize} companies in your industry`
      : `${peers.sampleSize} companies that took this assessment`
    : null
  const hasPeerCategories = categoryScores.some((c) => c.peerAverage !== undefined)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <Badge className="bg-green-100 text-green-700 mb-2">{displayName}</Badge>
          <h1 className="text-2xl font-bold text-gray-900">Your Compliance Summary</h1>
          {companyName && (
            <div className="flex items-center gap-2 text-gray-600 mt-1">
              <Building className="w-4 h-4" />
              <span>{companyName}</span>
            </div>
          )}
        </div>

        {/* 1. Overall score */}
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
                  {peers
                    ? `Average across ${peerLabel}: ${peers.overallAverage}%`
                    : 'Based on your answers across all requirements'}
                </p>
              </div>
              <div className="text-center">
                <div className={`text-6xl font-bold ${scoreColor}`}>{overallScore}%</div>
                <div className="text-gray-500 text-sm">Compliance Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Critical gaps */}
        <Card className={`mb-6 ${highPriorityCount > 0 ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-4">
              <AlertTriangle
                className={`w-6 h-6 flex-shrink-0 mt-0.5 ${highPriorityCount > 0 ? 'text-red-600' : 'text-amber-600'}`}
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                  <p className="font-semibold text-gray-900">
                    <span className="text-2xl text-red-700 mr-1">{highPriorityCount}</span>
                    critical gap{highPriorityCount !== 1 ? 's' : ''}
                  </p>
                  <p className="text-gray-700">
                    <span className="text-lg font-semibold mr-1">{gapsCount}</span>
                    gap{gapsCount !== 1 ? 's' : ''} in total
                  </p>
                </div>
                <p className="text-sm text-gray-700 mt-1">{penaltyRange}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Top three actions */}
        {topActions.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-gray-700" />
                Your Top {topActions.length} Action{topActions.length !== 1 ? 's' : ''}
              </CardTitle>
              <CardDescription>Start here. The detailed report has step-by-step instructions for each.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {topActions.map((action, i) => (
                <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{action.headline}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{action.category}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${PRIORITY_STYLES[action.priority] ?? 'bg-gray-100 text-gray-700'}`}
                  >
                    {action.priority.toUpperCase()}
                  </span>
                </div>
              ))}
              {gapsCount > topActions.length && (
                <p className="text-sm text-gray-500 text-center flex items-center justify-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  +{gapsCount - topActions.length} more action{gapsCount - topActions.length !== 1 ? 's' : ''} in the detailed report
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* 4. Category scores vs others */}
        {categoryScores.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-700" />
                Category Scores
              </CardTitle>
              <CardDescription>
                {hasPeerCategories
                  ? `Your score in each area, with the average of ${peerLabel} marked in grey.`
                  : 'Your score in each area. Comparison with other companies appears once enough have taken this assessment.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryScores.map((cat) => {
                const catColor =
                  cat.status === 'compliant' ? 'text-green-600' :
                  cat.status === 'needs-attention' ? 'text-amber-600' : 'text-red-600'
                const barColor =
                  cat.status === 'compliant' ? 'bg-green-500' :
                  cat.status === 'needs-attention' ? 'bg-amber-500' : 'bg-red-500'
                const diff = cat.peerAverage !== undefined ? cat.percentage - cat.peerAverage : null

                return (
                  <div key={cat.key} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <span className="font-medium">{cat.name}</span>
                      <span className={`font-bold ${catColor}`}>{cat.percentage}%</span>
                    </div>
                    <div
                      className="relative w-full h-2 bg-gray-200 rounded-full"
                      role="img"
                      aria-label={
                        cat.peerAverage !== undefined
                          ? `${cat.name}: you ${cat.percentage}%, others ${cat.peerAverage}%`
                          : `${cat.name}: ${cat.percentage}%`
                      }
                    >
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${cat.percentage}%` }} />
                      {cat.peerAverage !== undefined && (
                        <div
                          className="absolute -top-1 w-0.5 h-4 bg-gray-700"
                          style={{ left: `${cat.peerAverage}%` }}
                        />
                      )}
                    </div>
                    {diff !== null && (
                      <p className="text-xs text-gray-500 mt-1.5">
                        Others: {cat.peerAverage}% &middot;{' '}
                        {diff === 0 ? 'on par' : diff > 0 ? `${diff} points above average` : `${-diff} points below average`}
                      </p>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* 5. Relevant legal references */}
        {legalReferences.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-gray-700" />
                Relevant Legal References
              </CardTitle>
              <CardDescription>
                The laws this assessment checks you against. The detailed report cites the exact section behind each gap.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {legalReferences.map((ref) => (
                  <span key={ref} className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">
                    {ref}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 6. Pay for the detailed report */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-semibold text-blue-900 mb-2">Your detailed report includes:</p>
          <ul className="text-sm text-blue-800 space-y-1">
            {[
              `Step-by-step fixes for all ${gapsCount} gap${gapsCount !== 1 ? 's' : ''}`,
              '30 / 60 / 90-day action plan you can hand to your team',
              'Exact legal sections, penalties and deadlines for every gap',
              'Links to the government portal for each action',
              'PDF report, sent to your email and WhatsApp',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {unlocking ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600">Unlocking your detailed report…</p>
            </CardContent>
          </Card>
        ) : (
          <PaymentGate
            title="Get your detailed report"
            assessmentId={assessmentId}
            assessmentType={assessmentType}
            priceINR={priceINR}
            defaultEmail={defaultEmail}
            defaultPhone={defaultPhone}
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
