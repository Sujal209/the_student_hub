-- Fix foreign key relationships for notes table

-- First, let's check current foreign keys
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'notes';

-- Drop existing foreign key constraints if they exist
ALTER TABLE public.notes DROP CONSTRAINT IF EXISTS notes_uploader_id_fkey;
ALTER TABLE public.notes DROP CONSTRAINT IF EXISTS notes_subject_id_fkey;

-- Create proper foreign key constraints
ALTER TABLE public.notes 
ADD CONSTRAINT notes_uploader_id_fkey 
FOREIGN KEY (uploader_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.notes 
ADD CONSTRAINT notes_subject_id_fkey 
FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE SET NULL;

-- Verify the foreign keys were created
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'notes';