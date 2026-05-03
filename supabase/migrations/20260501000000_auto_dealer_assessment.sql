-- ============================================================================
-- Auto Dealer Compliance Assessment — DB Schema
-- Migration: 20260501000000_auto_dealer_assessment.sql
--
-- Creates:
--   auto_dealer_assessments  — primary assessment record (all user data)
--   otp_attempts             — OTP rate-limiting and verification
--   state_pt_slabs           — Professional Tax slabs by state (refreshable)
--   state_s_and_e            — Shops & Establishments rules by state
--   gst_rates_by_hsn         — GST rates by HSN/vehicle category (refreshable)
--
-- RLS:
--   Anonymous INSERT allowed on auto_dealer_assessments + otp_attempts.
--   SELECT/UPDATE on auto_dealer_assessments only when
--     auth.email() = user_email AND email_verified = true.
--   State/GST tables are public-read (reference data).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. auto_dealer_assessments
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auto_dealer_assessments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity (set on start; verified via OTP before submit)
  user_email            TEXT NOT NULL,
  email_verified        BOOLEAN NOT NULL DEFAULT false,
  full_name             TEXT,
  phone                 TEXT,
  company_name          TEXT,

  -- Applicability profile (Phase-1 answers, stored as JSONB)
  applicability_profile JSONB,

  -- All question responses keyed by question id
  responses             JSONB DEFAULT '{}'::JSONB,

  -- Scoring
  phase_scores          JSONB,    -- array of PhaseScore objects
  gap_analysis          JSONB,    -- array of GapItem objects
  overall_score         INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  compliance_status     TEXT CHECK (compliance_status IN ('green','yellow','red')),

  -- Payment
  payment_status        TEXT NOT NULL DEFAULT 'pending'
                          CHECK (payment_status IN ('pending','initiated','paid','failed','refunded')),
  razorpay_order_id     TEXT,
  razorpay_payment_id   TEXT,
  price_tier            TEXT CHECK (price_tier IN ('basic','standard','premium')),

  -- PDF
  pdf_generated_at      TIMESTAMPTZ,

  -- Labour regime toggle (default new Labour Codes)
  labour_regime         TEXT NOT NULL DEFAULT 'new'
                          CHECK (labour_regime IN ('new','legacy')),

  -- Metadata
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_auto_dealer_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_dealer_updated_at
  BEFORE UPDATE ON auto_dealer_assessments
  FOR EACH ROW EXECUTE FUNCTION update_auto_dealer_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ada_user_email
  ON auto_dealer_assessments (user_email);
CREATE INDEX IF NOT EXISTS idx_ada_payment_status
  ON auto_dealer_assessments (payment_status);
CREATE INDEX IF NOT EXISTS idx_ada_created_at
  ON auto_dealer_assessments (created_at DESC);

-- ----------------------------------------------------------------------------
-- 2. otp_attempts
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS otp_attempts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL,
  assessment_id UUID REFERENCES auto_dealer_assessments(id) ON DELETE SET NULL,
  otp_hash      TEXT NOT NULL,
  action        TEXT NOT NULL CHECK (action IN ('request', 'verify')),
  ip_address    TEXT,
  expires_at    TIMESTAMPTZ NOT NULL,
  used          BOOLEAN NOT NULL DEFAULT false,
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_email_created
  ON otp_attempts (email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_otp_expires
  ON otp_attempts (expires_at);

-- ----------------------------------------------------------------------------
-- 3. state_pt_slabs  (Professional Tax — state-specific slabs)
--    Source: Research §A.12 + state Budget notifications
--    Refresh cadence: quarterly
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS state_pt_slabs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code     TEXT NOT NULL,          -- ISO 3166-2:IN code e.g. 'MH','KA'
  slab_min       INTEGER NOT NULL,       -- monthly salary lower bound (INR)
  slab_max       INTEGER,               -- NULL = no upper cap for top slab
  monthly_tax    INTEGER NOT NULL,       -- INR per month
  effective_from DATE NOT NULL,
  effective_to   DATE,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pt_state_effective
  ON state_pt_slabs (state_code, effective_from DESC);

-- ----------------------------------------------------------------------------
-- 4. state_s_and_e  (Shops & Establishments rules by state)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS state_s_and_e (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code              TEXT NOT NULL UNIQUE,
  state_name              TEXT NOT NULL,
  registration_window_days INTEGER,     -- days from commencement to register
  max_hours_per_day        INTEGER,
  max_hours_per_week       INTEGER,
  weekly_off               TEXT,
  women_closing_time       TEXT,        -- e.g. '20:00' — women not to work after
  portal_url               TEXT,
  notes                    TEXT,
  effective_from           DATE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 5. gst_rates_by_hsn  (GST 2.0 rates effective 22 Sep 2025)
--    Source: Research §A.16 + PIB PRID 2164587
--    Refresh cadence: on GST Council notification
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gst_rates_by_hsn (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hsn              TEXT NOT NULL,
  description      TEXT NOT NULL,
  vehicle_category TEXT NOT NULL,       -- e.g. 'small_car','mid_large_car','2w_lte_350cc'
  rate             NUMERIC(5,2) NOT NULL, -- GST % e.g. 18.00
  cess             NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_rate       NUMERIC(5,2) GENERATED ALWAYS AS (rate + cess) STORED,
  effective_from   DATE NOT NULL,
  effective_to     DATE,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gst_hsn_effective
  ON gst_rates_by_hsn (hsn, effective_from DESC);
CREATE INDEX IF NOT EXISTS idx_gst_category
  ON gst_rates_by_hsn (vehicle_category);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE auto_dealer_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_attempts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE state_pt_slabs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE state_s_and_e           ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_rates_by_hsn        ENABLE ROW LEVEL SECURITY;

-- auto_dealer_assessments: anonymous INSERT; SELECT/UPDATE only for verified owner
CREATE POLICY "ada_anon_insert"
  ON auto_dealer_assessments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "ada_owner_select"
  ON auto_dealer_assessments FOR SELECT
  TO authenticated
  USING (auth.email() = user_email AND email_verified = true);

CREATE POLICY "ada_owner_update"
  ON auto_dealer_assessments FOR UPDATE
  TO authenticated
  USING (auth.email() = user_email AND email_verified = true)
  WITH CHECK (auth.email() = user_email);

-- Service-role bypass (used by API routes via SUPABASE_SERVICE_ROLE_KEY)
-- Service role bypasses RLS automatically — no policy needed.

-- otp_attempts: INSERT only (reads via service role from API)
CREATE POLICY "otp_anon_insert"
  ON otp_attempts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- state reference tables: public read
CREATE POLICY "pt_slabs_public_read"
  ON state_pt_slabs FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "s_and_e_public_read"
  ON state_s_and_e FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "gst_rates_public_read"
  ON gst_rates_by_hsn FOR SELECT TO anon, authenticated USING (true);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- ----------------------------------------------------------------------------
-- GST rates by HSN (GST 2.0, effective 22 Sep 2025)
-- Source: Research §A.16 / PIB PRID 2164587 / 56th GST Council 3 Sep 2025
-- ----------------------------------------------------------------------------
INSERT INTO gst_rates_by_hsn (hsn, description, vehicle_category, rate, cess, effective_from) VALUES
  ('8703', '4W petrol/CNG/LPG engine <=1200cc (length <=4000mm) — small car', 'small_car', 18, 0, '2025-09-22'),
  ('8703', '4W petrol engine >1200cc or length >4000mm — mid/large car', 'mid_large_car', 28, 12, '2025-09-22'),
  ('8703', '4W diesel engine <=1500cc (length <=4000mm)', 'small_diesel_car', 18, 0, '2025-09-22'),
  ('8703', '4W diesel engine >1500cc or length >4000mm', 'mid_large_diesel_car', 28, 12, '2025-09-22'),
  ('8703', 'Battery Electric Vehicle (BEV) — 4W', '4w_ev', 5, 0, '2025-09-22'),
  ('8711', '2-Wheeler petrol/CNG engine <=350cc', '2w_lte_350cc', 18, 0, '2025-09-22'),
  ('8711', '2-Wheeler petrol engine >350cc', '2w_gt_350cc', 28, 12, '2025-09-22'),
  ('8711', 'Battery Electric 2-Wheeler', '2w_ev', 5, 0, '2025-09-22'),
  ('8706', 'Buses and trucks (commercial vehicles)', 'commercial_vehicle', 18, 0, '2025-09-22'),
  ('8706', '3-Wheeler (auto-rickshaw, e-rickshaw)', '3_wheeler', 18, 0, '2025-09-22'),
  ('8708', 'Motor vehicle parts & accessories', 'parts_accessories', 18, 0, '2025-09-22'),
  ('8507', 'Traction batteries for EVs', 'ev_battery', 18, 0, '2025-09-22'),
  ('2710', 'Motor spirit (petrol) — for own consumption', 'fuel_internal', 0, 0, '2025-09-22'),
  ('9987', 'Service — repair, maintenance, servicing (labour)', 'workshop_service', 18, 0, '2025-09-22'),
  ('9972', 'Insurance agency/MISP service (to insurer)', 'misp_service', 18, 0, '2025-09-22')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- Professional Tax seed data (major states)
-- Source: Research §A.12; verify against current state notifications
-- NOTE: Slabs change with state Budgets — refresh quarterly via admin job
-- ----------------------------------------------------------------------------

-- Maharashtra (MVAT Act)
INSERT INTO state_pt_slabs (state_code, slab_min, slab_max, monthly_tax, effective_from, notes) VALUES
  ('MH', 0,     7499,  0,   '2023-04-01', 'Nil slab'),
  ('MH', 7500,  9999,  175, '2023-04-01', NULL),
  ('MH', 10000, NULL,  200, '2023-04-01', 'Rs.300 in Feb; annual max Rs.2,500')
ON CONFLICT DO NOTHING;

-- Karnataka (KPT Act 1976; PTax exemption raised to Rs.25,000/m wef 1 Apr 2025)
INSERT INTO state_pt_slabs (state_code, slab_min, slab_max, monthly_tax, effective_from, notes) VALUES
  ('KA', 0,      14999, 0,   '2025-04-01', 'Nil'),
  ('KA', 15000,  24999, 150, '2025-04-01', NULL),
  ('KA', 25000,  NULL,  200, '2025-04-01', 'Exemption raised to Rs.25,000 wef 1 Apr 2025')
ON CONFLICT DO NOTHING;

-- West Bengal
INSERT INTO state_pt_slabs (state_code, slab_min, slab_max, monthly_tax, effective_from, notes) VALUES
  ('WB', 0,    9999,  0,   '2023-04-01', 'Nil'),
  ('WB', 10000, 14999, 110, '2023-04-01', NULL),
  ('WB', 15000, 24999, 130, '2023-04-01', NULL),
  ('WB', 25000, NULL,  150, '2023-04-01', NULL)
ON CONFLICT DO NOTHING;

-- Tamil Nadu
INSERT INTO state_pt_slabs (state_code, slab_min, slab_max, monthly_tax, effective_from, notes) VALUES
  ('TN', 0,    21000, 0,   '2023-04-01', 'Nil'),
  ('TN', 21001, NULL, 208, '2023-04-01', 'Annual Rs.2,500')
ON CONFLICT DO NOTHING;

-- Andhra Pradesh
INSERT INTO state_pt_slabs (state_code, slab_min, slab_max, monthly_tax, effective_from, notes) VALUES
  ('AP', 0,    14999, 0,   '2023-04-01', 'Nil'),
  ('AP', 15000, 19999, 150, '2023-04-01', NULL),
  ('AP', 20000, NULL,  200, '2023-04-01', NULL)
ON CONFLICT DO NOTHING;

-- Telangana
INSERT INTO state_pt_slabs (state_code, slab_min, slab_max, monthly_tax, effective_from, notes) VALUES
  ('TS', 0,    14999, 0,   '2023-04-01', 'Nil'),
  ('TS', 15000, 19999, 150, '2023-04-01', NULL),
  ('TS', 20000, NULL,  200, '2023-04-01', NULL)
ON CONFLICT DO NOTHING;

-- Gujarat
INSERT INTO state_pt_slabs (state_code, slab_min, slab_max, monthly_tax, effective_from, notes) VALUES
  ('GJ', 0,    11999, 0,   '2023-04-01', 'Nil'),
  ('GJ', 12000, NULL,  200, '2023-04-01', NULL)
ON CONFLICT DO NOTHING;

-- Odisha
INSERT INTO state_pt_slabs (state_code, slab_min, slab_max, monthly_tax, effective_from, notes) VALUES
  ('OD', 0,    20000, 0,   '2023-04-01', 'Nil'),
  ('OD', 20001, NULL, 200, '2023-04-01', NULL)
ON CONFLICT DO NOTHING;

-- Assam
INSERT INTO state_pt_slabs (state_code, slab_min, slab_max, monthly_tax, effective_from, notes) VALUES
  ('AS', 0,    9999,  0,   '2023-04-01', 'Nil'),
  ('AS', 10000, 14999, 150, '2023-04-01', NULL),
  ('AS', 15000, NULL,  208, '2023-04-01', NULL)
ON CONFLICT DO NOTHING;

-- States WITHOUT PT (no rows needed; assessment will show N/A)
-- Delhi, Haryana, UP, Rajasthan, Punjab, Uttarakhand, HP, J&K, Goa, Bihar, MP, Chhattisgarh

-- ----------------------------------------------------------------------------
-- Shops & Establishments reference data (selected states)
-- ----------------------------------------------------------------------------
INSERT INTO state_s_and_e (state_code, state_name, registration_window_days, max_hours_per_day, max_hours_per_week, weekly_off, women_closing_time, portal_url, effective_from) VALUES
  ('MH', 'Maharashtra', 30, 9, 48, 'Sunday (or any 1 day)', '21:30', 'https://mahashram.gov.in', '2017-01-01'),
  ('KA', 'Karnataka', 30, 9, 48, 'Sunday', '20:00', 'https://karmika.karnataka.gov.in', '2017-01-01'),
  ('TN', 'Tamil Nadu', 30, 9, 48, 'Sunday', '21:00', 'https://labour.tn.gov.in', '2017-01-01'),
  ('TS', 'Telangana', 30, 9, 48, 'Sunday', '21:00', 'https://labour.telangana.gov.in', '2017-01-01'),
  ('AP', 'Andhra Pradesh', 30, 9, 48, 'Sunday', '21:00', 'https://labour.ap.gov.in', '2017-01-01'),
  ('GJ', 'Gujarat', 30, 9, 48, 'Sunday', '20:00', 'https://labour.gujarat.gov.in', '2017-01-01'),
  ('WB', 'West Bengal', 30, 9, 48, 'Sunday', '20:00', 'https://labour.wb.gov.in', '2017-01-01'),
  ('DL', 'Delhi', 30, 9, 48, 'Sunday', '21:00', 'https://labour.delhi.gov.in', '2017-01-01'),
  ('HR', 'Haryana', 30, 9, 48, 'Sunday', '20:00', 'https://hrylabour.gov.in', '2017-01-01'),
  ('RJ', 'Rajasthan', 30, 9, 48, 'Sunday', '20:00', 'https://labour.rajasthan.gov.in', '2017-01-01'),
  ('UP', 'Uttar Pradesh', 30, 9, 48, 'Sunday', '20:00', 'https://uplabour.gov.in', '2017-01-01'),
  ('MP', 'Madhya Pradesh', 30, 9, 48, 'Sunday', '20:00', 'https://labour.mp.gov.in', '2017-01-01'),
  ('PB', 'Punjab', 30, 9, 48, 'Sunday', '20:00', 'https://pblabour.gov.in', '2017-01-01'),
  ('OD', 'Odisha', 30, 9, 48, 'Sunday', '20:00', 'https://labour.odisha.gov.in', '2017-01-01'),
  ('AS', 'Assam', 30, 9, 48, 'Sunday', '20:00', 'https://labour.assam.gov.in', '2017-01-01')
ON CONFLICT (state_code) DO NOTHING;
