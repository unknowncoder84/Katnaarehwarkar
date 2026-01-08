-- RUN THIS IN SUPABASE SQL EDITOR TO FIX COLUMN ISSUES
-- This adds missing columns to existing tables

-- Fix appointments table - add 'user' column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'user') THEN
    ALTER TABLE public.appointments ADD COLUMN "user" UUID;
  END IF;
END $$;

-- Also ensure user_id exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'user_id') THEN
    ALTER TABLE public.appointments ADD COLUMN user_id UUID;
  END IF;
END $$;

-- Ensure user_name exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'user_name') THEN
    ALTER TABLE public.appointments ADD COLUMN user_name VARCHAR(255);
  END IF;
END $$;

-- Fix cases table - ensure all columns exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'next_date') THEN
    ALTER TABLE public.cases ADD COLUMN next_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'filing_date') THEN
    ALTER TABLE public.cases ADD COLUMN filing_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'created_by') THEN
    ALTER TABLE public.cases ADD COLUMN created_by UUID;
  END IF;
END $$;

-- Disable RLS on all tables to allow operations
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.counsel DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.books DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sofa_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_locations DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Done!
SELECT 'Columns fixed successfully!' as result;
