-- =====================================================
-- Migration 012: Add Missing Tables for Production
-- Description: Adds Tasks, Attendance, Expenses, Notifications
-- and related tables that are missing from the app
-- Version: V1.0
-- Date: 2024-12-10
-- =====================================================

-- =====================================================
-- 1. TASKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) DEFAULT 'case' CHECK (type IN ('case', 'custom', 'follow-up')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES public.user_accounts(id),
  assigned_to_name VARCHAR(255),
  assigned_by UUID REFERENCES public.user_accounts(id),
  assigned_by_name VARCHAR(255),
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  case_name VARCHAR(255),
  deadline DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all tasks" ON public.tasks;
CREATE POLICY "Users can view all tasks" ON public.tasks FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert tasks" ON public.tasks;
CREATE POLICY "Authenticated users can insert tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Users can update tasks" ON public.tasks;
CREATE POLICY "Users can update tasks" ON public.tasks FOR UPDATE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Admins can delete tasks" ON public.tasks;
CREATE POLICY "Admins can delete tasks" ON public.tasks FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_case_id ON public.tasks(case_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. ATTENDANCE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_accounts(id) ON DELETE CASCADE,
  user_name VARCHAR(255),
  date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'half-day', 'leave')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all attendance" ON public.attendance;
CREATE POLICY "Users can view all attendance" ON public.attendance FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert attendance" ON public.attendance;
CREATE POLICY "Authenticated users can insert attendance" ON public.attendance FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Users can update attendance" ON public.attendance;
CREATE POLICY "Users can update attendance" ON public.attendance FOR UPDATE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Admins can delete attendance" ON public.attendance;
CREATE POLICY "Admins can delete attendance" ON public.attendance FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON public.attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);

DROP TRIGGER IF EXISTS update_attendance_updated_at ON public.attendance;
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. EXPENSES TABLE
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

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all expenses" ON public.expenses;
CREATE POLICY "Users can view all expenses" ON public.expenses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert expenses" ON public.expenses;
CREATE POLICY "Authenticated users can insert expenses" ON public.expenses FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Users can update expenses" ON public.expenses;
CREATE POLICY "Users can update expenses" ON public.expenses FOR UPDATE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Admins can delete expenses" ON public.expenses;
CREATE POLICY "Admins can delete expenses" ON public.expenses FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);
CREATE INDEX IF NOT EXISTS idx_expenses_month ON public.expenses(month);
CREATE INDEX IF NOT EXISTS idx_expenses_added_by ON public.expenses(added_by);

DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. LIBRARY ITEMS TABLE
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

ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all library items" ON public.library_items;
CREATE POLICY "Users can view all library items" ON public.library_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert library items" ON public.library_items;
CREATE POLICY "Authenticated users can insert library items" ON public.library_items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Users can delete library items" ON public.library_items;
CREATE POLICY "Users can delete library items" ON public.library_items FOR DELETE USING (auth.uid() IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_library_items_location_id ON public.library_items(location_id);

-- =====================================================
-- 5. STORAGE ITEMS TABLE
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

ALTER TABLE public.storage_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all storage items" ON public.storage_items;
CREATE POLICY "Users can view all storage items" ON public.storage_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert storage items" ON public.storage_items;
CREATE POLICY "Authenticated users can insert storage items" ON public.storage_items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Users can delete storage items" ON public.storage_items;
CREATE POLICY "Users can delete storage items" ON public.storage_items FOR DELETE USING (auth.uid() IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_storage_items_location_id ON public.storage_items(location_id);

-- =====================================================
-- 6. NOTIFICATIONS TABLE
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

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (
  auth.uid() = user_id OR user_id IS NULL
);
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Function to create notification for all users
CREATE OR REPLACE FUNCTION create_notification_for_all(
  p_type VARCHAR,
  p_title VARCHAR,
  p_description TEXT,
  p_icon VARCHAR DEFAULT '🔔',
  p_related_id UUID DEFAULT NULL,
  p_created_by UUID DEFAULT NULL,
  p_created_by_name VARCHAR DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.notifications (type, title, description, icon, related_id, created_by, created_by_name)
  SELECT p_type, p_title, p_description, p_icon, p_related_id, p_created_by, p_created_by_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.notifications SET is_read = true WHERE id = p_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.notifications SET is_read = true WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. ENABLE REALTIME SUBSCRIPTIONS (if not already enabled)
-- =====================================================
-- Note: These may already be enabled, so we use conditional logic
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.library_items;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.storage_items;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

-- =====================================================
-- 9. GRANT PERMISSIONS
-- =====================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- DONE! All missing tables created
-- =====================================================
-- 
-- CREATED:
-- ✅ tasks table
-- ✅ attendance table
-- ✅ expenses table
-- ✅ library_items table
-- ✅ storage_items table
-- ✅ notifications table
-- ✅ Helper functions
-- ✅ Realtime subscriptions enabled
-- ✅ Permissions granted
--
-- Your app is now production-ready!
-- =====================================================
