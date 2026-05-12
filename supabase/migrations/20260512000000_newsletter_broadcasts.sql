-- Newsletter broadcasts log table
-- Records each successful newsletter broadcast so there is a history of sends.

CREATE TABLE IF NOT EXISTS public.newsletter_broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL,
    sent_count INTEGER NOT NULL DEFAULT 0,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Service role only — no public reads or writes
ALTER TABLE public.newsletter_broadcasts ENABLE ROW LEVEL SECURITY;

-- No permissive policies; the admin client (service role) bypasses RLS entirely.
-- Authenticated users and anonymous callers cannot read or write this table.
