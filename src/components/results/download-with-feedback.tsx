'use client'

import { useState, useEffect } from 'react'
import { FeedbackForm } from '@/components/feedback/feedback-form'
import { DownloadButtons as OriginalDownloadButtons } from '@/components/results/download-buttons'
import { analytics } from '@/lib/analytics'
import { Button } from '@/components/ui/button'
import { Download, Mail, FileText, CheckCircle } from 'lucide-react'
import type { AssessmentType } from '@/lib/analytics'

interface DownloadWithFeedbackProps {
  assessmentId?: string
  assessmentType?: string
  complianceScore?: number // Optional: pass score for better tracking
}

export function DownloadWithFeedback({ 
  assessmentId, 
  assessmentType = 'statutory_health',
  complianceScore 
}: DownloadWithFeedbackProps) {
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackCompleted, setFeedbackCompleted] = useState(false)
  const [pendingAction, setPendingAction] = useState<'download' | 'email' | null>(null)
  const [score, setScore] = useState<number>(complianceScore || 0)

  // Get ID from URL if not provided
  const id = assessmentId || (typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : '') || ''

  // Try to get score from localStorage if not provided
  useEffect(() => {
    if (!complianceScore && id) {
      try {
        const stored = localStorage.getItem(`assessment_${id}`)
        if (stored) {
          const data = JSON.parse(stored)
          setScore(data.overall_score || data.overallScore || 0)
        }
      } catch (e) {
        console.log('Could not get score from localStorage:', e)
      }
    }
  }, [id, complianceScore])

  const handleActionClick = (action: 'download' | 'email') => {
    // Track the intent to download/email (before feedback)
    analytics.trackEvent(`${action}_report_intent`, {
      assessment_type: assessmentType as AssessmentType,
      assessment_id: id,
      feedback_completed: feedbackCompleted,
    })

    if (!feedbackCompleted) {
      setPendingAction(action)
      setShowFeedback(true)
    } else {
      setPendingAction(action)
    }
  }

  const handleFeedbackComplete = () => {
    setFeedbackCompleted(true)
    setShowFeedback(false)
  }

  const handleSkipFeedback = () => {
    analytics.trackEvent('feedback_skipped', {
      assessment_type: assessmentType as AssessmentType,
      assessment_id: id,
    })
    setFeedbackCompleted(true)
    setShowFeedback(false)
  }

  // Show feedback form modal when triggered
  if (showFeedback) {
    return (
      <>
        <FeedbackForm
          assessmentType={assessmentType}
          assessmentId={id}
          onComplete={handleFeedbackComplete}
          onSkip={handleSkipFeedback}
        />
        {/* Show buttons below feedback form */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <FileText className="w-5 h-5" />
            <span className="font-semibold">Download Detailed Report</span>
          </div>
          <p className="text-sm text-blue-600">
            Complete the quick feedback above to unlock your detailed PDF report with:
          </p>
          <ul className="text-sm text-blue-600 mt-2 space-y-1">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Step-by-step remediation actions
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Legal references & government portal links
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Deadlines & penalty information
            </li>
          </ul>
        </div>
      </>
    )
  }

  // After feedback completed (or skipped), show full download buttons
  if (feedbackCompleted) {
    return (
      <OriginalDownloadButtons 
        assessmentId={id} 
        assessmentType={assessmentType} 
        autoTrigger={pendingAction}
        complianceScore={score}
      />
    )
  }

  // Initial state - show both buttons that trigger feedback first
  return (
    <div className="bg-blue-50 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="w-5 h-5 text-blue-700" />
        <h3 className="font-semibold text-gray-900">Download Detailed Report</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Get the complete PDF report with:
      </p>
      <ul className="text-sm text-gray-600 mb-4 space-y-1">
        <li className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          Step-by-step remediation actions
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          Legal references & government portal links
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          Deadlines & penalty information
        </li>
      </ul>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={() => handleActionClick('download')}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Detailed Report
        </Button>
        <Button 
          variant="outline"
          onClick={() => handleActionClick('email')}
          className="flex-1"
        >
          <Mail className="w-4 h-4 mr-2" />
          Email Report
        </Button>
      </div>
    </div>
  )
}
