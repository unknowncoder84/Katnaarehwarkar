-- =====================================================
-- FIX STORAGE_ITEMS TABLE - ADD MISSING COLUMNS
-- =====================================================
-- Run this in Supabase SQL Editor to fix the dropbox_link error

-- Add dropbox_path column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'storage_items' AND column_name = 'dropbox_path') THEN
    ALTER TABLE storage_items ADD COLUMN dropbox_path TEXT DEFAULT '';
  END IF;
END $$;

-- Add dropbox_link column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'storage_items' AND column_name = 'dropbox_link') THEN
    ALTER TABLE storage_items ADD COLUMN dropbox_link TEXT DEFAULT '';
  END IF;
END $$;

-- Verify the columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'storage_items'
ORDER BY ordinal_position;

-- Success message
SELECT '✅ Storage items table has been updated with dropbox_path and dropbox_link columns!' as status;
