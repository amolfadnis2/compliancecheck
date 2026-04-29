import type { User } from '@supabase/supabase-js'

export type { User }

export type LifecycleStage =
  | 'anonymous'
  | 'verified'
  | 'engaged'
  | 'assessment_taker'
  | 'paying'

export type Source =
  | 'ctc_calc'
  | 'gratuity_calc'
  | 'penalty_calc'
  | 'calendar'
  | 'assessment_statutory'
  | 'assessment_labour_code'
  | 'assessment_dpdp'
  | 'assessment_posh'
  | 'assessment_food_business'
  | 'assessment_state_wise'
  | 'unknown'

export type EmployeeCountRange =
  | '1-9'
  | '10-19'
  | '20-49'
  | '50-99'
  | '100-249'
  | '250-499'
  | '500+'

export type Industry =
  | 'it'
  | 'manufacturing'
  | 'food'
  | 'retail'
  | 'healthcare'
  | 'edtech'
  | 'financial'
  | 'other'

export interface Profile {
  id: string
  email: string | null
  email_verified_at: string | null
  full_name: string | null
  phone: string | null
  company_name: string | null
  state: string | null
  employee_count_range: EmployeeCountRange | null
  industry: Industry | null
  first_source: string
  sources_used: string[]
  lifecycle_stage: LifecycleStage
  marketing_consent_at: string | null
  deadline_reminders_consent_at: string | null
  deletion_requested_at: string | null
  created_at: string
  last_seen_at: string
  updated_at: string
}

export interface DomainEvent {
  id: string
  user_id: string
  event_name: string
  properties: Record<string, unknown>
  created_at: string
}

export interface ProfileUpdate {
  full_name?: string
  phone?: string
  company_name?: string
  state?: string
  employee_count_range?: EmployeeCountRange
  industry?: Industry
  sources_used?: string[]
  lifecycle_stage?: LifecycleStage
  marketing_consent_at?: string | null
  deadline_reminders_consent_at?: string | null
  last_seen_at?: string
}
