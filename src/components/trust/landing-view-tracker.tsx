'use client'

import { useEffect } from 'react'
import { analytics } from '@/lib/analytics/tracking'
import type { AssessmentType } from '@/lib/analytics/events'

interface LandingViewTrackerProps {
  assessmentType: AssessmentType
  source?: string
}

/** Fires landing_viewed once on mount — same pattern as ReportViewTracker. */
export function LandingViewTracker({ assessmentType, source }: LandingViewTrackerProps) {
  useEffect(() => {
    analytics.landingViewed({ assessment_type: assessmentType, source })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
