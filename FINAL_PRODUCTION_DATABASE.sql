-- =====================================================
-- KATNESHWARKAR LEGAL MANAGEMENT - COMPLETE DATABASE
-- =====================================================
-- This is the FINAL, COMPLETE SQL for your production app
-- Run this ONCE in Supabase SQL Editor
-- It covers ALL features: Cases, Appointments, Tasks, 
-- Finance, Library, Storage, Notifications, etc.
-- =====================================================

-- =====================================================
-- STEP 1: CLEANUP - Remove all existing objects
-- =====================================================

-- Drop all views first
DROP VIEW IF EXISTS cases_with_document_counts CASCADE;

-- Drop all tables in correct order (dependencies first)
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

-- Drop all functions
DROP FUNCTION IF EXISTS get_dashboard_stats() CASCADE;
DROP FUNCTION IF EXISTS create_notification_for_all(TEXT, TEXT, TEXT, TEXT, UUID, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS mark_notification_read(UUID) CASCADE;
DROP FUNCTION IF EXISTS mark_all_notifications_read(UUID) CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- =====================================================
-- STEP 2: PROFILES TABLE (User Management)
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
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on user signup
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- STEP 3: COURTS & CASE TYPES (Lookup Tables)
-- =====================================================

CREATE TABLE courts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "courts_all" ON courts FOR ALL USING (true);

CREATE TABLE case_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE case_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "case_types_all" ON case_types FOR ALL USING (true);

-- =====================================================
-- STEP 4: COUNSEL TABLE (Lawyers/Advocates)
-- =====================================================

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
CREATE POLICY "counsel_all" ON counsel FOR ALL USING (true);

-- =====================================================
-- STEP 5: CASES TABLE (Main Legal Cases)
-- =====================================================

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
CREATE POLICY "cases_all" ON cases FOR ALL USING (true);

-- =====================================================
-- STEP 6: APPOINTMENTS TABLE
-- =====================================================

CREATE TABLE appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    time TEXT,
    user_id UUID REFERENCES auth.users(id),
    user_name TEXT,
    client TEXT,
    details TEXT,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "appointments_all" ON appointments FOR ALL USING (true);

-- =====================================================
-- STEP 7: TRANSACTIONS TABLE (Payments/Finance)
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
CREATE POLICY "transactions_all" ON transactions FOR ALL USING (true);

-- =====================================================
-- STEP 8: EXPENSES TABLE (Office Expenses)
-- =====================================================

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
CREATE POLICY "expenses_all" ON expenses FOR ALL USING (true);

-- =====================================================
-- STEP 9: TASKS TABLE (Task Management)
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
CREATE POLICY "tasks_all" ON tasks FOR ALL USING (true);

-- =====================================================
-- STEP 10: ATTENDANCE TABLE
-- =====================================================

CREATE TABLE attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    user_name TEXT,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'half_day', 'leave')),
    check_in TIME,
    check_out TIME,
    notes TEXT,
    marked_by UUID REFERENCES auth.users(id),
    marked_by_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attendance_all" ON attendance FOR ALL USING (true);


-- =====================================================
-- STEP 11: LIBRARY & STORAGE LOCATIONS
-- =====================================================

CREATE TABLE library_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE library_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "library_locations_all" ON library_locations FOR ALL USING (true);

CREATE TABLE storage_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE storage_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "storage_locations_all" ON storage_locations FOR ALL USING (true);

-- =====================================================
-- STEP 12: BOOKS TABLE (Library Books)
-- =====================================================

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
CREATE POLICY "books_all" ON books FOR ALL USING (true);

-- =====================================================
-- STEP 13: SOFA ITEMS (Case Files in Compartments)
-- =====================================================

CREATE TABLE sofa_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    compartment TEXT NOT NULL CHECK (compartment IN ('C1', 'C2')),
    added_by UUID REFERENCES auth.users(id),
    added_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sofa_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sofa_items_all" ON sofa_items FOR ALL USING (true);

-- =====================================================
-- STEP 14: LIBRARY & STORAGE ITEMS
-- =====================================================

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
CREATE POLICY "library_items_all" ON library_items FOR ALL USING (true);

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
CREATE POLICY "storage_items_all" ON storage_items FOR ALL USING (true);

-- =====================================================
-- STEP 15: CASE DOCUMENTS (File Uploads)
-- =====================================================

CREATE TABLE case_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_path TEXT,
    file_url TEXT,
    file_type TEXT,
    file_size INTEGER,
    description TEXT,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "case_documents_all" ON case_documents FOR ALL USING (true);

-- =====================================================
-- STEP 16: CASE NOTES
-- =====================================================

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
CREATE POLICY "case_notes_all" ON case_notes FOR ALL USING (true);

-- =====================================================
-- STEP 17: CASE TIMELINE (History/Events)
-- =====================================================

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
CREATE POLICY "case_timeline_all" ON case_timeline FOR ALL USING (true);

-- =====================================================
-- STEP 18: CASE REMINDERS
-- =====================================================

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
CREATE POLICY "case_reminders_all" ON case_reminders FOR ALL USING (true);

-- =====================================================
-- STEP 19: NOTIFICATIONS
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
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "notifications_delete" ON notifications FOR DELETE USING (user_id = auth.uid() OR user_id IS NULL);

-- =====================================================
-- STEP 20: NOTIFICATION HELPER FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE notifications SET is_read = TRUE WHERE id = p_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE notifications SET is_read = TRUE 
    WHERE (user_id = p_user_id OR user_id IS NULL) AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
-- STEP 21: DASHBOARD STATS FUNCTION
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
        'disposed_cases', (SELECT COUNT(*) FROM cases WHERE status = 'disposed'),
        'total_counsel', (SELECT COUNT(*) FROM counsel),
        'upcoming_appointments', (SELECT COUNT(*) FROM appointments WHERE date >= CURRENT_DATE),
        'pending_tasks', (SELECT COUNT(*) FROM tasks WHERE status = 'pending'),
        'total_income', (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'income'),
        'total_expenses', (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'expense'),
        'total_books', (SELECT COUNT(*) FROM books),
        'total_library_locations', (SELECT COUNT(*) FROM library_locations),
        'total_storage_locations', (SELECT COUNT(*) FROM storage_locations)
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 22: VIEW FOR CASES WITH DOCUMENT COUNTS
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
-- STEP 23: INSERT DEFAULT DATA
-- =====================================================

-- Default Courts
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
    ('Labour Court'),
    ('Tribunal'),
    ('Appellate Court')
ON CONFLICT (name) DO NOTHING;

-- Default Case Types
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
    ('Consumer'),
    ('Motor Accident'),
    ('Land Dispute'),
    ('Matrimonial')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- STEP 24: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_next_date ON cases(next_date);
CREATE INDEX IF NOT EXISTS idx_cases_client_name ON cases(client_name);
CREATE INDEX IF NOT EXISTS idx_cases_file_no ON cases(file_no);
CREATE INDEX IF NOT EXISTS idx_cases_created_by ON cases(created_by);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_transactions_case_id ON transactions(case_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_expenses_month ON expenses(month);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance(user_id, date);
CREATE INDEX IF NOT EXISTS idx_case_documents_case_id ON case_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_case_notes_case_id ON case_notes(case_id);

-- =====================================================
-- STEP 25: ENABLE REALTIME FOR ALL TABLES
-- =====================================================

DO $$
DECLARE
    tables TEXT[] := ARRAY[
        'profiles', 'cases', 'counsel', 'appointments', 'transactions',
        'tasks', 'attendance', 'expenses', 'books', 'sofa_items',
        'library_locations', 'storage_locations', 'library_items', 'storage_items',
        'case_documents', 'case_notes', 'case_timeline', 'case_reminders', 
        'notifications', 'courts', 'case_types'
    ];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY tables LOOP
        BEGIN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', t);
        EXCEPTION WHEN duplicate_object THEN
            -- Already added, ignore
        END;
    END LOOP;
END $$;

-- =====================================================
-- STEP 26: STORAGE BUCKET FOR FILE UPLOADS
-- =====================================================

-- Create storage bucket for case documents (run separately if needed)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('case-documents', 'case-documents', true)
-- ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Your database is now ready for production.
-- 
-- Features Supported:
-- ✅ User Authentication & Profiles
-- ✅ Cases (Create, Edit, Delete, Search)
-- ✅ Appointments (Create, Edit, Delete)
-- ✅ Counsel/Lawyers Management
-- ✅ Financial Transactions (Income/Expense)
-- ✅ Office Expenses Tracking
-- ✅ Task Management with Assignments
-- ✅ Staff Attendance
-- ✅ Library Management (Books, Locations)
-- ✅ Storage Management (Locations, Items)
-- ✅ Sofa Compartments (C1, C2)
-- ✅ Case Documents Upload
-- ✅ Case Notes
-- ✅ Case Timeline/History
-- ✅ Case Reminders
-- ✅ Notifications System
-- ✅ Dashboard Statistics
-- ✅ Real-time Sync Across Devices
-- =====================================================
