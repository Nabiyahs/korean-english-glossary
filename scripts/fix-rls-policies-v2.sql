-- This script corrects the Row Level Security (RLS) policies to ensure data is visible.
-- It replaces the previous restrictive policies with a safer default for public read access.

-- 1. Enable Row Level Security on the table (if not already enabled)
ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies on the table to ensure a clean slate.
DROP POLICY IF EXISTS "Allow read access for all users" ON public.glossary_terms;
DROP POLICY IF EXISTS "Allow authenticated users to read all terms" ON public.glossary_terms;
DROP POLICY IF EXISTS "Allow public read access" ON public.glossary_terms;
DROP POLICY IF EXISTS "Allow users to insert pending terms" ON public.glossary_terms;
DROP POLICY IF EXISTS "Allow admins to update all terms" ON public.glossary_terms;
DROP POLICY IF EXISTS "Allow admins to delete all terms" ON public.glossary_terms;

-- 3. Create the new, correct policies.

-- POLICY: Allow public read access to everyone.
-- This is the most important change. It makes all terms visible to any visitor,
-- which is the correct behavior for a public glossary.
CREATE POLICY "Allow public read access"
ON public.glossary_terms
FOR SELECT
USING (true);

-- POLICY: Allow authenticated (logged-in) users to insert new terms.
CREATE POLICY "Allow users to insert pending terms"
ON public.glossary_terms
FOR INSERT
TO authenticated
WITH CHECK (status = 'pending');

-- POLICY: Allow users with the 'admin' role to update any term.
-- This requires the user to be logged in and have an 'admin' role in the user_profiles table.
CREATE POLICY "Allow admins to update all terms"
ON public.glossary_terms
FOR UPDATE
TO authenticated
USING (get_user_role(auth.uid()) = 'admin')
WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- POLICY: Allow users with the 'admin' role to delete any term.
-- This also requires the user to be an admin.
CREATE POLICY "Allow admins to delete all terms"
ON public.glossary_terms
FOR DELETE
TO authenticated
USING (get_user_role(auth.uid()) = 'admin');

-- Confirmation message
SELECT 'Successfully applied v2 RLS policies. Data should now be visible.' as "Status";
