-- STEP 1: Run this FIRST in Supabase SQL Editor
-- Go to: https://supabase.com/dashboard → Your Project → SQL Editor → New Query

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. USER_ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.user_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COURTS TABLE
CREATE TABLE IF NOT EXISTS public.courts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CASE_TYPES TABLE
CREATE TABLE IF NOT EXISTS public.case_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CASES TABLE
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
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COUNSEL TABLE
CREATE TABLE IF NOT EXISTS public.counsel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  mobile VARCHAR(50),
  specialization VARCHAR(255),
  bar_council_no VARCHAR(100),
  address TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  time VARCHAR(50),
  user_id UUID,
  user_name VARCHAR(255),
  client VARCHAR(255) NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_mode VARCHAR(50),
  received_by VARCHAR(255),
  confirmed_by VARCHAR(255),
  case_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. BOOKS TABLE
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  added_by UUID,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. LIBRARY_LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.library_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. STORAGE_LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.storage_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. SOFA_ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.sofa_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID,
  compartment VARCHAR(10),
  added_by UUID,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) DEFAULT 'case',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to UUID,
  assigned_to_name VARCHAR(255),
  assigned_by UUID,
  assigned_by_name VARCHAR(255),
  case_id UUID,
  case_name VARCHAR(255),
  deadline DATE,
  status VARCHAR(20) DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  user_name VARCHAR(255),
  date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50),
  added_by UUID,
  added_by_name VARCHAR(255),
  month VARCHAR(7) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT '🔔',
  related_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_by UUID,
  created_by_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. LIBRARY_ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.library_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  added_by UUID,
  added_by_name VARCHAR(255),
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. STORAGE_ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.storage_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  added_by UUID,
  added_by_name VARCHAR(255),
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default courts
INSERT INTO public.courts (name) VALUES 
  ('High Court'), ('District Court'), ('Commercial Court'), ('Supreme Court'), ('Sessions Court'), ('Civil Court')
ON CONFLICT DO NOTHING;

-- Insert default case types
INSERT INTO public.case_types (name) VALUES 
  ('Civil'), ('Criminal'), ('Commercial'), ('Family'), ('Labour'), ('Tax'), ('Constitutional')
ON CONFLICT DO NOTHING;

-- DISABLE Row Level Security (allows all operations)
ALTER TABLE public.user_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.counsel DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.books DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sofa_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_items DISABLE ROW LEVEL SECURITY;

-- Grant all permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Done! Your database is ready!
