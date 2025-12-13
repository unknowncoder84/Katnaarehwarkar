-- Fix books table schema - Add number column
-- Run this in Supabase SQL Editor

-- Add number column to books table if it doesn't exist
ALTER TABLE books ADD COLUMN IF NOT EXISTS number TEXT DEFAULT '';

-- Add location column to books table if it doesn't exist (in case it's missing)
ALTER TABLE books ADD COLUMN IF NOT EXISTS location TEXT DEFAULT '';

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'books';
