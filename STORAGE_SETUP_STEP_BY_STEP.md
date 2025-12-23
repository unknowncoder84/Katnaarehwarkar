# 🚀 File Storage Setup - Step by Step (5 Minutes)

## Error You Got:
```
ERROR: 42501: must be owner of table objects
```

This happens because storage policies need to be created through the Supabase Dashboard UI, not SQL.

---

## ✅ SOLUTION: 2-Step Setup

### STEP 1: Create Storage Bucket (2 minutes)

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard
   - Select project: `cdqzqvllbefryyrxmmls`

2. **Click "Storage" in left sidebar**

3. **Click "New bucket" button** (top right)

4. **Fill in the form:**
   - **Name**: `case-files`
   - **Public bucket**: ✅ **Check this box** (IMPORTANT!)
   - **File size limit**: `50` MB
   - **Allowed MIME types**: Leave empty (allows all types)

5. **Click "Create bucket"**

6. **Set up Policies** (Click on the bucket you just created)
   - Click **"Policies"** tab
   - Click **"New Policy"**
   - Select **"For full customization"**
   
   **Policy 1: Allow authenticated users to upload**
   - Policy name: `Allow authenticated uploads`
   - Target roles: `authenticated`
   - Policy definition: `INSERT`
   - USING expression: `true`
   - Click **"Review"** → **"Save policy"**
   
   **Policy 2: Allow everyone to read**
   - Click **"New Policy"** again
   - Policy name: `Allow public reads`
   - Target roles: `public`
   - Policy definition: `SELECT`
   - USING expression: `true`
   - Click **"Review"** → **"Save policy"**
   
   **Policy 3: Allow authenticated users to delete**
   - Click **"New Policy"** again
   - Policy name: `Allow authenticated deletes`
   - Target roles: `authenticated`
   - Policy definition: `DELETE`
   - USING expression: `true`
   - Click **"Review"** → **"Save policy"**

---

### STEP 2: Update Database (1 minute)

1. **Go to SQL Editor**
   - Click **"SQL Editor"** in left sidebar
   - Click **"New Query"**

2. **Copy and paste this SQL:**

```sql
-- Update case_files table to store storage path
ALTER TABLE case_files
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS mime_type TEXT;

-- Add comments
COMMENT ON COLUMN case_files.storage_path IS 'Path to file in Supabase Storage';
COMMENT ON COLUMN case_files.file_url IS 'Public URL for direct file access';
COMMENT ON COLUMN case_files.external_url IS 'External URL (Dropbox/Drive) if provided';
```

3. **Click "Run" or press Ctrl+Enter**

4. **You should see:** "Success. No rows returned"

---

## ✅ DONE! Test It Now

### Test Upload:
1. Go to your app: https://katnaarehwarkar.netlify.app
2. Login
3. Open any case → Files tab
4. Upload a PDF or image
5. ✅ You should see: "File uploaded successfully! All users can now download it from anywhere."

### Test Download:
1. Open the same case from a different device/browser
2. Click on the file name
3. ✅ File downloads successfully!

---

## 🔍 Verify Setup

### Check 1: Bucket Exists
1. Supabase Dashboard → Storage
2. You should see **"case-files"** bucket
3. ✅ If you see it, storage is ready!

### Check 2: Policies Are Set
1. Click on **"case-files"** bucket
2. Click **"Policies"** tab
3. You should see 3 policies:
   - Allow authenticated uploads
   - Allow public reads
   - Allow authenticated deletes
4. ✅ If you see all 3, permissions are correct!

### Check 3: Database Updated
1. Supabase Dashboard → Table Editor
2. Open **"case_files"** table
3. Look for new columns: `storage_path`, `file_size`, `mime_type`
4. ✅ If you see these columns, database is ready!

---

## 📊 How It Works

```
User uploads file
    ↓
File → Supabase Storage (case-files bucket)
    ↓
Get public URL: https://cdqzqvllbefryyrxmmls.supabase.co/storage/v1/object/public/case-files/...
    ↓
Save URL to database
    ↓
Any user can download from URL
    ↓
✅ SUCCESS!
```

---

## 🆘 Troubleshooting

### Problem: "Bucket already exists"
**Solution**: Perfect! Skip to Step 2 (Update Database)

### Problem: Upload fails with "Permission denied"
**Solution**: 
1. Go to Storage → case-files → Policies
2. Make sure you have all 3 policies
3. Check that "Public bucket" is enabled

### Problem: Can't see uploaded files
**Solution**:
1. Check browser console (F12) for errors
2. Verify the file was uploaded to Storage → case-files
3. Check that file_url is saved in case_files table

---

## 🎯 What You Get

✅ **Remote Access** - Files work from any device, any location  
✅ **Persistent** - Files remain after browser restart  
✅ **Multi-User** - All users can access all files  
✅ **Secure** - Only authenticated users can upload  
✅ **Public Download** - Anyone with the link can download  
✅ **50MB Limit** - Per file  
✅ **All File Types** - PDF, DOC, images, etc.  

---

**Your code is already deployed! Just follow these 2 steps and you're done! 🚀**
