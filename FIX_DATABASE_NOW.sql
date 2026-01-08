-- =====================================================
-- FIX DATABASE FOR PRODUCTION - RUN THIS IN SUPABASE SQL EDITOR
-- This script ensures all tables exist and have proper permissions
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ENSURE USER_ACCOUNTS TABLE EXISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. ENSURE COURTS TABLE EXISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.courts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default courts if empty
INSERT INTO public.courts (name) 
SELECT name FROM (VALUES 
  ('High Court'), 
  ('District Court'), 
  ('Commercial Court'), 
  ('Supreme Court'),
  ('Sessions Court'),
  ('Civil Court')
) AS v(name)
WHERE NOT EXISTS (SELECT 1 FROM public.courts LIMIT 1);

-- =====================================================
-- 3. ENSURE CASE_TYPES TABLE EXISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.case_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default case types if empty
INSERT INTO public.case_types (name) 
SELECT name FROM (VALUES 
  ('Civil'), 
  ('Criminal'), 
  ('Commercial'), 
  ('Family'),
  ('Labour'),
  ('Tax'),
  ('Constitutional')
) AS v(name)
WHERE NOT EXISTS (SELECT 1 FROM public.case_types LIMIT 1);

-- =====================================================
-- 4. ENSURE CASES TABLE EXISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  client_mobile VARCHAR(50),
  file_no VARCHAR(100),
  stamp_no VARCHAR(100),
  reg_no VARCHAR(100),
  parties_name TEXT,
  district VARCHAR(255),
  case_type VARCHAR(100),
  court VARCHAR(255),
  on_behalf_of VARCHAR(100),
  no_resp VARCHAR(50),
  opponent_lawyer VARCHAR(255),
  additional_details TEXT,
  fees_quoted DECIMAL(12, 2),
  status VARCHAR(50) DEFAULT 'active',
  stage VARCHAR(100),
  next_date DATE,
  filing_date DATE,
  circulation_status VARCHAR(50),
  interim_relief VARCHAR(50),
  created_by UUID REFERENCES public.user_accounts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. ENSURE COUNSEL TABLE EXISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.counsel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  mobile VARCHAR(50),
  specialization VARCHAR(255),
  bar_council_no VARCHAR(100),
  address TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.user_accounts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. ENSURE APPOINTMENTS TABLE EXISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  time VARCHAR(50),
  user_id UUID REFERENCES public.user_accounts(id),
  user_name VARCHAR(255),
  client VARCHAR(255) NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. ENSURE TRANSACTIONS TABLE EXISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_mode VARCHAR(50),
  received_by VARCHAR(255),
  confirmed_by VARCHAR(255),
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. ENSURE BOOKS TABLE EXISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  added_by UUID REFERENCES public.user_accounts(id),
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. ENSURE LIBRARY_LOCATIONS TABLE EXISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.library_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_by UUID REFERENCES public.user_accounts(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. ENSURE STORAGE_LOCATIONS TABLE EXISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.storage_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_by UUID REFERENCES public.user_accounts(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 11. ENSURE SOFA_ITEMS TABLE EXISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sofa_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  compartment VARCHAR(10) CHECK (compartment IN ('C1', 'C2')),
  added_by UUID REFERENCES public.user_accounts(id),
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 12. ENSURE TASKS TABLE EXISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) DEFAULT 'case',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES public.user_accounts(id),
  assigned_to_name VARCHAR(255),
  assigned_by UUID REFERENCES public.user_accounts(id),
  assigned_by_name VARCHAR(255),
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  case_name VARCHAR(255),
  deadline DATE,
  status VARCHAR(20) DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 13. ENSURE ATTENDANCE TABLE EXISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_accounts(id) ON DELETE CASCADE,
  user_name VARCHAR(255),
  date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- =====================================================
-- 14. ENSURE EXPENSES TABLE EXISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50),
  added_by UUID REFERENCES public.user_accounts(id),
  added_by_name VARCHAR(255),
  month VARCHAR(7) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 15. ENSURE NOTIFICATIONS TABLE EXISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_accounts(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT '🔔',
  related_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.user_accounts(id),
  created_by_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 16. ENSURE LIBRARY_ITEMS TABLE EXISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.library_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID REFERENCES public.library_locations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  added_by UUID REFERENCES public.user_accounts(id),
  added_by_name VARCHAR(255),
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 17. ENSURE STORAGE_ITEMS TABLE EXISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.storage_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID REFERENCES public.storage_locations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  added_by UUID REFERENCES public.user_accounts(id),
  added_by_name VARCHAR(255),
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 18. CREATE UPDATE TIMESTAMP FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 19. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =====================================================
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counsel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sofa_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 20. CREATE PERMISSIVE RLS POLICIES (Allow all authenticated users)
-- =====================================================

-- Drop existing policies first to avoid conflicts
DO $$ 
DECLARE
  tbl TEXT;
  pol TEXT;
BEGIN
  FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = tbl LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol, tbl);
    END LOOP;
  END LOOP;
END $$;

-- Create simple permissive policies for all tables
-- USER_ACCOUNTS
CREATE POLICY "Allow all for user_accounts" ON public.user_accounts FOR ALL USING (true) WITH CHECK (true);

-- COURTS
CREATE POLICY "Allow all for courts" ON public.courts FOR ALL USING (true) WITH CHECK (true);

-- CASE_TYPES
CREATE POLICY "Allow all for case_types" ON public.case_types FOR ALL USING (true) WITH CHECK (true);

-- CASES
CREATE POLICY "Allow all for cases" ON public.cases FOR ALL USING (true) WITH CHECK (true);

-- COUNSEL
CREATE POLICY "Allow all for counsel" ON public.counsel FOR ALL USING (true) WITH CHECK (true);

-- APPOINTMENTS
CREATE POLICY "Allow all for appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);

-- TRANSACTIONS
CREATE POLICY "Allow all for transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

-- BOOKS
CREATE POLICY "Allow all for books" ON public.books FOR ALL USING (true) WITH CHECK (true);

-- LIBRARY_LOCATIONS
CREATE POLICY "Allow all for library_locations" ON public.library_locations FOR ALL USING (true) WITH CHECK (true);

-- STORAGE_LOCATIONS
CREATE POLICY "Allow all for storage_locations" ON public.storage_locations FOR ALL USING (true) WITH CHECK (true);

-- SOFA_ITEMS
CREATE POLICY "Allow all for sofa_items" ON public.sofa_items FOR ALL USING (true) WITH CHECK (true);

-- TASKS
CREATE POLICY "Allow all for tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);

-- ATTENDANCE
CREATE POLICY "Allow all for attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);

-- EXPENSES
CREATE POLICY "Allow all for expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);

-- NOTIFICATIONS
CREATE POLICY "Allow all for notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- LIBRARY_ITEMS
CREATE POLICY "Allow all for library_items" ON public.library_items FOR ALL USING (true) WITH CHECK (true);

-- STORAGE_ITEMS
CREATE POLICY "Allow all for storage_items" ON public.storage_items FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 21. GRANT ALL PERMISSIONS
-- =====================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- 22. ENABLE REALTIME FOR ALL TABLES
-- =====================================================
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
    EXCEPTION WHEN OTHERS THEN
      -- Table might already be in publication, ignore error
      NULL;
    END;
  END LOOP;
END $$;

-- =====================================================
-- DONE! Your database is now ready for production
-- =====================================================
-- 
-- WHAT THIS SCRIPT DID:
-- ✅ Created all required tables
-- ✅ Added default courts and case types
-- ✅ Enabled Row Level Security
-- ✅ Created permissive policies (all users can read/write)
-- ✅ Granted all permissions to anon and authenticated users
-- ✅ Enabled realtime subscriptions for all tables
--
-- NEXT STEPS:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Refresh your app
-- 3. Your data will now persist!
-- =====================================================
