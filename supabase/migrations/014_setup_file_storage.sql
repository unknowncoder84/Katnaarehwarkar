-- Create storage bucket for case files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'case-files',
  'case-files',
  true,
  52428800, -- 50MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload case files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'case-files');

-- Policy: Allow authenticated users to read all files
CREATE POLICY "Authenticated users can read case files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'case-files');

-- Policy: Allow authenticated users to delete their own files or admins to delete any
CREATE POLICY "Users can delete their own case files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'case-files' AND
  (
    auth.uid()::text = owner OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
);

-- Policy: Allow public access to files (since bucket is public)
CREATE POLICY "Public can read case files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'case-files');

-- Update case_files table to store storage path
ALTER TABLE case_files
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS mime_type TEXT;

-- Add comment
COMMENT ON COLUMN case_files.storage_path IS 'Path to file in Supabase Storage';
COMMENT ON COLUMN case_files.file_url IS 'Public URL for direct file access';
COMMENT ON COLUMN case_files.external_url IS 'External URL (Dropbox/Drive) if provided';
