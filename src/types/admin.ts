/** Admin Dashboard TypeScript Types */

export interface DashboardStats {
  totalAssessments: number
  completedAssessments: number
  uniqueUsers: number
  averageScore: number | null
  completionRate: number
  npsScore: number | null
  npsResponses: number
  periodLabel: string
}

export interface AssessmentRow {
  id: string
  user_email: string
  user_name: string
  company_name: string
  assessment_type: string
  status: string
  overall_score: number | null
  state: string | null
  industry: string | null
  employee_count: string | null
  created_at: string
  completed_at: string | null
}

export interface AssessmentTypeBreakdown {
  assessment_type: string
  total: number
  completed: number
  avg_score: number | null
}

export interface ScoreBucket {
  bucket: string
  count: number
  percentage: number
}

export interface StateBreakdown {
  state: string
  total: number
  avg_score: number | null
}

export interface IndustryBreakdown {
  industry: string
  total: number
  avg_score: number | null
}

export interface DailyTrend {
  date: string
  count: number
}

export interface DashboardData {
  stats: DashboardStats
  assessments: AssessmentRow[]
  typeBreakdown: AssessmentTypeBreakdown[]
  scoreBuckets: ScoreBucket[]
  stateBreakdown: StateBreakdown[]
  industryBreakdown: IndustryBreakdown[]
  dailyTrend: DailyTrend[]
}

export type DateRange = '7' | '15' | '30' | '90' | 'custom'
