'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2 } from 'lucide-react'

interface AssessmentHeaderProps {
  title: string
  subtitle: string
  badgeText?: string
  badgeVariant?: 'free' | 'paid' | 'coming-soon'
}

/**
 * Shared header component for all assessments
 * Provides consistent branding and navigation
 */
export function AssessmentHeader({
  title,
  subtitle,
  badgeText = 'FREE Assessment',
  badgeVariant = 'free'
}: AssessmentHeaderProps) {
  const getBadgeClasses = () => {
    switch (badgeVariant) {
      case 'free':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'paid':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'coming-soon':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      default:
        return 'bg-green-100 text-green-700 border-green-200'
    }
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-semibold text-lg">{title}</span>
              <div className="text-xs text-gray-600">{subtitle}</div>
            </div>
          </Link>
          <Badge variant="secondary" className={getBadgeClasses()}>
            {badgeText}
          </Badge>
        </div>
      </div>
    </header>
  )
}
