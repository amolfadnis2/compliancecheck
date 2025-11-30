'use client'

import { useState } from 'react'
import { posthog } from '@/components/providers/posthog-provider'

interface FeedbackFormProps {
  assessmentType: string
  assessmentId: string
  onComplete: () => void
  onSkip?: () => void
}

interface FeedbackData {
  npsScore: number | null
  valueProvided: string
  wouldRecommend: string
  uiExperience: string
  reportQuality: string
  timeSpent: string
  desiredFeatures: string[]
  additionalComments: string
}

const FEATURE_OPTIONS = [
  'Email reminders for compliance deadlines',
  'Document templates (policies, letters)',
  'Multi-user team access',
  'Integration with HRMS software',
  'Mobile app',
  'Comparison with industry benchmarks',
  'Consultant connect for complex issues',
  'Regional language support (Hindi)',
]

export function FeedbackForm({ 
  assessmentType, 
  assessmentId, 
  onComplete,
  onSkip 
}: FeedbackFormProps) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackData>({
    npsScore: null,
    valueProvided: '',
    wouldRecommend: '',
    uiExperience: '',
    reportQuality: '',
    timeSpent: '',
    desiredFeatures: [],
    additionalComments: '',
  })

  const totalSteps = 3

  const handleNpsSelect = (score: number) => {
    setFeedback(prev => ({ ...prev, npsScore: score }))
  }

  const handleOptionSelect = (field: keyof FeedbackData, value: string) => {
    setFeedback(prev => ({ ...prev, [field]: value }))
  }

  const handleFeatureToggle = (feature: string) => {
    setFeedback(prev => ({
      ...prev,
      desiredFeatures: prev.desiredFeatures.includes(feature)
        ? prev.desiredFeatures.filter(f => f !== feature)
        : [...prev.desiredFeatures, feature]
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    // Track feedback in PostHog
    posthog.capture('feedback_submitted', {
      assessment_type: assessmentType,
      assessment_id: assessmentId,
      nps_score: feedback.npsScore,
      value_provided: feedback.valueProvided,
      would_recommend: feedback.wouldRecommend,
      ui_experience: feedback.uiExperience,
      report_quality: feedback.reportQuality,
      time_spent: feedback.timeSpent,
      desired_features: feedback.desiredFeatures,
      has_comments: feedback.additionalComments.length > 0,
    })

    // Optional: Send to your backend/Supabase
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentType,
          assessmentId,
          ...feedback,
          submittedAt: new Date().toISOString(),
        }),
      })
    } catch (error) {
      // Silently fail - feedback is also in PostHog
      console.log('Feedback API optional:', error)
    }

    setIsSubmitting(false)
    onComplete()
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return feedback.npsScore !== null
      case 2:
        return feedback.valueProvided && feedback.wouldRecommend && feedback.uiExperience
      case 3:
        return feedback.reportQuality && feedback.timeSpent
      default:
        return true
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Quick Feedback
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Help us improve (30 seconds)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">
                {step}/{totalSteps}
              </span>
              <div className="flex gap-1">
                {[1, 2, 3].map(s => (
                  <div
                    key={s}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      s <= step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: NPS Score */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-4">
                  How likely are you to recommend ComplianceCheck to a colleague?
                </label>
                <div className="flex justify-between gap-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                    <button
                      key={score}
                      onClick={() => handleNpsSelect(score)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        feedback.npsScore === score
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
            </div>
          )}

          {/* Step 2: Value & Experience */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Value Provided */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Did this assessment provide value?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Yes, very helpful',
                    'Somewhat helpful',
                    'Not very helpful',
                    'Not helpful at all',
                  ].map(option => (
                    <button
                      key={option}
                      onClick={() => handleOptionSelect('valueProvided', option)}
                      className={`p-3 rounded-lg text-sm text-left transition-all border ${
                        feedback.valueProvided === option
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Would Recommend */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Would you share this with other business owners?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Yes, definitely',
                    'Yes, if relevant',
                    'Maybe',
                    'No',
                  ].map(option => (
                    <button
                      key={option}
                      onClick={() => handleOptionSelect('wouldRecommend', option)}
                      className={`p-3 rounded-lg text-sm text-left transition-all border ${
                        feedback.wouldRecommend === option
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* UI Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  How was the user interface?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Easy and intuitive',
                    'Good, minor issues',
                    'Confusing at times',
                    'Difficult to use',
                  ].map(option => (
                    <button
                      key={option}
                      onClick={() => handleOptionSelect('uiExperience', option)}
                      className={`p-3 rounded-lg text-sm text-left transition-all border ${
                        feedback.uiExperience === option
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Report & Features */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Report Quality */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  How useful is the compliance report?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Very actionable',
                    'Somewhat actionable',
                    'Needs more detail',
                    'Not useful',
                  ].map(option => (
                    <button
                      key={option}
                      onClick={() => handleOptionSelect('reportQuality', option)}
                      className={`p-3 rounded-lg text-sm text-left transition-all border ${
                        feedback.reportQuality === option
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Spent */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Was the time investment reasonable?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Yes, quick and easy',
                    'Acceptable',
                    'Took too long',
                    'Way too long',
                  ].map(option => (
                    <button
                      key={option}
                      onClick={() => handleOptionSelect('timeSpent', option)}
                      className={`p-3 rounded-lg text-sm text-left transition-all border ${
                        feedback.timeSpent === option
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Desired Features */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  What features would you like to see? (Select all that apply)
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {FEATURE_OPTIONS.map(feature => (
                    <button
                      key={feature}
                      onClick={() => handleFeatureToggle(feature)}
                      className={`p-3 rounded-lg text-sm text-left transition-all border flex items-center gap-2 ${
                        feedback.desiredFeatures.includes(feature)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        feedback.desiredFeatures.includes(feature)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {feedback.desiredFeatures.includes(feature) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      {feature}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Any other feedback? (Optional)
                </label>
                <textarea
                  value={feedback.additionalComments}
                  onChange={(e) => setFeedback(prev => ({ ...prev, additionalComments: e.target.value }))}
                  placeholder="Tell us what you think..."
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-between items-center">
          {step === 1 && onSkip && (
            <button
              onClick={onSkip}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Skip feedback
            </button>
          )}
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Back
            </button>
          )}
          {step === 1 && !onSkip && <div />}
          
          <div className="flex gap-3">
            {step < totalSteps ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  canProceed()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  canProceed() && !isSubmitting
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
                    Submit & Download Report
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
