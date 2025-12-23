-- =====================================================
-- 🚨 RUN THIS NOW TO FIX LIBRARY BOOKS FILTERING 🚨
-- =====================================================
-- Copy this ENTIRE file and paste into Supabase SQL Editor
-- Then click RUN

-- Step 1: See the problem
SELECT '=== BEFORE FIX ===' as step;
SELECT 
  location,
  COUNT(*) as count
FROM books
GROUP BY location
ORDER BY location;

-- Step 2: Fix ALL location issues
UPDATE books
SET location = CASE
  WHEN location IS NULL THEN 'L1'
  WHEN TRIM(location) = '' THEN 'L1'
  WHEN LOWER(TRIM(location)) = 'l1' THEN 'L1'
  WHEN LOWER(TRIM(location)) = 'l2' THEN 'L2'
  ELSE UPPER(TRIM(location))
END;

-- Step 3: Verify the fix
SELECT '=== AFTER FIX ===' as step;
SELECT 
  location,
  COUNT(*) as count
FROM books
GROUP BY location
ORDER BY location;

-- Step 4: Show sample books
SELECT '=== SAMPLE BOOKS ===' as step;
SELECT 
  name,
  location,
  added_at
FROM books
ORDER BY location, added_at DESC
LIMIT 10;

-- Step 5: Set default for future books
ALTER TABLE books 
ALTER COLUMN location SET DEFAULT 'L1';

-- Done!
SELECT '✅ SUCCESS! Books are now fixed. Refresh your browser and try the L1/L2 filters!' as result;
