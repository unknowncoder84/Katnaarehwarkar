-- =====================================================
-- FIX STORAGE BUCKET RLS POLICIES
-- Run this in Supabase SQL Editor
-- =====================================================

-- First, drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to read files" ON storage.objects;

-- Create new policies with correct permissions
-- Policy 1: Allow authenticated users to INSERT (upload)
CREATE POLICY "Allow authenticated uploads to case-files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'case-files');

-- Policy 2: Allow authenticated users to SELECT (read/download)
CREATE POLICY "Allow authenticated reads from case-files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'case-files');

-- Policy 3: Allow public to SELECT (read/download) - for public access
CREATE POLICY "Allow public reads from case-files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'case-files');

-- Policy 4: Allow authenticated users to UPDATE
CREATE POLICY "Allow authenticated updates to case-files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'case-files')
WITH CHECK (bucket_id = 'case-files');

-- Policy 5: Allow authenticated users to DELETE
CREATE POLICY "Allow authenticated deletes from case-files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'case-files');

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%case-files%';
