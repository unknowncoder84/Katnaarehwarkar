# 📦 Complete Dropbox File Storage Setup Guide

## 🎯 What This Does

Dropbox will store:
- ✅ PDF documents (court orders, petitions, etc.)
- ✅ Large files (over 1MB)
- ✅ Images and scanned documents
- ✅ Any file attached to cases

Supabase will store:
- ✅ Case data (names, dates, status)
- ✅ User information
- ✅ Small metadata

---

## 📋 Step-by-Step Setup

### Step 1: Create Dropbox App (5 minutes)

1. **Go to Dropbox Developers**
   - Open: https://www.dropbox.com/developers/apps
   - Sign in with your Dropbox account

2. **Create New App**
   - Click **"Create app"** button
   
3. **Choose API**
   - Select: **"Scoped access"**
   - Click **Next**

4. **Choose Access Type**
   - Select: **"Full Dropbox"** (recommended)
   - OR **"App folder"** (if you want isolated folder)
   - Click **Next**

5. **Name Your App**
   - Enter name: `Katneshwarkar-Legal-Files`
   - Click **"Create app"**

### Step 2: Set Permissions (3 minutes)

1. **Go to Permissions Tab**
   - Click **"Permissions"** tab in your app

2. **Enable These Permissions:**
   - ✅ `files.metadata.write` - Create/modify file metadata
   - ✅ `files.metadata.read` - Read file metadata
   - ✅ `files.content.write` - Upload files
   - ✅ `files.content.read` - Download files
   - ✅ `sharing.write` - Create shareable links
   - ✅ `sharing.read` - Read sharing info

3. **Submit Permissions**
   - Click **"Submit"** button at bottom
   - Wait for confirmation

### Step 3: Generate Access Token (2 minutes)

1. **Go to Settings Tab**
   - Click **"Settings"** tab

2. **Generate Token**
   - Scroll down to **"OAuth 2"** section
   - Under **"Generated access token"**
   - Click **"Generate"** button

3. **Copy Token**
   - A long token will appear (starts with `sl.`)
   - Click **"Copy"** or select and copy it
   - **⚠️ IMPORTANT:** Save this token somewhere safe!
   - You won't be able to see it again

4. **Token Expiration**
   - By default, tokens don't expire
   - If you need long-lived token, it's already set

### Step 4: Add Token to Supabase (5 minutes)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com
   - Sign in
   - Open your project: `cdqzqvllbefryyrxmmls`

2. **Go to Edge Functions**
   - Click **"Edge Functions"** in left sidebar
   - If you don't see it, click **"Functions"**

3. **Manage Secrets**
   - Click **"Manage secrets"** or **"Secrets"** button
   - Click **"Add new secret"**

4. **Add Dropbox Token**
   - Name: `DROPBOX_ACCESS_TOKEN`
   - Value: (paste your Dropbox token)
   - Click **"Save"** or **"Add secret"**

### Step 5: Deploy Edge Function (10 minutes)

#### Option A: Using Supabase CLI (Recommended)

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```
   - Browser will open
   - Click **"Authorize"**

3. **Link Your Project**
   ```bash
   supabase link --project-ref cdqzqvllbefryyrxmmls
   ```
   - Enter your database password when prompted

4. **Deploy the Function**
   ```bash
   supabase functions deploy dropbox-file-handler
   ```
   - Wait for "Deployed successfully" message

#### Option B: Using Supabase Dashboard

1. **Go to Edge Functions**
   - Click **"Edge Functions"** in sidebar
   - Click **"Create a new function"**

2. **Create Function**
   - Name: `dropbox-file-handler`
   - Click **"Create function"**

3. **Copy Function Code**
   - Open `supabase/functions/dropbox-file-handler/index.ts` in your project
   - Copy ALL the code

4. **Paste and Deploy**
   - Paste code in the editor
   - Click **"Deploy"**

### Step 6: Test Dropbox Integration (5 minutes)

1. **Test Locally First**
   ```bash
   # Start your dev server
   npm run dev
   ```

2. **Open Your App**
   - Go to http://localhost:5173
   - Login with your credentials

3. **Test File Upload**
   - Go to **Cases** page
   - Open any case
   - Click **FILES** tab
   - Click **"Choose File"**
   - Select a PDF or image
   - Enter a title
   - Click **"ATTACH"**

4. **Check Dropbox**
   - Go to your Dropbox account
   - Look for folder: `/Katneshwarkar-Legal-Files/`
   - You should see your uploaded file!

5. **Test Download**
   - Click the **Download** button (green icon)
   - File should download to your computer

---

## 🔧 Configuration Files

Your project already has these files configured:

### 1. Dropbox Library (`src/lib/dropbox.ts`)
- ✅ Already configured
- ✅ Handles upload/download
- ✅ Creates shareable links

### 2. Edge Function (`supabase/functions/dropbox-file-handler/index.ts`)
- ✅ Already created
- ✅ Handles Dropbox API calls
- ✅ Secure server-side processing

### 3. Environment Variables (`.env`)
- ✅ Token already in `.env` file
- ⚠️ Don't commit `.env` to Git!

---

## 📱 How It Works

### When User Uploads a File:

1. **User selects file** in browser
2. **Frontend** converts file to base64
3. **Sends to Supabase Edge Function**
4. **Edge Function** uploads to Dropbox
5. **Dropbox** stores the file
6. **Returns** shareable link
7. **Supabase database** stores the link
8. **User** can now download anytime

### File Organization in Dropbox:

```
/Katneshwarkar-Legal-Files/
  ├── cases/
  │   ├── case-123/
  │   │   ├── court-order.pdf
  │   │   ├── petition.pdf
  │   │   └── evidence.jpg
  │   └── case-456/
  │       └── document.pdf
  └── temp/
```

---

## 🚨 Troubleshooting

### Problem: "Dropbox token invalid"

**Solution:**
1. Check token is copied correctly (no extra spaces)
2. Make sure token starts with `sl.`
3. Regenerate token in Dropbox app settings
4. Update secret in Supabase

### Problem: "Edge function not found"

**Solution:**
1. Make sure function is deployed:
   ```bash
   supabase functions list
   ```
2. Redeploy if needed:
   ```bash
   supabase functions deploy dropbox-file-handler
   ```

### Problem: "Permission denied"

**Solution:**
1. Go back to Dropbox app permissions
2. Make sure all 6 permissions are enabled
3. Click "Submit" again
4. Wait 5 minutes for changes to apply

### Problem: "File upload fails"

**Solution:**
1. Check file size (max 150MB for Dropbox API)
2. Check internet connection
3. Check browser console for errors (F12)
4. Verify Edge Function is running

### Problem: "Can't download file"

**Solution:**
1. Check if file exists in Dropbox
2. Check if shareable link is valid
3. Try regenerating the link
4. Check browser popup blocker

---

## 🔐 Security Best Practices

### 1. Token Security
- ✅ Never commit `.env` file to Git
- ✅ Token is stored in Supabase secrets (secure)
- ✅ Frontend never sees the token
- ✅ All API calls go through Edge Function

### 2. File Access Control
- ✅ Only authenticated users can upload
- ✅ Files are organized by case ID
- ✅ Shareable links can be revoked
- ✅ Supabase RLS controls who sees what

### 3. File Validation
- ✅ Check file types before upload
- ✅ Limit file sizes (recommended: 50MB max)
- ✅ Scan for malware (optional)
- ✅ Validate file names

---

## 📊 Monitoring & Limits

### Dropbox Free Plan Limits:
- **Storage:** 2GB free
- **File size:** 150MB per file
- **API calls:** 1000/hour

### Dropbox Plus Plan ($11.99/month):
- **Storage:** 2TB
- **File size:** 2GB per file
- **API calls:** Unlimited

### Upgrade When:
- You have more than 2GB of files
- You need to upload files larger than 150MB
- You have many users uploading simultaneously

---

## 🧪 Testing Checklist

After setup, test these scenarios:

- [ ] Upload a PDF file
- [ ] Upload an image file
- [ ] Download a file
- [ ] Delete a file
- [ ] Upload file larger than 10MB
- [ ] Upload multiple files to same case
- [ ] Check files appear in Dropbox
- [ ] Test on mobile device
- [ ] Test with slow internet
- [ ] Test with different file types

---

## 🎯 Next Steps

Once Dropbox is working:

1. **Set up Supabase database** (if not done)
   - Run `PRODUCTION_READY_DATABASE.sql`
   - Create admin user

2. **Deploy to Netlify**
   - Add environment variables
   - Deploy latest code

3. **Test on production**
   - Upload real case files
   - Test download on mobile

4. **Train users**
   - Show them how to upload files
   - Explain file organization

---

## 💡 Pro Tips

1. **Organize Files by Case**
   - Each case gets its own folder
   - Easy to find files later

2. **Use Descriptive Names**
   - `court-order-2024-01-15.pdf`
   - Better than `document.pdf`

3. **Regular Backups**
   - Dropbox has version history
   - Can restore deleted files

4. **Monitor Storage**
   - Check Dropbox usage regularly
   - Upgrade plan before hitting limit

5. **Compress Large Files**
   - Use PDF compression
   - Reduces storage and upload time

---

## 📞 Need Help?

If you get stuck:

1. **Check Supabase Logs**
   - Dashboard → Logs → Edge Functions
   - Look for error messages

2. **Check Dropbox App Console**
   - Dropbox Developers → Your App → Monitoring
   - See API call logs

3. **Check Browser Console**
   - Press F12
   - Look for red errors

4. **Test Edge Function Directly**
   ```bash
   curl -X POST https://cdqzqvllbefryyrxmmls.supabase.co/functions/v1/dropbox-file-handler \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"action":"list","filePath":""}'
   ```

---

## ✅ Setup Complete!

Once you see files in your Dropbox account, you're all set! 🎉

Your architecture:
- **Frontend** → React app on Netlify
- **Backend** → Supabase (database + auth)
- **File Storage** → Dropbox (PDFs, images, documents)

Everything is connected and working together!
