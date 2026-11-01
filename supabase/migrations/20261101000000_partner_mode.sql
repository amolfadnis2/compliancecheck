-- Partner mode (white-label reports for CAs, CSs, lawyers and consultants).
-- Plan: docs/superpowers/plans/2026-11-01-partner-white-label.md
--
-- A partner ticks "I'm filling this in for a client" in Step 0 of any of the
-- 7 paid assessments and enters the details to show on the report. Pricing is
-- unchanged: the partner pays the normal price at checkout.
--
--  * report_preparers   one row per partner (keyed by email), latest details.
--                       Service-role only (no anon policies) - written by the
--                       submit routes, read by admin stats.
--  * prepared_by        snapshot of the branding at submit time, stored on the
--                       assessment row so a report never changes after the
--                       partner edits their details.
--  * report-logos       public storage bucket for partner logos; uploads only
--                       through POST /api/partner/logo (service role).

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.report_preparers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         extensions.citext NOT NULL UNIQUE,
  firm_name     TEXT NOT NULL,
  preparer_name TEXT NOT NULL,
  designation   TEXT NOT NULL
                CHECK (designation IN ('CA', 'CS', 'CMA', 'Advocate', 'Consultant', 'Other')),
  phone         TEXT,
  website       TEXT,
  city          TEXT,
  logo_path     TEXT,
  brand_color   TEXT CHECK (brand_color IS NULL OR brand_color ~ '^#[0-9A-Fa-f]{6}$'),
  attested_at   TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.report_preparers ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies: service role only (like assessment_entitlements).

-- Assessment tables: who prepared it and how it was submitted.
ALTER TABLE public.assessments
  ADD COLUMN IF NOT EXISTS submission_mode TEXT NOT NULL DEFAULT 'self',
  ADD COLUMN IF NOT EXISTS preparer_id UUID REFERENCES public.report_preparers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS prepared_by JSONB;

ALTER TABLE public.posh_assessments
  ADD COLUMN IF NOT EXISTS submission_mode TEXT NOT NULL DEFAULT 'self',
  ADD COLUMN IF NOT EXISTS preparer_id UUID REFERENCES public.report_preparers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS prepared_by JSONB;

ALTER TABLE public.auto_dealer_assessments
  ADD COLUMN IF NOT EXISTS submission_mode TEXT NOT NULL DEFAULT 'self',
  ADD COLUMN IF NOT EXISTS preparer_id UUID REFERENCES public.report_preparers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS prepared_by JSONB;

-- Entitlements: so revenue by partner is a single-table query.
ALTER TABLE public.assessment_entitlements
  ADD COLUMN IF NOT EXISTS submission_mode TEXT NOT NULL DEFAULT 'self',
  ADD COLUMN IF NOT EXISTS preparer_id UUID REFERENCES public.report_preparers(id) ON DELETE SET NULL;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['assessments', 'posh_assessments', 'auto_dealer_assessments', 'assessment_entitlements'] LOOP
    EXECUTE format(
      'ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I',
      t, t || '_submission_mode_check'
    );
    EXECUTE format(
      'ALTER TABLE public.%I ADD CONSTRAINT %I CHECK (submission_mode IN (''self'', ''partner_on_behalf'', ''client_via_partner_link''))',
      t, t || '_submission_mode_check'
    );
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS %I ON public.%I (preparer_id) WHERE preparer_id IS NOT NULL',
      'idx_' || t || '_preparer_id', t
    );
  END LOOP;
END $$;

-- Logo bucket: public read (the report and summary render the logo), writes
-- only via the service role in POST /api/partner/logo. 300 KB, PNG/JPEG only.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('report-logos', 'report-logos', true, 307200, ARRAY['image/png', 'image/jpeg'])
ON CONFLICT (id) DO NOTHING;
