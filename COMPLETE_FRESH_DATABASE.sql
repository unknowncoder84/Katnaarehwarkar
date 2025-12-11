-- =====================================================
-- COMPLETE FRESH DATABASE - KATNESHWARKAR LEGAL MANAGEMENT
-- =====================================================
-- Version: FINAL - All Features Included
-- Run this ENTIRE script in Supabase SQL Editor
-- This will DROP all existing tables and recreate them
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- STEP 1: DROP ALL EXISTING OBJECTS (CLEAN SLATE)
-- =====================================================

-- Drop all views
DROP VIEW IF EXISTS disposed_cases CASCADE;
DROP VIEW IF EXISTS pending_cases CASCADE;
DROP VIEW IF EXISTS active_cases CASCADE;
DROP VIEW IF EXISTS on_hold_cases CASCADE;
DROP VIEW IF EXISTS upcoming_hearings CASCADE;
DROP VIEW IF EXISTS todays_appointments CASCADE;
DROP VIEW IF EXISTS cases_with_transactions CASCADE;
DROP VIEW IF EXISTS counsel_with_cases CASCADE;
DROP VIEW IF EXISTS sofa_items_with_cases CASCADE;

-- Drop all tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS case_documents CASCADE;
DROP TABLE IF EXISTS case_notes CASCADE;
DROP TABLE IF EXISTS case_timeline CASCADE;
DROP TABLE IF EXISTS case_reminders CASCADE;
DROP TABLE IF EXISTS library_items CASCADE;
DROP TABLE IF EXISTS storage_items CASCADE;
DROP TABLE IF EXISTS sofa_items CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS library_locations CASCADE;
DROP TABLE IF EXISTS storage_locations CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS counsel_cases CASCADE;
DROP TABLE IF EXISTS counsel CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS case_types CASCADE;
DROP TABLE IF EXISTS courts CASCADE;
DROP TABLE IF EXISTS user_accounts CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_counsel_case_count() CASCADE;
DROP FUNCTION IF EXISTS get_dashboard_stats() CASCADE;
DROP FUNCTION IF EXISTS search_cases(TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_cases_by_date(DATE) CASCADE;
DROP FUNCTION IF EXISTS hash_password(TEXT) CASCADE;
DROP FUNCTION IF EXISTS verify_password(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS authenticate_user(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS create_user_account(TEXT, TEXT, TEXT, TEXT, TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS get_all_users() CASCADE;
DROP FUNCTION IF EXISTS update_user_role(UUID, TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS toggle_user_status(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS delete_user_account(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS mark_notification_read(UUID) CASCADE;
DROP FUNCTION IF EXISTS mark_all_notifications_read(UUID) CASCADE;
DROP FUNCTION IF EXISTS create_notification_for_all(TEXT, TEXT, TEXT, TEXT, UUID, UUID, TEXT) CASCADE;

-- =====================================================
-- STEP 2: USER ACCOUNTS TABLE (Authentication)
-- =====================================================

CREATE TABLE user_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'vipin')),
    is_active BOOLEAN DEFAULT true,
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_accounts_all" ON user_accounts FOR ALL USING (true);

CREATE INDEX idx_user_accounts_username ON user_accounts(username);
CREATE INDEX idx_user_accounts_email ON user_accounts(email);
CREATE INDEX idx_user_accounts_role ON user_accounts(role);

-- =====================================================
-- STEP 3: COURTS TABLE
-- =====================================================

CREATE TABLE courts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "courts_all" ON courts FOR ALL USING (true);

-- =====================================================
-- STEP 4: CASE TYPES TABLE
-- =====================================================

CREATE TABLE case_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE case_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "case_types_all" ON case_types FOR ALL USING (true);

-- =====================================================
-- STEP 5: CASES TABLE (Complete with ALL fields)
-- =====================================================

CREATE TABLE cases (
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
    stage VARCHAR(50) DEFAULT 'consultation',
    next_date DATE,
    filing_date DATE,
    circulation_status VARCHAR(20) DEFAULT 'non-circulated',
    circulation_date DATE,
    interim_relief VARCHAR(20) DEFAULT 'none',
    interim_date DATE,
    granted_date DATE,
    -- Metadata
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cases_all" ON cases FOR ALL USING (true);

CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_stage ON cases(stage);
CREATE INDEX idx_cases_client_name ON cases(client_name);
CREATE INDEX idx_cases_file_no ON cases(file_no);
CREATE INDEX idx_cases_next_date ON cases(next_date);
CREATE INDEX idx_cases_court ON cases(court);

-- =====================================================
-- STEP 6: COUNSEL TABLE
-- =====================================================

CREATE TABLE counsel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    mobile VARCHAR(20),
    address TEXT,
    details TEXT,
    total_cases INTEGER DEFAULT 0,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE counsel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "counsel_all" ON counsel FOR ALL USING (true);

CREATE INDEX idx_counsel_name ON counsel(name);

-- =====================================================
-- STEP 7: APPOINTMENTS TABLE (NO foreign keys)
-- =====================================================

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    time VARCHAR(10),
    user_id TEXT,
    user_name VARCHAR(255),
    client VARCHAR(255),
    details TEXT,
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "appointments_all" ON appointments FOR ALL USING (true);

CREATE INDEX idx_appointments_date ON appointments(date);

-- =====================================================
-- STEP 8: TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('received', 'pending')),
    payment_mode VARCHAR(20) DEFAULT 'cash' CHECK (payment_mode IN ('upi', 'cash', 'check', 'bank-transfer', 'card', 'other')),
    received_by VARCHAR(255),
    confirmed_by VARCHAR(255),
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transactions_all" ON transactions FOR ALL USING (true);

CREATE INDEX idx_transactions_case_id ON transactions(case_id);
CREATE INDEX idx_transactions_status ON transactions(status);

-- =====================================================
-- STEP 9: LIBRARY LOCATIONS TABLE
-- =====================================================

CREATE TABLE library_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE library_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "library_locations_all" ON library_locations FOR ALL USING (true);

-- =====================================================
-- STEP 10: STORAGE LOCATIONS TABLE
-- =====================================================

CREATE TABLE storage_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE storage_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "storage_locations_all" ON storage_locations FOR ALL USING (true);

-- =====================================================
-- STEP 11: BOOKS TABLE
-- =====================================================

CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(50) DEFAULT 'L1',
    added_by TEXT,
    added_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "books_all" ON books FOR ALL USING (true);

CREATE INDEX idx_books_name ON books(name);

-- =====================================================
-- STEP 12: SOFA ITEMS TABLE
-- =====================================================

CREATE TABLE sofa_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    compartment VARCHAR(5) NOT NULL CHECK (compartment IN ('C1', 'C2')),
    added_by TEXT,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(case_id, compartment)
);

ALTER TABLE sofa_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sofa_items_all" ON sofa_items FOR ALL USING (true);

CREATE INDEX idx_sofa_items_case_id ON sofa_items(case_id);
CREATE INDEX idx_sofa_items_compartment ON sofa_items(compartment);

-- =====================================================
-- STEP 13: LIBRARY ITEMS TABLE
-- =====================================================

CREATE TABLE library_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location_id UUID REFERENCES library_locations(id) ON DELETE SET NULL,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    added_by TEXT,
    added_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "library_items_all" ON library_items FOR ALL USING (true);

-- =====================================================
-- STEP 14: STORAGE ITEMS TABLE
-- =====================================================

CREATE TABLE storage_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location_id UUID REFERENCES storage_locations(id) ON DELETE SET NULL,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    added_by TEXT,
    added_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE storage_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "storage_items_all" ON storage_items FOR ALL USING (true);

-- =====================================================
-- STEP 15: COUNSEL CASES TABLE
-- =====================================================

CREATE TABLE counsel_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    counsel_id UUID REFERENCES counsel(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(counsel_id, case_id)
);

ALTER TABLE counsel_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "counsel_cases_all" ON counsel_cases FOR ALL USING (true);

-- =====================================================
-- STEP 16: TASKS TABLE (NO foreign keys to user_accounts)
-- =====================================================

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) NOT NULL DEFAULT 'custom' CHECK (type IN ('case', 'custom')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to TEXT,
    assigned_to_name VARCHAR(255),
    assigned_by TEXT,
    assigned_by_name VARCHAR(255),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    case_name VARCHAR(255),
    deadline DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_all" ON tasks FOR ALL USING (true);

CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);

-- =====================================================
-- STEP 17: ATTENDANCE TABLE (NO foreign keys)
-- =====================================================

CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent')),
    marked_by TEXT,
    marked_by_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attendance_all" ON attendance FOR ALL USING (true);

CREATE INDEX idx_attendance_user_id ON attendance(user_id);
CREATE INDEX idx_attendance_date ON attendance(date);

-- =====================================================
-- STEP 18: EXPENSES TABLE (NO foreign keys)
-- =====================================================

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT NOT NULL,
    added_by TEXT,
    added_by_name VARCHAR(255),
    month VARCHAR(7) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "expenses_all" ON expenses FOR ALL USING (true);

CREATE INDEX idx_expenses_month ON expenses(month);

-- =====================================================
-- STEP 19: CASE DOCUMENTS TABLE
-- =====================================================

CREATE TABLE case_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    dropbox_path TEXT,
    dropbox_id TEXT,
    file_type VARCHAR(50),
    file_size BIGINT,
    uploaded_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "case_documents_all" ON case_documents FOR ALL USING (true);

CREATE INDEX idx_case_documents_case_id ON case_documents(case_id);

-- =====================================================
-- STEP 20: NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(10) DEFAULT '🔔',
    is_read BOOLEAN DEFAULT FALSE,
    related_id TEXT,
    created_by TEXT,
    created_by_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_all" ON notifications FOR ALL USING (true);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);


-- =====================================================
-- STEP 21: HELPER FUNCTIONS
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
CREATE TRIGGER update_user_accounts_updated_at BEFORE UPDATE ON user_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_counsel_updated_at BEFORE UPDATE ON counsel
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update counsel case count
CREATE OR REPLACE FUNCTION update_counsel_case_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE counsel SET total_cases = total_cases + 1 WHERE id = NEW.counsel_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE counsel SET total_cases = total_cases - 1 WHERE id = OLD.counsel_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_counsel_case_count_trigger
    AFTER INSERT OR DELETE ON counsel_cases
    FOR EACH ROW EXECUTE FUNCTION update_counsel_case_count();

-- =====================================================
-- STEP 22: USER AUTHENTICATION FUNCTIONS
-- =====================================================

-- Function to hash password
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN crypt(password, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify password
CREATE OR REPLACE FUNCTION verify_password(password TEXT, password_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN password_hash = crypt(password, password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to authenticate user
CREATE OR REPLACE FUNCTION authenticate_user(
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
    SELECT ua.id, ua.name, ua.email, ua.username, ua.role, ua.is_active, ua.avatar, ua.password_hash
    INTO v_user
    FROM user_accounts ua
    WHERE ua.username = p_username;

    IF v_user.id IS NULL THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::BOOLEAN, NULL::TEXT, 'Invalid username or password';
        RETURN;
    END IF;

    IF NOT v_user.is_active THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::BOOLEAN, NULL::TEXT, 'Account is deactivated';
        RETURN;
    END IF;

    IF NOT verify_password(p_password, v_user.password_hash) THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::BOOLEAN, NULL::TEXT, 'Invalid username or password';
        RETURN;
    END IF;

    RETURN QUERY SELECT TRUE, v_user.id, v_user.name, v_user.email, v_user.username, v_user.role, v_user.is_active, v_user.avatar, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create new user
CREATE OR REPLACE FUNCTION create_user_account(
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
    IF EXISTS (SELECT 1 FROM user_accounts WHERE email = p_email) THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'A user with this email already exists';
        RETURN;
    END IF;

    IF EXISTS (SELECT 1 FROM user_accounts WHERE username = p_username) THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'A user with this username already exists';
        RETURN;
    END IF;

    v_password_hash := hash_password(p_password);

    INSERT INTO user_accounts (name, email, username, password_hash, role, is_active)
    VALUES (p_name, p_email, p_username, v_password_hash, p_role, TRUE)
    RETURNING id INTO v_user_id;

    RETURN QUERY SELECT TRUE, v_user_id, NULL::TEXT;
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all users
CREATE OR REPLACE FUNCTION get_all_users()
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
    SELECT ua.id, ua.name, ua.email, ua.username, ua.role, ua.is_active, ua.avatar, ua.created_at, ua.updated_at
    FROM user_accounts ua
    ORDER BY ua.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user role
CREATE OR REPLACE FUNCTION update_user_role(
    p_user_id UUID,
    p_new_role TEXT,
    p_updated_by UUID
)
RETURNS TABLE (
    success BOOLEAN,
    error_message TEXT
) AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM user_accounts WHERE id = p_user_id) THEN
        RETURN QUERY SELECT FALSE, 'User not found';
        RETURN;
    END IF;

    UPDATE user_accounts
    SET role = p_new_role, updated_at = NOW()
    WHERE id = p_user_id;

    RETURN QUERY SELECT TRUE, NULL::TEXT;
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, SQLERRM;
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
    v_current_status BOOLEAN;
    v_new_status BOOLEAN;
BEGIN
    SELECT is_active INTO v_current_status
    FROM user_accounts
    WHERE id = p_user_id;

    IF v_current_status IS NULL THEN
        RETURN QUERY SELECT FALSE, NULL::BOOLEAN, 'User not found';
        RETURN;
    END IF;

    v_new_status := NOT v_current_status;

    UPDATE user_accounts
    SET is_active = v_new_status, updated_at = NOW()
    WHERE id = p_user_id;

    RETURN QUERY SELECT TRUE, v_new_status, NULL::TEXT;
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, NULL::BOOLEAN, SQLERRM;
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
    IF NOT EXISTS (SELECT 1 FROM user_accounts WHERE id = p_user_id) THEN
        RETURN QUERY SELECT FALSE, 'User not found';
        RETURN;
    END IF;

    UPDATE user_accounts
    SET is_active = FALSE, updated_at = NOW()
    WHERE id = p_user_id;

    RETURN QUERY SELECT TRUE, NULL::TEXT;
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 23: NOTIFICATION FUNCTIONS
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
    FROM user_accounts WHERE is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 24: DASHBOARD STATS FUNCTION
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
        'on_hold_cases', (SELECT COUNT(*) FROM cases WHERE status = 'on-hold'),
        'total_counsel', (SELECT COUNT(*) FROM counsel),
        'total_appointments', (SELECT COUNT(*) FROM appointments WHERE date >= CURRENT_DATE),
        'upcoming_hearings', (SELECT COUNT(*) FROM cases WHERE next_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'),
        'total_received', (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE status = 'received'),
        'total_pending', (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE status = 'pending'),
        'pending_tasks', (SELECT COUNT(*) FROM tasks WHERE status = 'pending'),
        'total_users', (SELECT COUNT(*) FROM user_accounts WHERE is_active = TRUE)
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 25: SEARCH FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION search_cases(search_term TEXT)
RETURNS SETOF cases AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM cases
    WHERE client_name ILIKE '%' || search_term || '%' 
       OR file_no ILIKE '%' || search_term || '%' 
       OR parties_name ILIKE '%' || search_term || '%' 
       OR court ILIKE '%' || search_term || '%' 
       OR opponent_lawyer ILIKE '%' || search_term || '%'
    ORDER BY updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_cases_by_date(target_date DATE)
RETURNS SETOF cases AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM cases
    WHERE next_date = target_date
    ORDER BY client_name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 26: VIEWS
-- =====================================================

CREATE OR REPLACE VIEW disposed_cases AS
SELECT * FROM cases WHERE status = 'closed';

CREATE OR REPLACE VIEW pending_cases AS
SELECT * FROM cases WHERE status = 'pending';

CREATE OR REPLACE VIEW active_cases AS
SELECT * FROM cases WHERE status = 'active';

CREATE OR REPLACE VIEW on_hold_cases AS
SELECT * FROM cases WHERE status = 'on-hold';

CREATE OR REPLACE VIEW upcoming_hearings AS
SELECT * FROM cases 
WHERE next_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
ORDER BY next_date ASC;

CREATE OR REPLACE VIEW todays_appointments AS
SELECT * FROM appointments WHERE date = CURRENT_DATE
ORDER BY time ASC;

CREATE OR REPLACE VIEW sofa_items_with_cases AS
SELECT si.*, c.client_name, c.file_no, c.parties_name, c.status as case_status
FROM sofa_items si
JOIN cases c ON si.case_id = c.id;

-- =====================================================
-- STEP 27: DEFAULT DATA
-- =====================================================

-- Insert default courts
INSERT INTO courts (name) VALUES 
    ('Supreme Court'),
    ('High Court'),
    ('District Court'),
    ('Sessions Court'),
    ('Civil Court'),
    ('Family Court'),
    ('Consumer Court'),
    ('Labour Court'),
    ('Tribunal'),
    ('Magistrate Court'),
    ('Commercial Court')
ON CONFLICT (name) DO NOTHING;

-- Insert default case types
INSERT INTO case_types (name) VALUES 
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
    ('Commercial'),
    ('Other')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- STEP 28: CREATE DEFAULT ADMIN USER
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM user_accounts WHERE username = 'admin') THEN
        INSERT INTO user_accounts (name, email, username, password_hash, role, is_active)
        VALUES (
            'Admin User',
            'admin@katneshwarkar.com',
            'admin',
            hash_password('admin123'),
            'admin',
            TRUE
        );
        RAISE NOTICE 'Default admin user created: admin / admin123';
    ELSE
        RAISE NOTICE 'Admin user already exists';
    END IF;
END $$;

-- =====================================================
-- STEP 29: GRANT PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- =====================================================
-- STEP 30: ENABLE REALTIME
-- =====================================================

DO $$
DECLARE
    tables TEXT[] := ARRAY[
        'user_accounts', 'cases', 'counsel', 'appointments', 'transactions',
        'tasks', 'attendance', 'expenses', 'books', 'sofa_items',
        'library_locations', 'storage_locations', 'library_items', 'storage_items',
        'case_documents', 'notifications', 'courts', 'case_types', 'counsel_cases'
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
-- SETUP COMPLETE! 🎉
-- =====================================================
-- 
-- ALL FEATURES SUPPORTED:
-- ✅ User Authentication (admin/admin123)
-- ✅ Cases Management (Create, Edit, Delete)
-- ✅ Appointments (Create, Edit, Delete)
-- ✅ Counsel/Lawyers Management
-- ✅ Financial Transactions
-- ✅ Office Expenses
-- ✅ Task Management
-- ✅ Staff Attendance
-- ✅ Library Locations
-- ✅ Storage Locations
-- ✅ Books Management
-- ✅ Sofa Compartments (C1, C2)
-- ✅ Case Documents
-- ✅ Notifications
-- ✅ Dashboard Statistics
-- ✅ Real-time Sync
-- 
-- DEFAULT LOGIN:
-- Username: admin
-- Password: admin123
-- =====================================================
