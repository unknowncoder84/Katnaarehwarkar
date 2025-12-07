# 🔐 Login Page Stuck - Troubleshooting Guide

## 🔴 Problem
You're stuck at the login page and can't log in.

## 🎯 Most Likely Causes

### 1. ❌ No Users in Database (MOST COMMON)
**Problem:** You haven't created any users in Supabase yet  
**Solution:** Create an admin user first

### 2. ❌ Database Not Set Up
**Problem:** The `user_accounts` or `profiles` table doesn't exist  
**Solution:** Run the database migrations

### 3. ❌ Wrong Credentials
**Problem:** Using incorrect username/password  
**Solution:** Use the correct credentials or create a new user

---

## ✅ Quick Fix - Create Admin User

### Option A: Via Supabase SQL Editor (Recommended)

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Run this SQL to create an admin user:

```sql
-- Create admin user
INSERT INTO public.user_accounts (username, password, name, email, role, is_active)
VALUES (
  'admin',
  'admin123',  -- Change this password!
  'Administrator',
  'admin@example.com',
  'admin',
  true
);

-- Also create in profiles table (if it exists)
INSERT INTO public.profiles (id, name, email, role, is_active)
SELECT id, name, email, role, is_active
FROM public.user_accounts
WHERE username = 'admin'
ON CONFLICT (id) DO NOTHING;
```

**Now you can login with:**
- Username: `admin`
- Password: `admin123`

⚠️ **IMPORTANT:** Change the password after first login!

### Option B: Create Multiple Users

```sql
-- Create admin user
INSERT INTO public.user_accounts (username, password, name, email, role, is_active)
VALUES 
  ('admin', 'admin123', 'Administrator', 'admin@example.com', 'admin', true),
  ('vipin', 'vipin123', 'Vipin', 'vipin@example.com', 'vipin', true),
  ('user1', 'user123', 'Regular User', 'user@example.com', 'user', true);

-- Sync to profiles
INSERT INTO public.profiles (id, name, email, role, is_active)
SELECT id, name, email, role, is_active
FROM public.user_accounts
ON CONFLICT (id) DO NOTHING;
```

---

## 🔍 Diagnostic Steps

### Step 1: Check if Database Tables Exist

Go to Supabase → **Table Editor** and verify these tables exist:
- ✅ `user_accounts`
- ✅ `profiles`
- ✅ `cases`
- ✅ `courts`
- ✅ `case_types`

**If tables don't exist:**
1. Go to **SQL Editor**
2. Run the migration file: `supabase/migrations/COMPLETE_DATABASE_SETUP.sql`

### Step 2: Check if Users Exist

Run this query in SQL Editor:

```sql
SELECT * FROM public.user_accounts;
```

**If no results:**
- No users exist → Create admin user (see above)

**If you see users:**
- Try logging in with those credentials
- Check if `is_active` is `true`

### Step 3: Check Browser Console

1. Open your browser (Chrome/Firefox)
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Try to login
5. Look for error messages

**Common errors:**
- `Missing Supabase environment variables` → Environment variables not set
- `Failed to fetch` → Supabase URL/key incorrect
- `Invalid username or password` → Wrong credentials or no users
- `Network error` → Check internet connection

### Step 4: Check Network Tab

1. Open Developer Tools (`F12`)
2. Go to **Network** tab
3. Try to login
4. Look for failed requests (red)

**Check:**
- Is the request going to Supabase?
- What's the response status? (401, 404, 500?)
- What's the error message in the response?

---

## 🛠️ Solutions by Error Type

### Error: "Invalid username or password"

**Cause:** No users in database or wrong credentials

**Solution:**
```sql
-- Check existing users
SELECT username, name, role, is_active FROM public.user_accounts;

-- If no users, create admin
INSERT INTO public.user_accounts (username, password, name, email, role, is_active)
VALUES ('admin', 'admin123', 'Administrator', 'admin@example.com', 'admin', true);
```

### Error: "Missing Supabase environment variables"

**Cause:** `.env` file not loaded or environment variables not set

**Solution (Local Development):**
1. Check `.env` file exists in project root
2. Verify it contains:
```
VITE_SUPABASE_URL=https://cdqzqvllbefryyrxmmls.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
3. Restart dev server: `npm run dev`

**Solution (Netlify):**
- Set environment variables in Netlify dashboard (see NETLIFY_DEPLOYMENT_FIX.md)

### Error: "relation 'user_accounts' does not exist"

**Cause:** Database tables not created

**Solution:**
1. Go to Supabase → SQL Editor
2. Copy content from `supabase/migrations/COMPLETE_DATABASE_SETUP.sql`
3. Paste and run in SQL Editor
4. Wait for completion
5. Verify tables exist in Table Editor

### Error: "Failed to fetch" or Network Error

**Cause:** 
- Supabase URL/key incorrect
- Internet connection issue
- Supabase service down

**Solution:**
1. Check Supabase status: https://status.supabase.com/
2. Verify Supabase URL and key in `.env`
3. Test connection:
```sql
-- In Supabase SQL Editor
SELECT 1;
```
4. Check internet connection

### Login Button Does Nothing

**Cause:** JavaScript error or form not submitting

**Solution:**
1. Open browser console (`F12`)
2. Look for JavaScript errors
3. Check if form is submitting
4. Verify `handleSubmit` function is called

---

## 📋 Complete Checklist

Before trying to login, verify:

- [ ] ✅ Supabase project created
- [ ] ✅ Database tables exist (`user_accounts`, `profiles`)
- [ ] ✅ At least one user exists in database
- [ ] ✅ User is active (`is_active = true`)
- [ ] ✅ Environment variables set (`.env` file)
- [ ] ✅ Dev server running (`npm run dev`)
- [ ] ✅ No console errors in browser
- [ ] ✅ Supabase URL and key are correct
- [ ] ✅ Internet connection working

---

## 🎯 Quick Test Credentials

After creating users, try these:

**Admin User:**
- Username: `admin`
- Password: `admin123`

**Vipin User:**
- Username: `vipin`
- Password: `vipin123`

**Regular User:**
- Username: `user1`
- Password: `user123`

---

## 🔧 Advanced Troubleshooting

### Check Authentication Function

Test the authentication directly in Supabase:

```sql
-- Test authentication function
SELECT * FROM public.authenticate_user('admin', 'admin123');
```

**Expected result:** User object with id, name, email, role

**If error:** Function doesn't exist or has issues

### Check RLS Policies

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'user_accounts';

-- Should show rowsecurity = true
```

### Reset Everything (Nuclear Option)

If nothing works, reset the database:

```sql
-- WARNING: This deletes ALL data!
DROP TABLE IF EXISTS public.user_accounts CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.cases CASCADE;
-- ... (drop all tables)

-- Then re-run COMPLETE_DATABASE_SETUP.sql
```

---

## 🆘 Still Stuck?

### Check These Files

1. **AuthContext.tsx** - Line 70-90 (login function)
2. **userManagement.ts** - Authentication logic
3. **supabase.ts** - Supabase client configuration

### Enable Debug Mode

Add console logs to see what's happening:

```typescript
// In src/contexts/AuthContext.tsx, login function
const login = async (username: string, password: string): Promise<void> => {
  console.log('🔐 Login attempt:', username);
  setLoading(true);
  setError(null);

  try {
    console.log('📡 Calling authenticateUserDb...');
    const result = await authenticateUserDb(username, password);
    console.log('📥 Result:', result);
    
    if (!result.success || !result.user) {
      console.error('❌ Login failed:', result.error);
      throw new Error(result.error || 'Invalid username or password');
    }

    console.log('✅ Login successful:', result.user);
    setUser(result.user);
    // ... rest of code
  } catch (err) {
    console.error('💥 Login error:', err);
    // ... rest of code
  }
};
```

### Test Supabase Connection

Create a test file `test-supabase.ts`:

```typescript
import { supabase } from './src/lib/supabase';

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  const { data, error } = await supabase
    .from('user_accounts')
    .select('count');
  
  if (error) {
    console.error('❌ Connection failed:', error);
  } else {
    console.log('✅ Connection successful:', data);
  }
}

testConnection();
```

---

## 📞 Get Help

If you're still stuck:

1. **Check Supabase logs:**
   - Go to Supabase Dashboard
   - Click **Logs** → **API Logs**
   - Look for failed requests

2. **Check browser console:**
   - Press `F12`
   - Look for red errors
   - Copy error messages

3. **Check network requests:**
   - Press `F12` → Network tab
   - Try to login
   - Look for failed requests
   - Check response details

---

## ✅ Success Indicators

You've successfully logged in when:

- ✅ No error message appears
- ✅ Page redirects to `/dashboard`
- ✅ You see the main application interface
- ✅ User name appears in header
- ✅ Sidebar navigation is visible

---

**Most Common Solution:** Create an admin user in Supabase SQL Editor!

```sql
INSERT INTO public.user_accounts (username, password, name, email, role, is_active)
VALUES ('admin', 'admin123', 'Administrator', 'admin@example.com', 'admin', true);
```

Then login with:
- Username: `admin`
- Password: `admin123`
