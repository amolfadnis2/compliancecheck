'use client'

import { useState, useCallback } from 'react'
import { ChevronDown, ChevronUp, HelpCircle, ArrowLeft, CheckCircle, XCircle, Square, CheckSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { AutoDealerQuestion, Responses } from '@/types/auto-dealer'

// Returns options filtered by previously-declared total headcount so that
// sub-questions (women count, contract workers) never exceed the total.
function getFilteredOptions(
  question: AutoDealerQuestion,
  responses: Responses
): NonNullable<AutoDealerQuestion['options']> {
  const opts = question.options ?? []
  const totalBracket = String(responses['AD_APP_003'] ?? '')
  const maxTotal: Record<string, number> = {
    lt_10: 9, '10_19': 19, '20_49': 49, '50_99': 99,
    '100_299': 299, '300_499': 499, gte_500: Infinity,
  }
  const max = maxTotal[totalBracket] ?? Infinity

  if (question.id === 'AD_APP_004') {
    const womenMin: Record<string, number> = { lt_10: 0, '10_29': 10, '30_49': 30, gte_50: 50 }
    return opts.filter(o => (womenMin[o.value] ?? 0) <= max)
  }
  if (question.id === 'AD_APP_020') {
    const contractMin: Record<string, number> = { no: 0, lt_20: 1, '20_49': 20, gte_50: 50 }
    return opts.filter(o => (contractMin[o.value] ?? 0) <= max)
  }
  return opts
}

interface ApplicabilityFormProps {
  questions: AutoDealerQuestion[]
  responses: Responses
  currentIndex: number
  onAnswer: (questionId: string, value: string | string[]) => void
  onContinue: () => void
  onBack: () => void
}

export function ApplicabilityForm({
  questions,
  responses,
  currentIndex,
  onAnswer,
  onContinue,
  onBack,
}: ApplicabilityFormProps) {
  const [expandedHelp, setExpandedHelp] = useState<string | null>(null)
  const question = questions[currentIndex]
  const progress = questions.length > 0
    ? Math.round((currentIndex / questions.length) * 100)
    : 0

  // For single-select the current response is a string; for multi_choice it is string[]
  const rawResponse = question ? responses[question.id] : undefined
  const currentResponse = question?.type === 'multi_choice'
    ? (Array.isArray(rawResponse) ? rawResponse as string[] : rawResponse ? [rawResponse as string] : [])
    : (rawResponse !== undefined && rawResponse !== null ? String(rawResponse) : '')

  const toggleHelp = useCallback((id: string) => {
    setExpandedHelp(prev => prev === id ? null : id)
  }, [])

  if (!question) return null

  // Multi-choice toggle handler
  const handleMultiToggle = (value: string) => {
    const current = Array.isArray(currentResponse) ? currentResponse as string[] : []
    if (value === 'none') {
      // "None of these" is mutually exclusive
      onAnswer(question.id, ['none'])
      return
    }
    const withoutNone = current.filter(v => v !== 'none')
    const idx = withoutNone.indexOf(value)
    const next = idx >= 0
      ? withoutNone.filter(v => v !== value)
      : [...withoutNone, value]
    onAnswer(question.id, next)
  }

  const multiSelected = Array.isArray(currentResponse) ? currentResponse as string[] : []
  const canContinue = multiSelected.length >= 1

  return (
    <>
      {/* Sticky progress bar */}
      <div className="bg-white border-b p-4 sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600 font-medium">Applicability Check</span>
          <span className="text-sm font-semibold text-gray-900">{progress}%</span>
        </div>
        <Progress
          value={progress}
          className="h-2 [&>div]:bg-blue-600"
          aria-label={`Applicability check progress: ${progress}%`}
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-800">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
            Phase 1: Applicability Profile
          </span>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto mt-6">
        <CardHeader>
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
                {expandedHelp === question.id ? 'Hide guidance' : 'Why do we ask?'}
                {expandedHelp === question.id
                  ? <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  : <ChevronDown className="h-4 w-4" aria-hidden="true" />
                }
              </button>
              {expandedHelp === question.id && (
                <CardDescription id={`help-${question.id}`} className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
                  {question.helpText}
                </CardDescription>
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

          {question.type === 'single_choice' && question.options && (() => {
            const visibleOptions = getFilteredOptions(question, responses)
            return (
              <div className="space-y-3" role="radiogroup" aria-label={question.text}>
                {visibleOptions.map(option => (
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
            )
          })()}

          {question.type === 'multi_choice' && question.options && (
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
                        ${checked
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-gray-300 bg-white text-gray-800 hover:border-blue-400'
                        }
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
                  disabled={!canContinue}
                  className="w-full bg-blue-700 hover:bg-blue-800 h-12 text-base"
                >
                  Continue ({multiSelected.length} selected)
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        {/* Back navigation */}
        <div className="px-6 pb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-3 py-2"
            aria-label={currentIndex === 0 ? 'Go back to company details' : 'Go to previous question'}
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back</span>
          </button>
        </div>
      </Card>
    </>
  )
}
