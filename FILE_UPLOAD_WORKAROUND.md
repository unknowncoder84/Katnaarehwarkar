# 📎 File Upload Workaround - Use External Links

## The Issue
Direct file upload to Supabase Storage requires Supabase Auth, but your app uses custom authentication (username/password). This causes RLS policy violations.

---

## ✅ SOLUTION: Use Dropbox or Google Drive Links

Instead of uploading files directly, you'll:
1. Upload files to Dropbox or Google Drive
2. Get a shareable link
3. Paste the link in the app

### This Works Because:
- ✅ No Supabase Storage needed
- ✅ No RLS policy issues
- ✅ Files accessible from anywhere
- ✅ No storage limits
- ✅ Works immediately (no SQL scripts needed)

---

## 🎯 How to Use

### Step 1: Upload to Dropbox/Google Drive

**Option A: Dropbox**
1. Go to https://dropbox.com
2. Upload your file
3. Click **Share** button
4. Click **Create link**
5. Copy the link

**Option B: Google Drive**
1. Go to https://drive.google.com
2. Upload your file
3. Right-click → **Get link**
4. Change to **Anyone with the link**
5. Copy the link

### Step 2: Paste Link in App

1. Go to **Case Details** → **FILES** tab
2. Select **File Title** (e.g., "Petition", "Written Statement")
3. **FILE field** is disabled (grayed out)
4. Paste your Dropbox/Google Drive link in **URL** field
5. Click **ATTACH**
6. ✅ File link saved!

### Step 3: Access Files

- Click the file name to open in new tab
- Works from any device
- No download needed
- Always accessible

---

## 📋 Example

### Before (Not Working):
```
FILE TITLE: Petition
FILE: [Choose File] ❌ RLS Error
URL: (empty)
```

### After (Working):
```
FILE TITLE: Petition
FILE: [Disabled - Use URL instead]
URL: https://www.dropbox.com/s/abc123/petition.pdf ✅
```

---

## 🎨 What Changed in the UI

### Old UI:
- File upload field was active
- URL was optional
- Got RLS errors

### New UI:
- File upload field is **disabled** (grayed out)
- Shows warning: "⚠️ Direct upload temporarily disabled"
- URL field is **required** (marked with *)
- Helper text: "💡 Upload your file to Dropbox/Google Drive..."

---

## 💡 Benefits of This Approach

1. **No Storage Limits**: Dropbox/Drive have generous free storage
2. **Better Performance**: No server upload time
3. **Universal Access**: Files accessible from anywhere
4. **No Database Issues**: No RLS policies to configure
5. **Immediate Solution**: Works right now, no setup needed

---

## 🔧 Technical Details

### What the Code Does Now:

**Before:**
```typescript
// Tried to upload to Supabase Storage
const uploadResult = await uploadFile(selectedFile, id, selectedFile.name);
// ❌ Failed with RLS error
```

**After:**
```typescript
// Only saves external URL to database
const fileData = {
  case_id: id,
  title: newFile.title,
  external_url: newFile.url, // Dropbox/Drive link
};
// ✅ Works perfectly
```

### Database Schema:
```sql
CREATE TABLE case_files (
  id UUID PRIMARY KEY,
  case_id UUID REFERENCES cases(id),
  title VARCHAR(255),
  external_url TEXT,  -- Dropbox/Google Drive link
  attached_by VARCHAR(255),
  created_at TIMESTAMPTZ
);
```

---

## 🐛 Troubleshooting

### "Please provide a Dropbox or Google Drive link"
- Make sure URL field is not empty
- Paste the full link (starts with https://)

### Link doesn't open
- Make sure link is set to "Anyone with the link"
- Check if link is still valid
- Try opening in incognito mode

### File not accessible
- Check sharing permissions
- Make sure link hasn't expired
- Verify you're using the shareable link (not the file path)

---

## 🚀 Future Enhancement (Optional)

If you want direct upload in the future, you'll need to:
1. Migrate to Supabase Auth (instead of custom auth)
2. Or set up a backend API to handle uploads
3. Or use a different storage service (AWS S3, Cloudinary, etc.)

But for now, the Dropbox/Drive link method works perfectly!

---

## ✅ Summary

**What to do:**
1. Upload files to Dropbox or Google Drive
2. Copy the shareable link
3. Paste link in the URL field
4. Click ATTACH
5. ✅ Done!

**No SQL scripts needed for this workaround!**

---

**Created**: February 5, 2026  
**Status**: ✅ Working Solution  
**Time to Use**: Immediate
