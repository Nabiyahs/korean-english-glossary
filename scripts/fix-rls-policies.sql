-- This script corrects the Row Level Security (RLS) policies for the glossary_terms table.
-- It ensures that all authenticated users can read terms, and admins have full update/delete rights.

-- 1. Enable Row Level Security on the table (if not already enabled)
ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies on the table to ensure a clean slate.
--    This is safe to run even if the policies don't exist.
DROP POLICY IF EXISTS "Allow read access for all users" ON public.glossary_terms;
DROP POLICY IF EXISTS "Allow authenticated users to read all terms" ON public.glossary_terms;
DROP POLICY IF EXISTS "Allow users to insert pending terms" ON public.glossary_terms;
DROP POLICY IF EXISTS "Allow admins to update all terms" ON public.glossary_terms;
DROP POLICY IF EXISTS "Allow admins to delete all terms" ON public.glossary_terms;

-- 3. Create the new, correct policies.

-- POLICY: Allow authenticated users to read all terms.
-- This is the key fix: it allows any logged-in user (including admins) to see all terms.
CREATE POLICY "Allow authenticated users to read all terms"
ON public.glossary_terms
FOR SELECT
TO authenticated
USING (true);

-- POLICY: Allow authenticated users to insert new terms (as 'pending').
-- This allows any logged-in user to suggest a new term.
CREATE POLICY "Allow users to insert pending terms"
ON public.glossary_terms
FOR INSERT
TO authenticated
WITH CHECK (status = 'pending');

-- POLICY: Allow users with the 'admin' role to update any term.
-- This uses the get_user_role() function to check the user's role from the user_profiles table.
CREATE POLICY "Allow admins to update all terms"
ON public.glossary_terms
FOR UPDATE
TO authenticated
USING (get_user_role(auth.uid()) = 'admin')
WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- POLICY: Allow users with the 'admin' role to delete any term.
-- This also uses the get_user_role() function.
CREATE POLICY "Allow admins to delete all terms"
ON public.glossary_terms
FOR DELETE
TO authenticated
USING (get_user_role(auth.uid()) = 'admin');

-- Confirmation message
SELECT 'Successfully reset and applied RLS policies for glossary_terms.' as "Status";
