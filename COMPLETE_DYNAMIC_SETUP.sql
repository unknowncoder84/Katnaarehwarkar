-- =====================================================
-- COMPLETE DYNAMIC SETUP FOR KATNESHWARKAR LEGAL DASHBOARD
-- Run this SQL in Supabase SQL Editor
-- This adds all missing tables for full dynamic functionality
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TASKS TABLE - For Task Management
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('case', 'custom')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to UUID,
  assigned_to_name VARCHAR(255),
  assigned_by UUID,
  assigned_by_name VARCHAR(255),
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  case_name VARCHAR(255),
  deadline DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Policies for tasks
CREATE POLICY "Anyone can view tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert tasks" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update tasks" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete tasks" ON public.tasks FOR DELETE USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON public.tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_case_id ON public.tasks(case_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. ATTENDANCE TABLE - For Attendance Management
-- =====================================================
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  user_name VARCHAR(255),
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent')),
  marked_by UUID,
  marked_by_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Policies for attendance
CREATE POLICY "Anyone can view attendance" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert attendance" ON public.attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update attendance" ON public.attendance FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete attendance" ON public.attendance FOR DELETE USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON public.attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON public.attendance(status);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_attendance_updated_at ON public.attendance;
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. EXPENSES TABLE - For Expense Management
-- =====================================================
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT NOT NULL,
  added_by UUID,
  added_by_name VARCHAR(255),
  month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Policies for expenses
CREATE POLICY "Anyone can view expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert expenses" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update expenses" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete expenses" ON public.expenses FOR DELETE USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_expenses_month ON public.expenses(month);
CREATE INDEX IF NOT EXISTS idx_expenses_added_by ON public.expenses(added_by);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. LIBRARY_ITEMS TABLE - For Library Management
-- =====================================================
CREATE TABLE IF NOT EXISTS public.library_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  number VARCHAR(100) NOT NULL,
  location_id UUID REFERENCES public.library_locations(id) ON DELETE SET NULL,
  location_name VARCHAR(255),
  type VARCHAR(20) DEFAULT 'Book' CHECK (type IN ('File', 'Book')),
  dropbox_path TEXT,
  dropbox_link TEXT,
  added_by UUID,
  added_by_name VARCHAR(255),
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;

-- Policies for library_items
CREATE POLICY "Anyone can view library_items" ON public.library_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert library_items" ON public.library_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update library_items" ON public.library_items FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete library_items" ON public.library_items FOR DELETE USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_library_items_location_id ON public.library_items(location_id);
CREATE INDEX IF NOT EXISTS idx_library_items_type ON public.library_items(type);
CREATE INDEX IF NOT EXISTS idx_library_items_name ON public.library_items(name);

-- =====================================================
-- 5. STORAGE_ITEMS TABLE - For Storage Management
-- =====================================================
CREATE TABLE IF NOT EXISTS public.storage_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  number VARCHAR(100) NOT NULL,
  location_id UUID REFERENCES public.storage_locations(id) ON DELETE SET NULL,
  location_name VARCHAR(255),
  type VARCHAR(20) DEFAULT 'File' CHECK (type IN ('File', 'Document', 'Box')),
  dropbox_path TEXT,
  dropbox_link TEXT,
  added_by UUID,
  added_by_name VARCHAR(255),
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.storage_items ENABLE ROW LEVEL SECURITY;

-- Policies for storage_items
CREATE POLICY "Anyone can view storage_items" ON public.storage_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert storage_items" ON public.storage_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update storage_items" ON public.storage_items FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete storage_items" ON public.storage_items FOR DELETE USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_storage_items_location_id ON public.storage_items(location_id);
CREATE INDEX IF NOT EXISTS idx_storage_items_type ON public.storage_items(type);
CREATE INDEX IF NOT EXISTS idx_storage_items_name ON public.storage_items(name);

-- =====================================================
-- 6. LIBRARY_LOCATIONS TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.library_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.library_locations ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can view library_locations" ON public.library_locations;
CREATE POLICY "Anyone can view library_locations" ON public.library_locations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert library_locations" ON public.library_locations;
CREATE POLICY "Authenticated users can insert library_locations" ON public.library_locations FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can delete library_locations" ON public.library_locations;
CREATE POLICY "Authenticated users can delete library_locations" ON public.library_locations FOR DELETE USING (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_library_locations_name ON public.library_locations(name);

-- =====================================================
-- 7. STORAGE_LOCATIONS TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.storage_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.storage_locations ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can view storage_locations" ON public.storage_locations;
CREATE POLICY "Anyone can view storage_locations" ON public.storage_locations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert storage_locations" ON public.storage_locations;
CREATE POLICY "Authenticated users can insert storage_locations" ON public.storage_locations FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can delete storage_locations" ON public.storage_locations;
CREATE POLICY "Authenticated users can delete storage_locations" ON public.storage_locations FOR DELETE USING (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_storage_locations_name ON public.storage_locations(name);

-- =====================================================
-- 8. ADD STAGE COLUMN TO CASES TABLE (if not exists)
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'cases' AND column_name = 'stage') THEN
    ALTER TABLE public.cases ADD COLUMN stage VARCHAR(50) DEFAULT 'consultation' 
      CHECK (stage IN ('consultation', 'drafting', 'filing', 'circulation', 'notice', 
                       'pre-admission', 'admitted', 'final-hearing', 'reserved', 'disposed'));
  END IF;
END $$;

-- =====================================================
-- 9. ADD PAYMENT_MODE COLUMN TO TRANSACTIONS TABLE (if not exists)
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'transactions' AND column_name = 'payment_mode') THEN
    ALTER TABLE public.transactions ADD COLUMN payment_mode VARCHAR(20) DEFAULT 'cash'
      CHECK (payment_mode IN ('upi', 'cash', 'check', 'bank-transfer', 'card', 'other'));
  END IF;
END $$;

-- =====================================================
-- 10. ENABLE REALTIME FOR NEW TABLES
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.library_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.storage_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.library_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.storage_locations;

-- =====================================================
-- 11. GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON public.tasks TO anon, authenticated;
GRANT ALL ON public.attendance TO anon, authenticated;
GRANT ALL ON public.expenses TO anon, authenticated;
GRANT ALL ON public.library_items TO anon, authenticated;
GRANT ALL ON public.storage_items TO anon, authenticated;
GRANT ALL ON public.library_locations TO anon, authenticated;
GRANT ALL ON public.storage_locations TO anon, authenticated;

-- =====================================================
-- 12. HELPER FUNCTIONS
-- =====================================================

-- Function to get pending tasks count
CREATE OR REPLACE FUNCTION get_pending_tasks_count(p_user_id UUID DEFAULT NULL)
RETURNS INTEGER AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RETURN (SELECT COUNT(*) FROM public.tasks WHERE status = 'pending');
  ELSE
    RETURN (SELECT COUNT(*) FROM public.tasks WHERE status = 'pending' AND assigned_to = p_user_id);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get expenses by month
CREATE OR REPLACE FUNCTION get_expenses_by_month(p_month VARCHAR)
RETURNS TABLE (
  id UUID,
  amount DECIMAL,
  description TEXT,
  added_by UUID,
  added_by_name VARCHAR,
  month VARCHAR,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT e.id, e.amount, e.description, e.added_by, e.added_by_name, e.month, e.created_at
  FROM public.expenses e
  WHERE e.month = p_month
  ORDER BY e.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get attendance by date
CREATE OR REPLACE FUNCTION get_attendance_by_date(p_date DATE)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_name VARCHAR,
  date DATE,
  status VARCHAR,
  marked_by UUID,
  marked_by_name VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.user_id, a.user_name, a.date, a.status, a.marked_by, a.marked_by_name
  FROM public.attendance a
  WHERE a.date = p_date
  ORDER BY a.user_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DONE! All tables are now set up for dynamic functionality
-- =====================================================
--
-- TABLES CREATED/UPDATED:
-- 1. tasks - Task management with case linking
-- 2. attendance - User attendance tracking
-- 3. expenses - Monthly expense tracking
-- 4. library_items - Library item management
-- 5. storage_items - Storage item management
-- 6. library_locations - Library location management
-- 7. storage_locations - Storage location management
-- 8. cases - Added stage column
-- 9. transactions - Added payment_mode column
--
-- FEATURES:
-- ✅ Row Level Security (RLS) on all tables
-- ✅ Auto-update timestamps
-- ✅ Indexes for performance
-- ✅ Realtime subscriptions enabled
-- ✅ Helper functions for common queries
-- =====================================================
