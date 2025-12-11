-- =====================================================
-- COMPLETE DATABASE SETUP - FRESH START
-- =====================================================
-- Run this SINGLE file in Supabase SQL Editor
-- It replaces all 9 previous queries with one clean setup
-- =====================================================

-- =====================================================
-- PART 1: CLEANUP - Drop all existing objects
-- =====================================================

-- Drop all views first (they depend on tables)
DROP VIEW IF EXISTS cases_with_document_counts CASCADE;

-- Drop all tables (CASCADE removes dependencies)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS case_documents CASCADE;
DROP TABLE IF EXISTS case_notes CASCADE;
DROP TABLE IF EXISTS case_timeline CASCADE;
DROP TABLE IF EXISTS case_reminders CASCADE;
DROP TABLE IF EXISTS payment_plans CASCADE;
DROP TABLE IF EXISTS client_communications CASCADE;
DROP TABLE IF EXISTS sofa_items CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS library_items CASCADE;
DROP TABLE IF EXISTS storage_items CASCADE;
DROP TABLE IF EXISTS library_locations CASCADE;
DROP TABLE IF EXISTS storage_locations CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS counsel CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS courts CASCADE;
DROP TABLE IF EXISTS case_types CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS get_dashboard_stats() CASCADE;
DROP FUNCTION IF EXISTS create_notification_for_all(TEXT, TEXT, TEXT, TEXT, UUID, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS mark_notification_read(UUID) CASCADE;
DROP FUNCTION IF EXISTS mark_all_notifications_read(UUID) CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- =====================================================
-- PART 2: CREATE PROFILES TABLE (for user management)
-- =====================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'staff')),
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Enable insert for authenticated users" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- PART 3: CREATE CORE TABLES
-- =====================================================

-- Courts table
CREATE TABLE courts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view courts" ON courts FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage courts" ON courts FOR ALL USING (auth.uid() IS NOT NULL);

-- Case Types table
CREATE TABLE case_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE case_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view case_types" ON case_types FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage case_types" ON case_types FOR ALL USING (auth.uid() IS NOT NULL);

-- Counsel table
CREATE TABLE counsel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    specialization TEXT,
    address TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE counsel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view counsel" ON counsel FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage counsel" ON counsel FOR ALL USING (auth.uid() IS NOT NULL);

-- Cases table (TEXT for all date fields to avoid parsing issues)
CREATE TABLE cases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    file_no TEXT NOT NULL,
    client_name TEXT NOT NULL,
    parties_name TEXT,
    court TEXT,
    case_type TEXT,
    case_no TEXT,
    year TEXT,
    stage TEXT,
    next_date TEXT,
    prev_date TEXT,
    filing_date TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'closed', 'disposed')),
    counsel_id UUID REFERENCES counsel(id) ON DELETE SET NULL,
    counsel_name TEXT,
    counsel_phone TEXT,
    additional_details TEXT,
    client_phone TEXT,
    client_email TEXT,
    client_address TEXT,
    opposing_party TEXT,
    opposing_counsel TEXT,
    judge_name TEXT,
    court_room TEXT,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view cases" ON cases FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage cases" ON cases FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- PART 4: CREATE APPOINTMENTS TABLE
-- =====================================================

CREATE TABLE appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    user_name TEXT,
    client TEXT,
    details TEXT NOT NULL,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view appointments" ON appointments FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage appointments" ON appointments FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- PART 5: CREATE FINANCIAL TABLES
-- =====================================================

CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    payment_mode TEXT,
    date TEXT,
    receipt_no TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage transactions" ON transactions FOR ALL USING (auth.uid() IS NOT NULL);

CREATE TABLE expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    category TEXT,
    month TEXT,
    date TEXT,
    receipt_no TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view expenses" ON expenses FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage expenses" ON expenses FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- PART 6: CREATE TASK & ATTENDANCE TABLES
-- =====================================================

CREATE TABLE tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES auth.users(id),
    assigned_to_name TEXT,
    deadline TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage tasks" ON tasks FOR ALL USING (auth.uid() IS NOT NULL);

CREATE TABLE attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    user_name TEXT,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'half_day', 'leave')),
    check_in TIME,
    check_out TIME,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view attendance" ON attendance FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage attendance" ON attendance FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- PART 7: CREATE LIBRARY & STORAGE TABLES
-- =====================================================

CREATE TABLE library_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE library_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view library_locations" ON library_locations FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage library_locations" ON library_locations FOR ALL USING (auth.uid() IS NOT NULL);

CREATE TABLE storage_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE storage_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view storage_locations" ON storage_locations FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage storage_locations" ON storage_locations FOR ALL USING (auth.uid() IS NOT NULL);

CREATE TABLE books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    author TEXT,
    isbn TEXT,
    location_id UUID REFERENCES library_locations(id) ON DELETE SET NULL,
    added_by UUID REFERENCES auth.users(id),
    added_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view books" ON books FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage books" ON books FOR ALL USING (auth.uid() IS NOT NULL);

CREATE TABLE sofa_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    compartment TEXT NOT NULL CHECK (compartment IN ('C1', 'C2')),
    added_by UUID REFERENCES auth.users(id),
    added_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sofa_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view sofa_items" ON sofa_items FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage sofa_items" ON sofa_items FOR ALL USING (auth.uid() IS NOT NULL);

CREATE TABLE library_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    location_id UUID REFERENCES library_locations(id) ON DELETE SET NULL,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    added_by UUID REFERENCES auth.users(id),
    added_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view library_items" ON library_items FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage library_items" ON library_items FOR ALL USING (auth.uid() IS NOT NULL);

CREATE TABLE storage_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    location_id UUID REFERENCES storage_locations(id) ON DELETE SET NULL,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    added_by UUID REFERENCES auth.users(id),
    added_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE storage_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view storage_items" ON storage_items FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage storage_items" ON storage_items FOR ALL USING (auth.uid() IS NOT NULL);


-- =====================================================
-- PART 8: CREATE CASE DOCUMENTS & NOTES TABLES
-- =====================================================

CREATE TABLE case_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_path TEXT,
    file_type TEXT,
    file_size INTEGER,
    description TEXT,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view case_documents" ON case_documents FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage case_documents" ON case_documents FOR ALL USING (auth.uid() IS NOT NULL);

CREATE TABLE case_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_by_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE case_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view case_notes" ON case_notes FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage case_notes" ON case_notes FOR ALL USING (auth.uid() IS NOT NULL);

CREATE TABLE case_timeline (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_date TEXT,
    description TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE case_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view case_timeline" ON case_timeline FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage case_timeline" ON case_timeline FOR ALL USING (auth.uid() IS NOT NULL);

CREATE TABLE case_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    reminder_date TEXT NOT NULL,
    reminder_time TEXT,
    message TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE case_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view case_reminders" ON case_reminders FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage case_reminders" ON case_reminders FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- PART 9: CREATE NOTIFICATIONS TABLE & FUNCTIONS
-- =====================================================

CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '🔔',
    is_read BOOLEAN DEFAULT FALSE,
    related_id UUID,
    created_by UUID REFERENCES auth.users(id),
    created_by_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications 
    FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Authenticated can create notifications" ON notifications 
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own notifications" ON notifications 
    FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Users can delete own notifications" ON notifications 
    FOR DELETE USING (user_id = auth.uid() OR user_id IS NULL);

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE notifications SET is_read = TRUE WHERE id = p_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE notifications SET is_read = TRUE 
    WHERE (user_id = p_user_id OR user_id IS NULL) AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification for all users
CREATE OR REPLACE FUNCTION create_notification_for_all(
    p_type TEXT,
    p_title TEXT,
    p_description TEXT,
    p_icon TEXT DEFAULT '🔔',
    p_related_id UUID DEFAULT NULL,
    p_created_by UUID DEFAULT NULL,
    p_created_by_name TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO notifications (user_id, type, title, description, icon, related_id, created_by, created_by_name)
    SELECT id, p_type, p_title, p_description, p_icon, p_related_id, p_created_by, p_created_by_name
    FROM profiles;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 10: CREATE VIEW FOR CASES WITH DOCUMENT COUNTS
-- =====================================================

CREATE OR REPLACE VIEW cases_with_document_counts AS
SELECT 
    c.*,
    COALESCE(d.doc_count, 0) as document_count
FROM cases c
LEFT JOIN (
    SELECT case_id, COUNT(*) as doc_count 
    FROM case_documents 
    GROUP BY case_id
) d ON c.id = d.case_id;

-- =====================================================
-- PART 11: CREATE DASHBOARD STATS FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_cases', (SELECT COUNT(*) FROM cases),
        'active_cases', (SELECT COUNT(*) FROM cases WHERE status = 'active'),
        'pending_cases', (SELECT COUNT(*) FROM cases WHERE status = 'pending'),
        'closed_cases', (SELECT COUNT(*) FROM cases WHERE status = 'closed'),
        'total_counsel', (SELECT COUNT(*) FROM counsel),
        'upcoming_appointments', (SELECT COUNT(*) FROM appointments WHERE date >= CURRENT_DATE),
        'pending_tasks', (SELECT COUNT(*) FROM tasks WHERE status = 'pending'),
        'total_income', (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'income'),
        'total_expenses', (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'expense')
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 12: INSERT DEFAULT DATA
-- =====================================================

-- Insert default courts
INSERT INTO courts (name) VALUES 
    ('High Court'),
    ('District Court'),
    ('Commercial Court'),
    ('Supreme Court'),
    ('Family Court'),
    ('Sessions Court'),
    ('Magistrate Court'),
    ('Civil Court'),
    ('Consumer Court'),
    ('Labour Court')
ON CONFLICT (name) DO NOTHING;

-- Insert default case types
INSERT INTO case_types (name) VALUES 
    ('Civil'),
    ('Criminal'),
    ('Commercial'),
    ('Family'),
    ('Labour'),
    ('Tax'),
    ('Constitutional'),
    ('Writ'),
    ('Appeal'),
    ('Revision'),
    ('Arbitration'),
    ('Consumer')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- PART 13: ENABLE REALTIME FOR ALL TABLES
-- =====================================================

DO $$
DECLARE
    tables TEXT[] := ARRAY[
        'profiles', 'cases', 'counsel', 'appointments', 'transactions',
        'tasks', 'attendance', 'expenses', 'books', 'sofa_items',
        'library_locations', 'storage_locations', 'library_items', 'storage_items',
        'case_documents', 'case_notes', 'case_timeline', 'case_reminders', 'notifications'
    ];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY tables LOOP
        BEGIN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', t);
        EXCEPTION WHEN duplicate_object THEN
            -- Table already in publication, ignore
        END;
    END LOOP;
END $$;

-- =====================================================
-- PART 14: CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_next_date ON cases(next_date);
CREATE INDEX IF NOT EXISTS idx_cases_client_name ON cases(client_name);
CREATE INDEX IF NOT EXISTS idx_cases_file_no ON cases(file_no);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_transactions_case_id ON transactions(case_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance(user_id, date);

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Your database is now ready for production use.
-- 
-- Next steps:
-- 1. Create your first admin user in Supabase Auth
-- 2. Update their role to 'admin' in the profiles table
-- 3. Deploy your app to Netlify with environment variables
-- =====================================================
