# Copy-Paste SQL Commands for Production Deployment

## 🚀 How to Use This File

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Create a new query
3. Copy the SQL code from below
4. Paste into the SQL Editor
5. Click **Run**
6. Wait for success message

---

## ✅ OPTION 1: Run Everything at Once (Recommended)

Copy and paste the entire content from `PRODUCTION_ORANGE_THEME_COMPLETE.sql` file into Supabase SQL Editor.

---

## ✅ OPTION 2: Run Commands Individually

If you prefer to run commands one at a time, use the sections below:

### Command 1: Create Audit Logs Table

```sql
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_accounts(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
```

### Command 2: Create Case Notes Table

```sql
CREATE TABLE IF NOT EXISTS public.case_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  note_type VARCHAR(50) DEFAULT 'general' CHECK (note_type IN ('general', 'hearing', 'decision', 'urgent', 'follow-up')),
  created_by UUID REFERENCES public.user_accounts(id),
  created_by_name VARCHAR(255),
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.case_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view case notes" ON public.case_notes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert notes" ON public.case_notes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own notes" ON public.case_notes FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Admins can delete notes" ON public.case_notes FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX IF NOT EXISTS idx_case_notes_case_id ON public.case_notes(case_id);
CREATE INDEX IF NOT EXISTS idx_case_notes_created_by ON public.case_notes(created_by);
CREATE INDEX IF NOT EXISTS idx_case_notes_is_pinned ON public.case_notes(is_pinned);

DROP TRIGGER IF EXISTS update_case_notes_updated_at ON public.case_notes;
CREATE TRIGGER update_case_notes_updated_at BEFORE UPDATE ON public.case_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Command 3: Create Case Reminders Table

```sql
CREATE TABLE IF NOT EXISTS public.case_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  reminder_date DATE NOT NULL,
  reminder_time TIME,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  reminder_type VARCHAR(50) DEFAULT 'hearing' CHECK (reminder_type IN ('hearing', 'filing', 'submission', 'payment', 'follow-up', 'custom')),
  is_completed BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.user_accounts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.case_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reminders" ON public.case_reminders FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reminders" ON public.case_reminders FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update reminders" ON public.case_reminders FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete reminders" ON public.case_reminders FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX IF NOT EXISTS idx_case_reminders_case_id ON public.case_reminders(case_id);
CREATE INDEX IF NOT EXISTS idx_case_reminders_reminder_date ON public.case_reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_case_reminders_is_completed ON public.case_reminders(is_completed);

DROP TRIGGER IF EXISTS update_case_reminders_updated_at ON public.case_reminders;
CREATE TRIGGER update_case_reminders_updated_at BEFORE UPDATE ON public.case_reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Command 4: Create Case Timeline Table

```sql
CREATE TABLE IF NOT EXISTS public.case_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_description TEXT,
  event_outcome VARCHAR(50),
  created_by UUID REFERENCES public.user_accounts(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.case_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view timeline" ON public.case_timeline FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert timeline" ON public.case_timeline FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete timeline" ON public.case_timeline FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX IF NOT EXISTS idx_case_timeline_case_id ON public.case_timeline(case_id);
CREATE INDEX IF NOT EXISTS idx_case_timeline_event_date ON public.case_timeline(event_date);
```

### Command 5: Create Payment Plans Table

```sql
CREATE TABLE IF NOT EXISTS public.payment_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  total_amount DECIMAL(12, 2) NOT NULL,
  installment_count INTEGER NOT NULL,
  installment_amount DECIMAL(12, 2) NOT NULL,
  start_date DATE NOT NULL,
  frequency VARCHAR(20) DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'bi-weekly', 'monthly', 'quarterly')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_by UUID REFERENCES public.user_accounts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payment plans" ON public.payment_plans FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert plans" ON public.payment_plans FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update plans" ON public.payment_plans FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete plans" ON public.payment_plans FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX IF NOT EXISTS idx_payment_plans_case_id ON public.payment_plans(case_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_status ON public.payment_plans(status);

DROP TRIGGER IF EXISTS update_payment_plans_updated_at ON public.payment_plans;
CREATE TRIGGER update_payment_plans_updated_at BEFORE UPDATE ON public.payment_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Command 6: Create Client Communications Table

```sql
CREATE TABLE IF NOT EXISTS public.client_communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  communication_type VARCHAR(50) NOT NULL CHECK (communication_type IN ('email', 'phone', 'sms', 'meeting', 'letter', 'other')),
  communication_date TIMESTAMPTZ NOT NULL,
  subject VARCHAR(255),
  notes TEXT,
  outcome VARCHAR(255),
  communicated_by UUID REFERENCES public.user_accounts(id),
  communicated_by_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.client_communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view communications" ON public.client_communications FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert communications" ON public.client_communications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete communications" ON public.client_communications FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX IF NOT EXISTS idx_client_communications_case_id ON public.client_communications(case_id);
CREATE INDEX IF NOT EXISTS idx_client_communications_communication_date ON public.client_communications(communication_date);
```

### Command 7: Create Views

```sql
-- View for case performance metrics
CREATE OR REPLACE VIEW public.case_performance_metrics AS
SELECT 
  c.id,
  c.client_name,
  c.file_no,
  c.status,
  c.stage,
  COUNT(DISTINCT cn.id) as total_notes,
  COUNT(DISTINCT cr.id) as total_reminders,
  COUNT(DISTINCT cc.id) as total_communications,
  COUNT(DISTINCT t.id) as total_transactions,
  COALESCE(SUM(t.amount) FILTER (WHERE t.status = 'received'), 0) as total_received,
  c.created_at,
  c.updated_at
FROM public.cases c
LEFT JOIN public.case_notes cn ON c.id = cn.case_id
LEFT JOIN public.case_reminders cr ON c.id = cr.case_id
LEFT JOIN public.client_communications cc ON c.id = cc.case_id
LEFT JOIN public.transactions t ON c.id = t.case_id
GROUP BY c.id;

-- View for pending reminders
CREATE OR REPLACE VIEW public.pending_reminders AS
SELECT 
  cr.*,
  c.client_name,
  c.file_no,
  c.parties_name
FROM public.case_reminders cr
JOIN public.cases c ON cr.case_id = c.id
WHERE cr.is_completed = false AND cr.reminder_date <= CURRENT_DATE
ORDER BY cr.reminder_date ASC;

-- View for case timeline with details
CREATE OR REPLACE VIEW public.case_timeline_with_details AS
SELECT 
  ct.*,
  c.client_name,
  c.file_no,
  c.parties_name
FROM public.case_timeline ct
JOIN public.cases c ON ct.case_id = c.id
ORDER BY ct.event_date DESC;

-- View for payment plan status
CREATE OR REPLACE VIEW public.payment_plan_status AS
SELECT 
  pp.*,
  c.client_name,
  c.file_no,
  COUNT(DISTINCT t.id) as payments_received,
  COALESCE(SUM(t.amount), 0) as amount_received,
  (pp.total_amount - COALESCE(SUM(t.amount), 0)) as amount_pending
FROM public.payment_plans pp
JOIN public.cases c ON pp.case_id = c.id
LEFT JOIN public.transactions t ON c.id = t.case_id AND t.status = 'received'
GROUP BY pp.id, c.id;

-- View for communication summary
CREATE OR REPLACE VIEW public.communication_summary AS
SELECT 
  c.id,
  c.client_name,
  c.file_no,
  COUNT(DISTINCT cc.id) as total_communications,
  COUNT(DISTINCT CASE WHEN cc.communication_type = 'email' THEN cc.id END) as email_count,
  COUNT(DISTINCT CASE WHEN cc.communication_type = 'phone' THEN cc.id END) as phone_count,
  COUNT(DISTINCT CASE WHEN cc.communication_type = 'meeting' THEN cc.id END) as meeting_count,
  MAX(cc.communication_date) as last_communication
FROM public.cases c
LEFT JOIN public.client_communications cc ON c.id = cc.case_id
GROUP BY c.id;
```

### Command 8: Create Functions

```sql
-- Function to get case summary
CREATE OR REPLACE FUNCTION get_case_summary(case_id UUID)
RETURNS TABLE (
  case_id UUID,
  client_name VARCHAR,
  file_no VARCHAR,
  status VARCHAR,
  stage VARCHAR,
  total_notes BIGINT,
  total_reminders BIGINT,
  total_communications BIGINT,
  total_received DECIMAL,
  total_pending DECIMAL
) AS $
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.client_name,
    c.file_no,
    c.status,
    c.stage::VARCHAR,
    COUNT(DISTINCT cn.id)::BIGINT,
    COUNT(DISTINCT cr.id)::BIGINT,
    COUNT(DISTINCT cc.id)::BIGINT,
    COALESCE(SUM(t.amount) FILTER (WHERE t.status = 'received'), 0),
    COALESCE(SUM(t.amount) FILTER (WHERE t.status = 'pending'), 0)
  FROM public.cases c
  LEFT JOIN public.case_notes cn ON c.id = cn.case_id
  LEFT JOIN public.case_reminders cr ON c.id = cr.case_id
  LEFT JOIN public.client_communications cc ON c.id = cc.case_id
  LEFT JOIN public.transactions t ON c.id = t.case_id
  WHERE c.id = case_id
  GROUP BY c.id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get upcoming reminders
CREATE OR REPLACE FUNCTION get_upcoming_reminders(days_ahead INTEGER DEFAULT 7)
RETURNS SETOF public.case_reminders AS $
BEGIN
  RETURN QUERY
  SELECT * FROM public.case_reminders
  WHERE is_completed = false 
    AND reminder_date BETWEEN CURRENT_DATE AND CURRENT_DATE + (days_ahead || ' days')::INTERVAL
  ORDER BY reminder_date ASC;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate case age
CREATE OR REPLACE FUNCTION calculate_case_age(case_id UUID)
RETURNS TABLE (
  case_id UUID,
  age_in_days INTEGER,
  age_in_months NUMERIC,
  age_in_years NUMERIC
) AS $
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    (CURRENT_DATE - c.created_at::DATE)::INTEGER,
    ROUND((CURRENT_DATE - c.created_at::DATE)::NUMERIC / 30.44, 2),
    ROUND((CURRENT_DATE - c.created_at::DATE)::NUMERIC / 365.25, 2)
  FROM public.cases c
  WHERE c.id = case_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get case statistics
CREATE OR REPLACE FUNCTION get_case_statistics()
RETURNS TABLE (
  total_cases BIGINT,
  active_cases BIGINT,
  pending_cases BIGINT,
  closed_cases BIGINT,
  total_notes BIGINT,
  pending_reminders BIGINT,
  total_communications BIGINT,
  total_payment_plans BIGINT
) AS $
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.cases)::BIGINT,
    (SELECT COUNT(*) FROM public.cases WHERE status = 'active')::BIGINT,
    (SELECT COUNT(*) FROM public.cases WHERE status = 'pending')::BIGINT,
    (SELECT COUNT(*) FROM public.cases WHERE status = 'closed')::BIGINT,
    (SELECT COUNT(*) FROM public.case_notes)::BIGINT,
    (SELECT COUNT(*) FROM public.case_reminders WHERE is_completed = false AND reminder_date <= CURRENT_DATE)::BIGINT,
    (SELECT COUNT(*) FROM public.client_communications)::BIGINT,
    (SELECT COUNT(*) FROM public.payment_plans WHERE status = 'active')::BIGINT;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Command 9: Grant Permissions

```sql
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
```

---

## ✅ Verification Queries

Run these after all commands to verify everything was created:

### Check Tables
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('audit_logs', 'case_notes', 'case_reminders', 'case_timeline', 'payment_plans', 'client_communications')
ORDER BY table_name;
```

**Expected Result:** 6 rows

### Check Views
```sql
SELECT viewname FROM pg_views 
WHERE schemaname = 'public' 
AND (viewname LIKE '%case_%' OR viewname LIKE '%payment_%' OR viewname LIKE '%communication_%')
ORDER BY viewname;
```

**Expected Result:** 5 rows

### Check Functions
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
AND (routine_name LIKE 'get_%' OR routine_name LIKE 'calculate_%')
ORDER BY routine_name;
```

**Expected Result:** 4 rows

### Check Indexes
```sql
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
AND (indexname LIKE 'idx_%')
ORDER BY indexname;
```

**Expected Result:** 15+ rows

---

## 🎯 Quick Deployment Steps

1. **Copy entire SQL from `PRODUCTION_ORANGE_THEME_COMPLETE.sql`**
2. **Go to Supabase Dashboard → SQL Editor**
3. **Create new query**
4. **Paste SQL**
5. **Click Run**
6. **Wait for success**
7. **Run verification queries above**
8. **Update React components (see COMPONENT_COLOR_UPDATES.md)**
9. **Deploy to production**

---

## ⏱️ Execution Time

- **All commands together:** ~30 seconds
- **Individual commands:** ~5 seconds each
- **Verification queries:** ~2 seconds

---

## 🔒 Safety Notes

- ✅ All commands are idempotent (safe to run multiple times)
- ✅ `IF NOT EXISTS` prevents errors if tables already exist
- ✅ `DROP TRIGGER IF EXISTS` prevents duplicate triggers
- ✅ No data is deleted
- ✅ Existing tables are not modified

---

## 📞 Need Help?

If you encounter any errors:

1. **Check the error message** - It will tell you what went wrong
2. **Verify Supabase connection** - Make sure you're in the right project
3. **Check existing tables** - Run verification queries
4. **Review documentation** - See PRODUCTION_READY_UPDATES_ORANGE_THEME.md

---

**Ready to deploy?** Copy the SQL and run it now! 🚀
