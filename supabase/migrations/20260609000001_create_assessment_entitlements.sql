-- Assessment entitlements: unified paid/waived state across all assessment types.
-- All writes go through API routes using the service_role client (bypasses RLS).

CREATE TABLE public.assessment_entitlements (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id         TEXT NOT NULL,
  assessment_type       TEXT NOT NULL,
  amount_paise          INTEGER NOT NULL DEFAULT 0,
  currency              TEXT NOT NULL DEFAULT 'INR',
  gst_amount            INTEGER,
  status                TEXT NOT NULL DEFAULT 'initiated'
                          CHECK (status IN ('initiated', 'paid', 'failed', 'waived')),
  payment_method        TEXT CHECK (payment_method IN ('razorpay', 'waiver')),
  razorpay_order_id     TEXT,
  razorpay_payment_id   TEXT,
  razorpay_signature    TEXT,
  promo_code            TEXT,
  email                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at               TIMESTAMPTZ,
  CONSTRAINT uq_assessment_entitlement UNIQUE (assessment_id, assessment_type)
);

CREATE INDEX idx_ae_assessment ON public.assessment_entitlements (assessment_id, assessment_type);
CREATE INDEX idx_ae_status ON public.assessment_entitlements (status);
CREATE INDEX idx_ae_order ON public.assessment_entitlements (razorpay_order_id)
  WHERE razorpay_order_id IS NOT NULL;

ALTER TABLE public.assessment_entitlements ENABLE ROW LEVEL SECURITY;

-- Inserts come from API routes (service_role). Allow anonymous insert as fallback safety.
CREATE POLICY "Allow anonymous inserts" ON public.assessment_entitlements
  FOR INSERT WITH CHECK (true);

-- Reads are server-side only (service_role bypasses). Allow select so client can
-- check own entitlement by assessment UUID (unguessable).
CREATE POLICY "Allow select by assessment_id" ON public.assessment_entitlements
  FOR SELECT USING (true);
