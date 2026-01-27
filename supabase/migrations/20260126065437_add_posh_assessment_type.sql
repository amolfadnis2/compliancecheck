-- Migration: Add POSH assessment type to enum
-- Created: 2026-01-26
-- Purpose: Enable POSH Act 2013 Compliance Assessment in ComplianceCheck

-- Add POSH to assessment_type enum
-- Note: IF NOT EXISTS syntax requires PostgreSQL 11+
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'posh' 
    AND enumtypid = (
      SELECT oid FROM pg_type WHERE typname = 'assessment_type'
    )
  ) THEN
    ALTER TYPE assessment_type ADD VALUE 'posh';
  END IF;
END
$$;

-- Verify the enum value was added
COMMENT ON TYPE assessment_type IS 'Assessment types: statutory_health, labour_code, dpdp, state_wise_compliance, food_business, posh';

-- No changes needed to assessments table schema - it uses TEXT type, not enum
-- RLS policies are already in place for authenticated and anonymous users

-- Verify indexes exist on assessment_type column for query performance
-- This is a check - the index should already exist from initial schema
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'assessments' 
    AND indexname = 'idx_assessments_type'
  ) THEN
    CREATE INDEX idx_assessments_type ON assessments(assessment_type);
  END IF;
END
$$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'POSH assessment type migration completed successfully';
END
$$;
