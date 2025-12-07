# 🗄️ Complete Database & Storage Setup Guide

## Overview

Your application uses **TWO systems**:
1. **Supabase** = Database (stores all data)
2. **Dropbox** = File Storage (stores documents/PDFs)

---

## ✅ Part 1: Supabase Database Setup (REQUIRED)

### Step 1: Access Your Supabase Project

1. Go to https://supabase.com
2. Sign in with your account
3. Your project is already created: `cdqzqvllbefryyrxmmls`
4. Project URL: `https://cdqzqvllbefryyrxmmls.supabase.co`

### Step 2: Run Database Migrations

You need to create all the tables in your database. You have SQL files ready!

#### Option A: Using Supabase Dashboard (EASIEST)

1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents from `PRODUCTION_READY_DATABASE.sql`
5. Paste it into the SQL editor
6. Click **RUN** button
7. Wait for "Success" message

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref cdqzqvllbefryyrxmmls

# Run migrations
supabase db push
```

### Step 3: Create Admin User

After running the database setup, create your admin user:

1. Go to **SQL Editor** in Supabase
2. Run this SQL (from `CREATE_ADMIN_USER.sql`):

```sql
-- Create admin user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
)
VALUES (
  gen_random_uuid(),
  'admin@katneshwarkar.com',  -- Change this email
  crypt('Admin@123', gen_salt('bf')),  -- Change this password
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Admin User","role":"admin"}',
  false,
  'authenticated'
);
```

**⚠️ IMPORTANT:** Change the email and password!

### Step 4: Verify Database Setup

1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - ✅ cases
   - ✅ counsel
   - ✅ appointments
   - ✅ transactions
   - ✅ courts
   - ✅ case_types
   - ✅ books
   - ✅ sofa_items
   - ✅ profiles
   - ✅ case_documents

3. Click on **cases** table
4. Try adding a test case manually

### Step 5: Set Environment Variables in Netlify

Your `.env` file has the credentials, but Netlify needs them too!

1. Go to Netlify Dashboard
2. Click your site
3. Go to **Site settings** → **Environment variables**
4. Add these variables:

```
VITE_SUPABASE_URL=https://cdqzqvllbefryyrxmmls.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcXpxdmxsYmVmcnl5cnhtbWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDMyMzMsImV4cCI6MjA4MDE3OTIzM30.6aRcT8XLfAxdQ0BLVXqyaG7iCvxcOjWVONhFgj1UbBQ
```

5. Click **Save**
6. Trigger a new deployment

---

## 📦 Part 2: Dropbox File Storage Setup (OPTIONAL)

Dropbox is for storing large files (PDFs, court orders, etc.). This is optional but recommended.

### Step 1: Get Dropbox Access Token

1. Go to https://www.dropbox.com/developers/apps
2. Click **Create app**
3. Choose:
   - API: Scoped access
   - Type: Full Dropbox
   - Name: `Katneshwarkar-Legal-App`
4. Click **Create app**
5. Go to **Permissions** tab
6. Enable these permissions:
   - ✅ files.metadata.write
   - ✅ files.metadata.read
   - ✅ files.content.write
   - ✅ files.content.read
   - ✅ sharing.write
   - ✅ sharing.read
7. Click **Submit**
8. Go to **Settings** tab
9. Scroll to **OAuth 2**
10. Click **Generate** under "Generated access token"
11. Copy the token (starts with `sl.`)

### Step 2: Add Dropbox Token to Supabase

1. Go to Supabase Dashboard
2. Click **Edge Functions** in sidebar
3. Click **Manage secrets**
4. Add new secret:
   - Name: `DROPBOX_ACCESS_TOKEN`
   - Value: (paste your token)
5. Click **Save**

### Step 3: Deploy Dropbox Edge Function

You already have the function code! Now deploy it:

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref cdqzqvllbefryyrxmmls

# Deploy the function
supabase functions deploy dropbox-file-handler
```

### Step 4: Test Dropbox Integration

1. Go to your deployed site
2. Open a case
3. Go to **FILES** tab
4. Try uploading a PDF file
5. Check if it appears in your Dropbox

---

## 🧪 Testing Your Setup

### Test 1: Database Connection

1. Open your deployed site
2. Try to login with admin credentials
3. If login works → Database is connected! ✅

### Test 2: Create a Case

1. Click **Cases** → **Create New Case**
2. Fill in the form
3. Click **Save**
4. Check if case appears in the list
5. If it works → Database is working! ✅

### Test 3: File Upload (if Dropbox is set up)

1. Open a case
2. Go to **FILES** tab
3. Upload a PDF
4. Try to download it
5. If it works → Dropbox is working! ✅

---

## 🚨 Troubleshooting

### Problem: "Missing Supabase environment variables"

**Solution:**
1. Check `.env` file has the correct values
2. Restart your dev server: `npm run dev`
3. For production, add variables to Netlify

### Problem: "Failed to fetch" or "Network error"

**Solution:**
1. Check Supabase project is not paused
2. Go to Supabase Dashboard → Settings → General
3. If paused, click "Resume project"

### Problem: "Authentication failed"

**Solution:**
1. Make sure you ran the admin user SQL
2. Check the email/password you're using
3. Try resetting password in Supabase Dashboard

### Problem: "Dropbox upload failed"

**Solution:**
1. Check Dropbox token is valid
2. Make sure Edge Function is deployed
3. Check Dropbox app permissions

### Problem: Tables don't exist

**Solution:**
1. Run the `PRODUCTION_READY_DATABASE.sql` file
2. Go to Supabase → SQL Editor
3. Paste and run the entire SQL file

---

## 📋 Quick Checklist

### Supabase Setup
- [ ] Supabase project created
- [ ] Database tables created (run SQL file)
- [ ] Admin user created
- [ ] Environment variables added to Netlify
- [ ] Can login to the app
- [ ] Can create/view cases

### Dropbox Setup (Optional)
- [ ] Dropbox app created
- [ ] Access token generated
- [ ] Token added to Supabase secrets
- [ ] Edge function deployed
- [ ] Can upload files
- [ ] Can download files

---

## 🎯 What's Next?

Once both are set up:

1. **Test everything locally** first
2. **Deploy to Netlify** (already done)
3. **Test on production** site
4. **Create your first real case**
5. **Invite users** to test

---

## 💡 Pro Tips

1. **Backup your database regularly**
   - Supabase Dashboard → Database → Backups

2. **Monitor usage**
   - Supabase Dashboard → Reports
   - Check API calls and storage

3. **Set up Row Level Security (RLS)**
   - Already configured in your SQL files
   - Ensures users only see their own data

4. **Use Dropbox for large files only**
   - Small files can be stored in Supabase Storage
   - Dropbox is better for PDFs, documents

---

## 📞 Need Help?

If you get stuck:

1. Check Supabase logs: Dashboard → Logs
2. Check browser console for errors (F12)
3. Check Netlify deployment logs
4. Verify all environment variables are set

---

**Remember:** Supabase is your DATABASE (required), Dropbox is for FILE STORAGE (optional but recommended).
