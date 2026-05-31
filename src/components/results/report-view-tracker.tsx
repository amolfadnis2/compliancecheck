'use client'

import { useEffect } from 'react'
import { analytics } from '@/lib/analytics/tracking'
import type { AssessmentType } from '@/lib/analytics/events'

interface ReportViewTrackerProps {
  assessmentType: string
  complianceScore: number
  assessmentId?: string
}

export function ReportViewTracker({ assessmentType, complianceScore, assessmentId }: ReportViewTrackerProps) {
  useEffect(() => {
    analytics.reportViewed({
      assessment_type: assessmentType as AssessmentType,
      compliance_score: complianceScore,
      assessment_id: assessmentId,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
