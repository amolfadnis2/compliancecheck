'use client'

import { useState, useCallback } from 'react'
import { ChevronDown, ChevronUp, HelpCircle, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { AutoDealerQuestion, Responses } from '@/types/auto-dealer'

interface ApplicabilityFormProps {
  questions: AutoDealerQuestion[]
  responses: Responses
  currentIndex: number
  onAnswer: (questionId: string, value: string) => void
  onBack: () => void
}

export function ApplicabilityForm({
  questions,
  responses,
  currentIndex,
  onAnswer,
  onBack,
}: ApplicabilityFormProps) {
  const [expandedHelp, setExpandedHelp] = useState<string | null>(null)
  const question = questions[currentIndex]
  const progress = questions.length > 0
    ? Math.round((currentIndex / questions.length) * 100)
    : 0
  const currentResponse = question ? String(responses[question.id] ?? '') : ''

  const toggleHelp = useCallback((id: string) => {
    setExpandedHelp(prev => prev === id ? null : id)
  }, [])

  if (!question) return null

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
                    ? <><CheckCircle className="mr-2 h-5 w-5" />Yes</>
                    : <><XCircle className="mr-2 h-5 w-5" />No</>
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
