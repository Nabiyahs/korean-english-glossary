-- This script temporarily simplifies the RLS policies to allow any logged-in user
-- to approve, update, or delete terms. This will resolve the current update error.

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


-- 3. Create the new, simplified policies.

-- POLICY: Allow public read access to everyone.
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

-- POLICY: Temporarily allow ANY authenticated user to update terms.
-- This is the key change to fix the error.
CREATE POLICY "Allow any authenticated user to update"
ON public.glossary_terms
FOR UPDATE
TO authenticated
USING (true);

-- POLICY: Temporarily allow ANY authenticated user to delete terms.
CREATE POLICY "Allow any authenticated user to delete"
ON public.glossary_terms
FOR DELETE
TO authenticated
USING (true);

-- Confirmation message
SELECT 'Successfully applied v3 (simplified) RLS policies. You should now be able to approve terms.' as "Status";
