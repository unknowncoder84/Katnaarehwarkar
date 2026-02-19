# 🔧 How to Fix "Upload failed: new row violates row-level security policy"

## The Problem
The storage bucket exists, but the RLS (Row Level Security) policies are blocking uploads.

---

## ✅ SOLUTION: Run This SQL Script

### Option 1: Simple Fix (Recommended)

**Run this in Supabase SQL Editor:**

```sql
-- Drop all existing policies
DROP POLICY IF EXISTS "Allow authenticated uploads to case-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads from case-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from case-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to case-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from case-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to read files" ON storage.objects;

-- Create ONE simple policy that allows everything for authenticated users
CREATE POLICY "Allow all operations for authenticated users"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'case-files')
WITH CHECK (bucket_id = 'case-files');

-- Create ONE simple policy for public read access
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'case-files');
```

**Steps:**
1. Open Supabase Dashboard → SQL Editor
2. Click **New Query**
3. Copy and paste the SQL above
4. Click **Run**
5. ✅ Should see "Success"

---

## 🎯 Alternative: Fix via Supabase UI

If SQL doesn't work, use the UI:

### Step 1: Delete Old Policies
1. Go to **Storage** in Supabase Dashboard
2. Click on **case-files** bucket
3. Click **Policies** tab
4. Delete ALL existing policies (click trash icon on each)

### Step 2: Create New Policy
1. Click **New Policy**
2. Select **For full customization**
3. Fill in:
   - **Policy name**: `Allow all for authenticated`
   - **Allowed operation**: `ALL`
   - **Target roles**: `authenticated`
   - **USING expression**: `bucket_id = 'case-files'`
   - **WITH CHECK expression**: `bucket_id = 'case-files'`
4. Click **Review**
5. Click **Save policy**

### Step 3: Create Public Read Policy
1. Click **New Policy** again
2. Select **For full customization**
3. Fill in:
   - **Policy name**: `Allow public read`
   - **Allowed operation**: `SELECT`
   - **Target roles**: `public`
   - **USING expression**: `bucket_id = 'case-files'`
4. Click **Review**
5. Click **Save policy**

---

## 🧪 Test After Running

1. Go to your app: http://localhost:3000
2. Open any Case Details → FILES tab
3. Select a file
4. Click **ATTACH**
5. ✅ Should upload successfully!

---

## 🐛 Still Not Working?

### Check Authentication
Make sure you're logged in:
1. Open browser DevTools (F12)
2. Go to **Application** tab
3. Click **Local Storage** → `http://localhost:3000`
4. Look for `current_user` key
5. ✅ Should have user data

If not logged in:
1. Go to Login page
2. Enter credentials
3. Try upload again

### Check Bucket Settings
1. Go to **Storage** → **case-files**
2. Click **Configuration**
3. Verify:
   - ✅ **Public bucket**: Enabled
   - ✅ **File size limit**: 50 MB or higher

---

## 📋 Summary

**What to do:**
1. ✅ Run `SIMPLE_STORAGE_FIX.sql` in Supabase SQL Editor
2. ✅ Refresh your app (Ctrl + Shift + R)
3. ✅ Try uploading a file
4. ✅ Should work now!

**If still failing:**
- Use the UI method (Alternative section above)
- Check you're logged in
- Check browser console for errors

---

**Created**: February 5, 2026  
**Status**: 🔧 Quick Fix Available  
**Time to Fix**: 2 minutes
