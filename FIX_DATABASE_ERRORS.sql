-- =====================================================
-- FIX DATABASE ERRORS - Run this in Supabase SQL Editor
-- =====================================================
-- This fixes:
-- 1. Appointments table missing 'user_id' and 'user_name' columns
-- 2. Cases table date column issues (drops dependent view first)
-- =====================================================

-- STEP 1: Drop dependent views that block column changes
-- =====================================================
DROP VIEW IF EXISTS cases_with_document_counts CASCADE;

-- STEP 2: Fix Appointments Table
-- =====================================================

-- Drop the appointments table if it exists and recreate with correct columns
DROP TABLE IF EXISTS appointments CASCADE;

CREATE TABLE appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    user_name TEXT,
    client TEXT,
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for appointments
CREATE POLICY "Allow all users to view appointments" ON appointments
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create appointments" ON appointments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to update appointments" ON appointments
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to delete appointments" ON appointments
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- STEP 3: Fix Cases Table - Change date columns to TEXT
-- =====================================================

-- Alter date columns to TEXT type (now that view is dropped)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cases') THEN
        -- Change next_date to TEXT
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'next_date' AND data_type != 'text') THEN
            ALTER TABLE cases ALTER COLUMN next_date TYPE TEXT USING next_date::TEXT;
            RAISE NOTICE 'Changed next_date to TEXT';
        END IF;
        
        -- Change prev_date to TEXT
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'prev_date' AND data_type != 'text') THEN
            ALTER TABLE cases ALTER COLUMN prev_date TYPE TEXT USING prev_date::TEXT;
            RAISE NOTICE 'Changed prev_date to TEXT';
        END IF;
        
        -- Change filing_date to TEXT
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'filing_date' AND data_type != 'text') THEN
            ALTER TABLE cases ALTER COLUMN filing_date TYPE TEXT USING filing_date::TEXT;
            RAISE NOTICE 'Changed filing_date to TEXT';
        END IF;
    END IF;
END $$;

-- STEP 4: Recreate the view with TEXT columns
-- =====================================================
CREATE OR REPLACE VIEW cases_with_document_counts AS
SELECT 
    c.*,
    COALESCE(d.doc_count, 0) as document_count
FROM cases c
LEFT JOIN (
    SELECT case_id, COUNT(*) as doc_count 
    FROM case_documents 
    GROUP BY case_id
) d ON c.id = d.case_id;

-- STEP 5: Ensure all required tables exist
-- =====================================================

-- Courts table
CREATE TABLE IF NOT EXISTS courts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all to view courts" ON courts;
DROP POLICY IF EXISTS "Allow authenticated to manage courts" ON courts;
CREATE POLICY "Allow all to view courts" ON courts FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to manage courts" ON courts FOR ALL USING (auth.uid() IS NOT NULL);

-- Case Types table
CREATE TABLE IF NOT EXISTS case_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE case_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all to view case_types" ON case_types;
DROP POLICY IF EXISTS "Allow authenticated to manage case_types" ON case_types;
CREATE POLICY "Allow all to view case_types" ON case_types FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to manage case_types" ON case_types FOR ALL USING (auth.uid() IS NOT NULL);

-- Counsel table
CREATE TABLE IF NOT EXISTS counsel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    specialization TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE counsel ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all to view counsel" ON counsel;
DROP POLICY IF EXISTS "Allow authenticated to manage counsel" ON counsel;
CREATE POLICY "Allow all to view counsel" ON counsel FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to manage counsel" ON counsel FOR ALL USING (auth.uid() IS NOT NULL);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    payment_mode TEXT,
    date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all to view transactions" ON transactions;
DROP POLICY IF EXISTS "Allow authenticated to manage transactions" ON transactions;
CREATE POLICY "Allow all to view transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to manage transactions" ON transactions FOR ALL USING (auth.uid() IS NOT NULL);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES auth.users(id),
    assigned_to_name TEXT,
    deadline TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all to view tasks" ON tasks;
DROP POLICY IF EXISTS "Allow authenticated to manage tasks" ON tasks;
CREATE POLICY "Allow all to view tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to manage tasks" ON tasks FOR ALL USING (auth.uid() IS NOT NULL);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    category TEXT,
    month TEXT,
    date TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all to view expenses" ON expenses;
DROP POLICY IF EXISTS "Allow authenticated to manage expenses" ON expenses;
CREATE POLICY "Allow all to view expenses" ON expenses FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to manage expenses" ON expenses FOR ALL USING (auth.uid() IS NOT NULL);

-- Books table
CREATE TABLE IF NOT EXISTS books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    added_by UUID REFERENCES auth.users(id),
    added_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all to view books" ON books;
DROP POLICY IF EXISTS "Allow authenticated to manage books" ON books;
CREATE POLICY "Allow all to view books" ON books FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to manage books" ON books FOR ALL USING (auth.uid() IS NOT NULL);

-- Sofa Items table
CREATE TABLE IF NOT EXISTS sofa_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    compartment TEXT NOT NULL CHECK (compartment IN ('C1', 'C2')),
    added_by UUID REFERENCES auth.users(id),
    added_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sofa_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all to view sofa_items" ON sofa_items;
DROP POLICY IF EXISTS "Allow authenticated to manage sofa_items" ON sofa_items;
CREATE POLICY "Allow all to view sofa_items" ON sofa_items FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to manage sofa_items" ON sofa_items FOR ALL USING (auth.uid() IS NOT NULL);

-- Library Locations table
CREATE TABLE IF NOT EXISTS library_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE library_locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all to view library_locations" ON library_locations;
DROP POLICY IF EXISTS "Allow authenticated to manage library_locations" ON library_locations;
CREATE POLICY "Allow all to view library_locations" ON library_locations FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to manage library_locations" ON library_locations FOR ALL USING (auth.uid() IS NOT NULL);

-- Storage Locations table
CREATE TABLE IF NOT EXISTS storage_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE storage_locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all to view storage_locations" ON storage_locations;
DROP POLICY IF EXISTS "Allow authenticated to manage storage_locations" ON storage_locations;
CREATE POLICY "Allow all to view storage_locations" ON storage_locations FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to manage storage_locations" ON storage_locations FOR ALL USING (auth.uid() IS NOT NULL);

-- Case Documents table (needed for the view)
CREATE TABLE IF NOT EXISTS case_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_path TEXT,
    file_type TEXT,
    file_size INTEGER,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all to view case_documents" ON case_documents;
DROP POLICY IF EXISTS "Allow authenticated to manage case_documents" ON case_documents;
CREATE POLICY "Allow all to view case_documents" ON case_documents FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to manage case_documents" ON case_documents FOR ALL USING (auth.uid() IS NOT NULL);

-- STEP 6: Insert default data
-- =====================================================

-- Insert default courts if empty
INSERT INTO courts (name) VALUES 
    ('High Court'),
    ('District Court'),
    ('Commercial Court'),
    ('Supreme Court'),
    ('Family Court'),
    ('Sessions Court'),
    ('Magistrate Court')
ON CONFLICT (name) DO NOTHING;

-- Insert default case types if empty
INSERT INTO case_types (name) VALUES 
    ('Civil'),
    ('Criminal'),
    ('Commercial'),
    ('Family'),
    ('Labour'),
    ('Tax'),
    ('Constitutional'),
    ('Writ')
ON CONFLICT (name) DO NOTHING;

-- STEP 7: Enable Realtime (ignore errors if already enabled)
-- =====================================================
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE cases;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE counsel;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE expenses;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- DONE! Your database should now work correctly.
-- Refresh your app and try creating cases/appointments again.
-- =====================================================
