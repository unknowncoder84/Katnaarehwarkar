# 📚 Supabase SQL Quick Reference

## Common SQL Commands for Your Legal Case Management System

---

## 🔐 User Management

### Create a New User
```sql
SELECT * FROM public.create_user_account(
  'User Name',           -- name
  'user@example.com',    -- email
  'username',            -- username
  'password123',         -- password
  'user',                -- role (admin/user/vipin)
  NULL                   -- created_by (optional)
);
```

### Authenticate User (Login)
```sql
SELECT * FROM public.authenticate_user('username', 'password');
```

### List All Users
```sql
SELECT * FROM public.get_all_users();
```

### Update User Role
```sql
SELECT * FROM public.update_user_role(
  'user-uuid-here',      -- user_id
  'admin',               -- new_role
  'admin-uuid-here'      -- updated_by (must be admin)
);
```

### Toggle User Status (Activate/Deactivate)
```sql
SELECT * FROM public.toggle_user_status(
  'user-uuid-here',      -- user_id
  'admin-uuid-here'      -- updated_by (must be admin)
);
```

### Delete User (Soft Delete)
```sql
SELECT * FROM public.delete_user_account(
  'user-uuid-here',      -- user_id
  'admin-uuid-here'      -- deleted_by (must be admin)
);
```

### Change User Password
```sql
UPDATE public.user_accounts
SET password_hash = public.hash_password('new_password')
WHERE id = 'user-uuid-here';
```

---

## 📁 Case Management

### Create a New Case
```sql
INSERT INTO public.cases (
  client_name,
  client_email,
  client_mobile,
  file_no,
  stamp_no,
  reg_no,
  parties_name,
  district,
  case_type,
  court,
  on_behalf_of,
  no_resp,
  opponent_lawyer,
  additional_details,
  fees_quoted,
  status,
  stage,
  next_date,
  filing_date,
  circulation_status,
  interim_relief,
  created_by
) VALUES (
  'John Doe',
  'john@example.com',
  '1234567890',
  'CASE-001',
  'STAMP-001',
  'REG-001',
  'John Doe vs State',
  'Mumbai',
  'Civil',
  'High Court',
  'Plaintiff',
  '2',
  'Jane Smith',
  'Additional case details here',
  50000.00,
  'active',
  'filing',
  '2025-01-15',
  '2025-01-01',
  'non-circulated',
  'none',
  'user-uuid-here'
);
```

### Search Cases
```sql
SELECT * FROM search_cases('search term');
```

### Get Cases by Date
```sql
SELECT * FROM get_cases_by_date('2025-01-15');
```

### Update Case Status
```sql
UPDATE public.cases
SET status = 'closed', updated_at = NOW()
WHERE id = 'case-uuid-here';
```

### Get All Active Cases
```sql
SELECT * FROM public.active_cases;
```

### Get All Pending Cases
```sql
SELECT * FROM public.pending_cases;
```

### Get All Disposed Cases
```sql
SELECT * FROM public.disposed_cases;
```

### Get Upcoming Hearings (Next 7 Days)
```sql
SELECT * FROM public.upcoming_hearings;
```

### Get Cases with Transaction Summary
```sql
SELECT * FROM public.cases_with_transactions;
```

---

## 💰 Financial Management

### Add a Transaction
```sql
INSERT INTO public.transactions (
  amount,
  status,
  payment_mode,
  received_by,
  confirmed_by,
  case_id
) VALUES (
  25000.00,
  'received',
  'upi',
  'Admin User',
  'Manager Name',
  'case-uuid-here'
);
```

### Get All Transactions for a Case
```sql
SELECT * FROM public.transactions
WHERE case_id = 'case-uuid-here'
ORDER BY created_at DESC;
```

### Get Total Received Amount
```sql
SELECT SUM(amount) as total_received
FROM public.transactions
WHERE status = 'received';
```

### Get Total Pending Amount
```sql
SELECT SUM(amount) as total_pending
FROM public.transactions
WHERE status = 'pending';
```

### Update Transaction Status
```sql
UPDATE public.transactions
SET status = 'received', confirmed_by = 'Admin User'
WHERE id = 'transaction-uuid-here';
```

---

## 📅 Appointments

### Create an Appointment
```sql
INSERT INTO public.appointments (
  date,
  time,
  user_id,
  user_name,
  client,
  details
) VALUES (
  '2025-01-15',
  '10:00 AM',
  'user-uuid-here',
  'User Name',
  'Client Name',
  'Meeting details'
);
```

### Get Today's Appointments
```sql
SELECT * FROM public.todays_appointments;
```

### Get Appointments by Date
```sql
SELECT * FROM public.appointments
WHERE date = '2025-01-15'
ORDER BY time ASC;
```

### Get Upcoming Appointments
```sql
SELECT * FROM public.appointments
WHERE date >= CURRENT_DATE
ORDER BY date ASC, time ASC;
```

---

## 👨‍⚖️ Counsel Management

### Add a Counsel
```sql
INSERT INTO public.counsel (
  name,
  email,
  mobile,
  address,
  details,
  created_by
) VALUES (
  'Advocate Name',
  'advocate@example.com',
  '9876543210',
  'Office Address',
  'Specialization and details',
  'user-uuid-here'
);
```

### Link Counsel to Case
```sql
INSERT INTO public.counsel_cases (counsel_id, case_id)
VALUES ('counsel-uuid-here', 'case-uuid-here');
```

### Get Counsel with Case Count
```sql
SELECT * FROM public.counsel_with_cases;
```

### Get Cases for a Counsel
```sql
SELECT c.* FROM public.cases c
JOIN public.counsel_cases cc ON c.id = cc.case_id
WHERE cc.counsel_id = 'counsel-uuid-here';
```

---

## ✅ Task Management

### Create a Task
```sql
INSERT INTO public.tasks (
  type,
  title,
  description,
  assigned_to,
  assigned_to_name,
  assigned_by,
  assigned_by_name,
  case_id,
  case_name,
  deadline,
  status
) VALUES (
  'case',
  'File petition',
  'File the petition in court',
  'user-uuid-here',
  'User Name',
  'admin-uuid-here',
  'Admin Name',
  'case-uuid-here',
  'John Doe',
  '2025-01-20',
  'pending'
);
```

### Get Pending Tasks
```sql
SELECT * FROM public.tasks
WHERE status = 'pending'
ORDER BY deadline ASC;
```

### Get Tasks for a User
```sql
SELECT * FROM public.tasks
WHERE assigned_to = 'user-uuid-here'
ORDER BY deadline ASC;
```

### Complete a Task
```sql
UPDATE public.tasks
SET status = 'completed', completed_at = NOW()
WHERE id = 'task-uuid-here';
```

---

## 📊 Attendance Management

### Mark Attendance
```sql
INSERT INTO public.attendance (
  user_id,
  user_name,
  date,
  status,
  marked_by,
  marked_by_name
) VALUES (
  'user-uuid-here',
  'User Name',
  CURRENT_DATE,
  'present',
  'admin-uuid-here',
  'Admin Name'
)
ON CONFLICT (user_id, date) 
DO UPDATE SET status = EXCLUDED.status;
```

### Get Attendance for a Date
```sql
SELECT * FROM public.attendance
WHERE date = '2025-01-15';
```

### Get Attendance for a User (This Month)
```sql
SELECT * FROM public.attendance
WHERE user_id = 'user-uuid-here'
  AND date >= DATE_TRUNC('month', CURRENT_DATE)
  AND date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
ORDER BY date DESC;
```

### Calculate Attendance Percentage
```sql
SELECT 
  user_name,
  COUNT(*) as total_days,
  SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
  ROUND(
    (SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)) * 100,
    2
  ) as attendance_percentage
FROM public.attendance
WHERE user_id = 'user-uuid-here'
  AND date >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY user_name;
```

---

## 💸 Expense Management

### Add an Expense
```sql
INSERT INTO public.expenses (
  amount,
  description,
  added_by,
  added_by_name,
  month
) VALUES (
  5000.00,
  'Office supplies',
  'user-uuid-here',
  'User Name',
  '2025-01'
);
```

### Get Expenses for a Month
```sql
SELECT * FROM public.expenses
WHERE month = '2025-01'
ORDER BY created_at DESC;
```

### Get Total Expenses for a Month
```sql
SELECT SUM(amount) as total_expenses
FROM public.expenses
WHERE month = '2025-01';
```

### Get Expenses by User
```sql
SELECT * FROM public.expenses
WHERE added_by = 'user-uuid-here'
ORDER BY created_at DESC;
```

---

## 📚 Library Management

### Add a Book
```sql
INSERT INTO public.books (name, location, added_by)
VALUES ('Book Title', 'L1', 'user-uuid-here');
```

### Get All Books
```sql
SELECT * FROM public.books
ORDER BY added_at DESC;
```

### Add Item to Sofa Compartment
```sql
INSERT INTO public.sofa_items (case_id, compartment, added_by)
VALUES ('case-uuid-here', 'C1', 'user-uuid-here');
```

### Get Sofa Items with Case Details
```sql
SELECT * FROM public.sofa_items_with_cases;
```

---

## 📈 Dashboard & Statistics

### Get Complete Dashboard Stats
```sql
SELECT * FROM get_dashboard_stats();
```

### Get Case Statistics
```sql
SELECT 
  status,
  COUNT(*) as count
FROM public.cases
GROUP BY status;
```

### Get Monthly Financial Summary
```sql
SELECT 
  DATE_TRUNC('month', created_at) as month,
  SUM(CASE WHEN status = 'received' THEN amount ELSE 0 END) as received,
  SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending
FROM public.transactions
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

### Get Case Type Distribution
```sql
SELECT 
  case_type,
  COUNT(*) as count
FROM public.cases
GROUP BY case_type
ORDER BY count DESC;
```

---

## 🔍 Advanced Queries

### Get Cases with No Next Date
```sql
SELECT * FROM public.cases
WHERE next_date IS NULL
  AND status IN ('active', 'pending');
```

### Get Overdue Cases
```sql
SELECT * FROM public.cases
WHERE next_date < CURRENT_DATE
  AND status IN ('active', 'pending');
```

### Get Cases Filed This Month
```sql
SELECT * FROM public.cases
WHERE filing_date >= DATE_TRUNC('month', CURRENT_DATE)
  AND filing_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
```

### Get Top Clients by Case Count
```sql
SELECT 
  client_name,
  COUNT(*) as case_count
FROM public.cases
GROUP BY client_name
ORDER BY case_count DESC
LIMIT 10;
```

### Get Revenue by Case
```sql
SELECT 
  c.client_name,
  c.file_no,
  c.fees_quoted,
  COALESCE(SUM(t.amount), 0) as total_received,
  c.fees_quoted - COALESCE(SUM(t.amount), 0) as balance
FROM public.cases c
LEFT JOIN public.transactions t ON c.id = t.case_id AND t.status = 'received'
GROUP BY c.id, c.client_name, c.file_no, c.fees_quoted
ORDER BY balance DESC;
```

---

## 🛠️ Maintenance Queries

### Reset Admin Password
```sql
UPDATE public.user_accounts
SET password_hash = public.hash_password('newpassword123')
WHERE username = 'admin';
```

### Deactivate Inactive Users
```sql
UPDATE public.user_accounts
SET is_active = FALSE
WHERE updated_at < NOW() - INTERVAL '90 days'
  AND role != 'admin';
```

### Archive Old Cases
```sql
UPDATE public.cases
SET status = 'closed'
WHERE status = 'active'
  AND updated_at < NOW() - INTERVAL '1 year';
```

### Clean Up Old Appointments
```sql
DELETE FROM public.appointments
WHERE date < CURRENT_DATE - INTERVAL '1 year';
```

---

## 🔐 Security Queries

### View All Active Users
```sql
SELECT id, name, email, username, role, created_at
FROM public.user_accounts
WHERE is_active = TRUE
ORDER BY created_at DESC;
```

### Check User Permissions
```sql
SELECT * FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'cases';
```

### View Failed Login Attempts (Custom Implementation Needed)
```sql
-- This would require adding a login_attempts table
-- Example structure:
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(100),
  success BOOLEAN,
  ip_address VARCHAR(45),
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📊 Reporting Queries

### Monthly Case Report
```sql
SELECT 
  DATE_TRUNC('month', filing_date) as month,
  COUNT(*) as cases_filed,
  SUM(fees_quoted) as total_fees_quoted
FROM public.cases
WHERE filing_date >= DATE_TRUNC('year', CURRENT_DATE)
GROUP BY DATE_TRUNC('month', filing_date)
ORDER BY month DESC;
```

### User Activity Report
```sql
SELECT 
  u.name,
  COUNT(DISTINCT c.id) as cases_created,
  COUNT(DISTINCT t.id) as tasks_assigned,
  COUNT(DISTINCT a.id) as appointments_scheduled
FROM public.user_accounts u
LEFT JOIN public.cases c ON u.id = c.created_by
LEFT JOIN public.tasks t ON u.id = t.assigned_by
LEFT JOIN public.appointments a ON u.id = a.user_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.name
ORDER BY cases_created DESC;
```

---

## 💡 Tips & Best Practices

1. **Always use parameterized queries** in your application code
2. **Never store passwords in plain text** - always use `hash_password()`
3. **Use transactions** for operations that modify multiple tables
4. **Create indexes** on frequently queried columns
5. **Regular backups** - export important data regularly
6. **Monitor performance** - use `EXPLAIN ANALYZE` for slow queries
7. **Keep RLS enabled** - only disable for debugging
8. **Use UUIDs** - they're already set as default for all tables
9. **Soft deletes** - prefer deactivating over hard deletes
10. **Audit trails** - use `created_at` and `updated_at` fields

---

## 🆘 Emergency Commands

### Disable All RLS (Development Only!)
```sql
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE 'ALTER TABLE public.' || r.tablename || ' DISABLE ROW LEVEL SECURITY';
  END LOOP;
END $$;
```

### Re-enable All RLS
```sql
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE 'ALTER TABLE public.' || r.tablename || ' ENABLE ROW LEVEL SECURITY';
  END LOOP;
END $$;
```

### Drop All Tables (⚠️ DANGER!)
```sql
-- ONLY USE IF YOU WANT TO START FRESH
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

---

**Remember:** Always test queries in a development environment first!

For more help, refer to:
- Supabase Documentation: https://supabase.com/docs
- PostgreSQL Documentation: https://www.postgresql.org/docs/
