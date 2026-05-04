'use client'

import { useState, useCallback } from 'react'
import { ChevronDown, ChevronUp, HelpCircle, ArrowLeft, CheckCircle, XCircle, Square, CheckSquare, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { AutoDealerQuestion, Responses } from '@/types/auto-dealer'
import { PHASE_METADATA } from '@/types/auto-dealer'

interface PhaseQuestionnaireProps {
  phase: 2 | 3 | 4 | 5 | 6
  questions: AutoDealerQuestion[]
  responses: Responses
  currentIndex: number
  overallProgress: number
  totalQuestions?: number
  onAnswer: (questionId: string, value: string | string[]) => void
  onContinue?: () => void
  onBack: () => void
}

export function PhaseQuestionnaire({
  phase,
  questions,
  responses,
  currentIndex,
  overallProgress,
  totalQuestions,
  onAnswer,
  onContinue,
  onBack,
}: PhaseQuestionnaireProps) {
  const [expandedHelp, setExpandedHelp] = useState<string | null>(null)

  const question = questions[currentIndex]
  const phaseInfo = PHASE_METADATA.find(m => m.phase === phase)
  const phaseProgress = questions.length > 0
    ? Math.round((currentIndex / questions.length) * 100)
    : 0

  // For multi_choice questions the response is string[]; for others it is string
  const rawResponse = question ? responses[question.id] : undefined
  const currentResponse = question?.type === 'multi_choice'
    ? (Array.isArray(rawResponse) ? rawResponse as string[] : rawResponse ? [rawResponse as string] : [])
    : (rawResponse !== undefined && rawResponse !== null ? String(rawResponse) : '')

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

  const minsRemaining = Math.max(1, Math.round(((totalQuestions ?? questions.length) - currentIndex) * 0.4))

  return (
    <>
      {/* Sticky progress bars */}
      <div className="bg-white border-b p-4 sticky top-0 z-10 shadow-sm">
        {/* Overall progress */}
        <div className="flex justify-between items-center mb-1">
          <span
            className="text-xs text-gray-500 flex items-center gap-1"
            title="Your progress through all phases of the assessment."
          >
            Overall assessment
            <Info className="h-3 w-3 text-gray-400" aria-hidden="true" />
          </span>
          <span className="text-xs font-medium text-gray-700">{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} className="h-1.5 mb-3 [&>div]:bg-green-500" aria-label={`Overall assessment progress: ${overallProgress}%`} />

        {/* Phase progress — hidden on mobile to reduce clutter */}
        <div className="hidden sm:block">
          <div className="flex justify-between items-center mb-1">
            <span
              className="text-sm text-gray-700 font-medium flex items-center gap-1"
              title="Your progress within the current phase only."
            >
              Phase {phase} of 6 &mdash; {phaseInfo?.name ?? `Phase ${phase}`}
              <Info className="h-3 w-3 text-gray-400" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {phaseProgress}% &middot; ~{minsRemaining} min left
            </span>
          </div>
          <Progress
            value={phaseProgress}
            className={`h-2 [&>div]:bg-${colour}-600`}
            aria-label={`Phase ${phase} progress: ${phaseProgress}%`}
          />
        </div>

        {/* Mobile: show phase label instead of second bar */}
        <div className="sm:hidden mt-1">
          <span className="text-xs text-gray-500">
            Phase {phase} of 6 &mdash; {phaseInfo?.name ?? `Phase ${phase}`}
          </span>
        </div>

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
                {expandedHelp === question.id ? 'Hide' : 'Why do we ask?'}
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
              {(['yes', 'no', 'not_applicable'] as const).filter(val =>
                val !== 'not_applicable' || question.compliantAnswers.includes('not_applicable')
              ).map(val => (
                <Button
                  key={val}
                  onClick={() => onAnswer(question.id, val)}
                  variant={(currentResponse as string) === val ? 'default' : 'outline'}
                  className={`h-16 text-lg ${
                    (currentResponse as string) === val && val === 'yes' ? 'bg-green-700 hover:bg-green-800 text-white' :
                    (currentResponse as string) === val && val === 'no' ? 'bg-red-700 hover:bg-red-800 text-white' :
                    (currentResponse as string) === val && val === 'not_applicable' ? 'bg-gray-600 hover:bg-gray-700 text-white' : ''
                  }`}
                  aria-pressed={(currentResponse as string) === val}
                >
                  {val === 'yes'
                    ? <><CheckCircle className="mr-2 h-5 w-5" aria-hidden="true" />Yes</>
                    : val === 'no'
                    ? <><XCircle className="mr-2 h-5 w-5" aria-hidden="true" />No</>
                    : <span className="flex flex-col items-center leading-tight"><span>N/A</span><span className="text-[10px] font-normal opacity-70">not applicable</span></span>
                  }
                </Button>
              ))}
            </div>
          )}

          {question.type === 'single_choice' && question.options && (
            <div className="space-y-3" role="radiogroup" aria-label={question.text}>
              {question.options.map(option => (
                <Button
                  key={option.value}
                  onClick={() => onAnswer(question.id, option.value)}
                  variant={(currentResponse as string) === option.value ? 'default' : 'outline'}
                  className={`w-full h-auto py-4 px-4 text-left justify-start whitespace-normal ${
                    (currentResponse as string) === option.value
                      ? 'bg-blue-700 hover:bg-blue-800 text-white'
                      : ''
                  }`}
                  aria-pressed={(currentResponse as string) === option.value}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          )}

          {question.type === 'multi_choice' && question.options && (() => {
            const multiSelected = Array.isArray(currentResponse) ? currentResponse as string[] : []
            const handleMultiToggle = (value: string) => {
              if (value === 'none') { onAnswer(question.id, ['none']); return }
              const withoutNone = multiSelected.filter(v => v !== 'none')
              const idx = withoutNone.indexOf(value)
              const next = idx >= 0 ? withoutNone.filter(v => v !== value) : [...withoutNone, value]
              onAnswer(question.id, next)
            }
            return (
              <div role="group" aria-label={question.text}>
                <p className="text-sm text-gray-500 mb-3">Select all that apply</p>
                <div className="space-y-3">
                  {question.options.map(option => {
                    const checked = multiSelected.includes(option.value)
                    const isNoneOption = option.value === 'none'
                    const disabledByNone = multiSelected.includes('none') && !isNoneOption
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleMultiToggle(option.value)}
                        disabled={disabledByNone}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors
                          ${checked ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-300 bg-white text-gray-800 hover:border-blue-400'}
                          ${disabledByNone ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        aria-pressed={checked}
                      >
                        {checked
                          ? <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0" aria-hidden="true" />
                          : <Square className="h-5 w-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
                        }
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    )
                  })}
                </div>
                <div className="mt-5">
                  <Button
                    onClick={onContinue}
                    disabled={multiSelected.length < 1}
                    className="w-full bg-blue-700 hover:bg-blue-800 h-12 text-base"
                  >
                    Continue ({multiSelected.length} selected)
                  </Button>
                </div>
              </div>
            )
          })()}

          {/* Penalty preview for non-compliant indicator */}
          {(currentResponse as string) === 'no' && question.gapTemplate && (
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
