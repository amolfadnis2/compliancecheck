-- =============================================================================
-- PHASE 1: IDENTITY FOUNDATION
-- Single migration — idempotent (safe to run multiple times)
-- =============================================================================

-- ----------------------------------------------------------------------------
-- profiles table — product data tied to auth.users
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  email_verified_at TIMESTAMPTZ,
  full_name TEXT,
  phone TEXT,
  company_name TEXT,

  -- Denormalized targeting fields
  state TEXT,
  employee_count_range TEXT,   -- '1-9'|'10-19'|'20-49'|'50-99'|'100-249'|'250-499'|'500+'
  industry TEXT,               -- 'it'|'manufacturing'|'food'|'retail'|'healthcare'|'edtech'|'financial'|'other'

  -- Attribution
  first_source TEXT NOT NULL DEFAULT 'unknown',
  sources_used TEXT[] NOT NULL DEFAULT '{}',
  lifecycle_stage TEXT NOT NULL DEFAULT 'anonymous', -- 'anonymous'|'verified'|'engaged'|'assessment_taker'|'paying'

  -- DPDP-compliant consent (two distinct timestamps, both nullable)
  marketing_consent_at TIMESTAMPTZ,         -- "Send me product updates"
  deadline_reminders_consent_at TIMESTAMPTZ, -- "Send me deadline reminders" (functional)

  -- Soft-delete for DPDP right-to-erasure (hard delete via cron after 30 days)
  deletion_requested_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_lifecycle    ON public.profiles(lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_profiles_email        ON public.profiles(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_first_source ON public.profiles(first_source);
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen    ON public.profiles(last_seen_at DESC);

-- ----------------------------------------------------------------------------
-- events table — append-only product behavior log
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,   -- 'calculator_started'|'calculator_completed'|'email_verified'|...
  properties JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_user_created  ON public.events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_name_created  ON public.events(event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_properties    ON public.events USING GIN (properties);

-- ----------------------------------------------------------------------------
-- Trigger: auto-create profile on auth.users insert
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, email_verified_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.email_confirmed_at
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Trigger: sync email + email_verified_at when user verifies OTP
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_user_email_verified()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.profiles
    SET
      email             = NEW.email,
      email_verified_at = NEW.email_confirmed_at,
      lifecycle_stage   = CASE
                            WHEN lifecycle_stage = 'anonymous' THEN 'verified'
                            ELSE lifecycle_stage
                          END,
      updated_at        = NOW()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_verified ON auth.users;
CREATE TRIGGER on_auth_user_email_verified
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_email_verified();

-- ----------------------------------------------------------------------------
-- Trigger: maintain updated_at on profiles
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events   ENABLE ROW LEVEL SECURITY;

-- profiles: user reads/updates only their own row
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'users_read_own_profile'
  ) THEN
    CREATE POLICY "users_read_own_profile"
      ON public.profiles FOR SELECT
      USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'users_update_own_profile'
  ) THEN
    CREATE POLICY "users_update_own_profile"
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- profiles: no INSERT policy — only the SECURITY DEFINER trigger may insert

-- events: user reads only their own events
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'users_read_own_events'
  ) THEN
    CREATE POLICY "users_read_own_events"
      ON public.events FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- events: user inserts only events tagged with their own user_id
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'users_insert_own_events'
  ) THEN
    CREATE POLICY "users_insert_own_events"
      ON public.events FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- events are append-only: no UPDATE or DELETE policies
