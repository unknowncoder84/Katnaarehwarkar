-- =====================================================
-- SIMPLE STORAGE FIX - ALLOW ALL OPERATIONS
-- Run this if the other script doesn't work
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow authenticated uploads to case-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads from case-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from case-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to case-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from case-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to read files" ON storage.objects;

-- Create ONE simple policy that allows everything for authenticated users
CREATE POLICY "Allow all operations for authenticated users"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'case-files')
WITH CHECK (bucket_id = 'case-files');

-- Create ONE simple policy for public read access
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'case-files');

-- Verify
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%case-files%'
OR policyname LIKE '%authenticated%'
OR policyname LIKE '%public%';
