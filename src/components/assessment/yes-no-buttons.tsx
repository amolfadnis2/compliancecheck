'use client'

import { CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface YesNoButtonsProps {
  onYes: () => void
  onNo: () => void
  selectedAnswer?: string
  disabled?: boolean
}

export function YesNoButtons({ onYes, onNo, selectedAnswer, disabled = false }: YesNoButtonsProps) {
  return (
    <div className="flex gap-3">
      <Button
        onClick={onYes}
        disabled={disabled}
        aria-pressed={selectedAnswer === 'yes'}
        className={`flex-1 flex items-center justify-center gap-2 h-12 text-base font-medium ${
          selectedAnswer === 'yes'
            ? 'bg-green-700 hover:bg-green-800 text-white'
            : 'bg-white hover:bg-green-50 text-gray-700 border border-gray-300'
        }`}
        variant="outline"
      >
        <CheckCircle className="h-5 w-5" aria-hidden="true" />
        Yes
      </Button>
      <Button
        onClick={onNo}
        disabled={disabled}
        aria-pressed={selectedAnswer === 'no'}
        className={`flex-1 flex items-center justify-center gap-2 h-12 text-base font-medium ${
          selectedAnswer === 'no'
            ? 'bg-red-700 hover:bg-red-800 text-white'
            : 'bg-white hover:bg-red-50 text-gray-700 border border-gray-300'
        }`}
        variant="outline"
      >
        <XCircle className="h-5 w-5" aria-hidden="true" />
        No
      </Button>
    </div>
  )
}
