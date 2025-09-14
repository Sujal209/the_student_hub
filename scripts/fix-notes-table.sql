-- Check and fix notes table structure

-- Check current notes table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'notes' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Create or update notes table with all required columns
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES public.subjects(id),
  uploader_id UUID REFERENCES auth.users(id) NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  mime_type TEXT,
  semester TEXT,
  year_of_study INTEGER DEFAULT 1,
  tags TEXT[],
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'college_only')),
  college_domain TEXT,
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  rating_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'rejected', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
ALTER TABLE public.notes 
ADD COLUMN IF NOT EXISTS college_domain TEXT,
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add check constraints if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'notes_visibility_check'
    ) THEN
        ALTER TABLE public.notes ADD CONSTRAINT notes_visibility_check 
        CHECK (visibility IN ('public', 'private', 'college_only'));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'notes_status_check'
    ) THEN
        ALTER TABLE public.notes ADD CONSTRAINT notes_status_check 
        CHECK (status IN ('active', 'pending', 'rejected', 'deleted'));
    END IF;
END $$;

-- Enable RLS on notes table
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Notes are viewable by everyone" ON public.notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;

-- Create RLS policies for notes table
CREATE POLICY "Notes are viewable by everyone" ON public.notes
  FOR SELECT USING (
    status = 'active' AND 
    (visibility = 'public' OR 
     (visibility = 'college_only' AND college_domain = (
       SELECT college_domain FROM public.users WHERE id = auth.uid()
     )) OR
     uploader_id = auth.uid())
  );

CREATE POLICY "Users can insert their own notes" ON public.notes
  FOR INSERT WITH CHECK (uploader_id = auth.uid());

CREATE POLICY "Users can update their own notes" ON public.notes
  FOR UPDATE USING (uploader_id = auth.uid());

CREATE POLICY "Users can delete their own notes" ON public.notes
  FOR DELETE USING (uploader_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_uploader ON public.notes(uploader_id);
CREATE INDEX IF NOT EXISTS idx_notes_subject ON public.notes(subject_id);
CREATE INDEX IF NOT EXISTS idx_notes_college_domain ON public.notes(college_domain);
CREATE INDEX IF NOT EXISTS idx_notes_visibility ON public.notes(visibility);
CREATE INDEX IF NOT EXISTS idx_notes_status ON public.notes(status);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);

-- Create updated_at trigger
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update download count
CREATE OR REPLACE FUNCTION public.increment_download_count(note_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.notes 
  SET download_count = download_count + 1 
  WHERE id = note_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update view count
CREATE OR REPLACE FUNCTION public.increment_view_count(note_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.notes 
  SET view_count = view_count + 1 
  WHERE id = note_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON public.notes TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_download_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_view_count(UUID) TO authenticated;

-- Verify the table structure
SELECT 'Notes table updated successfully!' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'notes' AND table_schema = 'public'
ORDER BY ordinal_position;