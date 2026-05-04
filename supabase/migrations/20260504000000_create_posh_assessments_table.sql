-- Migration: Create dedicated posh_assessments table
-- Created: 2026-05-04
-- Purpose: The generic assessments table schema doesn't have POSH-specific columns
--          (company_name, email, phone, full_name, applicability_responses, etc.)
--          and its CHECK constraint blocks 'posh_compliance' as assessment_type.
--          This creates a dedicated table that matches exactly what the API inserts.

CREATE TABLE IF NOT EXISTS public.posh_assessments (
    id UUID PRIMARY KEY,
    assessment_type TEXT NOT NULL DEFAULT 'posh_compliance',

    -- User / company details (flat for easy querying)
    company_name TEXT,
    email TEXT,
    phone TEXT,
    full_name TEXT,

    -- Raw question responses
    applicability_responses JSONB,
    compliance_responses JSONB,

    -- Computed results
    overall_score INTEGER,
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    category_scores JSONB,
    action_items JSONB,
    compliant_items JSONB,
    non_compliant_items JSONB,
    applicability_results JSONB,
    assessment_profile JSONB,

    -- Metadata
    completed BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_posh_assessments_email ON public.posh_assessments(email);
CREATE INDEX IF NOT EXISTS idx_posh_assessments_created_at ON public.posh_assessments(created_at DESC);

-- Allow anonymous inserts (no auth required for free assessment)
ALTER TABLE public.posh_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert posh assessments"
    ON public.posh_assessments FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can read posh assessments by id"
    ON public.posh_assessments FOR SELECT
    USING (true);
