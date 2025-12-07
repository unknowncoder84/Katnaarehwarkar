# ✅ Setup Checklist

## Complete Setup Checklist for Legal Case Management System

Use this checklist to track your progress through the setup process.

---

## 📋 Pre-Setup Checklist

### Before You Begin

- [ ] Have a Supabase account
- [ ] Created a Supabase project
- [ ] Have access to Supabase SQL Editor
- [ ] Have Node.js installed (v16 or higher)
- [ ] Have npm or yarn installed
- [ ] Have a code editor (VS Code recommended)
- [ ] Have a modern browser (Chrome, Firefox, Edge, Safari)

---

## 🗄️ Database Setup

### Step 1: Run SQL Setup

- [ ] Opened Supabase Dashboard
- [ ] Navigated to SQL Editor
- [ ] Opened `COMPLETE_DATABASE_SETUP.sql` file
- [ ] Copied entire file contents
- [ ] Pasted into SQL Editor
- [ ] Clicked "Run" button
- [ ] Waited for execution to complete (10-30 seconds)
- [ ] Checked for success message (no errors)

### Step 2: Verify Database Setup

Run these queries and check the boxes when they work:

- [ ] **Test 1:** Check tables exist
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' ORDER BY table_name;
  ```
  Expected: 14 tables listed

- [ ] **Test 2:** Test authentication
  ```sql
  SELECT * FROM public.authenticate_user('admin', 'admin123');
  ```
  Expected: Success with user details

- [ ] **Test 3:** List users
  ```sql
  SELECT * FROM public.get_all_users();
  ```
  Expected: Admin user listed

- [ ] **Test 4:** Check dashboard stats
  ```sql
  SELECT * FROM get_dashboard_stats();
  ```
  Expected: Statistics returned (all zeros initially)

- [ ] **Test 5:** Check functions
  ```sql
  SELECT proname FROM pg_proc 
  WHERE proname IN ('authenticate_user', 'hash_password', 'create_user_account');
  ```
  Expected: 3 functions listed

- [ ] **Test 6:** Check sample data
  ```sql
  SELECT COUNT(*) FROM public.courts;
  SELECT COUNT(*) FROM public.case_types;
  ```
  Expected: 10 courts, 17 case types

- [ ] **Test 7:** Insert test case
  ```sql
  INSERT INTO public.cases (client_name, file_no, case_type, court, status)
  VALUES ('Test Client', 'TEST-001', 'Civil', 'District Court', 'active');
  ```
  Expected: 1 row inserted

- [ ] **Test 8:** Search test
  ```sql
  SELECT * FROM search_cases('Test');
  ```
  Expected: Test case returned

- [ ] **Test 9:** Delete test case
  ```sql
  DELETE FROM public.cases WHERE file_no = 'TEST-001';
  ```
  Expected: 1 row deleted

---

## 🔧 Application Setup

### Step 3: Configure Environment

- [ ] Located `.env` file in project root
- [ ] If not exists, created `.env` file
- [ ] Opened Supabase Dashboard → Settings → API
- [ ] Copied Project URL
- [ ] Copied anon public key
- [ ] Updated `.env` file with:
  ```env
  VITE_SUPABASE_URL=your_project_url_here
  VITE_SUPABASE_ANON_KEY=your_anon_key_here
  ```
- [ ] Saved `.env` file
- [ ] Verified no spaces or quotes around values

### Step 4: Install Dependencies

- [ ] Opened terminal in project directory
- [ ] Ran `npm install` (or `yarn install`)
- [ ] Waited for installation to complete
- [ ] Checked for no errors
- [ ] Verified `node_modules` folder exists

### Step 5: Start Development Server

- [ ] Ran `npm run dev` (or `yarn dev`)
- [ ] Waited for server to start
- [ ] Noted the local URL (usually http://localhost:5173)
- [ ] Opened URL in browser
- [ ] Verified app loads (even if showing login page)

---

## 🧹 Browser Setup

### Step 6: Clear Browser Data

- [ ] Opened browser Developer Tools (F12)
- [ ] Went to Application tab (Chrome) or Storage tab (Firefox)
- [ ] Clicked Local Storage
- [ ] Right-clicked and selected "Clear"
- [ ] Went to Session Storage
- [ ] Right-clicked and selected "Clear"
- [ ] Closed Developer Tools
- [ ] Hard refreshed page (Ctrl+Shift+R or Cmd+Shift+R)

---

## 🔐 First Login

### Step 7: Login as Admin

- [ ] Navigated to login page
- [ ] Entered username: `admin`
- [ ] Entered password: `admin123`
- [ ] Clicked "Login" button
- [ ] Successfully logged in
- [ ] Redirected to dashboard
- [ ] Dashboard loads without errors

### Step 8: Change Admin Password

- [ ] Clicked on user menu/profile
- [ ] Navigated to Settings page
- [ ] Found "Change Password" section
- [ ] Entered current password: `admin123`
- [ ] Entered new strong password
- [ ] Confirmed new password
- [ ] Clicked "Change Password"
- [ ] Received success message
- [ ] Logged out
- [ ] Logged back in with new password
- [ ] Login successful

---

## 👥 User Management

### Step 9: Create Test User

- [ ] Logged in as admin
- [ ] Navigated to Admin page
- [ ] Clicked "Create User" button
- [ ] Filled in user details:
  - Name: Test User
  - Email: test@example.com
  - Username: testuser
  - Password: password123
  - Role: user
- [ ] Clicked "Create User"
- [ ] User created successfully
- [ ] User appears in user list

### Step 10: Test User Login

- [ ] Logged out as admin
- [ ] Logged in as test user
- [ ] Username: testuser
- [ ] Password: password123
- [ ] Login successful
- [ ] Dashboard loads
- [ ] Verified limited access (no admin features)
- [ ] Logged out

---

## 📊 Feature Testing

### Step 11: Test Case Management

- [ ] Logged in as admin
- [ ] Navigated to Cases page
- [ ] Clicked "Create New Case"
- [ ] Filled in case details:
  - Client Name: John Doe
  - File No: CASE-001
  - Case Type: Civil
  - Court: District Court
  - Status: Active
  - (Fill other required fields)
- [ ] Clicked "Create Case"
- [ ] Case created successfully
- [ ] Case appears in cases list
- [ ] Clicked on case to view details
- [ ] Case details page loads
- [ ] Clicked "Edit" button
- [ ] Modified case details
- [ ] Saved changes
- [ ] Changes reflected in case list

### Step 12: Test Financial Tracking

- [ ] Opened a case
- [ ] Scrolled to Transactions section
- [ ] Clicked "Add Transaction"
- [ ] Filled in transaction details:
  - Amount: 25000
  - Status: Received
  - Payment Mode: UPI
  - Received By: Admin User
- [ ] Clicked "Add Transaction"
- [ ] Transaction added successfully
- [ ] Transaction appears in list
- [ ] Dashboard shows updated financial stats

### Step 13: Test Appointments

- [ ] Navigated to Appointments page
- [ ] Clicked "Create Appointment"
- [ ] Filled in appointment details:
  - Date: Tomorrow's date
  - Time: 10:00 AM
  - Client: John Doe
  - Details: Initial consultation
- [ ] Clicked "Create Appointment"
- [ ] Appointment created successfully
- [ ] Appointment appears in list
- [ ] Calendar shows appointment

### Step 14: Test Task Management

- [ ] Navigated to Tasks page
- [ ] Clicked "Create Task"
- [ ] Selected task type: Custom
- [ ] Filled in task details:
  - Title: Review documents
  - Description: Review case documents
  - Assign To: Test User
  - Deadline: Next week
- [ ] Clicked "Create Task"
- [ ] Task created successfully
- [ ] Task appears in list
- [ ] Logged in as test user
- [ ] Verified task appears in "My Tasks"
- [ ] Marked task as complete
- [ ] Task status updated

### Step 15: Test Attendance

- [ ] Logged in as admin
- [ ] Navigated to Attendance page
- [ ] Selected today's date
- [ ] Marked test user as Present
- [ ] Attendance recorded successfully
- [ ] Clicked "View Calendar" for test user
- [ ] Calendar shows attendance record
- [ ] Verified attendance statistics

### Step 16: Test Expenses

- [ ] Navigated to Expenses page
- [ ] Clicked "Add Expense"
- [ ] Filled in expense details:
  - Amount: 5000
  - Description: Office supplies
  - Month: Current month
- [ ] Clicked "Add Expense"
- [ ] Expense added successfully
- [ ] Expense appears in list
- [ ] Monthly total updated

### Step 17: Test Library Management

- [ ] Navigated to Library page
- [ ] Clicked "Add Book" (L1 section)
- [ ] Entered book name: "Law Book 1"
- [ ] Clicked "Add"
- [ ] Book added successfully
- [ ] Book appears in L1 list
- [ ] Clicked "Add to Sofa" (C1 section)
- [ ] Selected a case
- [ ] Clicked "Add"
- [ ] Case file added to C1
- [ ] Item appears in sofa list

### Step 18: Test Counsel Management

- [ ] Navigated to Counsel page
- [ ] Clicked "Add Counsel"
- [ ] Filled in counsel details:
  - Name: Advocate Smith
  - Email: smith@example.com
  - Mobile: 9876543210
  - Address: Office address
- [ ] Clicked "Add Counsel"
- [ ] Counsel added successfully
- [ ] Counsel appears in list
- [ ] Clicked "Assign Cases"
- [ ] Selected a case
- [ ] Case assigned successfully

### Step 19: Test Search & Filter

- [ ] Navigated to Cases page
- [ ] Used search box to search for "John"
- [ ] Search results show matching cases
- [ ] Applied status filter: Active
- [ ] Only active cases shown
- [ ] Applied court filter
- [ ] Results filtered correctly
- [ ] Cleared filters
- [ ] All cases shown again

### Step 20: Test Dashboard

- [ ] Navigated to Dashboard
- [ ] Verified statistics cards show correct numbers:
  - Total Cases
  - Active Cases
  - Pending Cases
  - Closed Cases
  - Total Received
  - Total Pending
  - Upcoming Hearings
  - Today's Appointments
- [ ] Clicked on a date in calendar
- [ ] Date events page loads
- [ ] Shows cases and appointments for that date
- [ ] Clicked on a case
- [ ] Case details page loads

---

## 🔍 Advanced Testing

### Step 21: Test Data Persistence

- [ ] Created multiple records (cases, appointments, tasks)
- [ ] Closed browser completely
- [ ] Reopened browser
- [ ] Navigated to app
- [ ] Logged in
- [ ] Verified all data still present
- [ ] No data loss occurred

### Step 22: Test Permissions

- [ ] Logged in as regular user (not admin)
- [ ] Verified cannot access Admin page
- [ ] Verified cannot delete users
- [ ] Verified cannot change user roles
- [ ] Verified can create cases
- [ ] Verified can add transactions
- [ ] Verified can view own tasks
- [ ] Verified cannot mark attendance (admin only)

### Step 23: Test Mobile Responsiveness

- [ ] Opened app on mobile device (or browser dev tools)
- [ ] Verified layout adapts to small screen
- [ ] Verified navigation menu works
- [ ] Verified forms are usable
- [ ] Verified tables scroll horizontally
- [ ] Verified buttons are clickable
- [ ] Verified text is readable

---

## 📚 Documentation Review

### Step 24: Review Documentation

- [ ] Read `DATABASE_SETUP_SUMMARY.md`
- [ ] Bookmarked `SUPABASE_SQL_QUICK_REFERENCE.md`
- [ ] Reviewed `TROUBLESHOOTING_GUIDE.md`
- [ ] Understood `DATABASE_SCHEMA_DIAGRAM.md`
- [ ] Saved all documentation for future reference

---

## 🎯 Production Readiness

### Step 25: Security Checklist

- [ ] Changed default admin password
- [ ] Created strong passwords for all users
- [ ] Verified RLS is enabled on all tables
- [ ] Checked Supabase URL configuration
- [ ] Added production domain to allowed URLs
- [ ] Verified .env file is in .gitignore
- [ ] Enabled 2FA on Supabase account (recommended)
- [ ] Reviewed user permissions

### Step 26: Performance Checklist

- [ ] Verified all indexes are created
- [ ] Tested query performance with sample data
- [ ] Checked page load times
- [ ] Verified no console errors
- [ ] Tested with multiple users (if possible)
- [ ] Checked database size in Supabase dashboard
- [ ] Verified realtime subscriptions work (if used)

### Step 27: Backup & Maintenance

- [ ] Exported database schema
- [ ] Exported sample data
- [ ] Documented custom changes (if any)
- [ ] Set up regular backup schedule
- [ ] Documented backup procedure
- [ ] Tested restore procedure (optional but recommended)

---

## 🚀 Deployment Checklist

### Step 28: Pre-Deployment

- [ ] Ran `npm run build` successfully
- [ ] Checked build output for errors
- [ ] Tested production build locally
- [ ] Verified environment variables for production
- [ ] Updated Supabase URL configuration with production domain
- [ ] Reviewed CORS settings
- [ ] Checked all API endpoints work

### Step 29: Deployment

- [ ] Deployed to hosting platform (Netlify, Vercel, etc.)
- [ ] Verified deployment successful
- [ ] Tested production URL
- [ ] Verified login works
- [ ] Verified all features work
- [ ] Checked for console errors
- [ ] Tested on multiple devices
- [ ] Tested on multiple browsers

### Step 30: Post-Deployment

- [ ] Monitored for errors in first 24 hours
- [ ] Checked Supabase logs
- [ ] Verified database connections
- [ ] Tested with real users
- [ ] Collected feedback
- [ ] Documented any issues
- [ ] Created support documentation for users

---

## 📊 Final Verification

### Complete System Check

- [ ] ✅ Database setup complete
- [ ] ✅ Application configured
- [ ] ✅ Admin account secured
- [ ] ✅ Test users created
- [ ] ✅ All features tested
- [ ] ✅ Data persists correctly
- [ ] ✅ Permissions work correctly
- [ ] ✅ Mobile responsive
- [ ] ✅ Documentation reviewed
- [ ] ✅ Security measures in place
- [ ] ✅ Performance optimized
- [ ] ✅ Backups configured
- [ ] ✅ Deployed successfully (if applicable)

---

## 🎉 Completion

### You're Done When:

- [ ] All checkboxes above are checked
- [ ] System is running smoothly
- [ ] Users can login and use features
- [ ] Data is being saved correctly
- [ ] No critical errors in console
- [ ] Documentation is accessible
- [ ] Backup plan is in place
- [ ] You feel confident using the system

---

## 📞 Need Help?

If you're stuck on any step:

1. **Check the documentation:**
   - `TROUBLESHOOTING_GUIDE.md` for common issues
   - `SUPABASE_COMPLETE_SETUP_GUIDE.md` for detailed instructions
   - `SUPABASE_SQL_QUICK_REFERENCE.md` for SQL help

2. **Check browser console:**
   - Press F12
   - Look for error messages
   - Copy error text for troubleshooting

3. **Check Supabase logs:**
   - Go to Supabase Dashboard
   - Click on "Logs"
   - Look for errors

4. **Contact support:**
   - Email: sawantrishi152@gmail.com
   - Include: Error message, steps to reproduce, what you've tried

---

## 💡 Tips for Success

1. **Go step by step** - Don't skip steps
2. **Test as you go** - Verify each feature works
3. **Document changes** - Keep notes of customizations
4. **Ask for help** - Don't struggle alone
5. **Take breaks** - Setup can take 1-2 hours
6. **Backup often** - Export data regularly
7. **Stay organized** - Keep documentation handy
8. **Be patient** - Some steps take time
9. **Test thoroughly** - Better to find issues now
10. **Celebrate** - You're building something great!

---

## 📈 Progress Tracker

Track your overall progress:

- [ ] Pre-Setup (Steps 1-7)
- [ ] Database Setup (Steps 1-2)
- [ ] Application Setup (Steps 3-5)
- [ ] Browser Setup (Step 6)
- [ ] First Login (Steps 7-8)
- [ ] User Management (Steps 9-10)
- [ ] Feature Testing (Steps 11-20)
- [ ] Advanced Testing (Steps 21-23)
- [ ] Documentation Review (Step 24)
- [ ] Production Readiness (Steps 25-27)
- [ ] Deployment (Steps 28-30)
- [ ] Final Verification

**Progress: _____ / 30 steps complete**

---

## 🎊 Congratulations!

When all checkboxes are complete, you have successfully set up a complete, production-ready legal case management system!

**You now have:**
- ✅ Secure authentication system
- ✅ Complete case management
- ✅ Financial tracking
- ✅ Task management
- ✅ Attendance tracking
- ✅ Expense management
- ✅ Library organization
- ✅ Counsel management
- ✅ Appointment scheduling
- ✅ Dashboard analytics
- ✅ And much more!

**Happy case managing!** 🚀

---

**Print this checklist and check off items as you complete them!**
