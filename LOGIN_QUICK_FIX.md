# ⚡ Login Page Stuck - Quick Fix

## 🔴 Problem
Can't login - stuck at login page

## ✅ Solution (2 Steps)

### Step 1: Create Admin User in Supabase

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor**
4. Copy and paste this:

```sql
INSERT INTO public.user_accounts (username, password, name, email, role, is_active)
VALUES ('admin', 'admin123', 'Administrator', 'admin@example.com', 'admin', true);
```

5. Click **Run** or press `Ctrl+Enter`

### Step 2: Login

Go to your app and login with:
- **Username:** `admin`
- **Password:** `admin123`

## 🎉 That's It!

You should now be able to login and access the dashboard.

---

## ❓ Why This Happens

Your database exists but has **no users** yet. You need to create at least one user before you can login.

---

## 🔧 Alternative: Use the SQL File

1. Open `CREATE_ADMIN_USER.sql` in this project
2. Copy all the SQL
3. Paste in Supabase SQL Editor
4. Run it
5. This creates 3 users: admin, vipin, and user

---

## 🚨 Still Not Working?

### Check 1: Do tables exist?

Go to Supabase → **Table Editor**

Should see:
- `user_accounts` ✅
- `profiles` ✅
- `cases` ✅

**If tables don't exist:**
- Run `supabase/migrations/COMPLETE_DATABASE_SETUP.sql` in SQL Editor

### Check 2: Are environment variables set?

Check `.env` file has:
```
VITE_SUPABASE_URL=https://cdqzqvllbefryyrxmmls.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

**If missing:**
- Copy from `.env.example`
- Restart dev server: `npm run dev`

### Check 3: Browser console errors?

1. Press `F12`
2. Go to **Console** tab
3. Try to login
4. Look for red errors

**Common errors:**
- "Missing environment variables" → Check `.env` file
- "Failed to fetch" → Check Supabase URL/key
- "Invalid credentials" → User doesn't exist (create admin user)

---

## 📚 More Help

See `LOGIN_TROUBLESHOOTING.md` for detailed troubleshooting steps.

---

**Quick Summary:**
1. Create admin user in Supabase SQL Editor
2. Login with `admin` / `admin123`
3. Done! ✅
