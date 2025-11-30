export type EntityType = 'pvt_ltd' | 'llp' | 'proprietorship' | 'partnership' | 'opc'
export type IndustryType = 'it' | 'manufacturing' | 'retail' | 'healthcare' | 'fintech' | 'other'
export type EmployeeCount = '1-10' | '11-50' | '51-100' | '101-500' | '500+'
export type ProductType = 'statutory_health' | 'labor_code' | 'dpdp' | 'document'
export type PaymentStatus = 'created' | 'paid' | 'failed' | 'refunded'
export type AssessmentStatus = 'paid' | 'in_progress' | 'completed'

export interface User {
  id: string
  email: string
  full_name: string
  phone: string | null
  consent_timestamp: string | null
  consent_version: string | null
  consent_ip: string | null
  marketing_consent: boolean
  is_deleted: boolean
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  user_id: string
  company_name: string
  entity_type: EntityType | null
  gstin: string | null
  pan: string | null
  cin: string | null
  industry_type: IndustryType | null
  employee_count: EmployeeCount | null
  registered_state: string | null
  operating_states: string[] | null
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  user_id: string
  company_id: string | null
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  razorpay_signature: string | null
  amount: number
  currency: string
  gst_amount: number | null
  product_type: ProductType
  status: PaymentStatus
  invoice_number: string | null
  payment_method: string | null
  created_at: string
  paid_at: string | null
}

export interface Assessment {
  id: string
  user_id: string
  company_id: string | null
  payment_id: string | null
  assessment_type: ProductType
  status: AssessmentStatus
  responses: Record<string, unknown>
  overall_score: number | null
  category_scores: Record<string, number>
  action_items: Array<{
    priority: 'high' | 'medium' | 'low'
    text: string
    category: string
  }>
  report_url: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export interface ConsentLog {
  id: string
  user_id: string | null
  consent_type: string
  consent_given: boolean
  ip_address: string | null
  user_agent: string | null
  policy_version: string | null
  created_at: string
}
