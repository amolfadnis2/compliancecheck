-- Allow state_wise_compliance and food_business rows in public.assessments.
--
-- Production's assessments_assessment_type_check still lists only
--   statutory_health, labour_code, dpdp, document, ctc_calculator, gratuity_calculator
-- (verified 2026-10-27), even though 20260524000000 was meant to add these two.
-- Every State-Wise and Food Business submit has therefore failed its insert and
-- fallen back to a local_ id — no row has ever been saved for either type.
-- With both now paid, a local_ id shows the "couldn't save" page instead of a
-- report, so the constraint must allow them. Idempotent: safe to re-run.

ALTER TABLE public.assessments
  DROP CONSTRAINT IF EXISTS assessments_assessment_type_check;

ALTER TABLE public.assessments
  ADD CONSTRAINT assessments_assessment_type_check
  CHECK (assessment_type::text IN (
    'statutory_health',
    'labour_code',
    'dpdp',
    'document',
    'ctc_calculator',
    'gratuity_calculator',
    'state_wise_compliance',
    'food_business'
  ));
