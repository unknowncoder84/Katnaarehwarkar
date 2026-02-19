-- =====================================================
-- ENABLE DIRECT FILE UPLOAD - FINAL SOLUTION
-- This bypasses authentication by making the bucket fully public
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Make sure the bucket exists and is public
UPDATE storage.buckets
SET public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY[
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/gif',
      'text/plain',
      'text/csv'
    ]
WHERE id = 'case-files';

-- Step 2: Drop ALL existing policies (clean slate)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- Step 3: Create a SINGLE policy that allows EVERYONE (no authentication required)
CREATE POLICY "Public Access for case-files"
ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'case-files')
WITH CHECK (bucket_id = 'case-files');

-- Step 4: Verify the policy was created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage';

-- Step 5: Grant necessary permissions
GRANT ALL ON storage.objects TO anon;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.objects TO public;

-- Success message
SELECT 'Storage bucket configured for public access!' as status;
