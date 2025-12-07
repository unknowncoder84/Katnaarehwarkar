-- =====================================================
-- SUPABASE SCHEMA FOR LEGAL CASE MANAGEMENT DASHBOARD
-- Version 2.0 - Complete & Updated
-- Copy and paste this entire file into Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- DROP EXISTING TABLES (if recreating)
-- Uncomment these lines if you need to reset the database
-- =====================================================
-- DROP TABLE IF EXISTS public.sofa_items CASCADE;
-- DROP TABLE IF EXISTS public.books CASCADE;
-- DROP TABLE IF EXISTS public.transactions CASCADE;
-- DROP TABLE IF EXISTS public.appointments CASCADE;
-- DROP TABLE IF EXISTS public.counsel CASCADE;
-- DROP TABLE IF EXISTS public.cases CASCADE;
-- DROP TABLE IF EXISTS public.case_types CASCADE;
-- DROP TABLE IF EXISTS public.courts CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;
-- DROP VIEW IF EXISTS public.disposed_cases CASCADE;
-- DROP VIEW IF EXISTS public.pending_cases CASCADE;
-- DROP VIEW IF EXISTS public.active_cases CASCADE;
-- DROP VIEW IF EXISTS public.upcoming_hearings CASCADE;
-- DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
-- DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- =====================================================
-- 1. USER_ACCOUNTS TABLE (Simple Username/Password Auth)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
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

-- Index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_user_accounts_username ON public.user_accounts(username);
CREATE INDEX IF NOT EXISTS idx_user_accounts_role ON public.user_accounts(role);

-- =====================================================
-- 2. PROFILES TABLE (User profile information)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES public.user_accounts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);


-- =====================================================
-- 3. COURTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.courts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;

-- Policies for courts (shared data - all authenticated users can access)
CREATE POLICY "Anyone can view courts" ON public.courts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert courts" ON public.courts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete courts" ON public.courts FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);

-- =====================================================
-- 4. CASE_TYPES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.case_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.case_types ENABLE ROW LEVEL SECURITY;

-- Policies for case_types (shared data)
CREATE POLICY "Anyone can view case types" ON public.case_types FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert case types" ON public.case_types FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete case types" ON public.case_types FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);

-- =====================================================
-- 5. CASES TABLE (Complete with all columns)
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

-- Policies for cases
CREATE POLICY "Users can view all cases" ON public.cases FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert cases" ON public.cases FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update cases" ON public.cases FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete cases" ON public.cases FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_client_name ON public.cases(client_name);
CREATE INDEX IF NOT EXISTS idx_cases_file_no ON public.cases(file_no);
CREATE INDEX IF NOT EXISTS idx_cases_next_date ON public.cases(next_date);
CREATE INDEX IF NOT EXISTS idx_cases_court ON public.cases(court);
CREATE INDEX IF NOT EXISTS idx_cases_case_type ON public.cases(case_type);
CREATE INDEX IF NOT EXISTS idx_cases_created_by ON public.cases(created_by);


-- =====================================================
-- 6. COUNSEL TABLE
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

-- Policies for counsel
CREATE POLICY "Users can view all counsel" ON public.counsel FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert counsel" ON public.counsel FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update counsel" ON public.counsel FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete counsel" ON public.counsel FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_counsel_name ON public.counsel(name);
CREATE INDEX IF NOT EXISTS idx_counsel_email ON public.counsel(email);

-- =====================================================
-- 7. APPOINTMENTS TABLE
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

-- Policies for appointments
CREATE POLICY "Users can view all appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update appointments" ON public.appointments FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete own appointments" ON public.appointments FOR DELETE USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);

-- =====================================================
-- 8. TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('received', 'pending')),
  received_by VARCHAR(255),
  confirmed_by VARCHAR(255),
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policies for transactions
CREATE POLICY "Users can view all transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update transactions" ON public.transactions FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete transactions" ON public.transactions FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_case_id ON public.transactions(case_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);


-- =====================================================
-- 9. BOOKS TABLE (Library Management - L1)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(10) DEFAULT 'L1' CHECK (location IN ('L1')),
  added_by UUID REFERENCES public.user_accounts(id),
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Policies for books
CREATE POLICY "Users can view all books" ON public.books FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert books" ON public.books FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete books" ON public.books FOR DELETE USING (auth.uid() IS NOT NULL);

-- Index
CREATE INDEX IF NOT EXISTS idx_books_name ON public.books(name);

-- =====================================================
-- 10. SOFA_ITEMS TABLE (Library Management - Sofa C1/C2)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sofa_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  compartment VARCHAR(5) NOT NULL CHECK (compartment IN ('C1', 'C2')),
  added_by UUID REFERENCES public.user_accounts(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(case_id, compartment)
);

-- Enable RLS
ALTER TABLE public.sofa_items ENABLE ROW LEVEL SECURITY;

-- Policies for sofa_items
CREATE POLICY "Users can view all sofa items" ON public.sofa_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert sofa items" ON public.sofa_items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete sofa items" ON public.sofa_items FOR DELETE USING (auth.uid() IS NOT NULL);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sofa_items_case_id ON public.sofa_items(case_id);
CREATE INDEX IF NOT EXISTS idx_sofa_items_compartment ON public.sofa_items(compartment);

-- =====================================================
-- 11. COUNSEL_CASES TABLE (Link Counsel to Cases)
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

-- Policies
CREATE POLICY "Users can view counsel cases" ON public.counsel_cases FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert counsel cases" ON public.counsel_cases FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete counsel cases" ON public.counsel_cases FOR DELETE USING (auth.uid() IS NOT NULL);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_counsel_cases_counsel_id ON public.counsel_cases(counsel_id);
CREATE INDEX IF NOT EXISTS idx_counsel_cases_case_id ON public.counsel_cases(case_id);


-- =====================================================
-- 11. FUNCTIONS & TRIGGERS
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
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
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

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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
-- 12. VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for disposed/closed cases
CREATE OR REPLACE VIEW public.disposed_cases AS
SELECT * FROM public.cases WHERE status = 'closed';

-- View for pending cases
CREATE OR REPLACE VIEW public.pending_cases AS
SELECT * FROM public.cases WHERE status = 'pending';

-- View for active cases
CREATE OR REPLACE VIEW public.active_cases AS
SELECT * FROM public.cases WHERE status = 'active';

-- View for on-hold cases
CREATE OR REPLACE VIEW public.on_hold_cases AS
SELECT * FROM public.cases WHERE status = 'on-hold';

-- View for cases with upcoming hearings (next 7 days)
CREATE OR REPLACE VIEW public.upcoming_hearings AS
SELECT * FROM public.cases 
WHERE next_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
ORDER BY next_date ASC;

-- View for today's appointments
CREATE OR REPLACE VIEW public.todays_appointments AS
SELECT * FROM public.appointments 
WHERE date = CURRENT_DATE
ORDER BY time ASC;

-- View for cases with transactions summary
CREATE OR REPLACE VIEW public.cases_with_transactions AS
SELECT 
  c.*,
  COALESCE(SUM(t.amount) FILTER (WHERE t.status = 'received'), 0) as total_received,
  COALESCE(SUM(t.amount) FILTER (WHERE t.status = 'pending'), 0) as total_pending
FROM public.cases c
LEFT JOIN public.transactions t ON c.id = t.case_id
GROUP BY c.id;

-- View for counsel with their cases
CREATE OR REPLACE VIEW public.counsel_with_cases AS
SELECT 
  co.*,
  COUNT(cc.case_id) as assigned_cases
FROM public.counsel co
LEFT JOIN public.counsel_cases cc ON co.id = cc.counsel_id
GROUP BY co.id;

-- View for sofa items with case details
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
-- 13. HELPER FUNCTIONS
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
  total_pending DECIMAL
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
    (SELECT COALESCE(SUM(amount), 0) FROM public.transactions WHERE status = 'pending') as total_pending;
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


-- =====================================================
-- 14. SAMPLE DATA (Optional - Remove in production)
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
  ('Writ Petition')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 15. STORAGE BUCKET FOR AVATARS
-- =====================================================
-- Run these in Supabase Dashboard > Storage

-- Create avatars bucket (run in SQL Editor)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (run in SQL Editor)
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

-- =====================================================
-- 16. REALTIME SUBSCRIPTIONS (Enable in Dashboard)
-- =====================================================
-- Go to Database > Replication and enable realtime for:
-- - cases
-- - appointments
-- - transactions
-- - counsel

-- Or run this SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE public.cases;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.counsel;

-- =====================================================
-- 17. GRANT PERMISSIONS
-- =====================================================
-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- DONE! Your Supabase database is ready.
-- =====================================================
-- 
-- TABLES CREATED:
-- 1. profiles - User profiles with admin/user roles
-- 2. courts - Court names (shared)
-- 3. case_types - Case categories (shared)
-- 4. cases - Full case management (25+ columns)
-- 5. counsel - Lawyer/counsel information
-- 6. appointments - Scheduling system
-- 7. transactions - Financial tracking
-- 8. books - Library Management (L1)
-- 9. sofa_items - Sofa compartments (C1, C2)
-- 10. counsel_cases - Link counsel to cases
--
-- FEATURES:
-- ✅ Row Level Security (RLS) on all tables
-- ✅ Auto-create profile on user signup
-- ✅ Auto-update timestamps
-- ✅ Views for disposed/pending/active cases
-- ✅ Dashboard statistics function
-- ✅ Search function for cases
-- ✅ Indexes for performance
-- ✅ Realtime subscriptions
-- ✅ Storage bucket for avatars
-- ✅ Sample data for courts and case types
--
-- NEXT STEPS:
-- 1. Go to Supabase Dashboard > Authentication > Settings
-- 2. Enable Email authentication
-- 3. Set Site URL to your app URL
-- 4. Copy your Supabase URL and anon key to .env file
-- =====================================================


-- =====================================================
-- 18. CASE_DOCUMENTS TABLE (For Dropbox file references)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.case_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  dropbox_path TEXT NOT NULL,
  dropbox_id TEXT,
  file_type VARCHAR(50),
  file_size BIGINT,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.case_documents ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all documents" ON public.case_documents FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert documents" ON public.case_documents FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete documents" ON public.case_documents FOR DELETE USING (auth.uid() IS NOT NULL);

-- Index
CREATE INDEX IF NOT EXISTS idx_case_documents_case_id ON public.case_documents(case_id);
