-- =====================================================
-- 🚨 FIX EVERYTHING - BOOKS + STORAGE 🚨
-- =====================================================
-- Run this ENTIRE file in Supabase SQL Editor

-- =====================================================
-- PART 1: FIX BOOKS LOCATION
-- =====================================================

-- Fix ALL location issues in books table
UPDATE books
SET location = CASE
  WHEN location IS NULL THEN 'L1'
  WHEN TRIM(location) = '' THEN 'L1'
  WHEN LOWER(TRIM(location)) = 'l1' THEN 'L1'
  WHEN LOWER(TRIM(location)) = 'l2' THEN 'L2'
  ELSE UPPER(TRIM(location))
END;

-- Set default for future books
ALTER TABLE books 
ALTER COLUMN location SET DEFAULT 'L1';

-- Verify books fix
SELECT 'BOOKS FIXED:' as status;
SELECT location, COUNT(*) as count FROM books GROUP BY location ORDER BY location;

-- =====================================================
-- PART 2: FIX STORAGE_ITEMS TABLE
-- =====================================================

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

-- Add location column if it doesn't exist (for display purposes)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'storage_items' AND column_name = 'location') THEN
    ALTER TABLE storage_items ADD COLUMN location TEXT DEFAULT '';
  END IF;
END $$;

-- Verify storage_items columns
SELECT 'STORAGE_ITEMS COLUMNS:' as status;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'storage_items'
ORDER BY ordinal_position;

-- =====================================================
-- SUCCESS!
-- =====================================================
SELECT '✅ ALL FIXES APPLIED! Refresh your browser now.' as result;
