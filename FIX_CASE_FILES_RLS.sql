-- FIX CASE FILES RLS POLICY ERROR
-- Run this in Supabase SQL Editor to fix the "row-level security policy" error

-- First, check if table exists and create if not
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_case_files_case_id ON case_files(case_id);

-- IMPORTANT: Drop ALL existing policies first
DROP POLICY IF EXISTS "Allow authenticated users to view case files" ON case_files;
DROP POLICY IF EXISTS "Allow authenticated users to insert case files" ON case_files;
DROP POLICY IF EXISTS "Allow authenticated users to delete case files" ON case_files;
DROP POLICY IF EXISTS "Allow authenticated users to update case files" ON case_files;
DROP POLICY IF EXISTS "Enable read access for all users" ON case_files;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON case_files;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON case_files;
DROP POLICY IF EXISTS "case_files_select_policy" ON case_files;
DROP POLICY IF EXISTS "case_files_insert_policy" ON case_files;
DROP POLICY IF EXISTS "case_files_delete_policy" ON case_files;

-- Disable RLS temporarily to ensure clean state
ALTER TABLE case_files DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE case_files ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for ALL operations
-- SELECT policy
CREATE POLICY "case_files_select_policy"
  ON case_files
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT policy  
CREATE POLICY "case_files_insert_policy"
  ON case_files
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE policy (was missing!)
CREATE POLICY "case_files_update_policy"
  ON case_files
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE policy
CREATE POLICY "case_files_delete_policy"
  ON case_files
  FOR DELETE
  TO authenticated
  USING (true);

-- Also allow public/anon access if needed (for service role operations)
CREATE POLICY "case_files_anon_select"
  ON case_files
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "case_files_anon_insert"
  ON case_files
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Grant permissions to authenticated and anon roles
GRANT ALL ON case_files TO authenticated;
GRANT ALL ON case_files TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'case_files';
