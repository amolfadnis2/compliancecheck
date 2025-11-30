'use client'

import { useState } from 'react'
import { FeedbackForm } from '@/components/feedback/feedback-form'
import { DownloadButtons as OriginalDownloadButtons } from '@/components/results/download-buttons'
import { posthog } from '@/components/providers/posthog-provider'

interface DownloadWithFeedbackProps {
  assessmentId?: string
  assessmentType?: string
}

export function DownloadWithFeedback({ assessmentId, assessmentType = 'statutory_health' }: DownloadWithFeedbackProps) {
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackCompleted, setFeedbackCompleted] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)

  // Get ID from URL if not provided
  const id = assessmentId || (typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : '') || ''

  const handleDownloadClick = () => {
    try {
      posthog.capture('download_report_clicked', {
        assessment_type: assessmentType,
        assessment_id: id,
        feedback_completed: feedbackCompleted,
      })
    } catch (e) {
      console.log('PostHog not available:', e)
    }

    if (!feedbackCompleted) {
      setShowFeedback(true)
    } else {
      setShowOriginal(true)
    }
  }

  const handleFeedbackComplete = () => {
    setFeedbackCompleted(true)
    setShowFeedback(false)
    setShowOriginal(true)
  }

  const handleSkipFeedback = () => {
    try {
      posthog.capture('feedback_skipped', {
        assessment_type: assessmentType,
        assessment_id: id,
      })
    } catch (e) {
      console.log('PostHog not available:', e)
    }
    setFeedbackCompleted(true)
    setShowFeedback(false)
    setShowOriginal(true)
  }

  // Show feedback form modal
  if (showFeedback) {
    return (
      <>
        <FeedbackForm
          assessmentType={assessmentType}
          assessmentId={id}
          onComplete={handleFeedbackComplete}
          onSkip={handleSkipFeedback}
        />
        <button
          onClick={handleDownloadClick}
          className="w-full py-4 px-6 rounded-xl text-white font-semibold text-lg transition-all flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF Report
        </button>
      </>
    )
  }

  // Show original download button after feedback
  if (showOriginal) {
    return <OriginalDownloadButtons assessmentId={id} />
  }

  // Initial state - show button that triggers feedback
  return (
    <button
      onClick={handleDownloadClick}
      className="w-full py-4 px-6 rounded-xl text-white font-semibold text-lg transition-all flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Download PDF Report
    </button>
  )
}
