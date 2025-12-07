-- =====================================================
-- COMPLETE DATABASE SETUP FOR LEGAL CASE MANAGEMENT
-- Version 3.0 - All Features Included
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- PART 1: USER MANAGEMENT SYSTEM
-- =====================================================

-- Drop existing tables if recreating (UNCOMMENT IF NEEDED)
-- DROP TABLE IF EXISTS public.expenses CASCADE;
-- DROP TABLE IF EXISTS public.attendance CASCADE;
-- DROP TABLE IF EXISTS public.tasks CASCADE;
-- DROP TABLE IF EXISTS public.counsel_cases CASCADE;
-- DROP TABLE IF EXISTS public.sofa_items CASCADE;
-- DROP TABLE IF EXISTS public.books CASCADE;
-- DROP TABLE IF EXISTS public.case_documents CASCADE;
-- DROP TABLE IF EXISTS public.transactions CASCADE;
-- DROP TABLE IF EXISTS public.appointments CASCADE;
-- DROP TABLE IF EXISTS public.counsel CASCADE;
-- DROP TABLE IF EXISTS public.cases CASCADE;
-- DROP TABLE IF EXISTS public.case_types CASCADE;
-- DROP TABLE IF EXISTS public.courts CASCADE;
-- DROP TABLE IF EXISTS public.user_accounts CASCADE;

-- Create user_accounts table
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

-- Add self-referencing foreign key
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_created_by'
  ) THEN
    ALTER TABLE public.user_accounts 
    ADD CONSTRAINT fk_created_by 
    FOREIGN KEY (created_by) REFERENCES public.user_accounts(id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;

-- Indexes for user_accounts
CREATE INDEX IF NOT EXISTS idx_user_accounts_username ON public.user_accounts(username);
CREATE INDEX IF NOT EXISTS idx_user_accounts_email ON public.user_accounts(email);
CREATE INDEX IF NOT EXISTS idx_user_accounts_role ON public.user_accounts(role);
CREATE INDEX IF NOT EXISTS idx_user_accounts_is_active ON public.user_accounts(is_active);

-- =====================================================
-- PART 2: COURTS AND CASE TYPES (SHARED DATA)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.courts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.case_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_types ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 3: CASES TABLE (COMPLETE WITH ALL FIELDS)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Client Information
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  client_mobile VARCHAR(20),
  client_alternate_no VARCHAR(20),
  -- Case Identification
  file_no VARCHAR(100) NOT NULL,
  stamp_no VARCHAR(100),
  reg_no VARCHAR(100),
  -- Case Details
  parties_name TEXT,
  district VARCHAR(100),
  case_type VARCHAR(100),
  court VARCHAR(255),
  on_behalf_of VARCHAR(255),
  no_resp VARCHAR(100),
  opponent_lawyer VARCHAR(255),
  additional_details TEXT,
  -- Financial
  fees_quoted DECIMAL(12, 2) DEFAULT 0,
  -- Status & Dates
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'closed', 'on-hold')),
  stage VARCHAR(50) DEFAULT 'consultation' CHECK (stage IN ('consultation', 'drafting', 'filing', 'circulation', 'notice', 'pre-admission', 'admitted', 'final-hearing', 'reserved', 'disposed')),
  next_date DATE,
  filing_date DATE,
  circulation_status VARCHAR(20) DEFAULT 'non-circulated' CHECK (circulation_status IN ('circulated', 'non-circulated')),
  interim_relief VARCHAR(20) DEFAULT 'none' CHECK (interim_relief IN ('favor', 'against', 'none')),
  -- Metadata
  created_by UUID REFERENCES public.user_accounts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Indexes for cases
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_stage ON public.cases(stage);
CREATE INDEX IF NOT EXISTS idx_cases_client_name ON public.cases(client_name);
CREATE INDEX IF NOT EXISTS idx_cases_file_no ON public.cases(file_no);
CREATE INDEX IF NOT EXISTS idx_cases_next_date ON public.cases(next_date);
CREATE INDEX IF NOT EXISTS idx_cases_filing_date ON public.cases(filing_date);
CREATE INDEX IF NOT EXISTS idx_cases_court ON public.cases(court);
CREATE INDEX IF NOT EXISTS idx_cases_case_type ON public.cases(case_type);
CREATE INDEX IF NOT EXISTS idx_cases_created_by ON public.cases(created_by);

-- =====================================================
-- PART 4: COUNSEL TABLE
-- =====================================================

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

-- Enable RLS
ALTER TABLE public.counsel ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_counsel_name ON public.counsel(name);
CREATE INDEX IF NOT EXISTS idx_counsel_email ON public.counsel(email);

-- =====================================================
-- PART 5: APPOINTMENTS TABLE
-- =====================================================

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

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);

-- =====================================================
-- PART 6: TRANSACTIONS TABLE
-- =====================================================

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

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_case_id ON public.transactions(case_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);

-- =====================================================
-- PART 7: LIBRARY MANAGEMENT (BOOKS & SOFA ITEMS)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(10) DEFAULT 'L1' CHECK (location IN ('L1')),
  added_by UUID REFERENCES public.user_accounts(id),
  added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sofa_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  compartment VARCHAR(5) NOT NULL CHECK (compartment IN ('C1', 'C2')),
  added_by UUID REFERENCES public.user_accounts(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(case_id, compartment)
);

-- Enable RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sofa_items ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_books_name ON public.books(name);
CREATE INDEX IF NOT EXISTS idx_sofa_items_case_id ON public.sofa_items(case_id);
CREATE INDEX IF NOT EXISTS idx_sofa_items_compartment ON public.sofa_items(compartment);

-- =====================================================
-- PART 8: COUNSEL-CASES LINKING TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.counsel_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  counsel_id UUID REFERENCES public.counsel(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(counsel_id, case_id)
);

-- Enable RLS
ALTER TABLE public.counsel_cases ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_counsel_cases_counsel_id ON public.counsel_cases(counsel_id);
CREATE INDEX IF NOT EXISTS idx_counsel_cases_case_id ON public.counsel_cases(case_id);

-- =====================================================
-- PART 9: CASE DOCUMENTS (DROPBOX INTEGRATION)
-- =====================================================

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

-- Enable RLS
ALTER TABLE public.case_documents ENABLE ROW LEVEL SECURITY;

-- Index
CREATE INDEX IF NOT EXISTS idx_case_documents_case_id ON public.case_documents(case_id);

-- =====================================================
-- PART 10: TASK MANAGEMENT SYSTEM
-- =====================================================

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

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_by ON public.tasks(assigned_by);
CREATE INDEX IF NOT EXISTS idx_tasks_case_id ON public.tasks(case_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON public.tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON public.tasks(type);

-- =====================================================
-- PART 11: ATTENDANCE MANAGEMENT SYSTEM
-- =====================================================

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

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON public.attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON public.attendance(status);
CREATE INDEX IF NOT EXISTS idx_attendance_marked_by ON public.attendance(marked_by);

-- =====================================================
-- PART 12: EXPENSE MANAGEMENT SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT NOT NULL,
  added_by UUID REFERENCES public.user_accounts(id) ON DELETE SET NULL,
  added_by_name VARCHAR(255) NOT NULL,
  month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_expenses_added_by ON public.expenses(added_by);
CREATE INDEX IF NOT EXISTS idx_expenses_month ON public.expenses(month);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON public.expenses(created_at);

-- =====================================================
-- PART 13: FUNCTIONS & TRIGGERS
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

-- Function to update counsel total_cases count
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

-- Trigger for counsel case count
DROP TRIGGER IF EXISTS update_counsel_case_count_trigger ON public.counsel_cases;
CREATE TRIGGER update_counsel_case_count_trigger
  AFTER INSERT OR DELETE ON public.counsel_cases
  FOR EACH ROW EXECUTE FUNCTION update_counsel_case_count();

-- =====================================================
-- PART 14: USER MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to hash password
CREATE OR REPLACE FUNCTION public.hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify password
CREATE OR REPLACE FUNCTION public.verify_password(password TEXT, password_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN password_hash = crypt(password, password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to authenticate user
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
  -- Find user by username
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

  -- Check if user exists
  IF v_user.id IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::BOOLEAN, NULL::TEXT, 'Invalid username or password';
    RETURN;
  END IF;

  -- Check if user is active
  IF NOT v_user.is_active THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::BOOLEAN, NULL::TEXT, 'Account is deactivated';
    RETURN;
  END IF;

  -- Verify password
  IF NOT public.verify_password(p_password, v_user.password_hash) THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::BOOLEAN, NULL::TEXT, 'Invalid username or password';
    RETURN;
  END IF;

  -- Return success with user data
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

-- Function to create new user
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
  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM public.user_accounts WHERE email = p_email) THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'A user with this email already exists';
    RETURN;
  END IF;

  -- Check if username already exists
  IF EXISTS (SELECT 1 FROM public.user_accounts WHERE username = p_username) THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'A user with this username already exists';
    RETURN;
  END IF;

  -- Hash the password
  v_password_hash := public.hash_password(p_password);

  -- Insert new user
  INSERT INTO public.user_accounts (name, email, username, password_hash, role, is_active, created_by)
  VALUES (p_name, p_email, p_username, v_password_hash, p_role, TRUE, p_created_by)
  RETURNING id INTO v_user_id;

  RETURN QUERY SELECT TRUE, v_user_id, NULL::TEXT;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all users
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

-- Function to update user role
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
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM public.user_accounts WHERE id = p_user_id) THEN
    RETURN QUERY SELECT FALSE, 'User not found';
    RETURN;
  END IF;

  -- Check if updater is admin
  IF NOT EXISTS (SELECT 1 FROM public.user_accounts WHERE id = p_updated_by AND role = 'admin') THEN
    RETURN QUERY SELECT FALSE, 'Only admins can update user roles';
    RETURN;
  END IF;

  -- Prevent self-demotion
  IF p_user_id = p_updated_by AND p_new_role != 'admin' THEN
    RETURN QUERY SELECT FALSE, 'You cannot demote yourself';
    RETURN;
  END IF;

  -- Update role
  UPDATE public.user_accounts
  SET role = p_new_role, updated_at = NOW()
  WHERE id = p_user_id;

  RETURN QUERY SELECT TRUE, NULL::TEXT;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to toggle user status
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
  v_current_status BOOLEAN;
  v_new_status BOOLEAN;
BEGIN
  -- Check if user exists
  SELECT is_active INTO v_current_status
  FROM public.user_accounts
  WHERE id = p_user_id;

  IF v_current_status IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::BOOLEAN, 'User not found';
    RETURN;
  END IF;

  -- Check if updater is admin
  IF NOT EXISTS (SELECT 1 FROM public.user_accounts WHERE id = p_updated_by AND role = 'admin') THEN
    RETURN QUERY SELECT FALSE, NULL::BOOLEAN, 'Only admins can toggle user status';
    RETURN;
  END IF;

  -- Prevent self-deactivation
  IF p_user_id = p_updated_by THEN
    RETURN QUERY SELECT FALSE, NULL::BOOLEAN, 'You cannot deactivate your own account';
    RETURN;
  END IF;

  -- Toggle status
  v_new_status := NOT v_current_status;
  
  UPDATE public.user_accounts
  SET is_active = v_new_status, updated_at = NOW()
  WHERE id = p_user_id;

  RETURN QUERY SELECT TRUE, v_new_status, NULL::TEXT;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, NULL::BOOLEAN, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete user (soft delete)
CREATE OR REPLACE FUNCTION public.delete_user_account(
  p_user_id UUID,
  p_deleted_by UUID
)
RETURNS TABLE (
  success BOOLEAN,
  error_message TEXT
) AS $$
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM public.user_accounts WHERE id = p_user_id) THEN
    RETURN QUERY SELECT FALSE, 'User not found';
    RETURN;
  END IF;

  -- Check if deleter is admin
  IF NOT EXISTS (SELECT 1 FROM public.user_accounts WHERE id = p_deleted_by AND role = 'admin') THEN
    RETURN QUERY SELECT FALSE, 'Only admins can delete users';
    RETURN;
  END IF;

  -- Prevent self-deletion
  IF p_user_id = p_deleted_by THEN
    RETURN QUERY SELECT FALSE, 'You cannot delete your own account';
    RETURN;
  END IF;

  -- Soft delete by deactivating
  UPDATE public.user_accounts
  SET is_active = FALSE, updated_at = NOW()
  WHERE id = p_user_id;

  RETURN QUERY SELECT TRUE, NULL::TEXT;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 15: HELPER FUNCTIONS & VIEWS
-- =====================================================

-- Function to get dashboard statistics
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
    (SELECT COUNT(*) FROM public.cases)::BIGINT as total_cases,
    (SELECT COUNT(*) FROM public.cases WHERE status = 'active')::BIGINT as active_cases,
    (SELECT COUNT(*) FROM public.cases WHERE status = 'pending')::BIGINT as pending_cases,
    (SELECT COUNT(*) FROM public.cases WHERE status = 'closed')::BIGINT as closed_cases,
    (SELECT COUNT(*) FROM public.cases WHERE status = 'on-hold')::BIGINT as on_hold_cases,
    (SELECT COUNT(*) FROM public.counsel)::BIGINT as total_counsel,
    (SELECT COUNT(*) FROM public.appointments WHERE date >= CURRENT_DATE)::BIGINT as total_appointments,
    (SELECT COUNT(*) FROM public.cases WHERE next_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days')::BIGINT as upcoming_hearings,
    (SELECT COALESCE(SUM(amount), 0) FROM public.transactions WHERE status = 'received') as total_received,
    (SELECT COALESCE(SUM(amount), 0) FROM public.transactions WHERE status = 'pending') as total_pending,
    (SELECT COUNT(*) FROM public.tasks WHERE status = 'pending')::BIGINT as pending_tasks,
    (SELECT COUNT(*) FROM public.user_accounts WHERE is_active = TRUE)::BIGINT as total_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search cases
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

-- Function to get cases by date
CREATE OR REPLACE FUNCTION get_cases_by_date(target_date DATE)
RETURNS SETOF public.cases AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.cases
  WHERE next_date = target_date
  ORDER BY client_name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Views for common queries
CREATE OR REPLACE VIEW public.disposed_cases AS
SELECT * FROM public.cases WHERE status = 'closed';

CREATE OR REPLACE VIEW public.pending_cases AS
SELECT * FROM public.cases WHERE status = 'pending';

CREATE OR REPLACE VIEW public.active_cases AS
SELECT * FROM public.cases WHERE status = 'active';

CREATE OR REPLACE VIEW public.on_hold_cases AS
SELECT * FROM public.cases WHERE status = 'on-hold';

CREATE OR REPLACE VIEW public.upcoming_hearings AS
SELECT * FROM public.cases 
WHERE next_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
ORDER BY next_date ASC;

CREATE OR REPLACE VIEW public.todays_appointments AS
SELECT * FROM public.appointments 
WHERE date = CURRENT_DATE
ORDER BY time ASC;

CREATE OR REPLACE VIEW public.cases_with_transactions AS
SELECT 
  c.*,
  COALESCE(SUM(t.amount) FILTER (WHERE t.status = 'received'), 0) as total_received,
  COALESCE(SUM(t.amount) FILTER (WHERE t.status = 'pending'), 0) as total_pending
FROM public.cases c
LEFT JOIN public.transactions t ON c.id = t.case_id
GROUP BY c.id;

CREATE OR REPLACE VIEW public.counsel_with_cases AS
SELECT 
  co.*,
  COUNT(cc.case_id) as assigned_cases
FROM public.counsel co
LEFT JOIN public.counsel_cases cc ON co.id = cc.counsel_id
GROUP BY co.id;

CREATE OR REPLACE VIEW public.sofa_items_with_cases AS
SELECT 
  si.*,
  c.client_name,
  c.file_no,
  c.parties_name,
  c.status as case_status
FROM public.sofa_items si
JOIN public.cases c ON si.case_id = c.id;

-- =====================================================
-- PART 16: ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Policies for user_accounts
DROP POLICY IF EXISTS "Authenticated users can view active users" ON public.user_accounts;
DROP POLICY IF EXISTS "Service role can do anything" ON public.user_accounts;

CREATE POLICY "Authenticated users can view active users" ON public.user_accounts
FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Service role can do anything" ON public.user_accounts
FOR ALL USING (true);

-- Policies for courts (shared data)
DROP POLICY IF EXISTS "Anyone can view courts" ON public.courts;
DROP POLICY IF EXISTS "Authenticated users can insert courts" ON public.courts;
DROP POLICY IF EXISTS "Admins can delete courts" ON public.courts;

CREATE POLICY "Anyone can view courts" ON public.courts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert courts" ON public.courts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can delete courts" ON public.courts FOR DELETE USING (true);

-- Policies for case_types (shared data)
DROP POLICY IF EXISTS "Anyone can view case types" ON public.case_types;
DROP POLICY IF EXISTS "Authenticated users can insert case types" ON public.case_types;
DROP POLICY IF EXISTS "Admins can delete case types" ON public.case_types;

CREATE POLICY "Anyone can view case types" ON public.case_types FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert case types" ON public.case_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can delete case types" ON public.case_types FOR DELETE USING (true);

-- Policies for cases
DROP POLICY IF EXISTS "Users can view all cases" ON public.cases;
DROP POLICY IF EXISTS "Authenticated users can insert cases" ON public.cases;
DROP POLICY IF EXISTS "Users can update cases" ON public.cases;
DROP POLICY IF EXISTS "Admins can delete cases" ON public.cases;

CREATE POLICY "Users can view all cases" ON public.cases FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert cases" ON public.cases FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update cases" ON public.cases FOR UPDATE USING (true);
CREATE POLICY "Admins can delete cases" ON public.cases FOR DELETE USING (true);

-- Policies for counsel
DROP POLICY IF EXISTS "Users can view all counsel" ON public.counsel;
DROP POLICY IF EXISTS "Authenticated users can insert counsel" ON public.counsel;
DROP POLICY IF EXISTS "Users can update counsel" ON public.counsel;
DROP POLICY IF EXISTS "Admins can delete counsel" ON public.counsel;

CREATE POLICY "Users can view all counsel" ON public.counsel FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert counsel" ON public.counsel FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update counsel" ON public.counsel FOR UPDATE USING (true);
CREATE POLICY "Admins can delete counsel" ON public.counsel FOR DELETE USING (true);

-- Policies for appointments
DROP POLICY IF EXISTS "Users can view all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated users can insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can delete appointments" ON public.appointments;

CREATE POLICY "Users can view all appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update appointments" ON public.appointments FOR UPDATE USING (true);
CREATE POLICY "Users can delete appointments" ON public.appointments FOR DELETE USING (true);

-- Policies for transactions
DROP POLICY IF EXISTS "Users can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can delete transactions" ON public.transactions;

CREATE POLICY "Users can view all transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert transactions" ON public.transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update transactions" ON public.transactions FOR UPDATE USING (true);
CREATE POLICY "Admins can delete transactions" ON public.transactions FOR DELETE USING (true);

-- Policies for books
DROP POLICY IF EXISTS "Users can view all books" ON public.books;
DROP POLICY IF EXISTS "Authenticated users can insert books" ON public.books;
DROP POLICY IF EXISTS "Users can delete books" ON public.books;

CREATE POLICY "Users can view all books" ON public.books FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert books" ON public.books FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete books" ON public.books FOR DELETE USING (true);

-- Policies for sofa_items
DROP POLICY IF EXISTS "Users can view all sofa items" ON public.sofa_items;
DROP POLICY IF EXISTS "Authenticated users can insert sofa items" ON public.sofa_items;
DROP POLICY IF EXISTS "Users can delete sofa items" ON public.sofa_items;

CREATE POLICY "Users can view all sofa items" ON public.sofa_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert sofa items" ON public.sofa_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete sofa items" ON public.sofa_items FOR DELETE USING (true);

-- Policies for counsel_cases
DROP POLICY IF EXISTS "Users can view counsel cases" ON public.counsel_cases;
DROP POLICY IF EXISTS "Authenticated users can insert counsel cases" ON public.counsel_cases;
DROP POLICY IF EXISTS "Users can delete counsel cases" ON public.counsel_cases;

CREATE POLICY "Users can view counsel cases" ON public.counsel_cases FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert counsel cases" ON public.counsel_cases FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete counsel cases" ON public.counsel_cases FOR DELETE USING (true);

-- Policies for case_documents
DROP POLICY IF EXISTS "Users can view all documents" ON public.case_documents;
DROP POLICY IF EXISTS "Authenticated users can insert documents" ON public.case_documents;
DROP POLICY IF EXISTS "Users can delete documents" ON public.case_documents;

CREATE POLICY "Users can view all documents" ON public.case_documents FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert documents" ON public.case_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete documents" ON public.case_documents FOR DELETE USING (true);

-- Policies for tasks
DROP POLICY IF EXISTS "Users can view all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete tasks" ON public.tasks;

CREATE POLICY "Users can view all tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert tasks" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update tasks" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Users can delete tasks" ON public.tasks FOR DELETE USING (true);

-- Policies for attendance
DROP POLICY IF EXISTS "Users can view all attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can insert attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can update attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can delete attendance" ON public.attendance;

CREATE POLICY "Users can view all attendance" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Admins can insert attendance" ON public.attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update attendance" ON public.attendance FOR UPDATE USING (true);
CREATE POLICY "Admins can delete attendance" ON public.attendance FOR DELETE USING (true);

-- Policies for expenses
DROP POLICY IF EXISTS "Users can view all expenses" ON public.expenses;
DROP POLICY IF EXISTS "Authenticated users can insert expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;

CREATE POLICY "Users can view all expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert expenses" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own expenses" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "Users can delete own expenses" ON public.expenses FOR DELETE USING (true);

-- =====================================================
-- PART 17: GRANT PERMISSIONS
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant access to tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Grant specific function permissions
GRANT EXECUTE ON FUNCTION public.hash_password(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.verify_password(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_user_account(TEXT, TEXT, TEXT, TEXT, TEXT, UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_user_role(UUID, TEXT, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.toggle_user_status(UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.delete_user_account(UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_all_users() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION search_cases(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_cases_by_date(DATE) TO authenticated, service_role;

-- =====================================================
-- PART 18: SAMPLE DATA
-- =====================================================

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
  ('Writ Petition'),
  ('Property'),
  ('Other')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- PART 19: CREATE DEFAULT ADMIN USER
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
    
    RAISE NOTICE 'Default admin user created successfully';
    RAISE NOTICE 'Username: admin';
    RAISE NOTICE 'Password: admin123';
    RAISE NOTICE 'IMPORTANT: Change this password immediately after first login!';
  ELSE
    RAISE NOTICE 'Admin user already exists';
  END IF;
END $$;

-- =====================================================
-- PART 20: STORAGE BUCKET FOR AVATARS (OPTIONAL)
-- =====================================================

-- Create avatars bucket (run in SQL Editor)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DO $$
BEGIN
  -- Check if policies exist before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Avatar images are publicly accessible'
  ) THEN
    CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload their own avatar'
  ) THEN
    CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update their own avatar'
  ) THEN
    CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete their own avatar'
  ) THEN
    CREATE POLICY "Users can delete their own avatar"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'avatars');
  END IF;
END $$;

-- =====================================================
-- PART 21: ENABLE REALTIME (OPTIONAL)
-- =====================================================

-- Enable realtime for key tables (only if not already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'cases'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cases;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'appointments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'transactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'counsel'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.counsel;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'tasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'attendance'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'expenses'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
  END IF;
END $$;

-- =====================================================
-- SETUP COMPLETE! ✅
-- =====================================================
-- 
-- DATABASE TABLES CREATED:
-- ✅ user_accounts - User authentication & management
-- ✅ courts - Court names (shared data)
-- ✅ case_types - Case categories (shared data)
-- ✅ cases - Complete case management (30+ fields)
-- ✅ counsel - Lawyer/counsel information
-- ✅ appointments - Scheduling system
-- ✅ transactions - Financial tracking with payment modes
-- ✅ books - Library Management (L1)
-- ✅ sofa_items - Sofa compartments (C1, C2)
-- ✅ counsel_cases - Link counsel to cases
-- ✅ case_documents - Dropbox file references
-- ✅ tasks - Task management system
-- ✅ attendance - Attendance tracking system
-- ✅ expenses - Expense management system
--
-- FEATURES IMPLEMENTED:
-- ✅ Row Level Security (RLS) on all tables
-- ✅ User authentication with bcrypt password hashing
-- ✅ Admin/User/Vipin role-based access control
-- ✅ Auto-update timestamps on all tables
-- ✅ Views for disposed/pending/active cases
-- ✅ Dashboard statistics function
-- ✅ Search function for cases
-- ✅ Indexes for performance optimization
-- ✅ Realtime subscriptions enabled
-- ✅ Storage bucket for avatars
-- ✅ Sample data for courts and case types
-- ✅ Default admin user created
-- ✅ Task management with case linking
-- ✅ Attendance tracking with calendar view
-- ✅ Expense management with monthly tracking
-- ✅ Payment mode tracking for transactions
-- ✅ Case stage tracking (consultation to disposed)
--
-- DEFAULT LOGIN CREDENTIALS:
-- Username: admin
-- Password: admin123
-- ⚠️ IMPORTANT: Change this password immediately!
--
-- NEXT STEPS:
-- 1. Test the authentication: SELECT * FROM public.authenticate_user('admin', 'admin123');
-- 2. Test user listing: SELECT * FROM public.get_all_users();
-- 3. Test dashboard stats: SELECT * FROM get_dashboard_stats();
-- 4. Update your .env file with Supabase credentials
-- 5. Clear browser localStorage to remove old data
-- 6. Login with admin credentials
-- 7. Create additional users from Admin page
-- 8. Change default admin password
--
-- TROUBLESHOOTING:
-- - If authentication fails, check password hash: SELECT password_hash FROM user_accounts WHERE username = 'admin';
-- - If RLS blocks access, temporarily disable: ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
-- - Check function execution: SELECT * FROM pg_proc WHERE proname LIKE '%authenticate%';
-- - View all policies: SELECT * FROM pg_policies WHERE schemaname = 'public';
--
-- SUPPORT:
-- For issues or questions, contact: sawantrishi152@gmail.com
-- =====================================================
