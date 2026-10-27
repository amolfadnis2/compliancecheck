-- Lock down assessment_entitlements — the table that IS the paywall.
--
-- The original migration (20260609000001) allowed anonymous INSERT with
-- CHECK (true) and anonymous SELECT with USING (true). With the public anon key
-- (shipped to every browser) anyone could:
--   * INSERT a row with status='paid' for any assessment id → unlock any paid
--     report without paying;
--   * SELECT every row → enumerate buyer emails and Razorpay ids.
--
-- Every read and write of this table happens in API routes / server code via
-- the service-role client, which bypasses RLS, so no policy is needed for the
-- app to work. CLAUDE.md §8 (anonymous INSERT policy) does not apply: this
-- table never receives browser writes.

DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.assessment_entitlements;
DROP POLICY IF EXISTS "Allow select by assessment_id" ON public.assessment_entitlements;

ALTER TABLE public.assessment_entitlements ENABLE ROW LEVEL SECURITY;
