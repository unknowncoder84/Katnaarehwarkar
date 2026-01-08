-- Case Files Table for storing file attachments per case
-- This allows files to persist and be visible to all users

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

-- Enable realtime for case_files
ALTER PUBLICATION supabase_realtime ADD TABLE case_files;
