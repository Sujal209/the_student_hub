-- Final database configuration for Student Notes Hub

-- Ensure RLS is properly configured for all tables
-- 1. Users table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
CREATE POLICY "Enable read access for all users" ON public.users
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
CREATE POLICY "Enable insert for authenticated users only" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Enable update for users based on id" ON public.users;
CREATE POLICY "Enable update for users based on id" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 2. Notes table policies (more permissive for demo)
DROP POLICY IF EXISTS "Notes are viewable by everyone" ON public.notes;
CREATE POLICY "Notes are viewable by everyone" ON public.notes
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Users can insert their own notes" ON public.notes;
CREATE POLICY "Users can insert their own notes" ON public.notes
  FOR INSERT WITH CHECK (auth.uid() = uploader_id);

DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes;
CREATE POLICY "Users can update their own notes" ON public.notes
  FOR UPDATE USING (auth.uid() = uploader_id);

DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;
CREATE POLICY "Users can delete their own notes" ON public.notes
  FOR DELETE USING (auth.uid() = uploader_id);

-- 3. Subjects table (public read access)
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Subjects are viewable by everyone" ON public.subjects;
CREATE POLICY "Subjects are viewable by everyone" ON public.subjects
  FOR SELECT USING (true);

-- 4. College configs (public read access)
ALTER TABLE public.college_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "College configs are viewable by everyone" ON public.college_configs;
CREATE POLICY "College configs are viewable by everyone" ON public.college_configs
  FOR SELECT USING (true);

-- Ensure proper grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Create a simple function to check if everything is working
CREATE OR REPLACE FUNCTION public.health_check()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'users_count', (SELECT COUNT(*) FROM public.users),
    'notes_count', (SELECT COUNT(*) FROM public.notes),
    'subjects_count', (SELECT COUNT(*) FROM public.subjects),
    'college_configs_count', (SELECT COUNT(*) FROM public.college_configs),
    'status', 'healthy',
    'timestamp', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.health_check() TO anon, authenticated;

-- Test the health check
SELECT public.health_check();