-- Migration: Add company fields to users table
-- This adds company info directly to users for simpler queries
-- The companies table remains for detailed company data if needed

-- Add company-related columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS industry_type TEXT,
ADD COLUMN IF NOT EXISTS employee_count TEXT,
ADD COLUMN IF NOT EXISTS registered_state TEXT;

-- Add index for common queries
CREATE INDEX IF NOT EXISTS idx_users_company_name ON public.users(company_name);
CREATE INDEX IF NOT EXISTS idx_users_industry_type ON public.users(industry_type);

-- Update the feedback table to also include user_id
ALTER TABLE public.feedback 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
