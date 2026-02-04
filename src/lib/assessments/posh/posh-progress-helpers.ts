/**
 * Helper functions to calculate progress data for POSH Assessment
 * Issue: P2-001 from POSH_ASSESSMENT_FIXES_BACKLOG.md
 */

import { POSHQuestion, POSHCategory } from './posh-compliance-questions'

export interface CategoryInfo {
  code: POSHCategory
  name: string
  questionCount: number
}

// POSH Assessment Categories in order
const POSH_CATEGORY_ORDER: CategoryInfo[] = [
  { code: 'icc_constitution', name: 'ICC Constitution', questionCount: 10 },
  { code: 'policy_documentation', name: 'Policy & Documentation', questionCount: 8 },
  { code: 'training_awareness', name: 'Training & Awareness', questionCount: 8 },
  { code: 'display_communication', name: 'Display & Communication', questionCount: 5 },
  { code: 'reporting_monitoring', name: 'Reporting & Monitoring', questionCount: 7 },
  { code: 'complaint_handling', name: 'Complaint Handling', questionCount: 7 },
]

export interface ProgressData {
  currentQuestion: number // 1-based index for display
  totalQuestions: number
  currentCategory: string
  categoryIndex: number // 0-based index
  totalCategories: number
  questionsInCategory: number
  questionIndexInCategory: number // 0-based within category
  categories: { code: string; name: string }[]
}

/**
 * Calculate progress data for current question
 * @param questions - Array of filtered questions shown to user
 * @param currentQuestionIndex - 0-based index of current question
 */
export function calculateProgressData(
  questions: POSHQuestion[],
  currentQuestionIndex: number
): ProgressData | null {
  if (!questions || questions.length === 0 || currentQuestionIndex < 0) {
    return null
  }
  
  const currentQ = questions[currentQuestionIndex]
  if (!currentQ) return null
  
  const currentCategory = currentQ.category
  
  // Find which category we're in
  const categoryIndex = POSH_CATEGORY_ORDER.findIndex(
    cat => cat.code === currentCategory
  )
  
  // Count questions in current category
  const questionsInCurrentCategory = questions.filter(
    q => q.category === currentCategory
  )
  
  // Find position within current category
  const questionIndexInCategory = questionsInCurrentCategory.findIndex(
    q => q.id === currentQ.id
  )
  
  return {
    currentQuestion: currentQuestionIndex + 1, // Convert to 1-based
    totalQuestions: questions.length,
    currentCategory: POSH_CATEGORY_ORDER[categoryIndex]?.name || 'Unknown Section',
    categoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
    totalCategories: POSH_CATEGORY_ORDER.length,
    questionsInCategory: questionsInCurrentCategory.length,
    questionIndexInCategory: questionIndexInCategory >= 0 ? questionIndexInCategory : 0,
    categories: POSH_CATEGORY_ORDER.map(cat => ({
      code: cat.code,
      name: cat.name,
    })),
  }
}

/**
 * Get overall progress percentage
 */
export function getOverallProgress(
  currentQuestionIndex: number,
  totalQuestions: number
): number {
  if (totalQuestions === 0) return 0
  return Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)
}

/**
 * Get category progress percentage
 */
export function getCategoryProgress(
  questionIndexInCategory: number,
  questionsInCategory: number
): number {
  if (questionsInCategory === 0) return 0
  return Math.round(((questionIndexInCategory + 1) / questionsInCategory) * 100)
}
