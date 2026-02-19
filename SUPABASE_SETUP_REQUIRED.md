# 🚨 SUPABASE SETUP REQUIRED - URGENT

## Problem Summary

You're experiencing two issues:
1. **File uploads fail** - "Bucket not found" error
2. **Data vanishes on refresh** - Changes don't persist to database

## Root Cause

The Supabase database is missing:
1. Storage bucket for file uploads
2. Database columns for new features (event_type)

---

## 🔧 SOLUTION: Run These SQL Scripts

### Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `cdqzqvllbefryyrxmmls`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste this SQL:

```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'case-files',
  'case-files',
  true,
  52428800,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/gif',
    'text/plain',
    'text/csv'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'case-files');

CREATE POLICY "Allow authenticated users to read files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'case-files');

CREATE POLICY "Allow authenticated users to update files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'case-files');

CREATE POLICY "Allow authenticated users to delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'case-files');

CREATE POLICY "Allow public to read files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'case-files');
```

6. Click **Run** (or press Ctrl+Enter)
7. ✅ Should see "Success. No rows returned"

---

### Step 2: Add Missing Columns

1. Still in **SQL Editor**
2. Click **New Query**
3. Copy and paste this SQL:

```sql
-- Add event_type column to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS event_type VARCHAR(20) DEFAULT 'appointment' 
CHECK (event_type IN ('appointment', 'birthday', 'anniversary', 'other'));

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_event_type ON appointments(event_type);

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'appointments' 
AND column_name = 'event_type';
```

4. Click **Run**
5. ✅ Should see the new column listed

---

## 🎯 Alternative: Quick Setup via Storage UI

If SQL doesn't work, create bucket via UI:

1. Go to **Storage** in Supabase Dashboard
2. Click **New Bucket**
3. Enter:
   - **Name**: `case-files`
   - **Public bucket**: ✅ Checked
   - **File size limit**: 50 MB
   - **Allowed MIME types**: Leave empty (allows all)
4. Click **Create Bucket**
5. Click on the bucket → **Policies** tab
6. Click **New Policy** → **For full customization**
7. Add these policies:
   - **INSERT**: `authenticated` role
   - **SELECT**: `authenticated` and `public` roles
   - **UPDATE**: `authenticated` role
   - **DELETE**: `authenticated` role

---

## 📋 Verification Checklist

After running the SQL scripts:

### Check Storage Bucket:
1. Go to **Storage** in Supabase Dashboard
2. ✅ Should see `case-files` bucket listed
3. Click on it
4. ✅ Should see "Policies" tab with 5 policies

### Check Database Column:
1. Go to **Table Editor** in Supabase Dashboard
2. Select `appointments` table
3. ✅ Should see `event_type` column

### Test File Upload:
1. Go to your app: http://localhost:3000
2. Open any Case Details → FILES tab
3. Try uploading a file
4. ✅ Should upload successfully (no "Bucket not found" error)

### Test Data Persistence:
1. Create a birthday event in Appointments
2. Refresh the page (F5)
3. ✅ Birthday event should still be there

---

## 🐛 Troubleshooting

### If Storage Bucket Creation Fails:

**Error**: "permission denied for table buckets"

**Solution**: You need to be the project owner or have admin access. Contact your Supabase project admin.

**Alternative**: Create bucket via UI (see "Alternative" section above)

---

### If Column Addition Fails:

**Error**: "relation 'appointments' does not exist"

**Solution**: The appointments table might not exist. Run this first:

```sql
-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'appointments';
```

If it returns nothing, you need to create the table first. Check your migration files in `supabase/migrations/`.

---

### If Data Still Vanishes:

**Possible Causes**:
1. **RLS Policies**: Check if Row Level Security is blocking inserts
2. **Authentication**: Make sure you're logged in
3. **Network**: Check browser console for errors

**Debug Steps**:
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try creating an event
4. Look for errors (red text)
5. Share the error message

---

## 📝 Summary

**What You Need to Do**:
1. ✅ Run `CREATE_STORAGE_BUCKET.sql` in Supabase SQL Editor
2. ✅ Run `ADD_MISSING_COLUMNS.sql` in Supabase SQL Editor
3. ✅ Refresh your app (Ctrl + Shift + R)
4. ✅ Test file upload
5. ✅ Test data persistence

**Expected Result**:
- File uploads work ✅
- Data persists after refresh ✅
- Special events show in calendar ✅
- Circulation count matches ✅

---

## 🆘 Need Help?

If you're still having issues after running the SQL scripts:

1. Check the browser console (F12) for errors
2. Check Supabase logs (Dashboard → Logs)
3. Verify you're using the correct project
4. Make sure you're logged in as admin

**Common Issues**:
- **"Bucket not found"** → Run CREATE_STORAGE_BUCKET.sql
- **"Column does not exist"** → Run ADD_MISSING_COLUMNS.sql
- **"Permission denied"** → Check RLS policies
- **Data vanishes** → Check browser console for errors

---

**Created**: February 5, 2026  
**Status**: 🚨 Action Required  
**Priority**: HIGH - Required for app to work properly
