-- ComplianceCheck Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/jnzxzqfstfttjnimruje/sql

-- ============================================
-- 1. USERS TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    consent_timestamp TIMESTAMPTZ,
    consent_version TEXT,
    consent_ip TEXT,
    marketing_consent BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create anonymous user for free assessments
INSERT INTO public.users (id, email, full_name, is_deleted)
VALUES ('00000000-0000-0000-0000-000000000000', 'anonymous@compliancecheck.local', 'Anonymous User', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. COMPANIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    entity_type TEXT CHECK (entity_type IN ('pvt_ltd', 'llp', 'proprietorship', 'partnership', 'opc')),
    gstin TEXT,
    pan TEXT,
    cin TEXT,
    industry_type TEXT CHECK (industry_type IN ('it', 'manufacturing', 'retail', 'healthcare', 'fintech', 'other')),
    employee_count TEXT CHECK (employee_count IN ('1-10', '11-50', '51-100', '101-500', '500+')),
    registered_state TEXT,
    operating_states TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- 3. PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    amount INTEGER NOT NULL, -- in paise
    currency TEXT DEFAULT 'INR',
    gst_amount INTEGER,
    product_type TEXT NOT NULL CHECK (product_type IN ('statutory_health', 'labour_code', 'dpdp', 'document')),
    status TEXT DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed', 'refunded')),
    invoice_number TEXT,
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

-- ============================================
-- 4. ASSESSMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    assessment_type TEXT NOT NULL CHECK (assessment_type IN ('statutory_health', 'labour_code', 'dpdp', 'document')),
    status TEXT DEFAULT 'completed' CHECK (status IN ('paid', 'in_progress', 'completed')),
    responses JSONB,
    overall_score INTEGER,
    category_scores JSONB,
    action_items JSONB,
    company_details JSONB, -- For anonymous assessments without company FK
    report_url TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. FEEDBACK TABLE (with proper FK)
-- ============================================
-- Drop and recreate with proper relationship
DROP TABLE IF EXISTS public.feedback;

CREATE TABLE public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE SET NULL,
    assessment_type TEXT NOT NULL,
    nps_score INTEGER NOT NULL CHECK (nps_score >= 0 AND nps_score <= 10),
    value_provided TEXT,
    would_recommend TEXT,
    ui_experience TEXT,
    report_quality TEXT,
    time_spent TEXT,
    desired_features TEXT[],
    additional_comments TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. CONSENT LOGS TABLE (DPDP compliance)
-- ============================================
CREATE TABLE IF NOT EXISTS public.consent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    consent_type TEXT NOT NULL,
    consent_given BOOLEAN NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    policy_version TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON public.assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_type ON public.assessments(assessment_type);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON public.assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON public.assessments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_companies_user_id ON public.companies(user_id);

CREATE INDEX IF NOT EXISTS idx_feedback_assessment_id ON public.feedback(assessment_id);
CREATE INDEX IF NOT EXISTS idx_feedback_nps_score ON public.feedback(nps_score);
CREATE INDEX IF NOT EXISTS idx_feedback_submitted_at ON public.feedback(submitted_at DESC);

-- ============================================
-- 8. UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Companies: users see own companies
CREATE POLICY "Users can view own companies" ON public.companies
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own companies" ON public.companies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own companies" ON public.companies
    FOR UPDATE USING (auth.uid() = user_id);

-- Assessments: users see own assessments
CREATE POLICY "Users can view own assessments" ON public.assessments
    FOR SELECT USING (auth.uid() = user_id);

-- CRITICAL: Allow anonymous inserts for free assessments
CREATE POLICY "Allow anonymous assessment inserts" ON public.assessments
    FOR INSERT WITH CHECK (true);

-- Payments: users see own payments
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

-- Feedback: anyone can insert (anonymous feedback allowed)
CREATE POLICY "Allow anonymous feedback inserts" ON public.feedback
    FOR INSERT WITH CHECK (true);

-- Consent logs: users see own logs
CREATE POLICY "Users can view own consent logs" ON public.consent_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow consent log inserts" ON public.consent_logs
    FOR INSERT WITH CHECK (true);

-- ============================================
-- 10. SERVICE ROLE BYPASS (for API calls)
-- ============================================
-- Service role key bypasses RLS automatically
-- This allows the API to insert assessments for anonymous users

-- Grant usage to service role (already default, but explicit)
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================
-- DONE! Verify with:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- ============================================
