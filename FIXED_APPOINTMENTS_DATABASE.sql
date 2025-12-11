-- =====================================================
-- FIX APPOINTMENTS TABLE - COMPLETE FIX
-- =====================================================
-- This fixes the foreign key constraint error
-- Run this ENTIRE script in Supabase SQL Editor
-- =====================================================

-- Step 1: Drop ALL foreign key constraints on appointments
ALTER TABLE public.appointments 
DROP CONSTRAINT IF EXISTS appointments_user_id_fkey;

ALTER TABLE public.appointments 
DROP CONSTRAINT IF EXISTS appointments_user_id_fkey1;

ALTER TABLE public.appointments 
DROP CONSTRAINT IF EXISTS fk_appointments_user;

-- Step 2: Make user_id column nullable (no foreign key)
ALTER TABLE public.appointments 
ALTER COLUMN user_id DROP NOT NULL;

-- Step 3: Ensure user_name column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments' AND column_name = 'user_name'
    ) THEN
        ALTER TABLE public.appointments ADD COLUMN user_name VARCHAR(255);
    END IF;
END $$;

-- Step 4: Ensure all required columns exist
DO $$
BEGIN
    -- Add status column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.appointments ADD COLUMN status VARCHAR(20) DEFAULT 'scheduled';
    END IF;
    
    -- Add case_id column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments' AND column_name = 'case_id'
    ) THEN
        ALTER TABLE public.appointments ADD COLUMN case_id UUID;
    END IF;
END $$;

-- Step 5: Recreate the appointments table if it's completely broken
-- (Only run this if the above doesn't work)
/*
DROP TABLE IF EXISTS public.appointments CASCADE;

CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    time VARCHAR(10),
    user_id UUID,  -- No foreign key constraint
    user_name VARCHAR(255),
    client VARCHAR(255),
    details TEXT,
    status VARCHAR(20) DEFAULT 'scheduled',
    case_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointments_all" ON public.appointments FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
*/

-- Step 6: Verify the fix
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'appointments' 
    AND tc.constraint_type = 'FOREIGN KEY';

-- If the above returns no rows, the foreign key is removed!

-- Step 7: Show current table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'appointments'
ORDER BY ordinal_position;

-- =====================================================
-- DONE! Now try creating an appointment again.
-- =====================================================
