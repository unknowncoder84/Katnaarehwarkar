-- =====================================================
-- FIX ALL DATA PERSISTENCE ISSUES
-- =====================================================
-- Run this SQL in Supabase SQL Editor to fix all persistence issues
-- This adds missing columns and tables for:
-- 1. Case Assignment
-- 2. Attendance
-- 3. Case Files
-- 4. Tasks
-- 5. Expenses
-- =====================================================

-- =====================================================
-- 1. FIX CASE ASSIGNMENT
-- =====================================================
ALTER TABLE cases ADD COLUMN IF NOT EXISTS assigned_to UUID;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS assigned_to_name VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_to ON cases(assigned_to);

-- =====================================================
-- 2. FIX ATTENDANCE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    user_name VARCHAR(255),
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent')),
    marked_by UUID,
    marked_by_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Enable RLS for attendance
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "attendance_select" ON attendance;
DROP POLICY IF EXISTS "attendance_insert" ON attendance;
DROP POLICY IF EXISTS "attendance_update" ON attendance;
DROP POLICY IF EXISTS "attendance_delete" ON attendance;

-- Create permissive policies
CREATE POLICY "attendance_select" ON attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "attendance_insert" ON attendance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "attendance_update" ON attendance FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "attendance_delete" ON attendance FOR DELETE TO authenticated USING (true);

-- Grant permissions
GRANT ALL ON attendance TO authenticated;
GRANT ALL ON attendance TO anon;

CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

-- =====================================================
-- 3. FIX CASE FILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS case_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_url TEXT,
    external_url TEXT,
    file_name VARCHAR(255),
    file_type VARCHAR(100),
    file_size BIGINT,
    attached_by VARCHAR(255),
    attached_by_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for case_files
ALTER TABLE case_files ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "case_files_select" ON case_files;
DROP POLICY IF EXISTS "case_files_insert" ON case_files;
DROP POLICY IF EXISTS "case_files_update" ON case_files;
DROP POLICY IF EXISTS "case_files_delete" ON case_files;

-- Create permissive policies
CREATE POLICY "case_files_select" ON case_files FOR SELECT TO authenticated USING (true);
CREATE POLICY "case_files_insert" ON case_files FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "case_files_update" ON case_files FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "case_files_delete" ON case_files FOR DELETE TO authenticated USING (true);

-- Also allow anon access
CREATE POLICY "case_files_anon_select" ON case_files FOR SELECT TO anon USING (true);
CREATE POLICY "case_files_anon_insert" ON case_files FOR INSERT TO anon WITH CHECK (true);

-- Grant permissions
GRANT ALL ON case_files TO authenticated;
GRANT ALL ON case_files TO anon;

CREATE INDEX IF NOT EXISTS idx_case_files_case_id ON case_files(case_id);

-- =====================================================
-- 4. FIX TASKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(20) DEFAULT 'custom',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to UUID,
    assigned_to_name VARCHAR(255),
    assigned_by UUID,
    assigned_by_name VARCHAR(255),
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    case_name VARCHAR(255),
    deadline DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "tasks_select" ON tasks;
DROP POLICY IF EXISTS "tasks_insert" ON tasks;
DROP POLICY IF EXISTS "tasks_update" ON tasks;
DROP POLICY IF EXISTS "tasks_delete" ON tasks;

-- Create permissive policies
CREATE POLICY "tasks_select" ON tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "tasks_insert" ON tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "tasks_update" ON tasks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tasks_delete" ON tasks FOR DELETE TO authenticated USING (true);

-- Grant permissions
GRANT ALL ON tasks TO authenticated;
GRANT ALL ON tasks TO anon;

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);

-- =====================================================
-- 5. FIX EXPENSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT,
    added_by UUID,
    added_by_name VARCHAR(255),
    month VARCHAR(7), -- Format: YYYY-MM
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "expenses_select" ON expenses;
DROP POLICY IF EXISTS "expenses_insert" ON expenses;
DROP POLICY IF EXISTS "expenses_update" ON expenses;
DROP POLICY IF EXISTS "expenses_delete" ON expenses;

-- Create permissive policies
CREATE POLICY "expenses_select" ON expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "expenses_insert" ON expenses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "expenses_update" ON expenses FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "expenses_delete" ON expenses FOR DELETE TO authenticated USING (true);

-- Grant permissions
GRANT ALL ON expenses TO authenticated;
GRANT ALL ON expenses TO anon;

CREATE INDEX IF NOT EXISTS idx_expenses_month ON expenses(month);

-- =====================================================
-- 6. FIX LIBRARY LOCATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS library_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE library_locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "library_locations_all" ON library_locations;
CREATE POLICY "library_locations_all" ON library_locations FOR ALL USING (true);
GRANT ALL ON library_locations TO authenticated;
GRANT ALL ON library_locations TO anon;

-- =====================================================
-- 7. FIX STORAGE LOCATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS storage_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE storage_locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "storage_locations_all" ON storage_locations;
CREATE POLICY "storage_locations_all" ON storage_locations FOR ALL USING (true);
GRANT ALL ON storage_locations TO authenticated;
GRANT ALL ON storage_locations TO anon;

-- =====================================================
-- 8. FIX DISTRICTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS districts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "districts_all" ON districts;
CREATE POLICY "districts_all" ON districts FOR ALL USING (true);
GRANT ALL ON districts TO authenticated;
GRANT ALL ON districts TO anon;

-- Insert default districts if table is empty
INSERT INTO districts (name) 
SELECT name FROM (VALUES 
    ('Mumbai'),
    ('Pune'),
    ('Nagpur'),
    ('Nashik'),
    ('Aurangabad'),
    ('Thane'),
    ('Kolhapur'),
    ('Solapur'),
    ('Sangli'),
    ('Satara'),
    ('Ahmednagar'),
    ('Ratnagiri'),
    ('Sindhudurg'),
    ('Raigad'),
    ('Palghar')
) AS default_districts(name)
WHERE NOT EXISTS (SELECT 1 FROM districts LIMIT 1);

-- =====================================================
-- 9. FIX BOOKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    number VARCHAR(100),
    location VARCHAR(255),
    added_by VARCHAR(255),
    added_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "books_all" ON books;
CREATE POLICY "books_all" ON books FOR ALL USING (true);
GRANT ALL ON books TO authenticated;
GRANT ALL ON books TO anon;

-- =====================================================
-- 10. FIX SOFA ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sofa_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    compartment VARCHAR(10) CHECK (compartment IN ('C1', 'C2')),
    added_by VARCHAR(255),
    added_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sofa_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sofa_items_all" ON sofa_items;
CREATE POLICY "sofa_items_all" ON sofa_items FOR ALL USING (true);
GRANT ALL ON sofa_items TO authenticated;
GRANT ALL ON sofa_items TO anon;

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 'All tables created/updated successfully!' as status;

-- Show all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
