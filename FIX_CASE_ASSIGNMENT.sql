-- =====================================================
-- FIX CASE ASSIGNMENT PERSISTENCE
-- =====================================================
-- Run this in Supabase SQL Editor to add assigned_to column to cases table
-- This allows case assignments to persist after navigation
-- 
-- IMPORTANT: Run this SQL FIRST before using the assignment feature!
-- =====================================================

-- Add assigned_to columns to cases table
ALTER TABLE cases ADD COLUMN IF NOT EXISTS assigned_to UUID;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS assigned_to_name VARCHAR(255);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cases_assigned_to ON cases(assigned_to);

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cases' 
AND column_name IN ('assigned_to', 'assigned_to_name');

-- Success message
SELECT '✅ Case assignment columns added successfully! You can now assign cases to users.' as status;
