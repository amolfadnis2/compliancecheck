-- Migration: Add food_business (and state_wise_compliance) to assessments CHECK constraint
-- Created: 2026-05-24
-- Fixes: food_business inserts were silently failing with constraint violation

-- The assessments table uses TEXT type with a CHECK constraint (not an enum).
-- Migration 006 set the constraint to only allow: statutory_health, labour_code, dpdp,
-- document, ctc_calculator, gratuity_calculator.
-- food_business and state_wise_compliance were never added, so every insert fails.

ALTER TABLE public.assessments
  DROP CONSTRAINT IF EXISTS assessments_assessment_type_check;

ALTER TABLE public.assessments
  ADD CONSTRAINT assessments_assessment_type_check
  CHECK (assessment_type IN (
    'statutory_health',
    'labour_code',
    'dpdp',
    'document',
    'ctc_calculator',
    'gratuity_calculator',
    'state_wise_compliance',
    'food_business'
  ));

-- Verify the change
DO $$
BEGIN
  RAISE NOTICE 'food_business and state_wise_compliance added to assessments CHECK constraint';
END
$$;
