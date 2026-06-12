-- Migration: Remove world-readable SELECT policy on posh_assessments
-- SEC-01: The original policy allowed any anon user to read all rows.
-- Results are now served via the admin client after email verification only.

DROP POLICY IF EXISTS "Anyone can read posh assessments by id" ON public.posh_assessments;

-- No anon SELECT policy — reads go through service-role API routes only.
-- Insert policy is unchanged (anonymous inserts still allowed).
