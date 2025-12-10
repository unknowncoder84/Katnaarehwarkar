# Production Readiness Guide - Legal Case Management Dashboard

## Overview
This guide ensures your app is fully functional with persistent data storage, real-time updates, and no bugs for production users.

---

## ✅ PART 1: DATABASE SETUP CHECKLIST

### 1.1 Run All SQL Migrations (IN ORDER)

Execute these in Supabase SQL Editor in this exact order:

```
1. supabase/schema.sql (Main schema)
2. supabase/migrations/001_add_user_accounts.sql
3. supabase/migrations/002_populate_courts_and_case_types.sql
4. supabase/migrations/003_update_user_management.sql
5. supabase/migrations/004_library_storage_locations.sql
6. supabase/migrations/006_case_notes.sql
7. supabase/migrations/007_case_reminders.sql
8. supabase/migrations/008_case_timeline.sql
9. supabase/migrations/009_payment_plans.sql
10. supabase/migrations/010_client_communications.sql
11. supabase/migrations/011_helper_functions.sql
12. SUPABASE_PRODUCTION_SETUP.sql (New tables)
```

### 1.2 Verify All Tables Exist

Run this query in Supabase to verify:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected tables (20+):**
- user_accounts
- profiles
- cases
- counsel
- appointments
- transactions
- courts
- case_types
- books
- sofa_items
- counsel_cases
- case_notes
- case_reminders
- case_timeline
- payment_plans
- client_communications
- audit_logs
- tasks
- attendance
- expenses
- library_locations
- storage_locations
- library_items
- storage_items
- notifications

### 1.3 Enable Real-Time Subscriptions

Run in Supabase SQL Editor:

```sql
-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.cases;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.counsel;
ALTER PUBLICATION supabase_realtime ADD TABLE public.case_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.case_reminders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.case_timeline;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_communications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

### 1.4 Verify Row Level Security (RLS)

All tables should have RLS enabled. Run:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

**Should show all public tables with rowsecurity = true**

---

## ✅ PART 2: ENVIRONMENT VARIABLES

### 2.1 Update .env file

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# App
VITE_APP_NAME=Legal Case Management Dashboard
VITE_APP_VERSION=1.0.0
```

### 2.2 Get Supabase Credentials

1. Go to Supabase Dashboard
2. Click "Settings" → "API"
3. Copy "Project URL" → VITE_SUPABASE_URL
4. Copy "anon public" key → VITE_SUPABASE_ANON_KEY

---

## ✅ PART 3: DATA PERSISTENCE VERIFICATION

### 3.1 Test Case Creation

1. Login to app
2. Create a new case
3. Refresh page (F5)
4. **Expected:** Case should still be there

### 3.2 Test Real-Time Updates

1. Open app in 2 browser tabs
2. Create case in Tab 1
3. **Expected:** Case appears instantly in Tab 2 without refresh

### 3.3 Test Data Visibility

1. Create case as User A
2. Login as User B
3. **Expected:** Case is visible to User B (shared data)

### 3.4 Test Delete Operations

1. Create a case
2. Delete it
3. Refresh page
4. **Expected:** Case is gone permanently

---

## ✅ PART 4: MISSING SQL UPDATES

### 4.1 Create Missing Tables

Run this if you haven't already:

```sql
-- Tasks Table
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
CREATE POLICY "Users can view all tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update tasks" ON public.tasks FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete tasks" ON public.tasks FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_case_id ON public.tasks(case_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- Attendance Table
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
CREATE POLICY "Users can view all attendance" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert attendance" ON public.attendance FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update attendance" ON public.attendance FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete attendance" ON public.attendance FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON public.attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);

-- Expenses Table
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
CREATE POLICY "Users can view all expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert expenses" ON public.expenses FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update expenses" ON public.expenses FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete expenses" ON public.expenses FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);
CREATE INDEX IF NOT EXISTS idx_expenses_month ON public.expenses(month);
CREATE INDEX IF NOT EXISTS idx_expenses_added_by ON public.expenses(added_by);

-- Library Locations Table
CREATE TABLE IF NOT EXISTS public.library_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_by UUID REFERENCES public.user_accounts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.library_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all library locations" ON public.library_locations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert library locations" ON public.library_locations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update library locations" ON public.library_locations FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete library locations" ON public.library_locations FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);

-- Storage Locations Table
CREATE TABLE IF NOT EXISTS public.storage_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_by UUID REFERENCES public.user_accounts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.storage_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all storage locations" ON public.storage_locations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert storage locations" ON public.storage_locations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update storage locations" ON public.storage_locations FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete storage locations" ON public.storage_locations FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);

-- Library Items Table
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
CREATE POLICY "Users can view all library items" ON public.library_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert library items" ON public.library_items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete library items" ON public.library_items FOR DELETE USING (auth.uid() IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_library_items_location_id ON public.library_items(location_id);

-- Storage Items Table
CREATE TABLE IF NOT EXISTS public.storage_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID REFERENCES public.storage_locations(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  added_by UUID REFERENCES public.user_accounts(id),
  added_by_name VARCHAR(255),
  added_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.storage_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all storage items" ON public.storage_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert storage items" ON public.storage_items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete storage items" ON public.storage_items FOR DELETE USING (auth.uid() IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_storage_items_location_id ON public.storage_items(location_id);
CREATE INDEX IF NOT EXISTS idx_storage_items_case_id ON public.storage_items(case_id);

-- Notifications Table
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
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (
  auth.uid() = user_id OR user_id IS NULL
);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_attendance_updated_at ON public.attendance;
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_library_locations_updated_at ON public.library_locations;
CREATE TRIGGER update_library_locations_updated_at BEFORE UPDATE ON public.library_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_storage_locations_updated_at ON public.storage_locations;
CREATE TRIGGER update_storage_locations_updated_at BEFORE UPDATE ON public.storage_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
```

### 4.2 Create Helper Functions

```sql
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
```

---

## ✅ PART 5: CODE UPDATES NEEDED

### 5.1 Update DataContext.tsx

The DataContext already has most operations, but ensure these are present:

1. **Real-time subscriptions** - Already implemented ✅
2. **Optimistic updates** - Already implemented ✅
3. **Error handling** - Already implemented ✅
4. **Timeout handling** - Already implemented ✅

### 5.2 Verify Supabase Client

Check `src/lib/supabase.ts` has:

1. ✅ Auth functions
2. ✅ Database CRUD operations
3. ✅ Real-time subscriptions
4. ✅ All table operations

---

## ✅ PART 6: TESTING CHECKLIST

### 6.1 Create Case Test

```
1. Click "Create Case"
2. Fill all fields
3. Click "Save"
4. ✅ Case appears in list immediately
5. ✅ Refresh page - case still there
6. ✅ Other users see it instantly
```

### 6.2 Update Case Test

```
1. Click case to edit
2. Change a field
3. Click "Update"
4. ✅ Change appears immediately
5. ✅ Refresh page - change persists
6. ✅ Other users see update instantly
```

### 6.3 Delete Case Test

```
1. Click case
2. Click "Delete"
3. Confirm deletion
4. ✅ Case disappears immediately
5. ✅ Refresh page - case gone
6. ✅ Other users see deletion instantly
```

### 6.4 Appointment Test

```
1. Create appointment
2. ✅ Appears in calendar
3. ✅ Persists after refresh
4. ✅ Visible to all users
5. ✅ Can be edited/deleted
```

### 6.5 Transaction Test

```
1. Add transaction to case
2. ✅ Amount updates immediately
3. ✅ Persists after refresh
4. ✅ Visible in finance page
```

### 6.6 Real-Time Test

```
1. Open app in 2 tabs
2. Create case in Tab 1
3. ✅ Appears in Tab 2 within 1 second
4. ✅ No page refresh needed
```

---

## ✅ PART 7: DEPLOYMENT CHECKLIST

### 7.1 Before Going Live

- [ ] All SQL migrations executed
- [ ] Real-time subscriptions enabled
- [ ] RLS policies verified
- [ ] Environment variables set
- [ ] All CRUD operations tested
- [ ] Real-time updates working
- [ ] No console errors
- [ ] Data persists after refresh
- [ ] All users see shared data
- [ ] Delete operations work

### 7.2 Deploy to Netlify

```bash
npm run build
# Deploy dist folder to Netlify
```

### 7.3 Post-Deployment

1. Test all features in production
2. Monitor Supabase logs
3. Check for errors in browser console
4. Verify real-time updates work
5. Test with multiple users

---

## ✅ PART 8: COMMON ISSUES & FIXES

### Issue: Data not persisting

**Fix:**
1. Check Supabase URL and key in .env
2. Verify RLS policies are correct
3. Check browser console for errors
4. Verify table exists in Supabase

### Issue: Real-time updates not working

**Fix:**
1. Enable realtime in Supabase Dashboard
2. Run ALTER PUBLICATION commands
3. Check DataContext subscriptions
4. Verify WebSocket connection

### Issue: Users can't see each other's data

**Fix:**
1. Check RLS policies - should allow SELECT for all
2. Verify `FOR SELECT USING (true)` in policies
3. Check user authentication

### Issue: Delete not working

**Fix:**
1. Verify admin role for delete policies
2. Check if user is admin
3. Verify foreign key constraints
4. Check cascade delete settings

---

## ✅ PART 9: PRODUCTION MONITORING

### Monitor These Metrics

1. **Database Performance**
   - Query response times
   - Connection count
   - Storage usage

2. **Real-Time Updates**
   - Subscription count
   - Message latency
   - Connection stability

3. **User Activity**
   - Active users
   - Operations per minute
   - Error rate

### Check Supabase Dashboard

1. Go to Supabase Dashboard
2. Click "Database" → "Logs"
3. Monitor for errors
4. Check slow queries

---

## ✅ SUMMARY

Your app is production-ready when:

✅ All tables created
✅ RLS enabled on all tables
✅ Real-time subscriptions working
✅ CRUD operations persist data
✅ All users see shared data
✅ Real-time updates work
✅ No console errors
✅ Delete operations work
✅ Environment variables set
✅ Deployed to production

**You're ready to launch!** 🚀
