-- RLS tests for the PF calculator migration (20261022000000_pf_calculator.sql).
-- Runs in a transaction that is rolled back; raises an exception on failure.
-- Run with the service role / postgres (e.g. Supabase SQL editor or MCP execute_sql).

BEGIN;

-- Fixtures (as the table owner). Two throwaway auth users.
INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-4000-8000-0000000000a1', 'rls-a@example.test'),
  ('00000000-0000-4000-8000-0000000000b2', 'rls-b@example.test');
INSERT INTO public.pf_calc_sessions (anon_id, salary_band) VALUES ('rls_test', '25k-50k');
INSERT INTO public.leads (email, source, consent_text_version, consent_at) VALUES ('rls@example.test', 'pf_calculator', 'test', NOW());
INSERT INTO public.pf_calc_saved (user_id, name, inputs) VALUES
  ('00000000-0000-4000-8000-0000000000a1', 'A plan', '{}'),
  ('00000000-0000-4000-8000-0000000000b2', 'B plan', '{}');
INSERT INTO public.pf_calc_shares (slug, inputs) VALUES ('rlsTestSlug1', '{"basic":1}');

-- ---- anon -----------------------------------------------------------------
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '{"role":"anon"}', true);

DO $$
BEGIN
  IF (SELECT count(*) FROM public.pf_calc_sessions) <> 0 THEN RAISE EXCEPTION 'anon can read pf_calc_sessions'; END IF;
  IF (SELECT count(*) FROM public.leads) <> 0 THEN RAISE EXCEPTION 'anon can read leads'; END IF;
  IF (SELECT count(*) FROM public.pf_calc_saved) <> 0 THEN RAISE EXCEPTION 'anon can read pf_calc_saved'; END IF;
  IF (SELECT count(*) FROM public.pf_calc_shares) <> 0 THEN RAISE EXCEPTION 'anon can list pf_calc_shares'; END IF;
  IF public.get_pf_share('rlsTestSlug1') IS NULL THEN RAISE EXCEPTION 'anon cannot read a share by slug'; END IF;
  IF (SELECT count(*) FROM public.statutory_params) = 0 THEN RAISE EXCEPTION 'anon cannot read statutory_params'; END IF;
  IF (SELECT count(*) FROM public.epf_interest_rates) = 0 THEN RAISE EXCEPTION 'anon cannot read epf_interest_rates'; END IF;

  BEGIN
    INSERT INTO public.pf_calc_sessions (anon_id) VALUES ('x');
    RAISE EXCEPTION 'anon can insert pf_calc_sessions';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO public.leads (email, source, consent_text_version, consent_at) VALUES ('x@example.test', 'pf_calculator', 'v', NOW());
    RAISE EXCEPTION 'anon can insert leads';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO public.pf_calc_shares (slug, inputs) VALUES ('anonSlug123', '{}');
    RAISE EXCEPTION 'anon can insert pf_calc_shares';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    UPDATE public.statutory_params SET notes = 'x';
    IF FOUND THEN RAISE EXCEPTION 'anon can update statutory_params'; END IF;
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;

-- ---- authenticated user A -------------------------------------------------
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"role":"authenticated","sub":"00000000-0000-4000-8000-0000000000a1"}', true);

DO $$
BEGIN
  IF (SELECT count(*) FROM public.pf_calc_saved) <> 1 THEN RAISE EXCEPTION 'user A should see exactly 1 saved row'; END IF;
  IF (SELECT name FROM public.pf_calc_saved) <> 'A plan' THEN RAISE EXCEPTION 'user A sees another user''s save'; END IF;
  IF (SELECT count(*) FROM public.pf_calc_sessions) <> 0 THEN RAISE EXCEPTION 'authenticated can read pf_calc_sessions'; END IF;
  IF (SELECT count(*) FROM public.leads) <> 0 THEN RAISE EXCEPTION 'authenticated can read leads'; END IF;

  BEGIN
    INSERT INTO public.pf_calc_saved (user_id, name, inputs) VALUES ('00000000-0000-4000-8000-0000000000b2', 'spoof', '{}');
    RAISE EXCEPTION 'user A can insert a save for user B';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;

  INSERT INTO public.pf_calc_saved (name, inputs) VALUES ('A second', '{}');  -- user_id defaults to auth.uid()
  DELETE FROM public.pf_calc_saved WHERE name = 'B plan';
END $$;

RESET ROLE;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.pf_calc_saved WHERE name = 'B plan') THEN RAISE EXCEPTION 'user A deleted user B''s save'; END IF;
  IF (SELECT count(*) FROM public.pf_calc_saved WHERE user_id = '00000000-0000-4000-8000-0000000000a1') <> 2 THEN RAISE EXCEPTION 'user A own insert failed'; END IF;
END $$;

SELECT 'pf_calculator RLS: all checks passed' AS result;
ROLLBACK;
