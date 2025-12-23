-- ============================================
-- SIMPLE FILE STORAGE SETUP
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Update case_files table to store storage path
ALTER TABLE case_files
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS mime_type TEXT;

-- Add comments
COMMENT ON COLUMN case_files.storage_path IS 'Path to file in Supabase Storage';
COMMENT ON COLUMN case_files.file_url IS 'Public URL for direct file access';
COMMENT ON COLUMN case_files.external_url IS 'External URL (Dropbox/Drive) if provided';

-- That's it! The storage bucket and policies will be created via Dashboard UI
