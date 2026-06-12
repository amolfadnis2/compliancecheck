-- Backfill: normalize posh_compliance → posh for assessment_type
UPDATE public.posh_assessments
  SET assessment_type = 'posh'
  WHERE assessment_type = 'posh_compliance';
