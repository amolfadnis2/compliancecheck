-- Promo codes for waiving assessment fees (tester door).
-- Never anonymously readable — all validation happens server-side only.

CREATE TABLE public.promo_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT UNIQUE NOT NULL,  -- always stored and matched uppercased
  kind        TEXT NOT NULL DEFAULT 'full_waiver'
                CHECK (kind IN ('full_waiver')),
  applies_to  TEXT[] NOT NULL DEFAULT '{all}', -- assessment type constants or 'all'
  max_uses    INTEGER,                          -- NULL = unlimited
  used_count  INTEGER NOT NULL DEFAULT 0,
  expires_at  TIMESTAMPTZ,                      -- NULL = no expiry
  active      BOOLEAN NOT NULL DEFAULT true,
  note        TEXT,                             -- e.g. 'QA team', 'beta cohort May 2026'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pc_code ON public.promo_codes (code) WHERE active = true;

-- No anonymous access: codes must not be enumerable.
-- Service_role (used by API routes) bypasses RLS automatically.
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Redemption audit trail
CREATE TABLE public.promo_redemptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code      TEXT NOT NULL,
  assessment_id   TEXT NOT NULL,
  assessment_type TEXT NOT NULL,
  email           TEXT,
  redeemed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pr_code ON public.promo_redemptions (promo_code);
CREATE INDEX idx_pr_assessment ON public.promo_redemptions (assessment_id);

ALTER TABLE public.promo_redemptions ENABLE ROW LEVEL SECURITY;
-- No policies: service_role only
