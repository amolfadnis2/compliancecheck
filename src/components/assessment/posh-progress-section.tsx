/**
 * Enhanced Progress Section for POSH Assessment
 * Shows overall progress + current section + upcoming sections
 * 
 * Issue: P2-001 from POSH_ASSESSMENT_FIXES_BACKLOG.md
 */

import React from 'react'

interface ProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  currentCategory: string;
  categoryIndex: number;
  totalCategories: number;
  questionsInCategory: number;
  questionIndexInCategory: number;
  categories: { code: string; name: string }[];
}

export const POSHProgressSection: React.FC<ProgressProps> = ({
  currentQuestion,
  totalQuestions,
  currentCategory,
  categoryIndex,
  totalCategories,
  questionsInCategory,
  questionIndexInCategory,
  categories,
}) => {
  const overallPercent = Math.round((currentQuestion / totalQuestions) * 100)
  const categoryPercent = Math.round(((questionIndexInCategory + 1) / questionsInCategory) * 100)
  
  // Get upcoming category names
  const upcomingCategories = categories
    .slice(categoryIndex + 1, categoryIndex + 3)
    .map(cat => cat.name)
  
  return (
    <div className="bg-white border-b p-4 sticky top-0 z-10 shadow-sm">
      {/* Overall Progress */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600 font-medium">Overall Progress</span>
        <span className="text-sm font-semibold text-gray-900">{overallPercent}%</span>
      </div>
      
      <div 
        className="relative h-2 bg-gray-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={overallPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Overall assessment progress: ${overallPercent}%`}
      >
        {/* Progress fill */}
        <div 
          className="h-full bg-green-600 transition-all duration-300"
          style={{ width: `${overallPercent}%` }}
        />
        
        {/* Category milestone markers */}
        {categories.map((_, idx) => {
          if (idx === 0) return null // Skip first marker
          const position = (idx / totalCategories) * 100
          return (
            <div
              key={idx}
              className="absolute top-0 h-full w-0.5 bg-gray-400"
              style={{ left: `${position}%` }}
              aria-hidden="true"
            />
          )
        })}
      </div>
      
      {/* Current Section Indicator */}
      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
          📍 Section {categoryIndex + 1} of {totalCategories}
        </span>
        <span className="text-sm font-semibold text-gray-800">
          {currentCategory}
        </span>
      </div>
      
      {/* Section Progress */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Question {questionIndexInCategory + 1} of {questionsInCategory}</span>
          <span className="font-medium">{categoryPercent}%</span>
        </div>
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${categoryPercent}%` }}
            role="progressbar"
            aria-valuenow={categoryPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Current section progress: ${categoryPercent}%`}
          />
        </div>
      </div>
      
      {/* Upcoming Sections Preview */}
      {upcomingCategories.length > 0 && (
        <div className="mt-3 text-xs text-gray-500">
          <span className="font-medium">Coming up:</span>{' '}
          {upcomingCategories.join(' → ')}
          {categoryIndex + 3 < totalCategories && ' ...'}
        </div>
      )}
    </div>
  )
}

export default POSHProgressSection
