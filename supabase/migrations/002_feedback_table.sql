-- Migration: Create feedback table for NPS and user feedback
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assessment_id TEXT,
    assessment_type TEXT NOT NULL,
    nps_score INTEGER NOT NULL CHECK (nps_score >= 0 AND nps_score <= 10),
    value_provided TEXT,
    would_recommend TEXT,
    ui_experience TEXT,
    report_quality TEXT,
    time_spent TEXT,
    desired_features TEXT[],
    additional_comments TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_feedback_assessment_type ON public.feedback(assessment_type);
CREATE INDEX IF NOT EXISTS idx_feedback_nps_score ON public.feedback(nps_score);
CREATE INDEX IF NOT EXISTS idx_feedback_submitted_at ON public.feedback(submitted_at);

-- Enable RLS (but allow anonymous inserts for feedback)
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert feedback (anonymous users)
CREATE POLICY "Allow anonymous feedback inserts" ON public.feedback
    FOR INSERT
    WITH CHECK (true);

-- Comment on table
COMMENT ON TABLE public.feedback IS 'User feedback and NPS scores collected after assessment completion';
