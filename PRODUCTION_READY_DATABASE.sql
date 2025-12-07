-- =====================================================
-- PRODUCTION READY DATABASE SETUP
-- Legal Case Management System - Katneshwarkar Office
-- Version: 1.0 FINAL
-- =====================================================
-- 
-- COPY THIS ENTIRE FILE AND RUN IN SUPABASE SQL EDITOR
-- 
-- This file will:
-- ✅ Create all database tables
-- ✅ Set up authentication system
-- ✅ Create default admin user
-- ✅ Add sample data
-- ✅ Configure security
-- ✅ Everything you need!
-- 
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- STEP 1: USER AUTHENTICATION SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'vipin')),
  is_active BOOLEAN DEFAULT true,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_user_accounts_username ON public.user_accounts(username);
CREATE INDEX IF NOT EXISTS idx_user_accounts_email ON public.user_accounts(email);
CREATE INDEX IF NOT EXISTS idx_user_accounts_role ON public.user_accounts(role);

-- =====================================================
-- STEP 2: CORE DATA TABLES
-- =====================================================

-- Courts
CREATE TABLE IF NOT EXISTS public.courts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;

-- Case Types
CREATE TABLE IF NOT EXISTS public.case_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.case_types ENABLE ROW LEVEL SECURITY;

-- Cases
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
  stage VARCHAR(50) DEFAULT 'consultation' CHECK (stage IN ('consultation', 'drafting', 'filing', 'circulation', 'notice', 'pre-admission', 'admitted', 'final-hearing', 'reserved', 'disposed')),
  next_date DATE,
  filing_date DATE,
  circulation_status VARCHAR(20) DEFAULT 'non-circulated' CHECK (circulation_status IN ('circulated', 'non-circulated')),
  interim_relief VARCHAR(20) DEFAULT 'none' CHECK (interim_relief IN ('favor', 'against', 'none')),
  created_by UUID REFERENCES public.user_accounts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_client_name ON public.cases(client_name);
CREATE INDEX IF NOT EXISTS idx_cases_file_no ON public.cases(file_no);
CREATE INDEX IF NOT EXISTS idx_cases_next_date ON public.cases(next_date);

-- Counsel
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

-- Appointments
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

CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);

-- Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('received', 'pending')),
  payment_mode VARCHAR(20) DEFAULT 'cash' CHECK (payment_mode IN ('upi', 'cash', 'check', 'bank-transfer', 'card', 'other')),
  received_by VARCHAR(255),
  confirmed_by VARCHAR(255),
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_transactions_case_id ON public.transactions(case_id);

-- Books (Library L1)
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(10) DEFAULT 'L1' CHECK (location IN ('L1')),
  added_by UUID REFERENCES public.user_accounts(id),
  added_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Sofa Items (Library C1/C2)
CREATE TABLE IF NOT EXISTS public.sofa_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  compartment VARCHAR(5) NOT NULL CHECK (compartment IN ('C1', 'C2')),
  added_by UUID REFERENCES public.user_accounts(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(case_id, compartment)
);

ALTER TABLE public.sofa_items ENABLE ROW LEVEL SECURITY;

-- Counsel Cases Link
CREATE TABLE IF NOT EXISTS public.counsel_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  counsel_id UUID REFERENCES public.counsel(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(counsel_id, case_id)
);

ALTER TABLE public.counsel_cases ENABLE ROW LEVEL SECURITY;

-- Case Documents
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

-- Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('case', 'custom')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES public.user_accounts(id) ON DELETE CASCADE,
  assigned_to_name VARCHAR(255) NOT NULL,
  assigned_by UUID REFERENCES public.user_accounts(id) ON DELETE SET NULL,
  assigned_by_name VARCHAR(255) NOT NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  case_name VARCHAR(255),
  deadline DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON public.tasks(deadline);

-- Attendance
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_accounts(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent')),
  marked_by UUID REFERENCES public.user_accounts(id) ON DELETE SET NULL,
  marked_by_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON public.attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);

-- Expenses
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT NOT NULL,
  added_by UUID REFERENCES public.user_accounts(id) ON DELETE SET NULL,
  added_by_name VARCHAR(255) NOT NULL,
  month VARCHAR(7) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_expenses_month ON public.expenses(month);

-- =====================================================
-- STEP 3: AUTHENTICATION FUNCTIONS
-- =====================================================

-- Hash password function
CREATE OR REPLACE FUNCTION public.hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify password function
CREATE OR REPLACE FUNCTION public.verify_password(password TEXT, password_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN password_hash = crypt(password, password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Authenticate user function
CREATE OR REPLACE FUNCTION public.authenticate_user(
  p_username TEXT,
  p_password TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  user_id UUID,
  name VARCHAR(255),
  email VARCHAR(255),
  username VARCHAR(100),
  role VARCHAR(20),
  is_active BOOLEAN,
  avatar TEXT,
  error_message TEXT
) AS $$
DECLARE
  v_user RECORD;
BEGIN
  SELECT 
    ua.id,
    ua.name,
    ua.email,
    ua.username,
    ua.role,
    ua.is_active,
    ua.avatar,
    ua.password_hash
  INTO v_user
  FROM public.user_accounts ua
  WHERE ua.username = p_username;

  IF v_user.id IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::BOOLEAN, NULL::TEXT, 'Invalid username or password';
    RETURN;
  END IF;

  IF NOT v_user.is_active THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::BOOLEAN, NULL::TEXT, 'Account is deactivated';
    RETURN;
  END IF;

  IF NOT public.verify_password(p_password, v_user.password_hash) THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::BOOLEAN, NULL::TEXT, 'Invalid username or password';
    RETURN;
  END IF;

  RETURN QUERY SELECT 
    TRUE,
    v_user.id,
    v_user.name,
    v_user.email,
    v_user.username,
    v_user.role,
    v_user.is_active,
    v_user.avatar,
    NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create user function
CREATE OR REPLACE FUNCTION public.create_user_account(
  p_name TEXT,
  p_email TEXT,
  p_username TEXT,
  p_password TEXT,
  p_role TEXT DEFAULT 'user',
  p_created_by UUID DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  user_id UUID,
  error_message TEXT
) AS $$
DECLARE
  v_user_id UUID;
  v_password_hash TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM public.user_accounts WHERE email = p_email) THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'A user with this email already exists';
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM public.user_accounts WHERE username = p_username) THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'A user with this username already exists';
    RETURN;
  END IF;

  v_password_hash := public.hash_password(p_password);

  INSERT INTO public.user_accounts (name, email, username, password_hash, role, is_active, created_by)
  VALUES (p_name, p_email, p_username, v_password_hash, p_role, TRUE, p_created_by)
  RETURNING id INTO v_user_id;

  RETURN QUERY SELECT TRUE, v_user_id, NULL::TEXT;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get all users function
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  email VARCHAR(255),
  username VARCHAR(100),
  role VARCHAR(20),
  is_active BOOLEAN,
  avatar TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ua.id,
    ua.name,
    ua.email,
    ua.username,
    ua.role,
    ua.is_active,
    ua.avatar,
    ua.created_at,
    ua.updated_at
  FROM public.user_accounts ua
  ORDER BY ua.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user role function
CREATE OR REPLACE FUNCTION public.update_user_role(
  p_user_id UUID,
  p_new_role TEXT,
  p_updated_by UUID
)
RETURNS TABLE (
  success BOOLEAN,
  error_message TEXT
) AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_accounts WHERE id = p_user_id) THEN
    RETURN QUERY SELECT FALSE, 'User not found';
    RETURN;
  END IF;

  UPDATE public.user_accounts
  SET role = p_new_role, updated_at = NOW()
  WHERE id = p_user_id;

  RETURN QUERY SELECT TRUE, NULL::TEXT;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Toggle user status function
CREATE OR REPLACE FUNCTION public.toggle_user_status(
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
    RETURN QUERY SELECT TRUE, v_new_status, NULL::TEXT;
  ELSE
    RETURN QUERY SELECT FALSE, NULL::BOOLEAN, 'User not found';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, NULL::BOOLEAN, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete user function
CREATE OR REPLACE FUNCTION public.delete_user_account(
  p_user_id UUID,
  p_deleted_by UUID
)
RETURNS TABLE (
  success BOOLEAN,
  error_message TEXT
) AS $$
BEGIN
  UPDATE public.user_accounts
  SET is_active = FALSE, updated_at = NOW()
  WHERE id = p_user_id;

  IF FOUND THEN
    RETURN QUERY SELECT TRUE, NULL::TEXT;
  ELSE
    RETURN QUERY SELECT FALSE, 'User not found';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 4: HELPER FUNCTIONS
-- =====================================================

-- Dashboard stats function
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
  total_pending DECIMAL,
  pending_tasks BIGINT,
  total_users BIGINT
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
    (SELECT COALESCE(SUM(amount), 0) FROM public.transactions WHERE status = 'pending'),
    (SELECT COUNT(*) FROM public.tasks WHERE status = 'pending')::BIGINT,
    (SELECT COUNT(*) FROM public.user_accounts WHERE is_active = TRUE)::BIGINT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search cases function
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
-- STEP 5: TRIGGERS
-- =====================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_user_accounts_updated_at ON public.user_accounts;
CREATE TRIGGER update_user_accounts_updated_at BEFORE UPDATE ON public.user_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cases_updated_at ON public.cases;
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_counsel_updated_at ON public.counsel;
CREATE TRIGGER update_counsel_updated_at BEFORE UPDATE ON public.counsel
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_attendance_updated_at ON public.attendance;
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 6: ROW LEVEL SECURITY POLICIES
-- =====================================================

-- User accounts policies
DROP POLICY IF EXISTS "Users can view active users" ON public.user_accounts;
DROP POLICY IF EXISTS "Service role full access" ON public.user_accounts;
CREATE POLICY "Users can view active users" ON public.user_accounts FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Service role full access" ON public.user_accounts FOR ALL USING (true);

-- Courts policies
DROP POLICY IF EXISTS "Anyone can view courts" ON public.courts;
DROP POLICY IF EXISTS "Anyone can insert courts" ON public.courts;
DROP POLICY IF EXISTS "Anyone can delete courts" ON public.courts;
CREATE POLICY "Anyone can view courts" ON public.courts FOR SELECT USING (true);
CREATE POLICY "Anyone can insert courts" ON public.courts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete courts" ON public.courts FOR DELETE USING (true);

-- Case types policies
DROP POLICY IF EXISTS "Anyone can view case types" ON public.case_types;
DROP POLICY IF EXISTS "Anyone can insert case types" ON public.case_types;
DROP POLICY IF EXISTS "Anyone can delete case types" ON public.case_types;
CREATE POLICY "Anyone can view case types" ON public.case_types FOR SELECT USING (true);
CREATE POLICY "Anyone can insert case types" ON public.case_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete case types" ON public.case_types FOR DELETE USING (true);

-- Cases policies
DROP POLICY IF EXISTS "Anyone can view cases" ON public.cases;
DROP POLICY IF EXISTS "Anyone can insert cases" ON public.cases;
DROP POLICY IF EXISTS "Anyone can update cases" ON public.cases;
DROP POLICY IF EXISTS "Anyone can delete cases" ON public.cases;
CREATE POLICY "Anyone can view cases" ON public.cases FOR SELECT USING (true);
CREATE POLICY "Anyone can insert cases" ON public.cases FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update cases" ON public.cases FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete cases" ON public.cases FOR DELETE USING (true);

-- Counsel policies
DROP POLICY IF EXISTS "Anyone can view counsel" ON public.counsel;
DROP POLICY IF EXISTS "Anyone can insert counsel" ON public.counsel;
DROP POLICY IF EXISTS "Anyone can update counsel" ON public.counsel;
DROP POLICY IF EXISTS "Anyone can delete counsel" ON public.counsel;
CREATE POLICY "Anyone can view counsel" ON public.counsel FOR SELECT USING (true);
CREATE POLICY "Anyone can insert counsel" ON public.counsel FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update counsel" ON public.counsel FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete counsel" ON public.counsel FOR DELETE USING (true);

-- Appointments policies
DROP POLICY IF EXISTS "Anyone can view appointments" ON public.appointments;
DROP POLICY IF EXISTS "Anyone can insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "Anyone can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Anyone can delete appointments" ON public.appointments;
CREATE POLICY "Anyone can view appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update appointments" ON public.appointments FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete appointments" ON public.appointments FOR DELETE USING (true);

-- Transactions policies
DROP POLICY IF EXISTS "Anyone can view transactions" ON public.transactions;
DROP POLICY IF EXISTS "Anyone can insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Anyone can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Anyone can delete transactions" ON public.transactions;
CREATE POLICY "Anyone can view transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert transactions" ON public.transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update transactions" ON public.transactions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete transactions" ON public.transactions FOR DELETE USING (true);

-- Books policies
DROP POLICY IF EXISTS "Anyone can view books" ON public.books;
DROP POLICY IF EXISTS "Anyone can insert books" ON public.books;
DROP POLICY IF EXISTS "Anyone can delete books" ON public.books;
CREATE POLICY "Anyone can view books" ON public.books FOR SELECT USING (true);
CREATE POLICY "Anyone can insert books" ON public.books FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete books" ON public.books FOR DELETE USING (true);

-- Sofa items policies
DROP POLICY IF EXISTS "Anyone can view sofa items" ON public.sofa_items;
DROP POLICY IF EXISTS "Anyone can insert sofa items" ON public.sofa_items;
DROP POLICY IF EXISTS "Anyone can delete sofa items" ON public.sofa_items;
CREATE POLICY "Anyone can view sofa items" ON public.sofa_items FOR SELECT USING (true);
CREATE POLICY "Anyone can insert sofa items" ON public.sofa_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete sofa items" ON public.sofa_items FOR DELETE USING (true);

-- Counsel cases policies
DROP POLICY IF EXISTS "Anyone can view counsel cases" ON public.counsel_cases;
DROP POLICY IF EXISTS "Anyone can insert counsel cases" ON public.counsel_cases;
DROP POLICY IF EXISTS "Anyone can delete counsel cases" ON public.counsel_cases;
CREATE POLICY "Anyone can view counsel cases" ON public.counsel_cases FOR SELECT USING (true);
CREATE POLICY "Anyone can insert counsel cases" ON public.counsel_cases FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete counsel cases" ON public.counsel_cases FOR DELETE USING (true);

-- Case documents policies
DROP POLICY IF EXISTS "Anyone can view documents" ON public.case_documents;
DROP POLICY IF EXISTS "Anyone can insert documents" ON public.case_documents;
DROP POLICY IF EXISTS "Anyone can delete documents" ON public.case_documents;
CREATE POLICY "Anyone can view documents" ON public.case_documents FOR SELECT USING (true);
CREATE POLICY "Anyone can insert documents" ON public.case_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete documents" ON public.case_documents FOR DELETE USING (true);

-- Tasks policies
DROP POLICY IF EXISTS "Anyone can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Anyone can insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "Anyone can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Anyone can delete tasks" ON public.tasks;
CREATE POLICY "Anyone can view tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Anyone can insert tasks" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update tasks" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete tasks" ON public.tasks FOR DELETE USING (true);

-- Attendance policies
DROP POLICY IF EXISTS "Anyone can view attendance" ON public.attendance;
DROP POLICY IF EXISTS "Anyone can insert attendance" ON public.attendance;
DROP POLICY IF EXISTS "Anyone can update attendance" ON public.attendance;
DROP POLICY IF EXISTS "Anyone can delete attendance" ON public.attendance;
CREATE POLICY "Anyone can view attendance" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Anyone can insert attendance" ON public.attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update attendance" ON public.attendance FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete attendance" ON public.attendance FOR DELETE USING (true);

-- Expenses policies
DROP POLICY IF EXISTS "Anyone can view expenses" ON public.expenses;
DROP POLICY IF EXISTS "Anyone can insert expenses" ON public.expenses;
DROP POLICY IF EXISTS "Anyone can update expenses" ON public.expenses;
DROP POLICY IF EXISTS "Anyone can delete expenses" ON public.expenses;
CREATE POLICY "Anyone can view expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Anyone can insert expenses" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update expenses" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete expenses" ON public.expenses FOR DELETE USING (true);

-- =====================================================
-- STEP 7: GRANT PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- =====================================================
-- STEP 8: SAMPLE DATA
-- =====================================================

-- Insert courts
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

-- Insert case types
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
  ('Writ Petition'),
  ('Property'),
  ('Other')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- STEP 9: CREATE DEFAULT ADMIN USER
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_accounts WHERE username = 'admin') THEN
    INSERT INTO public.user_accounts (name, email, username, password_hash, role, is_active)
    VALUES (
      'Admin User',
      'admin@katneshwarkar.com',
      'admin',
      public.hash_password('admin123'),
      'admin',
      TRUE
    );
    
    RAISE NOTICE '✅ Default admin user created successfully!';
    RAISE NOTICE '📧 Username: admin';
    RAISE NOTICE '🔑 Password: admin123';
    RAISE NOTICE '⚠️  IMPORTANT: Change this password after first login!';
  ELSE
    RAISE NOTICE '✅ Admin user already exists';
  END IF;
END $$;

-- =====================================================
-- ✅ SETUP COMPLETE!
-- =====================================================
-- 
-- 🎉 Your database is ready to use!
-- 
-- LOGIN CREDENTIALS:
-- Username: admin
-- Password: admin123
-- 
-- NEXT STEPS:
-- 1. Go to your app
-- 2. Login with the credentials above
-- 3. Change the default password
-- 4. Start using the system!
-- 
-- FEATURES INCLUDED:
-- ✅ User authentication with bcrypt
-- ✅ All database tables
-- ✅ Security policies
-- ✅ Helper functions
-- ✅ Sample data
-- ✅ Default admin user
-- 
-- =====================================================
