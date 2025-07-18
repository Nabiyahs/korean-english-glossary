-- This script sets up the database tables and functions
-- Run this in your Supabase SQL editor

-- Create glossary_terms table
CREATE TABLE IF NOT EXISTS public.glossary_terms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    en text NOT NULL,
    kr text NOT NULL,
    description text DEFAULT '',
    discipline text NOT NULL,
    abbreviation text NOT NULL,
    status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved')),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    role text DEFAULT 'user' NOT NULL CHECK (role IN ('user', 'admin'))
);

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM public.user_profiles WHERE id = user_id;
  RETURN COALESCE(user_role, 'user');
END;
$$;

-- Enable RLS
ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow read access for all users" ON public.glossary_terms;
DROP POLICY IF EXISTS "Allow users to insert pending terms" ON public.glossary_terms;
DROP POLICY IF EXISTS "Allow admins to update all terms" ON public.glossary_terms;
DROP POLICY IF EXISTS "Allow admins to delete all terms" ON public.glossary_terms;
DROP POLICY IF EXISTS "Allow authenticated users to read their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow new users to create their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow admins to update any profile" ON public.user_profiles;

-- Create policies for glossary_terms
CREATE POLICY "Allow read access for all users" ON public.glossary_terms 
FOR SELECT USING (true);

CREATE POLICY "Allow users to insert pending terms" ON public.glossary_terms 
FOR INSERT WITH CHECK (status = 'pending');

CREATE POLICY "Allow admins to update all terms" ON public.glossary_terms 
FOR UPDATE USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Allow admins to delete all terms" ON public.glossary_terms 
FOR DELETE USING (get_user_role(auth.uid()) = 'admin');

-- Create policies for user_profiles
CREATE POLICY "Allow authenticated users to read their own profile" ON public.user_profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow new users to create their own profile" ON public.user_profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow admins to update any profile" ON public.user_profiles 
FOR UPDATE USING (get_user_role(auth.uid()) = 'admin');

-- Create trigger function for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample data
INSERT INTO public.glossary_terms (en, kr, description, discipline, abbreviation, status) VALUES
('Project Kick-off', '프로젝트 착수', '프로젝트 시작 회의', '프로젝트 일반 용어', 'Gen', 'approved'),
('Scope of Work', '업무 범위', '업무 범위 정의', '프로젝트 일반 용어', 'Gen', 'approved'),
('Floor Plan', '평면도', '건물 층별 배치 도면', 'Architecture', 'Arch', 'approved'),
('Circuit Breaker', '회로 차단기', '회로 보호 장치', 'Electrical', 'Elec', 'approved'),
('Pipeline', '배관', '유체/가스 운반 파이프', 'Piping', 'Piping', 'approved')
ON CONFLICT DO NOTHING;
