# 🚀 Complete Project Setup Guide

Your legal case dashboard project is almost ready! Follow this guide to get everything working perfectly.

---

## ✅ What's Already Done

- ✅ Frontend built with React + Vite
- ✅ Deployed on Netlify
- ✅ Supabase database configured
- ✅ Dropbox token added to Supabase secrets
- ✅ File download button working
- ✅ Edit button visible to all users

---

## 📋 What You Need to Do Now

### Phase 1: Database Setup (REQUIRED)

#### Step 1: Run Database Migrations

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com
   - Login to your account
   - Open project: `cdqzqvllbefryyrxmmls`

2. **Go to SQL Editor**
   - Click **"SQL Editor"** in left sidebar
   - Click **"New Query"**

3. **Run the Database Setup**
   - Open file: `PRODUCTION_READY_DATABASE.sql`
   - Copy ALL the SQL code
   - Paste into Supabase SQL Editor
   - Click **"RUN"** button
   - Wait for "Success" message

#### Step 2: Create Admin User

1. **In Supabase SQL Editor**
   - Click **"New Query"**
   - Open file: `CREATE_ADMIN_USER.sql`
   - Copy the SQL code
   - Paste into editor
   - **IMPORTANT:** Change these values:
     - `'admin@katneshwarkar.com'` → Your email
     - `'Admin@123'` → Your password
   - Click **"RUN"**

#### Step 3: Verify Database

1. **Check Tables**
   - Go to **"Table Editor"** in Supabase
   - You should see these tables:
     - ✅ cases
     - ✅ counsel
     - ✅ appointments
     - ✅ transactions
     - ✅ courts
     - ✅ case_types
     - ✅ books
     - ✅ sofa_items
     - ✅ profiles

---

### Phase 2: Deploy Edge Function (REQUIRED)

#### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

#### Step 2: Login to Supabase

```bash
supabase login
```
- Browser will open
- Click **"Authorize"**

#### Step 3: Link Your Project

```bash
supabase link --project-ref cdqzqvllbefryyrxmmls
```
- Enter your database password when prompted

#### Step 4: Deploy the Edge Function

```bash
supabase functions deploy dropbox-file-handler
```
- Wait for "Deployed successfully" message

---

### Phase 3: Test Everything

#### Test 1: Login

1. Open your deployed site
2. Login with:
   - Email: (the one you created)
   - Password: (the one you created)
3. If login works → Database is connected ✅

#### Test 2: Create a Case

1. Click **"Cases"** → **"Create New Case"**
2. Fill in the form
3. Click **"Save"**
4. If case appears in list → Database is working ✅

#### Test 3: File Upload

1. Open a case
2. Go to **"FILES"** tab
3. Upload a PDF file
4. Click **"ATTACH"**
5. Check your Dropbox account
6. If file appears → Dropbox is working ✅

---

## 🔧 Environment Variables

Your `.env` file already has:
- ✅ Supabase URL
- ✅ Supabase Anon Key
- ✅ Dropbox Access Token

**For Netlify Production:**
1. Go to Netlify Dashboard
2. Site settings → Environment variables
3. Add these two:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Redeploy site

---

## 📊 Architecture Summary

```
Frontend (React/Netlify)
    ↓
Backend (Supabase Database)
    ↓
File Storage (Dropbox)
```

---

## 🚨 Troubleshooting

### "Login Failed"
- Check admin user was created
- Verify email/password are correct
- Check Supabase project is not paused

### "File Upload Failed"
- Check Dropbox token is valid
- Verify Edge Function is deployed
- Check browser console for errors (F12)

### "Database Tables Missing"
- Run `PRODUCTION_READY_DATABASE.sql` again
- Check for SQL errors in Supabase

### "Can't Find Edge Functions"
- Try searching for "Functions" in Supabase
- Or look under "Database" → "Functions"

---

## ✨ You're All Set!

Once all three phases are complete, your project is fully operational:
- Users can login
- Cases can be created/edited/deleted
- Files can be uploaded to Dropbox
- Everything syncs properly

**Next Steps:**
1. Invite team members
2. Start creating cases
3. Upload documents
4. Monitor usage

---

## 📞 Quick Reference

- **Supabase Dashboard:** https://supabase.com
- **Netlify Dashboard:** https://app.netlify.com
- **Your Site:** (check Netlify for your URL)
- **Dropbox App:** https://www.dropbox.com/developers/apps

---

**Questions?** Check the other setup guides in your project root for detailed information on any specific component.
