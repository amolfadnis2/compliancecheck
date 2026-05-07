'use client'

import { useState } from 'react'
import { analytics } from '@/lib/analytics/tracking'
import { ANALYTICS_EVENTS } from '@/lib/analytics/events'

interface FeedbackFormProps {
  assessmentType: string
  assessmentId: string
  onComplete: () => void
  onSkip?: () => void
}

export function FeedbackForm({ 
  assessmentType, 
  assessmentId, 
  onComplete,
  onSkip 
}: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [npsScore, setNpsScore] = useState<number | null>(null)
  const [comments, setComments] = useState('')

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    analytics.trackEvent(ANALYTICS_EVENTS.FEEDBACK_SUBMITTED, {
      assessment_type: assessmentType,
      assessment_id: assessmentId,
      nps_score: npsScore,
      has_comments: comments.length > 0,
    })

    // Send to backend
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentType,
          assessmentId,
          npsScore,
          additionalComments: comments,
          submittedAt: new Date().toISOString(),
        }),
      })
    } catch (error) {
      console.log('Feedback API optional:', error)
    }

    setIsSubmitting(false)
    onComplete()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            Quick Feedback
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Help us improve (10 seconds)
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* NPS Score */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-4">
              How likely are you to recommend ComplianceCheck to a colleague?
            </label>
            <div className="flex justify-between gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                <button
                  key={score}
                  onClick={() => setNpsScore(score)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                    npsScore === score
                      ? score <= 6
                        ? 'bg-red-500 text-white'
                        : score <= 8
                        ? 'bg-amber-500 text-white'
                        : 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>Not likely</span>
              <span>Very likely</span>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Any feedback or suggestions? (Optional)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Tell us what you think..."
              className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-between items-center">
          {onSkip && (
            <button
              onClick={onSkip}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Skip
            </button>
          )}
          {!onSkip && <div />}
          
          <button
            onClick={handleSubmit}
            disabled={npsScore === null || isSubmitting}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              npsScore !== null && !isSubmitting
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting...
              </>
            ) : (
              <>
                Submit & Download
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
