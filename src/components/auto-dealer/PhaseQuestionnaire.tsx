'use client'

import { useState, useCallback } from 'react'
import { ChevronDown, ChevronUp, HelpCircle, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { AutoDealerQuestion, Responses } from '@/types/auto-dealer'
import { PHASE_METADATA } from '@/types/auto-dealer'

interface PhaseQuestionnaireProps {
  phase: 2 | 3 | 4 | 5 | 6
  questions: AutoDealerQuestion[]
  responses: Responses
  currentIndex: number
  overallProgress: number
  onAnswer: (questionId: string, value: string) => void
  onBack: () => void
}

export function PhaseQuestionnaire({
  phase,
  questions,
  responses,
  currentIndex,
  overallProgress,
  onAnswer,
  onBack,
}: PhaseQuestionnaireProps) {
  const [expandedHelp, setExpandedHelp] = useState<string | null>(null)

  const question = questions[currentIndex]
  const phaseInfo = PHASE_METADATA.find(m => m.phase === phase)
  const phaseProgress = questions.length > 0
    ? Math.round((currentIndex / questions.length) * 100)
    : 0
  const currentResponse = question ? String(responses[question.id] ?? '') : ''

  const toggleHelp = useCallback((id: string) => {
    setExpandedHelp(prev => prev === id ? null : id)
  }, [])

  if (!question) return null

  const PHASE_COLOURS: Record<number, string> = {
    2: 'blue',
    3: 'orange',
    4: 'purple',
    5: 'green',
    6: 'indigo',
  }
  const colour = PHASE_COLOURS[phase] ?? 'blue'

  return (
    <>
      {/* Sticky progress bars */}
      <div className="bg-white border-b p-4 sticky top-0 z-10 shadow-sm">
        {/* Overall progress */}
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Overall Assessment</span>
          <span className="text-xs font-medium text-gray-700">{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} className="h-1.5 mb-3 [&>div]:bg-green-500" aria-label={`Overall progress: ${overallProgress}%`} />

        {/* Phase progress */}
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-700 font-medium">{phaseInfo?.name ?? `Phase ${phase}`}</span>
          <span className="text-sm font-semibold text-gray-900">{phaseProgress}%</span>
        </div>
        <Progress
          value={phaseProgress}
          className={`h-2 [&>div]:bg-${colour}-600`}
          aria-label={`Phase ${phase} progress: ${phaseProgress}%`}
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-800">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className={`text-xs bg-${colour}-100 text-${colour}-700 px-2 py-1 rounded font-medium`}>
            Phase {phase}
          </span>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto mt-6">
        <CardHeader>
          {/* Compliance area badge */}
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-${colour}-50 text-${colour}-700 uppercase tracking-wide`}>
              {question.complianceArea.replace(/_/g, ' ')}
            </span>
            <span className="text-xs text-gray-400">Weight: {question.weight}/10</span>
          </div>

          <CardTitle className="text-lg leading-snug">{question.text}</CardTitle>

          {question.helpText && (
            <div className="mt-2">
              <button
                onClick={() => toggleHelp(question.id)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                aria-expanded={expandedHelp === question.id}
                aria-controls={`help-${question.id}`}
              >
                <HelpCircle className="h-4 w-4" aria-hidden="true" />
                {expandedHelp === question.id ? 'Hide guidance' : 'Why this matters'}
                {expandedHelp === question.id
                  ? <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  : <ChevronDown className="h-4 w-4" aria-hidden="true" />
                }
              </button>
              {expandedHelp === question.id && (
                <div id={`help-${question.id}`} className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">{question.helpText}</p>
                  <p className="text-xs text-gray-500 mt-1">Source: {question.source}</p>
                </div>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {question.type === 'yes_no' && (
            <div className="grid grid-cols-2 gap-4">
              {(['yes', 'no'] as const).map(val => (
                <Button
                  key={val}
                  onClick={() => onAnswer(question.id, val)}
                  variant={currentResponse === val ? 'default' : 'outline'}
                  className={`h-16 text-lg ${
                    currentResponse === val && val === 'yes' ? 'bg-green-700 hover:bg-green-800 text-white' :
                    currentResponse === val && val === 'no' ? 'bg-red-700 hover:bg-red-800 text-white' : ''
                  }`}
                  aria-pressed={currentResponse === val}
                >
                  {val === 'yes'
                    ? <><CheckCircle className="mr-2 h-5 w-5" aria-hidden="true" />Yes</>
                    : <><XCircle className="mr-2 h-5 w-5" aria-hidden="true" />No</>
                  }
                </Button>
              ))}
            </div>
          )}

          {(question.type === 'single_choice' || question.type === 'multi_choice') && question.options && (
            <div className="space-y-3" role="radiogroup" aria-label={question.text}>
              {question.options.map(option => (
                <Button
                  key={option.value}
                  onClick={() => onAnswer(question.id, option.value)}
                  variant={currentResponse === option.value ? 'default' : 'outline'}
                  className={`w-full h-auto py-4 px-4 text-left justify-start whitespace-normal ${
                    currentResponse === option.value
                      ? 'bg-blue-700 hover:bg-blue-800 text-white'
                      : ''
                  }`}
                  aria-pressed={currentResponse === option.value}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          )}

          {/* Penalty preview for non-compliant indicator */}
          {currentResponse === 'no' && question.gapTemplate && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs font-semibold text-amber-800 mb-1">Penalty exposure if non-compliant:</p>
              <p className="text-xs text-amber-700">{question.gapTemplate.penaltyExposure}</p>
            </div>
          )}
        </CardContent>

        <div className="px-6 pb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-3 py-2"
            aria-label={currentIndex === 0 ? 'Go back to previous phase' : 'Go to previous question'}
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back</span>
          </button>
        </div>
      </Card>

      {/* Phase description */}
      {phaseInfo && (
        <p className="max-w-2xl mx-auto mt-4 text-center text-sm text-gray-500">
          {phaseInfo.description}
        </p>
      )}
    </>
  )
}
