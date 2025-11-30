-- Run this in Supabase SQL Editor to verify tables exist
-- URL: https://supabase.com/dashboard/project/jnzxzqfstfttjnimruje/sql

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if anonymous user exists (required for free assessments)
SELECT id, email, full_name FROM public.users WHERE id = '00000000-0000-0000-0000-000000000000';

-- Count records in each table
SELECT 'users' as table_name, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'assessments', COUNT(*) FROM public.assessments
UNION ALL
SELECT 'feedback', COUNT(*) FROM public.feedback
UNION ALL
SELECT 'companies', COUNT(*) FROM public.companies
UNION ALL
SELECT 'payments', COUNT(*) FROM public.payments;
