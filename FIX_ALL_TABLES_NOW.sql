-- =====================================================
-- 🚨 COMPLETE DATABASE FIX - RUN THIS NOW 🚨
-- =====================================================
-- This fixes ALL missing columns in your database
-- Copy and paste this ENTIRE file into Supabase SQL Editor

-- =====================================================
-- PART 1: FIX STORAGE_ITEMS TABLE
-- =====================================================

-- Check if storage_items table exists, if not create it
CREATE TABLE IF NOT EXISTS storage_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  number TEXT DEFAULT '',
  location TEXT DEFAULT '',
  location_id UUID,
  type TEXT DEFAULT 'File',
  added_at TIMESTAMPTZ DEFAULT NOW(),
  added_by TEXT DEFAULT '',
  dropbox_path TEXT DEFAULT '',
  dropbox_link TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns one by one (safe - won't error if exists)
DO $$ BEGIN
  ALTER TABLE storage_items ADD COLUMN IF NOT EXISTS number TEXT DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE storage_items ADD COLUMN IF NOT EXISTS location TEXT DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE storage_items ADD COLUMN IF NOT EXISTS location_id UUID;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE storage_items ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'File';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE storage_items ADD COLUMN IF NOT EXISTS added_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE storage_items ADD COLUMN IF NOT EXISTS added_by TEXT DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE storage_items ADD COLUMN IF NOT EXISTS dropbox_path TEXT DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE storage_items ADD COLUMN IF NOT EXISTS dropbox_link TEXT DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE storage_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow all access to storage_items" ON storage_items;

-- Create permissive policy
CREATE POLICY "Allow all access to storage_items" ON storage_items
  FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- PART 2: FIX BOOKS TABLE
-- =====================================================

-- Fix ALL location issues in books table
UPDATE books
SET location = CASE
  WHEN location IS NULL THEN 'L1'
  WHEN TRIM(location) = '' THEN 'L1'
  WHEN LOWER(TRIM(location)) = 'l1' THEN 'L1'
  WHEN LOWER(TRIM(location)) = 'l2' THEN 'L2'
  ELSE UPPER(TRIM(location))
END
WHERE location IS NULL OR location != UPPER(TRIM(COALESCE(location, 'L1')));

-- Set default for future books
ALTER TABLE books ALTER COLUMN location SET DEFAULT 'L1';

-- =====================================================
-- PART 3: VERIFY EVERYTHING
-- =====================================================

-- Show storage_items columns
SELECT 'STORAGE_ITEMS COLUMNS:' as info;
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'storage_items'
ORDER BY ordinal_position;

-- Show books by location
SELECT 'BOOKS BY LOCATION:' as info;
SELECT location, COUNT(*) as count FROM books GROUP BY location ORDER BY location;

-- Success!
SELECT '✅ ALL FIXES APPLIED! Refresh your browser (F5) now!' as result;
