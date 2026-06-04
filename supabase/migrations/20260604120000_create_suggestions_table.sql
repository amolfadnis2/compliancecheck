-- Suggestions / Ideas submissions
--
-- Captures user feedback on existing assessments and ideas for new ones.
-- Contact details (name/email/phone) are OPTIONAL and UNVERIFIED by design.
-- Receives writes from unauthenticated users, so an explicit RLS INSERT
-- policy is required (see CLAUDE.md section 8).

CREATE TABLE IF NOT EXISTS public.suggestions (
    id UUID PRIMARY KEY,

    -- The idea / suggestion (required)
    suggestion TEXT NOT NULL,

    -- High-level category bucket
    category TEXT CHECK (category IN (
        'improve_existing',
        'new_assessment',
        'new_tool',
        'bug_report',
        'other'
    )),

    -- Optional, unverified contact details
    name TEXT,
    email TEXT,
    phone TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suggestions_created_at ON public.suggestions(created_at);
CREATE INDEX IF NOT EXISTS idx_suggestions_category ON public.suggestions(category);

ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert suggestions"
    ON public.suggestions FOR INSERT
    WITH CHECK (true);
