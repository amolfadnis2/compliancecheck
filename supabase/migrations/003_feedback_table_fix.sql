-- Migration: Fix feedback table with proper foreign keys
-- Run this in your Supabase SQL Editor

-- Step 1: Drop existing feedback table (if it has data you want to keep, skip this)
DROP TABLE IF EXISTS public.feedback;

-- Step 2: Create feedback table with proper foreign keys
CREATE TABLE public.feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Link to user (nullable - anonymous feedback allowed)
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Link to assessment (nullable - feedback can exist without assessment)
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE SET NULL,
    
    -- Assessment context
    assessment_type TEXT NOT NULL,
    
    -- NPS Score (0-10)
    nps_score INTEGER NOT NULL CHECK (nps_score >= 0 AND nps_score <= 10),
    
    -- Feedback responses
    value_provided TEXT,
    would_recommend TEXT,
    ui_experience TEXT,
    report_quality TEXT,
    time_spent TEXT,
    desired_features TEXT[],
    additional_comments TEXT,
    
    -- Metadata
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for queries
CREATE INDEX idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX idx_feedback_assessment_id ON public.feedback(assessment_id);
CREATE INDEX idx_feedback_assessment_type ON public.feedback(assessment_type);
CREATE INDEX idx_feedback_nps_score ON public.feedback(nps_score);
CREATE INDEX idx_feedback_submitted_at ON public.feedback(submitted_at);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert feedback
CREATE POLICY "Allow anonymous feedback inserts" ON public.feedback
    FOR INSERT
    WITH CHECK (true);

-- Allow users to view their own feedback
CREATE POLICY "Users can view own feedback" ON public.feedback
    FOR SELECT
    USING (user_id = auth.uid() OR user_id IS NULL);

-- Allow service role full access
CREATE POLICY "Service role full access" ON public.feedback
    FOR ALL
    USING (auth.role() = 'service_role');

COMMENT ON TABLE public.feedback IS 'User feedback and NPS scores linked to users and assessments';
