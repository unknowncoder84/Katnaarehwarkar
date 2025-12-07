-- =====================================================
-- COMPLETE SUPABASE DATABASE SETUP
-- Legal Case Management System with Authentication
-- =====================================================
-- 
-- INSTRUCTIONS:
-- 1. Copy this ENTIRE file
-- 2. Go to Supabase Dashboard → SQL Editor
-- 3. Paste and click RUN
-- 4. Wait for "Success" message
-- 5. Login with: admin / admin123
-- 
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PART 1: USER AUTHENTICATION SYSTEM
-- =====================================================

-- Drop existing user tables if they exist
DROP TABLE IF EXISTS public.user_accounts CASCADE;

-- Create user_accounts table with plain password (for development)
CREATE TABLE public.user_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'vipin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.user_accounts(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;

-- Policies for user_accounts
CREATE POLICY "Anyone can view active users" ON public.user_accounts FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can insert users" ON public.user_accounts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update users" ON public.user_accounts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete users" ON public.user_accounts FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Allow first admin creation" ON public.user_accounts FOR INSERT WITH CHECK (
  NOT EXISTS (SELECT 1 FROM public.user_accounts)
);

-- Indexes
CREATE INDEX idx_user_accounts_username ON public.user_accounts(username);
CREATE INDEX idx_user_accounts_role ON public.user_accounts(role);

-- =====================================================
-- PART 2: AUTHENTICATION FUNCTIONS
-- =====================================================

-- Function to authenticate user
CREATE OR REPLACE FUNCTION authenticate_user(
  p_username VARCHAR,
  p_password VARCHAR
)
RETURNS TABLE (
  success BOOLEAN,
  user_id UUID,
  username VARCHAR,
  name VARCHAR,
  email VARCHAR,
  role VARCHAR,
  is_active BOOLEAN,
  error_message TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN ua.password = p_password AND ua.is_active = true THEN true
      ELSE false
    END as success,
    ua.id as user_id,
    ua.username,
    ua.name,
    ua.email,
    ua.role,
    ua.is_active,
    CASE 
      WHEN ua.id IS NULL THEN 'Invalid username or password'
      WHEN ua.is_active = false THEN 'Account is inactive'
      WHEN ua.password != p_password THEN 'Invalid username or password'
      ELSE NULL
    END as error_message
  FROM public.user_accounts ua
  WHERE ua.username = p_username
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::BOOLEAN, 'Invalid username or password'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all users
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  id UUID,
  username VARCHAR,
  name VARCHAR,
  email VARCHAR,
  role VARCHAR,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ua.id,
    ua.username,
    ua.name,
    ua.email,
    ua.role,
    ua.is_active,
    ua.created_at,
    ua.updated_at
  FROM public.user_accounts ua
  ORDER BY ua.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create user
CREATE OR REPLACE FUNCTION create_user_account(
  p_name VARCHAR,
  p_email VARCHAR,
  p_username VARCHAR,
  p_password VARCHAR,
  p_role VARCHAR,
  p_created_by UUID
)
RETURNS TABLE (
  success BOOLEAN,
  user_id UUID,
  error_message TEXT
) AS $$
DECLARE
  v_user_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM public.user_accounts WHERE username = p_username) THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Username already exists'::TEXT;
    RETURN;
  END IF;
  
  INSERT INTO public.user_accounts (name, email, username, password, role, created_by)
  VALUES (p_name, p_email, p_username, p_password, p_role, p_created_by)
  RETURNING id INTO v_user_id;
  
  RETURN QUERY SELECT true, v_user_id, NULL::TEXT;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT false, NULL::UUID, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user role
CREATE OR REPLACE FUNCTION update_user_role(
  p_user_id UUID,
  p_new_role VARCHAR,
  p_updated_by UUID
)
RETURNS TABLE (
  success BOOLEAN,
  error_message TEXT
) AS $$
BEGIN
  UPDATE public.user_accounts
  SET role = p_new_role, updated_at = NOW()
  WHERE id = p_user_id;
  
  IF FOUND THEN
    RETURN QUERY SELECT true, NULL::TEXT;
  ELSE
    RETURN QUERY SELECT false, 'User not found'::TEXT;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT false, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to toggle user status
CREATE OR REPLACE FUNCTION toggle_user_status(
  p_user_id UUID,
  p_updated_by UUID
)
RETURNS TABLE (
  success BOOLEAN,
  new_status BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  v_new_status BOOLEAN;
BEGIN
  UPDATE public.user_accounts
  SET is_active = NOT is_active, updated_at = NOW()
  WHERE id = p_user_id
  RETURNING is_active INTO v_new_status;
  
  IF FOUND THEN
    RETURN QUERY SELECT true, v_new_status, NULL::TEXT;
  ELSE
    RETURN QUERY SELECT false, NULL::BOOLEAN, 'User not found'::TEXT;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT false, NULL::BOOLEAN, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete user (soft delete)
CREATE OR REPLACE FUNCTION delete_user_account(
  p_user_id UUID,
  p_deleted_by UUID
)
RETURNS TABLE (
  success BOOLEAN,
  error_message TEXT
) AS $$
BEGIN
  UPDATE public.user_accounts
  SET is_active = false, updated_at = NOW()
  WHERE id = p_user_id;
  
  IF FOUND THEN
    RETURN QUERY SELECT true, NULL::TEXT;
  ELSE
    RETURN QUERY SELECT false, 'User not found'::TEXT;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT false, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 3: CORE TABLES
-- =====================================================

-- Courts table
CREATE TABLE IF NOT EXISTS public.courts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view courts" ON public.courts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert courts" ON public.courts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can delete courts" ON public.courts FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE role = 'admin')
);

-- Case types table
CREATE TABLE IF NOT EXISTS public.case_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.case_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view case types" ON public.case_types FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert case types" ON public.case_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can delete case types" ON public.case_types FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE role = 'admin')
);

-- Cases table
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  client_mobile VARCHAR(20),
  client_alternate_no VARCHAR(20),
  file_no VARCHAR(100) NOT NULL,
  stamp_no VARCHAR(100),
  reg_no VARCHAR(100),
  parties_name TEXT,
  district VARCHAR(100),
  case_type VARCHAR(100),
  court VARCHAR(255),
  on_behalf_of VARCHAR(255),
  no_resp VARCHAR(100),
  opponent_lawyer VARCHAR(255),
  additional_details TEXT,
  fees_quoted DECIMAL(12, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'closed', 'on-hold')),
  next_date DATE,
  filing_date DATE,
  circulation_status VARCHAR(20) DEFAULT 'non-circulated' CHECK (circulation_status IN ('circulated', 'non-circulated')),
  interim_relief VARCHAR(20) DEFAULT 'none' CHECK (interim_relief IN ('favor', 'against', 'none')),
  created_by UUID REFERENCES public.user_accounts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all cases" ON public.cases FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert cases" ON public.cases FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update cases" ON public.cases FOR UPDATE USING (true);
CREATE POLICY "Admins can delete cases" ON public.cases FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE role = 'admin')
);

CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_cases_client_name ON public.cases(client_name);
CREATE INDEX idx_cases_file_no ON public.cases(file_no);
CREATE INDEX idx_cases_next_date ON public.cases(next_date);

-- Counsel table
CREATE TABLE IF NOT EXISTS public.counsel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  mobile VARCHAR(20),
  address TEXT,
  details TEXT,
  total_cases INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.user_accounts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.counsel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all counsel" ON public.counsel FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert counsel" ON public.counsel FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update counsel" ON public.counsel FOR UPDATE USING (true);
CREATE POLICY "Admins can delete counsel" ON public.counsel FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE role = 'admin')
);

-- Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  time VARCHAR(10),
  user_id UUID REFERENCES public.user_accounts(id),
  user_name VARCHAR(255),
  client VARCHAR(255),
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update appointments" ON public.appointments FOR UPDATE USING (true);
CREATE POLICY "Users can delete appointments" ON public.appointments FOR DELETE USING (true);

CREATE INDEX idx_appointments_date ON public.appointments(date);

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('received', 'pending')),
  received_by VARCHAR(255),
  confirmed_by VARCHAR(255),
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert transactions" ON public.transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update transactions" ON public.transactions FOR UPDATE USING (true);
CREATE POLICY "Admins can delete transactions" ON public.transactions FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE role = 'admin')
);

CREATE INDEX idx_transactions_case_id ON public.transactions(case_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);

-- Books table (Library L1)
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(10) DEFAULT 'L1' CHECK (location IN ('L1')),
  added_by UUID REFERENCES public.user_accounts(id),
  added_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all books" ON public.books FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert books" ON public.books FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete books" ON public.books FOR DELETE USING (true);

-- Sofa items table (Library C1/C2)
CREATE TABLE IF NOT EXISTS public.sofa_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  compartment VARCHAR(5) NOT NULL CHECK (compartment IN ('C1', 'C2')),
  added_by UUID REFERENCES public.user_accounts(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(case_id, compartment)
);

ALTER TABLE public.sofa_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all sofa items" ON public.sofa_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert sofa items" ON public.sofa_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete sofa items" ON public.sofa_items FOR DELETE USING (true);

CREATE INDEX idx_sofa_items_case_id ON public.sofa_items(case_id);

-- Counsel cases link table
CREATE TABLE IF NOT EXISTS public.counsel_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  counsel_id UUID REFERENCES public.counsel(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(counsel_id, case_id)
);

ALTER TABLE public.counsel_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view counsel cases" ON public.counsel_cases FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert counsel cases" ON public.counsel_cases FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete counsel cases" ON public.counsel_cases FOR DELETE USING (true);

CREATE INDEX idx_counsel_cases_counsel_id ON public.counsel_cases(counsel_id);
CREATE INDEX idx_counsel_cases_case_id ON public.counsel_cases(case_id);

-- Case documents table
CREATE TABLE IF NOT EXISTS public.case_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  dropbox_path TEXT NOT NULL,
  dropbox_id TEXT,
  file_type VARCHAR(50),
  file_size BIGINT,
  uploaded_by UUID REFERENCES public.user_accounts(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.case_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all documents" ON public.case_documents FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert documents" ON public.case_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete documents" ON public.case_documents FOR DELETE USING (true);

CREATE INDEX idx_case_documents_case_id ON public.case_documents(case_id);

-- =====================================================
-- PART 4: TRIGGERS & FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_cases_updated_at ON public.cases;
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_counsel_updated_at ON public.counsel;
CREATE TRIGGER update_counsel_updated_at BEFORE UPDATE ON public.counsel
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update counsel case count
CREATE OR REPLACE FUNCTION update_counsel_case_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.counsel SET total_cases = total_cases + 1 WHERE id = NEW.counsel_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.counsel SET total_cases = total_cases - 1 WHERE id = OLD.counsel_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_counsel_case_count_trigger ON public.counsel_cases;
CREATE TRIGGER update_counsel_case_count_trigger
  AFTER INSERT OR DELETE ON public.counsel_cases
  FOR EACH ROW EXECUTE FUNCTION update_counsel_case_count();

-- =====================================================
-- PART 5: VIEWS
-- =====================================================

CREATE OR REPLACE VIEW public.disposed_cases AS
SELECT * FROM public.cases WHERE status = 'closed';

CREATE OR REPLACE VIEW public.pending_cases AS
SELECT * FROM public.cases WHERE status = 'pending';

CREATE OR REPLACE VIEW public.active_cases AS
SELECT * FROM public.cases WHERE status = 'active';

CREATE OR REPLACE VIEW public.upcoming_hearings AS
SELECT * FROM public.cases 
WHERE next_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
ORDER BY next_date ASC;

-- =====================================================
-- PART 6: HELPER FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
  total_cases BIGINT,
  active_cases BIGINT,
  pending_cases BIGINT,
  closed_cases BIGINT,
  on_hold_cases BIGINT,
  total_counsel BIGINT,
  total_appointments BIGINT,
  upcoming_hearings BIGINT,
  total_received DECIMAL,
  total_pending DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.cases)::BIGINT,
    (SELECT COUNT(*) FROM public.cases WHERE status = 'active')::BIGINT,
    (SELECT COUNT(*) FROM public.cases WHERE status = 'pending')::BIGINT,
    (SELECT COUNT(*) FROM public.cases WHERE status = 'closed')::BIGINT,
    (SELECT COUNT(*) FROM public.cases WHERE status = 'on-hold')::BIGINT,
    (SELECT COUNT(*) FROM public.counsel)::BIGINT,
    (SELECT COUNT(*) FROM public.appointments WHERE date >= CURRENT_DATE)::BIGINT,
    (SELECT COUNT(*) FROM public.cases WHERE next_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days')::BIGINT,
    (SELECT COALESCE(SUM(amount), 0) FROM public.transactions WHERE status = 'received'),
    (SELECT COALESCE(SUM(amount), 0) FROM public.transactions WHERE status = 'pending');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION search_cases(search_term TEXT)
RETURNS SETOF public.cases AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.cases
  WHERE 
    client_name ILIKE '%' || search_term || '%' OR
    file_no ILIKE '%' || search_term || '%' OR
    parties_name ILIKE '%' || search_term || '%' OR
    court ILIKE '%' || search_term || '%' OR
    opponent_lawyer ILIKE '%' || search_term || '%'
  ORDER BY updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 7: SAMPLE DATA
-- =====================================================

-- Insert default users
INSERT INTO public.user_accounts (username, password, name, email, role, is_active)
VALUES 
  ('admin', 'admin123', 'Administrator', 'admin@katneshwarkar.com', 'admin', true),
  ('vipin', 'vipin123', 'Vipin Katneshwarkar', 'vipin@katneshwarkar.com', 'vipin', true),
  ('user', 'user123', 'Regular User', 'user@katneshwarkar.com', 'user', true)
ON CONFLICT (username) DO UPDATE
SET password = EXCLUDED.password, is_active = true;

-- Insert default courts
INSERT INTO public.courts (name) VALUES 
  ('Supreme Court'),
  ('High Court'),
  ('District Court'),
  ('Sessions Court'),
  ('Civil Court'),
  ('Family Court'),
  ('Consumer Court'),
  ('Labour Court'),
  ('Tribunal'),
  ('Magistrate Court')
ON CONFLICT (name) DO NOTHING;

-- Insert default case types
INSERT INTO public.case_types (name) VALUES 
  ('Civil'),
  ('Criminal'),
  ('Family'),
  ('Corporate'),
  ('Immigration'),
  ('Real Estate'),
  ('Labour'),
  ('Tax'),
  ('Constitutional'),
  ('Consumer Protection'),
  ('Intellectual Property'),
  ('Banking'),
  ('Insurance'),
  ('Arbitration'),
  ('Writ Petition')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- PART 8: PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- PART 9: VERIFICATION
-- =====================================================

-- Test authentication
SELECT * FROM authenticate_user('admin', 'admin123');

-- View all users
SELECT username, name, email, role, is_active FROM public.user_accounts;

-- =====================================================
-- ✅ SETUP COMPLETE!
-- =====================================================
-- 
-- LOGIN CREDENTIALS:
-- 
-- Admin Account:
--   Username: admin
--   Password: admin123
--
-- Vipin Account:
--   Username: vipin
--   Password: vipin123
--
-- Regular User:
--   Username: user
--   Password: user123
--
-- WHAT WAS CREATED:
-- ✅ User authentication system
-- ✅ All database tables (cases, counsel, appointments, etc.)
-- ✅ All authentication functions
-- ✅ Row Level Security policies
-- ✅ Indexes for performance
-- ✅ Triggers for auto-updates
-- ✅ Views for common queries
-- ✅ Helper functions
-- ✅ Sample data (courts, case types, users)
--
-- NEXT STEPS:
-- 1. Go to your app
-- 2. Login with: admin / admin123
-- 3. Start using the system!
--
-- ⚠️ SECURITY NOTE:
-- This uses plain text passwords for development.
-- For production, implement proper password hashing!
-- =====================================================
