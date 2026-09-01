'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { analytics } from '@/lib/analytics/tracking'
import type { AssessmentType } from '@/lib/analytics/events'
import type { UnifiedActionItem } from '@/lib/pdf/unified-report-generator'

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-blue-100 text-blue-700',
}

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 }

function storageKey(assessmentId: string | undefined, questionId: string): string {
  return `cc_action_done_${assessmentId ?? 'unknown'}_${questionId}`
}

/**
 * The done-for-you outcome the report is supposed to deliver: not just a
 * score, but a ranked, checkable plan (gap -> priority -> penalty -> fix ->
 * deadline). Items already come ranked (high/medium/low) from the same
 * report-data-adapter.ts logic that renders the PDF's action-items pages, so
 * this is a second view of the same data, not new content.
 */
export function ActionPlanChecklist({
  items,
  assessmentType,
  assessmentId,
}: {
  items: UnifiedActionItem[]
  assessmentType: AssessmentType
  assessmentId?: string
}) {
  const sorted = [...items].sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3)
  )

  useEffect(() => {
    analytics.actionPlanViewed({ assessment_type: assessmentType, assessment_id: assessmentId, item_count: sorted.length })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (sorted.length === 0) return null

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Your Action Plan</CardTitle>
        <CardDescription>
          Ranked by penalty exposure and urgency — check items off as your team completes them.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {sorted.map((item) => (
          <ActionPlanItem key={item.questionId} item={item} assessmentType={assessmentType} assessmentId={assessmentId} />
        ))}
      </CardContent>
    </Card>
  )
}

function ActionPlanItem({
  item,
  assessmentType,
  assessmentId,
}: {
  item: UnifiedActionItem
  assessmentType: AssessmentType
  assessmentId?: string
}) {
  const key = storageKey(assessmentId, item.questionId)
  const [expanded, setExpanded] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDone(typeof window !== 'undefined' && window.localStorage.getItem(key) === '1')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const toggleDone = () => {
    const next = !done
    setDone(next)
    if (typeof window !== 'undefined') {
      if (next) window.localStorage.setItem(key, '1')
      else window.localStorage.removeItem(key)
    }
    analytics.actionItemChecked({ assessment_type: assessmentType, assessment_id: assessmentId, checked: next })
  }

  return (
    <div className={`border rounded-lg ${done ? 'bg-gray-50 opacity-70' : ''}`}>
      <div className="flex items-start gap-3 p-3">
        <button
          type="button"
          onClick={toggleDone}
          aria-pressed={done}
          aria-label={done ? 'Mark as not done' : 'Mark as done'}
          className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded border flex items-center justify-center ${
            done ? 'bg-green-600 border-green-600' : 'border-gray-300'
          }`}
        >
          {done && <Check className="w-3.5 h-3.5 text-white" />}
        </button>
        <div className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${PRIORITY_STYLES[item.priority] ?? 'bg-gray-100 text-gray-700'}`}>
          {item.priority.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-gray-900 ${done ? 'line-through' : ''}`}>{item.title}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
            <span>{item.category}</span>
            {item.deadline && <span>Deadline: {item.deadline}</span>}
            {item.penalty && (
              <span className="text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {item.penalty}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? 'Hide remediation steps' : 'Show remediation steps'}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      {expanded && (
        <div className="px-3 pb-3 pl-11 text-sm text-gray-700">
          {item.remediation.length > 0 && (
            <ol className="list-decimal pl-4 space-y-1">
              {item.remediation.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          )}
          {item.governmentRef && <p className="text-xs text-gray-400 mt-2">Ref: {item.governmentRef}</p>}
        </div>
      )}
    </div>
  )
}
