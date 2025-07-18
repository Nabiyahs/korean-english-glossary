-- Create glossary_terms table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.glossary_terms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    en text NOT NULL,
    kr text NOT NULL,
    description text,
    discipline text NOT NULL,
    abbreviation text NOT NULL,
    status text DEFAULT 'pending' NOT NULL, -- 'pending' or 'approved'
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid REFERENCES auth.users(id) -- Link to Supabase auth users
);

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id),
    email text UNIQUE NOT NULL,
    role text DEFAULT 'user' NOT NULL -- 'user' or 'admin'
);

-- Function to get user role (DEFINED FIRST)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM public.user_profiles WHERE id = user_id;
  RETURN user_role;
END;
$$;

-- Enable Row Level Security (RLS) for glossary_terms
ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;

-- Policies for glossary_terms
-- Allow read access for all users
DROP POLICY IF EXISTS "Allow read access for all users" ON public.glossary_terms;
CREATE POLICY "Allow read access for all users" ON public.glossary_terms FOR SELECT USING (true);

-- Allow users to insert pending terms (authenticated or anonymous)
DROP POLICY IF EXISTS "Allow users to insert pending terms" ON public.glossary_terms;
CREATE POLICY "Allow users to insert pending terms" ON public.glossary_terms FOR INSERT WITH CHECK ((auth.role() = 'authenticated' OR auth.role() = 'anon') AND status = 'pending');

-- Allow admins to update all terms
DROP POLICY IF EXISTS "Allow admins to update all terms" ON public.glossary_terms;
CREATE POLICY "Allow admins to update all terms" ON public.glossary_terms FOR UPDATE USING (get_user_role(auth.uid()) = 'admin');

-- Allow admins to delete all terms
DROP POLICY IF EXISTS "Allow admins to delete all terms" ON public.glossary_terms;
CREATE POLICY "Allow admins to delete all terms" ON public.glossary_terms FOR DELETE USING (get_user_role(auth.uid()) = 'admin');

-- Enable Row Level Security (RLS) for user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
-- Allow authenticated users to read their own profile
DROP POLICY IF EXISTS "Allow authenticated users to read their own profile" ON public.user_profiles;
CREATE POLICY "Allow authenticated users to read their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);

-- Allow new users to create their own profile
DROP POLICY IF EXISTS "Allow new users to create their own profile" ON public.user_profiles;
CREATE POLICY "Allow new users to create their own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow admins to update any profile
DROP POLICY IF EXISTS "Allow admins to update any profile" ON public.user_profiles;
CREATE POLICY "Allow admins to update any profile" ON public.user_profiles FOR UPDATE USING (get_user_role(auth.uid()) = 'admin');

-- Set up trigger for new user creation to create a profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user'); -- Default role is 'user'
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists before creating a new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Make created_by nullable (this is an ALTER, so it runs even if table exists)
ALTER TABLE public.glossary_terms ALTER COLUMN created_by DROP NOT NULL;

-- Optional: Set an initial admin user (replace with a real user ID from auth.users)
-- INSERT INTO public.user_profiles (id, email, role) VALUES ('YOUR_AUTH_USER_ID', 'admin@example.com', 'admin') ON CONFLICT (id) DO NOTHING;
