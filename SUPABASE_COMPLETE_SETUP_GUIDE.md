# 🚀 Complete Supabase Database Setup Guide

## Legal Case Management Dashboard - Full Database Configuration

This guide will help you set up your complete Supabase database with ALL features including:
- ✅ User Authentication & Management
- ✅ Case Management (30+ fields)
- ✅ Financial Tracking with Payment Modes
- ✅ Task Management System
- ✅ Attendance Tracking
- ✅ Expense Management
- ✅ Library Management
- ✅ Counsel Management
- ✅ Appointments & Calendar
- ✅ Dropbox Integration Support

---

## 📋 Prerequisites

1. A Supabase account (free tier works fine)
2. Your Supabase project created
3. Access to Supabase SQL Editor

---

## 🎯 Step-by-Step Setup

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Complete Database Setup

1. Open the file: `supabase/migrations/COMPLETE_DATABASE_SETUP.sql`
2. Copy the ENTIRE contents of the file
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl/Cmd + Enter)
5. Wait for execution to complete (should take 10-30 seconds)

### Step 3: Verify Setup

Run these verification queries one by one:

```sql
-- Check if all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if admin user was created
SELECT * FROM public.authenticate_user('admin', 'admin123');

-- Check dashboard stats
SELECT * FROM get_dashboard_stats();

-- List all users
SELECT * FROM public.get_all_users();
```

### Step 4: Get Your Supabase Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 5: Update Your .env File

Create or update `.env` file in your project root:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 6: Clear Browser Data

**IMPORTANT:** Clear your browser's localStorage to remove old mock data:

1. Open your app in browser
2. Open Developer Tools (F12)
3. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
4. Click **Local Storage**
5. Right-click and select **Clear**
6. Refresh the page

### Step 7: First Login

1. Navigate to your app's login page
2. Use these credentials:
   - **Username:** `admin`
   - **Password:** `admin123`
3. ⚠️ **IMPORTANT:** Change this password immediately after first login!

---

## 📊 Database Structure

### Core Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `user_accounts` | User authentication & management | Bcrypt password hashing, role-based access |
| `cases` | Case management | 30+ fields, status tracking, stage tracking |
| `counsel` | Lawyer/counsel information | Auto case count, contact details |
| `appointments` | Scheduling system | Date/time tracking, user assignment |
| `transactions` | Financial tracking | Payment modes, status tracking |
| `tasks` | Task management | Case linking, deadline tracking |
| `attendance` | Attendance tracking | Daily records, calendar view |
| `expenses` | Expense management | Monthly tracking, user attribution |
| `books` | Library management (L1) | Book tracking |
| `sofa_items` | Sofa compartments (C1/C2) | Case file storage |
| `counsel_cases` | Counsel-case linking | Many-to-many relationship |
| `case_documents` | Dropbox file references | File metadata storage |
| `courts` | Court names | Shared dropdown data |
| `case_types` | Case categories | Shared dropdown data |

### Key Functions

| Function | Purpose |
|----------|---------|
| `authenticate_user()` | User login with password verification |
| `create_user_account()` | Create new users with validation |
| `get_all_users()` | List all users |
| `update_user_role()` | Change user roles (admin only) |
| `toggle_user_status()` | Activate/deactivate users |
| `delete_user_account()` | Soft delete users |
| `get_dashboard_stats()` | Get comprehensive dashboard statistics |
| `search_cases()` | Full-text search across cases |
| `get_cases_by_date()` | Get cases by specific date |

---

## 🔐 Security Features

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:
- Users can view active data
- Admins have full control
- Users can manage their own data
- Soft deletes for user accounts

### Password Security

- Passwords are hashed using bcrypt (10 rounds)
- Never stored in plain text
- Secure authentication function

### Role-Based Access

Three roles supported:
- **admin**: Full system access
- **user**: Standard user access
- **vipin**: Custom role (same as user)

---

## 🧪 Testing Your Setup

### Test 1: Authentication

```sql
SELECT * FROM public.authenticate_user('admin', 'admin123');
```

Expected result: Success with user details

### Test 2: Create a Test User

```sql
SELECT * FROM public.create_user_account(
  'Test User',
  'test@example.com',
  'testuser',
  'password123',
  'user',
  NULL
);
```

### Test 3: List All Users

```sql
SELECT * FROM public.get_all_users();
```

Should show admin and test user

### Test 4: Dashboard Stats

```sql
SELECT * FROM get_dashboard_stats();
```

Should return statistics (all zeros initially)

### Test 5: Insert Test Case

```sql
INSERT INTO public.cases (
  client_name,
  client_email,
  client_mobile,
  file_no,
  parties_name,
  case_type,
  court,
  status
) VALUES (
  'John Doe',
  'john@example.com',
  '1234567890',
  'CASE-001',
  'John Doe vs State',
  'Civil',
  'District Court',
  'active'
);
```

### Test 6: Search Cases

```sql
SELECT * FROM search_cases('John');
```

Should return the test case

---

## 🎨 Sample Data Included

The setup automatically creates:

### Courts (10 entries)
- Supreme Court
- High Court
- District Court
- Sessions Court
- Civil Court
- Family Court
- Consumer Court
- Labour Court
- Tribunal
- Magistrate Court

### Case Types (17 entries)
- Civil
- Criminal
- Family
- Corporate
- Immigration
- Real Estate
- Labour
- Tax
- Constitutional
- Consumer Protection
- Intellectual Property
- Banking
- Insurance
- Arbitration
- Writ Petition
- Property
- Other

---

## 🔧 Troubleshooting

### Issue: Authentication Fails

**Solution:**
```sql
-- Check if admin user exists
SELECT * FROM public.user_accounts WHERE username = 'admin';

-- Recreate admin user if needed
DELETE FROM public.user_accounts WHERE username = 'admin';
INSERT INTO public.user_accounts (name, email, username, password_hash, role, is_active)
VALUES (
  'Admin User',
  'admin@katneshwarkar.com',
  'admin',
  public.hash_password('admin123'),
  'admin',
  TRUE
);
```

### Issue: RLS Blocks Access

**Temporary Solution (Development Only):**
```sql
-- Disable RLS on specific table
ALTER TABLE public.cases DISABLE ROW LEVEL SECURITY;

-- Re-enable when done testing
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
```

### Issue: Functions Not Found

**Solution:**
```sql
-- Check if functions exist
SELECT proname FROM pg_proc WHERE proname LIKE '%authenticate%';

-- If missing, re-run the COMPLETE_DATABASE_SETUP.sql file
```

### Issue: Old Data Still Showing

**Solution:**
1. Clear browser localStorage (see Step 6 above)
2. Clear browser cache
3. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. Try incognito/private browsing mode

### Issue: Policies Not Working

**Solution:**
```sql
-- View all policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Drop and recreate policies if needed
-- (Re-run the COMPLETE_DATABASE_SETUP.sql file)
```

---

## 📱 Frontend Integration

Your React app should already be configured to use Supabase. Verify these files:

### 1. Check `src/lib/supabase.ts`

Should contain:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 2. Check `src/contexts/AuthContext.tsx`

Should use Supabase authentication functions

### 3. Check `src/contexts/DataContext.tsx`

Should use Supabase for all CRUD operations

---

## 🚀 Next Steps After Setup

1. **Change Admin Password**
   - Login as admin
   - Go to Settings
   - Change password to something secure

2. **Create Users**
   - Go to Admin page
   - Create user accounts for your team
   - Assign appropriate roles

3. **Add Courts & Case Types**
   - Go to Settings page
   - Add any additional courts or case types needed

4. **Start Adding Cases**
   - Go to Cases page
   - Click "Create New Case"
   - Fill in case details

5. **Configure Dropbox (Optional)**
   - Set up Dropbox integration for file storage
   - Update environment variables

6. **Test All Features**
   - Create test cases
   - Add appointments
   - Track finances
   - Manage tasks
   - Record attendance
   - Track expenses

---

## 📊 Feature Checklist

After setup, verify these features work:

- [ ] User login/logout
- [ ] Create/edit/delete cases
- [ ] Add appointments
- [ ] Track transactions
- [ ] Manage counsel
- [ ] Create tasks
- [ ] Mark attendance
- [ ] Add expenses
- [ ] Library management
- [ ] Search functionality
- [ ] Dashboard statistics
- [ ] Calendar view
- [ ] Date-based filtering
- [ ] Role-based access control
- [ ] User management (admin only)

---

## 💾 Backup & Maintenance

### Create Backup

```sql
-- Export all data (run in Supabase SQL Editor)
COPY (SELECT * FROM public.cases) TO '/tmp/cases_backup.csv' CSV HEADER;
COPY (SELECT * FROM public.user_accounts) TO '/tmp/users_backup.csv' CSV HEADER;
-- Repeat for other tables
```

### Regular Maintenance

1. **Weekly:** Review user accounts and deactivate unused ones
2. **Monthly:** Check database size and optimize if needed
3. **Quarterly:** Review and update RLS policies
4. **Yearly:** Audit all data and archive old cases

---

## 📞 Support

For issues or questions:
- **Email:** sawantrishi152@gmail.com
- **Check:** Supabase documentation at https://supabase.com/docs
- **Review:** Application logs in browser console

---

## 🎉 Success!

If you've completed all steps and tests pass, your database is ready!

You now have a fully functional legal case management system with:
- ✅ Secure authentication
- ✅ Complete case management
- ✅ Financial tracking
- ✅ Task management
- ✅ Attendance system
- ✅ Expense tracking
- ✅ And much more!

**Happy case managing! 🎊**
