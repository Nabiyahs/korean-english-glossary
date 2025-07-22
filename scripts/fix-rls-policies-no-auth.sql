-- This script removes authentication requirements entirely.
-- Anyone can read, and anyone accessing /admin can update/delete terms.

-- 1. Enable Row Level Security on the table (if not already enabled)
ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies on the table to ensure a clean slate.
DROP POLICY IF EXISTS "Allow read access for all users" ON public.glossary_terms;
DROP POLICY IF EXISTS "Allow authenticated users to read all terms" ON public.glossary_terms;
DROP POLICY IF EXISTS "Allow public read access" ON public.glossary_terms;
DROP POLICY IF EXISTS "Allow users to insert pending terms" ON public.glossary_terms;
DROP POLICY IF EXISTS "Allow admins to update all terms" ON public.glossary_terms;
DROP POLICY IF EXISTS "Allow admins to delete all terms" ON public.glossary_terms;
DROP POLICY IF EXISTS "Allow any authenticated user to update" ON public.glossary_terms;
DROP POLICY IF EXISTS "Allow any authenticated user to delete" ON public.glossary_terms;

-- 3. Create completely open policies for a public glossary with admin URL access.

-- POLICY: Allow everyone (including anonymous users) to read all terms.
CREATE POLICY "Allow everyone to read"
ON public.glossary_terms
FOR SELECT
USING (true);

-- POLICY: Allow everyone (including anonymous users) to insert new terms as pending.
CREATE POLICY "Allow everyone to insert"
ON public.glossary_terms
FOR INSERT
WITH CHECK (status = 'pending');

-- POLICY: Allow everyone (including anonymous users) to update any term.
-- This enables the /admin functionality without authentication.
CREATE POLICY "Allow everyone to update"
ON public.glossary_terms
FOR UPDATE
USING (true);

-- POLICY: Allow everyone (including anonymous users) to delete any term.
-- This enables the /admin functionality without authentication.
CREATE POLICY "Allow everyone to delete"
ON public.glossary_terms
FOR DELETE
USING (true);

-- Confirmation message
SELECT 'Successfully applied no-auth RLS policies. /admin should now work without login.' as "Status";
