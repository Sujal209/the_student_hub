-- Initial seed data for Student Notes Hub
-- This file contains sample data for testing and initial setup

-- Sample college configuration
INSERT INTO public.college_configs (domain, name, logo_url, primary_color, secondary_color, description, contact_email)
VALUES 
    ('example.edu', 'Example University', '/images/example-logo.png', '#1E40AF', '#6B7280', 'A premier educational institution', 'admin@example.edu'),
    ('test.edu', 'Test College', '/images/test-logo.png', '#059669', '#6B7280', 'Test College for development', 'admin@test.edu')
ON CONFLICT (domain) DO NOTHING;

-- Sample subjects for different colleges
INSERT INTO public.subjects (name, code, description, college_domain, color, created_at)
VALUES 
    -- Computer Science subjects
    ('Introduction to Computer Science', 'CS101', 'Basic concepts of computer science and programming', 'example.edu', '#3B82F6', NOW()),
    ('Data Structures and Algorithms', 'CS201', 'Fundamental data structures and algorithmic techniques', 'example.edu', '#8B5CF6', NOW()),
    ('Database Systems', 'CS301', 'Design and implementation of database systems', 'example.edu', '#06B6D4', NOW()),
    ('Software Engineering', 'CS401', 'Software development methodologies and practices', 'example.edu', '#10B981', NOW()),
    ('Machine Learning', 'CS501', 'Introduction to machine learning algorithms and applications', 'example.edu', '#F59E0B', NOW()),
    
    -- Mathematics subjects
    ('Calculus I', 'MATH101', 'Differential and integral calculus', 'example.edu', '#EF4444', NOW()),
    ('Linear Algebra', 'MATH201', 'Vector spaces, matrices, and linear transformations', 'example.edu', '#EC4899', NOW()),
    ('Statistics', 'MATH301', 'Probability theory and statistical analysis', 'example.edu', '#84CC16', NOW()),
    ('Discrete Mathematics', 'MATH401', 'Logic, sets, combinatorics, and graph theory', 'example.edu', '#6366F1', NOW()),
    
    -- Physics subjects
    ('General Physics I', 'PHYS101', 'Mechanics, thermodynamics, and waves', 'example.edu', '#F97316', NOW()),
    ('General Physics II', 'PHYS201', 'Electricity, magnetism, and optics', 'example.edu', '#0EA5E9', NOW()),
    ('Quantum Physics', 'PHYS301', 'Introduction to quantum mechanics', 'example.edu', '#8B5CF6', NOW()),
    
    -- Chemistry subjects
    ('General Chemistry I', 'CHEM101', 'Atomic structure, bonding, and stoichiometry', 'example.edu', '#059669', NOW()),
    ('Organic Chemistry', 'CHEM201', 'Structure and reactions of organic compounds', 'example.edu', '#DC2626', NOW()),
    
    -- Biology subjects
    ('General Biology', 'BIO101', 'Cell biology, genetics, and evolution', 'example.edu', '#16A34A', NOW()),
    ('Biochemistry', 'BIO301', 'Chemical processes in living organisms', 'example.edu', '#CA8A04', NOW()),
    
    -- Business subjects
    ('Introduction to Business', 'BUS101', 'Fundamentals of business operations', 'example.edu', '#7C3AED', NOW()),
    ('Marketing Principles', 'BUS201', 'Marketing strategies and consumer behavior', 'example.edu', '#DB2777', NOW()),
    ('Financial Accounting', 'BUS301', 'Financial statement preparation and analysis', 'example.edu', '#0D9488', NOW()),
    
    -- English/Literature subjects
    ('English Composition', 'ENG101', 'Writing skills and composition techniques', 'example.edu', '#B91C1C', NOW()),
    ('World Literature', 'ENG201', 'Survey of global literary works', 'example.edu', '#7C2D12', NOW()),
    
    -- History subjects
    ('World History', 'HIST101', 'Major events and civilizations in world history', 'example.edu', '#A16207', NOW()),
    ('Modern History', 'HIST201', 'History from the industrial revolution to present', 'example.edu', '#92400E', NOW()),
    
    -- Psychology subjects
    ('Introduction to Psychology', 'PSYC101', 'Basic principles of human behavior and mental processes', 'example.edu', '#BE185D', NOW()),
    ('Cognitive Psychology', 'PSYC301', 'Mental processes including perception, memory, and thinking', 'example.edu', '#C026D3', NOW()),
    
    -- Test college subjects
    ('Test Subject 1', 'TEST101', 'Sample subject for testing purposes', 'test.edu', '#3B82F6', NOW()),
    ('Test Subject 2', 'TEST201', 'Another sample subject for testing', 'test.edu', '#10B981', NOW())

ON CONFLICT (code, college_domain) DO NOTHING;

-- Sample tags that can be used with notes
-- These are stored as arrays in the notes table, so this is just for reference

-- Common tags for different categories:
-- Computer Science: ['programming', 'algorithms', 'data-structures', 'web-development', 'database', 'ai', 'machine-learning']
-- Mathematics: ['calculus', 'algebra', 'statistics', 'proofs', 'geometry', 'discrete-math']
-- Physics: ['mechanics', 'thermodynamics', 'electricity', 'magnetism', 'quantum', 'optics']
-- Chemistry: ['organic', 'inorganic', 'physical-chemistry', 'lab-procedures', 'reactions']
-- Biology: ['cell-biology', 'genetics', 'evolution', 'ecology', 'anatomy', 'physiology']
-- Business: ['marketing', 'finance', 'management', 'strategy', 'entrepreneurship']
-- General: ['lecture-notes', 'study-guide', 'exam-prep', 'homework', 'project', 'tutorial']

-- Function to get popular tags (for UI suggestions)
CREATE OR REPLACE FUNCTION get_popular_tags(college_domain_param TEXT DEFAULT NULL, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (tag TEXT, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        unnest(tags) as tag,
        COUNT(*) as count
    FROM public.notes
    WHERE 
        (college_domain_param IS NULL OR college_domain = college_domain_param)
        AND NOT is_flagged
        AND visibility = 'public'
    GROUP BY unnest(tags)
    ORDER BY COUNT(*) DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get subjects by college
CREATE OR REPLACE FUNCTION get_subjects_by_college(college_domain_param TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    code TEXT,
    description TEXT,
    color TEXT,
    note_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s.code,
        s.description,
        s.color,
        COUNT(n.id) as note_count
    FROM public.subjects s
    LEFT JOIN public.notes n ON s.id = n.subject_id AND NOT n.is_flagged
    WHERE 
        s.college_domain = college_domain_param 
        AND s.is_active = true
    GROUP BY s.id, s.name, s.code, s.description, s.color
    ORDER BY s.name;
END;
$$ LANGUAGE plpgsql;

-- Function to search notes with full text search
CREATE OR REPLACE FUNCTION search_notes(
    search_query TEXT,
    college_domain_param TEXT,
    subject_id_param UUID DEFAULT NULL,
    tags_param TEXT[] DEFAULT NULL,
    semester_param TEXT DEFAULT NULL,
    year_param INTEGER DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    file_name TEXT,
    file_type TEXT,
    file_size INTEGER,
    tags TEXT[],
    semester TEXT,
    year_of_study INTEGER,
    download_count INTEGER,
    uploader_name TEXT,
    subject_name TEXT,
    subject_color TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.title,
        n.description,
        n.file_name,
        n.file_type::TEXT,
        n.file_size,
        n.tags,
        n.semester,
        n.year_of_study,
        n.download_count,
        u.full_name as uploader_name,
        s.name as subject_name,
        s.color as subject_color,
        n.created_at,
        CASE 
            WHEN search_query = '' THEN 1.0
            ELSE ts_rank(to_tsvector('english', n.title || ' ' || COALESCE(n.description, '')), plainto_tsquery('english', search_query))
        END as relevance
    FROM public.notes n
    JOIN public.users u ON n.uploader_id = u.id
    LEFT JOIN public.subjects s ON n.subject_id = s.id
    WHERE 
        n.college_domain = college_domain_param
        AND n.visibility = 'public'
        AND NOT n.is_flagged
        AND (subject_id_param IS NULL OR n.subject_id = subject_id_param)
        AND (tags_param IS NULL OR n.tags && tags_param)
        AND (semester_param IS NULL OR n.semester = semester_param)
        AND (year_param IS NULL OR n.year_of_study = year_param)
        AND (
            search_query = '' OR 
            to_tsvector('english', n.title || ' ' || COALESCE(n.description, '')) @@ plainto_tsquery('english', search_query)
        )
    ORDER BY 
        CASE WHEN search_query = '' THEN n.created_at END DESC,
        CASE WHEN search_query <> '' THEN relevance END DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Sample admin user function (for testing - creates admin user)
CREATE OR REPLACE FUNCTION create_sample_admin(
    user_id UUID,
    admin_email TEXT,
    admin_name TEXT,
    college_domain_param TEXT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.users (
        id, 
        email, 
        full_name, 
        college_domain, 
        user_role, 
        is_verified,
        created_at
    )
    VALUES (
        user_id,
        admin_email,
        admin_name,
        college_domain_param,
        'admin',
        true,
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        user_role = 'admin',
        is_verified = true,
        college_domain = college_domain_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;