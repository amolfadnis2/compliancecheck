'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

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
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center">
              <Check className="w-6 h-6 text-white" strokeWidth={3} />
            </div>
            <div>
              <span className="font-semibold text-lg text-gray-900 dark:text-white">{title}</span>
              <div className="text-xs text-gray-600 dark:text-gray-400">{subtitle}</div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className={getBadgeClasses()}>
              {badgeText}
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
