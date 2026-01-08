-- =====================================================
-- CHECK BOOKS LOCATION - DIAGNOSTIC QUERY
-- =====================================================
-- Run this FIRST to see what's wrong with your data
-- Copy and paste into Supabase SQL Editor

-- Show the problem: Count books by location (including NULL)
SELECT 
  CASE 
    WHEN location IS NULL THEN '❌ NULL'
    WHEN location = '' THEN '❌ EMPTY STRING'
    WHEN TRIM(location) = '' THEN '❌ WHITESPACE ONLY'
    ELSE location
  END as location_value,
  COUNT(*) as book_count
FROM books
GROUP BY location
ORDER BY location;

-- Show first 10 books with their exact location values
SELECT 
  name,
  location,
  CASE 
    WHEN location IS NULL THEN '❌ Problem: NULL'
    WHEN location = '' THEN '❌ Problem: Empty'
    WHEN location != UPPER(location) THEN '⚠️ Problem: Not uppercase'
    WHEN location != TRIM(location) THEN '⚠️ Problem: Has whitespace'
    ELSE '✅ OK'
  END as status,
  added_at
FROM books
ORDER BY added_at DESC
LIMIT 10;

-- Summary
SELECT 
  COUNT(*) as total_books,
  COUNT(CASE WHEN location IS NULL OR location = '' THEN 1 END) as books_with_null_or_empty,
  COUNT(CASE WHEN location = 'L1' THEN 1 END) as books_in_L1_uppercase,
  COUNT(CASE WHEN LOWER(location) = 'l1' AND location != 'L1' THEN 1 END) as books_in_l1_lowercase,
  COUNT(CASE WHEN location = 'L2' THEN 1 END) as books_in_L2_uppercase,
  COUNT(CASE WHEN LOWER(location) = 'l2' AND location != 'L2' THEN 1 END) as books_in_l2_lowercase
FROM books;
