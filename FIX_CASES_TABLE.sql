-- =====================================================
-- FIX CASES TABLE - ADD MISSING COLUMNS
-- =====================================================
-- Run this in Supabase SQL Editor to fix the cases table
-- =====================================================

-- Add circulation_status column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'circulation_status'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN circulation_status VARCHAR(20) DEFAULT 'non-circulated';
    END IF;
END $$;

-- Add interim_relief column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'interim_relief'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN interim_relief VARCHAR(20) DEFAULT 'none';
    END IF;
END $$;

-- Add stage column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'stage'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN stage VARCHAR(50) DEFAULT 'consultation';
    END IF;
END $$;

-- Add fees_quoted column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'fees_quoted'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN fees_quoted DECIMAL(12, 2) DEFAULT 0;
    END IF;
END $$;

-- Add stamp_no column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'stamp_no'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN stamp_no VARCHAR(100);
    END IF;
END $$;

-- Add reg_no column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'reg_no'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN reg_no VARCHAR(100);
    END IF;
END $$;

-- Add district column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'district'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN district VARCHAR(100);
    END IF;
END $$;

-- Add on_behalf_of column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'on_behalf_of'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN on_behalf_of VARCHAR(255);
    END IF;
END $$;

-- Add no_resp column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'no_resp'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN no_resp VARCHAR(100);
    END IF;
END $$;

-- Add opponent_lawyer column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'opponent_lawyer'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN opponent_lawyer VARCHAR(255);
    END IF;
END $$;

-- Add additional_details column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'additional_details'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN additional_details TEXT;
    END IF;
END $$;

-- Add client_email column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'client_email'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN client_email VARCHAR(255);
    END IF;
END $$;

-- Add client_mobile column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'client_mobile'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN client_mobile VARCHAR(20);
    END IF;
END $$;

-- Add client_alternate_no column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'client_alternate_no'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN client_alternate_no VARCHAR(20);
    END IF;
END $$;

-- Add filing_date column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'filing_date'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN filing_date DATE;
    END IF;
END $$;

-- Add next_date column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'next_date'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN next_date DATE;
    END IF;
END $$;

-- Add parties_name column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'parties_name'
    ) THEN
        ALTER TABLE public.cases ADD COLUMN parties_name TEXT;
    END IF;
END $$;

-- Drop the created_by foreign key constraint if it exists (causes issues)
ALTER TABLE public.cases 
DROP CONSTRAINT IF EXISTS cases_created_by_fkey;

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'cases'
ORDER BY ordinal_position;

-- =====================================================
-- DONE! Cases table should now have all required columns
-- =====================================================
