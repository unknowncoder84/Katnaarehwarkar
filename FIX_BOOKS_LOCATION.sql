-- =====================================================
-- FIX BOOKS LOCATION FIELD - COMPREHENSIVE FIX
-- =====================================================
-- This script fixes ALL location issues in the books table
-- Run this in Supabase SQL Editor

-- Step 1: Check CURRENT state (before fix)
SELECT 
  COALESCE(location, 'NULL') as location,
  COUNT(*) as count
FROM books
GROUP BY location
ORDER BY location;

-- Step 2: Fix NULL or empty locations - set them to 'L1' (default)
UPDATE books
SET location = 'L1'
WHERE location IS NULL 
   OR location = '' 
   OR TRIM(location) = '';

-- Step 3: Normalize all locations to UPPERCASE (L1, L2, etc.)
UPDATE books
SET location = UPPER(TRIM(location))
WHERE location IS NOT NULL;

-- Step 4: Fix any lowercase variations (l1 -> L1, l2 -> L2)
UPDATE books
SET location = 'L1'
WHERE LOWER(TRIM(location)) = 'l1';

UPDATE books
SET location = 'L2'
WHERE LOWER(TRIM(location)) = 'l2';

-- Step 5: Verify the fix - check counts by location
SELECT 
  location,
  COUNT(*) as count
FROM books
GROUP BY location
ORDER BY location;

-- Step 6: Show all books with their locations
SELECT 
  id,
  name,
  location,
  added_at
FROM books
ORDER BY location, added_at DESC;

-- Step 7: Add constraints to prevent future issues (optional but recommended)
-- This ensures location is never NULL and defaults to 'L1'
ALTER TABLE books 
ALTER COLUMN location SET DEFAULT 'L1';

-- Make location NOT NULL (only if you want to enforce this)
-- ALTER TABLE books 
-- ALTER COLUMN location SET NOT NULL;

-- Success message
SELECT '✅ Books location field has been fixed! All books now have proper L1 or L2 locations.' as status;
