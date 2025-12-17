# Supabase File Storage Setup Guide

## Problem Solved
Previously, files uploaded by one user created local blob URLs that were NOT accessible to other users remotely. Now with Supabase Storage, files are stored in the cloud and accessible to all authenticated users from anywhere.

## Quick Setup (2 Steps)

### Step 1: Run the Database Migration

Go to your Supabase Dashboard:
1. Open https://supabase.com/dashboard
2. Select your project: `cdqzqvllbefryyrxmmls`
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the contents of `supabase/migrations/014_setup_file_storage.sql`
6. Click **Run** or press `Ctrl+Enter`

You should see: "Success. No rows returned"

### Step 2: Deploy Your Code

```bash
git add .
git commit -m "Add Supabase Storage for remote file sharing"
git push
```

Netlify will automatically deploy the changes.

## How It Works Now

### For Users Uploading Files:
1. User selects a file in the Case Details > Files tab
2. File is uploaded to **Supabase Cloud Storage** (not local browser)
3. A permanent public URL is generated
4. File metadata is saved to the database
5. ✅ Success message confirms upload

### For Users Downloading Files:
1. Any authenticated user can see all uploaded files
2. Click the file name or download button
3. File is downloaded from **Supabase Cloud Storage**
4. ✅ Works from any device, any location, any time

## Features

✅ **Remote Access**: Files accessible from anywhere
✅ **Persistent Storage**: Files remain after browser restart
✅ **Multi-User**: All users can access files uploaded by anyone
✅ **Secure**: Only authenticated users can upload/download
✅ **File Types**: PDF, DOC, DOCX, JPG, PNG, TXT
✅ **Size Limit**: 50MB per file
✅ **External URLs**: Still supports Dropbox/Drive links

## Testing

1. **User A** uploads a file to a case
2. **User B** (on different device/location) opens the same case
3. **User B** can see and download the file uploaded by User A
4. ✅ File downloads successfully!

## Troubleshooting

### If upload fails:
- Check that the migration ran successfully
- Verify Supabase credentials in `.env` file
- Check browser console for error messages

### If download fails:
- Ensure user is authenticated
- Check that file URL is not a blob: URL (old files)
- Verify storage bucket exists in Supabase Dashboard

## Storage Bucket Details

- **Bucket Name**: `case-files`
- **Public Access**: Yes (with authentication)
- **File Size Limit**: 50MB
- **Allowed Types**: PDF, DOC, DOCX, JPG, PNG, TXT
- **Organization**: Files stored by case ID

## Database Schema

The `case_files` table now includes:
- `storage_path`: Path to file in Supabase Storage
- `file_url`: Public URL for direct access
- `external_url`: Optional Dropbox/Drive link
- `file_size`: File size in bytes
- `mime_type`: File MIME type

## Next Steps

After setup, all new file uploads will use Supabase Storage automatically. Old files with blob: URLs will show an error message prompting users to re-upload them.
