-- Fix employee_count in companies table: ENUM → TEXT
-- The UI sends values like '10-19', '50-99', '100-299' which don't match
-- the old ENUM values ('1-10', '11-50', '51-100', '101-500', '500+').
-- Using TEXT avoids schema drift as the UI's range options evolve.

ALTER TABLE public.companies
  ALTER COLUMN employee_count TYPE TEXT;
