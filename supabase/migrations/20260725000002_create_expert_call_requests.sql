-- Expert-call demand capture (P0-B.2). Fulfilment is manual/deferred today
-- (no CA/credentialed expert on staff) — this table exists purely to record
-- and measure demand, so the founder can decide when to staff the expert
-- layer. Receives writes from unauthenticated users, so an explicit RLS
-- INSERT policy is required (see CLAUDE.md section 8).

CREATE TABLE public.expert_call_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id     TEXT NOT NULL,
  assessment_type   TEXT NOT NULL,
  email             TEXT NOT NULL,
  topic             TEXT,
  preferred_window  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ecr_assessment ON public.expert_call_requests (assessment_id, assessment_type);
CREATE INDEX idx_ecr_created_at ON public.expert_call_requests (created_at);

ALTER TABLE public.expert_call_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON public.expert_call_requests
  FOR INSERT WITH CHECK (true);
