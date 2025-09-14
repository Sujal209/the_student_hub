-- Student Notes Hub Database Schema
-- This file contains all the DDL statements for creating the database structure

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('student', 'admin');
CREATE TYPE note_visibility AS ENUM ('public', 'private', 'college_only');
CREATE TYPE file_type AS ENUM ('pdf', 'docx', 'pptx', 'jpg', 'jpeg', 'png', 'gif');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    college_email TEXT,
    college_domain TEXT,
    user_role user_role DEFAULT 'student',
    bio TEXT,
    year_of_study INTEGER,
    major TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subjects table for organizing notes by academic subjects
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT, -- e.g., "CS101", "MATH201"
    description TEXT,
    college_domain TEXT NOT NULL,
    color TEXT DEFAULT '#3B82F6', -- Hex color for UI
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(code, college_domain)
);

-- Notes table for storing note metadata
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    uploader_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Supabase storage path
    file_size INTEGER NOT NULL, -- in bytes
    file_type file_type NOT NULL,
    mime_type TEXT NOT NULL,
    semester TEXT, -- e.g., "Fall 2023", "Spring 2024"
    year_of_study INTEGER, -- 1, 2, 3, 4 for undergrad
    tags TEXT[], -- Array of tags
    visibility note_visibility DEFAULT 'public',
    college_domain TEXT NOT NULL,
    download_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE, -- Admin verified
    is_flagged BOOLEAN DEFAULT FALSE, -- Flagged for review
    flag_reason TEXT,
    flagged_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    flagged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note downloads tracking table
CREATE TABLE IF NOT EXISTS public.note_downloads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note ratings table (for future enhancement)
CREATE TABLE IF NOT EXISTS public.note_ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(note_id, user_id)
);

-- Comments table (for future enhancement)
CREATE TABLE IF NOT EXISTS public.note_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.note_comments(id) ON DELETE CASCADE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table for content moderation
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE,
    reported_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending', -- pending, reviewed, resolved, dismissed
    reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- College configurations table (for multi-tenant setup)
CREATE TABLE IF NOT EXISTS public.college_configs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    domain TEXT UNIQUE NOT NULL, -- e.g., "stanford.edu"
    name TEXT NOT NULL, -- e.g., "Stanford University"
    logo_url TEXT,
    primary_color TEXT DEFAULT '#3B82F6',
    secondary_color TEXT DEFAULT '#6B7280',
    description TEXT,
    contact_email TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}', -- Store additional settings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_college_domain ON public.users(college_domain);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_notes_uploader_id ON public.notes(uploader_id);
CREATE INDEX IF NOT EXISTS idx_notes_subject_id ON public.notes(subject_id);
CREATE INDEX IF NOT EXISTS idx_notes_college_domain ON public.notes(college_domain);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_visibility ON public.notes(visibility);
CREATE INDEX IF NOT EXISTS idx_notes_tags ON public.notes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_notes_search ON public.notes USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_subjects_college_domain ON public.subjects(college_domain);
CREATE INDEX IF NOT EXISTS idx_note_downloads_note_id ON public.note_downloads(note_id);
CREATE INDEX IF NOT EXISTS idx_note_downloads_user_id ON public.note_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_note_ratings_note_id ON public.note_ratings(note_id);
CREATE INDEX IF NOT EXISTS idx_reports_note_id ON public.reports(note_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_configs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view other users in same college" ON public.users
    FOR SELECT USING (
        college_domain = (SELECT college_domain FROM public.users WHERE id = auth.uid())
    );

-- Notes policies
CREATE POLICY "Users can view public notes in their college" ON public.notes
    FOR SELECT USING (
        visibility = 'public' AND 
        college_domain = (SELECT college_domain FROM public.users WHERE id = auth.uid())
    );

CREATE POLICY "Users can view their own notes" ON public.notes
    FOR SELECT USING (auth.uid() = uploader_id);

CREATE POLICY "Users can insert notes" ON public.notes
    FOR INSERT WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "Users can update their own notes" ON public.notes
    FOR UPDATE USING (auth.uid() = uploader_id);

CREATE POLICY "Users can delete their own notes" ON public.notes
    FOR DELETE USING (auth.uid() = uploader_id);

CREATE POLICY "Admins can manage all notes in their college" ON public.notes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND user_role = 'admin' 
            AND college_domain = notes.college_domain
        )
    );

-- Subjects policies
CREATE POLICY "Users can view subjects in their college" ON public.subjects
    FOR SELECT USING (
        college_domain = (SELECT college_domain FROM public.users WHERE id = auth.uid())
    );

CREATE POLICY "Verified users can create subjects" ON public.subjects
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND is_verified = true 
            AND college_domain = subjects.college_domain
        )
    );

-- Downloads tracking policies
CREATE POLICY "Users can insert download records" ON public.note_downloads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own download history" ON public.note_downloads
    FOR SELECT USING (auth.uid() = user_id);

-- Ratings policies
CREATE POLICY "Users can rate notes in their college" ON public.note_ratings
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.notes n
            JOIN public.users u ON u.id = auth.uid()
            WHERE n.id = note_id AND n.college_domain = u.college_domain
        )
    );

CREATE POLICY "Users can view ratings" ON public.note_ratings
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own ratings" ON public.note_ratings
    FOR UPDATE USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can create reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Admins can view all reports in their college" ON public.reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND user_role = 'admin'
        )
    );

-- College configs policies
CREATE POLICY "Anyone can view active college configs" ON public.college_configs
    FOR SELECT USING (is_active = true);

-- Functions for common operations

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_note_ratings_updated_at BEFORE UPDATE ON public.note_ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_note_comments_updated_at BEFORE UPDATE ON public.note_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_college_configs_updated_at BEFORE UPDATE ON public.college_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.notes 
    SET download_count = download_count + 1 
    WHERE id = NEW.note_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_download_count_trigger 
    AFTER INSERT ON public.note_downloads
    FOR EACH ROW EXECUTE FUNCTION increment_download_count();

-- Function to handle new user creation (called from Supabase Auth trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Storage bucket policies (to be applied in Supabase dashboard or via SQL)
-- These need to be created manually in Supabase or via API

-- Create storage bucket for notes
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-notes', 'student-notes', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the bucket
-- Allow authenticated users to upload files
CREATE POLICY "Users can upload files" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'student-notes');

-- Allow users to view files they uploaded
CREATE POLICY "Users can view their own files" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'student-notes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to download public files in their college
-- This would need additional logic based on the file path structure

-- Views for common queries

-- View for note statistics
CREATE OR REPLACE VIEW note_stats AS
SELECT 
    college_domain,
    COUNT(*) as total_notes,
    COUNT(*) FILTER (WHERE visibility = 'public') as public_notes,
    COUNT(DISTINCT uploader_id) as unique_uploaders,
    SUM(download_count) as total_downloads,
    AVG(file_size) as avg_file_size
FROM public.notes
WHERE NOT is_flagged
GROUP BY college_domain;

-- View for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.full_name,
    u.college_domain,
    COUNT(n.id) as notes_uploaded,
    SUM(n.download_count) as total_downloads_received,
    COUNT(d.id) as notes_downloaded,
    COUNT(r.id) as ratings_given,
    COALESCE(AVG(ur.rating), 0) as avg_rating_received
FROM public.users u
LEFT JOIN public.notes n ON u.id = n.uploader_id AND NOT n.is_flagged
LEFT JOIN public.note_downloads d ON u.id = d.user_id
LEFT JOIN public.note_ratings r ON u.id = r.user_id
LEFT JOIN public.note_ratings ur ON ur.note_id IN (SELECT id FROM public.notes WHERE uploader_id = u.id)
GROUP BY u.id, u.full_name, u.college_domain;