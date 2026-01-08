-- Run this SQL in your Supabase SQL Editor to add the case_files table
-- This allows file attachments to persist and be visible to all users

-- Create case_files table
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

-- Create index for faster lookups by case_id
CREATE INDEX IF NOT EXISTS idx_case_files_case_id ON case_files(case_id);

-- Enable RLS
ALTER TABLE case_files ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid errors on re-run)
DROP POLICY IF EXISTS "Allow authenticated users to view case files" ON case_files;
DROP POLICY IF EXISTS "Allow authenticated users to insert case files" ON case_files;
DROP POLICY IF EXISTS "Allow authenticated users to delete case files" ON case_files;

-- Allow all authenticated users to view case files
CREATE POLICY "Allow authenticated users to view case files"
  ON case_files FOR SELECT
  TO authenticated
  USING (true);

-- Allow all authenticated users to insert case files
CREATE POLICY "Allow authenticated users to insert case files"
  ON case_files FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow all authenticated users to delete case files
CREATE POLICY "Allow authenticated users to delete case files"
  ON case_files FOR DELETE
  TO authenticated
  USING (true);

-- Enable realtime for case_files (may fail if already added, that's OK)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE case_files;
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Table already in publication, ignore
END $$;

-- Success message
SELECT 'case_files table created successfully!' as status;
