-- Migration 005: Fix INSERT policies for users and companies tables
-- This enables anonymous user and company creation via service role

-- ============================================
-- 1. ADD INSERT POLICY FOR USERS TABLE
-- ============================================
-- Allow service role inserts (for API-created users)
DROP POLICY IF EXISTS "Allow user inserts via service role" ON public.users;
CREATE POLICY "Allow user inserts via service role" ON public.users
    FOR INSERT WITH CHECK (true);

-- ============================================
-- 2. FIX COMPANIES INSERT POLICY
-- ============================================
-- Drop the old policy that requires auth.uid()
DROP POLICY IF EXISTS "Users can insert own companies" ON public.companies;

-- Allow any insert (service role will handle auth)
CREATE POLICY "Allow company inserts via service role" ON public.companies
    FOR INSERT WITH CHECK (true);

-- ============================================
-- 3. ENSURE COLUMNS EXIST (idempotent)
-- ============================================
-- Add company fields to users if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'users' 
                   AND column_name = 'company_name') THEN
        ALTER TABLE public.users ADD COLUMN company_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'users' 
                   AND column_name = 'industry_type') THEN
        ALTER TABLE public.users ADD COLUMN industry_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'users' 
                   AND column_name = 'employee_count') THEN
        ALTER TABLE public.users ADD COLUMN employee_count TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'users' 
                   AND column_name = 'registered_state') THEN
        ALTER TABLE public.users ADD COLUMN registered_state TEXT;
    END IF;
END $$;

-- ============================================
-- 4. VERIFY SERVICE ROLE PERMISSIONS
-- ============================================
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.companies TO service_role;
GRANT ALL ON public.assessments TO service_role;

-- ============================================
-- DONE! Run this SQL in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql
-- ============================================
