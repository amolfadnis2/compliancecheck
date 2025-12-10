-- Add calculator types to assessment_type and product_type
-- Migration: 006_add_calculator_types.sql

-- First, check if we're using ENUM or CHECK constraint
-- If ENUM exists, add new values to it
-- If CHECK constraint exists, modify it

-- For assessments table (assessment_type)
DO $$ 
BEGIN
    -- Try to add values to enum if it exists
    BEGIN
        ALTER TYPE assessment_type ADD VALUE IF NOT EXISTS 'ctc_calculator';
        ALTER TYPE assessment_type ADD VALUE IF NOT EXISTS 'gratuity_calculator';
    EXCEPTION
        WHEN undefined_object THEN
            -- If enum doesn't exist, it's a CHECK constraint
            -- Drop and recreate the constraint
            ALTER TABLE public.assessments DROP CONSTRAINT IF EXISTS assessments_assessment_type_check;
            ALTER TABLE public.assessments ADD CONSTRAINT assessments_assessment_type_check 
            CHECK (assessment_type IN (
                'statutory_health', 
                'labour_code', 
                'dpdp', 
                'document',
                'ctc_calculator',
                'gratuity_calculator'
            ));
    END;
END $$;

-- For payments table (product_type)
DO $$ 
BEGIN
    -- Try to add values to enum if it exists
    BEGIN
        ALTER TYPE product_type ADD VALUE IF NOT EXISTS 'ctc_calculator';
        ALTER TYPE product_type ADD VALUE IF NOT EXISTS 'gratuity_calculator';
    EXCEPTION
        WHEN undefined_object THEN
            -- If enum doesn't exist, it's a CHECK constraint
            -- Drop and recreate the constraint
            ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_product_type_check;
            ALTER TABLE public.payments ADD CONSTRAINT payments_product_type_check 
            CHECK (product_type IN (
                'statutory_health', 
                'labour_code', 
                'dpdp', 
                'document',
                'ctc_calculator',
                'gratuity_calculator'
            ));
    END;
END $$;

-- Add index for faster queries on assessment_type (if not exists)
CREATE INDEX IF NOT EXISTS idx_assessments_type 
ON public.assessments(assessment_type);

-- Add index for faster queries on user_id + assessment_type (if not exists)
CREATE INDEX IF NOT EXISTS idx_assessments_user_type 
ON public.assessments(user_id, assessment_type) 
WHERE user_id IS NOT NULL;

-- Add comments to document the calculator types
COMMENT ON COLUMN public.assessments.assessment_type IS 
'Type of assessment or tool: statutory_health, labour_code, dpdp, document, ctc_calculator, gratuity_calculator';

COMMENT ON COLUMN public.payments.product_type IS 
'Type of product purchased: statutory_health, labour_code, dpdp, document, ctc_calculator, gratuity_calculator';
