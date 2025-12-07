# 🚀 Complete Deployment Guide - Netlify + Supabase

## Overview

This guide will help you deploy your Legal Case Management System to production using Netlify and Supabase.

---

## ✅ Prerequisites Checklist

Before starting, make sure you have:

- [x] Git repository pushed to GitHub/GitLab/Bitbucket
- [x] Netlify account connected to your Git repository
- [ ] Supabase account and project created
- [ ] Database setup completed

---

## Step 1: Setup Supabase Database

### 1.1 Run the Database Setup

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project (or create a new one)
3. Click **SQL Editor** in the left sidebar
4. Open the file: `supabase/migrations/COMPLETE_DATABASE_SETUP.sql`
5. **Copy ALL** the contents (Ctrl+A, Ctrl+C)
6. **Paste** into Supabase SQL Editor (Ctrl+V)
7. Click **RUN** (or press Ctrl+Enter)
8. Wait for "Success" message (takes 10-30 seconds)

### 1.2 Verify Database Setup

Run this query in SQL Editor to verify:

```sql
-- Check if admin user exists
SELECT username, name, email, role, is_active 
FROM public.user_accounts;

-- Test authentication
SELECT * FROM public.authenticate_user('admin', 'admin123');
```

You should see:
- Admin user in the first query
- `success = true` in the second query

### 1.3 Get Supabase Credentials

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** tab
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

---

## Step 2: Configure Netlify Environment Variables

### 2.1 Add Environment Variables

1. Go to your **Netlify Dashboard**: https://app.netlify.com
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable** and add these:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** Replace with YOUR actual Supabase URL and key!

### 2.2 Verify netlify.toml

Your `netlify.toml` should look like this (already configured):

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Step 3: Deploy to Netlify

### Option A: Automatic Deployment (Recommended)

Since you've already connected Git to Netlify:

1. **Push your code** to Git:
   ```bash
   git add .
   git commit -m "Production ready deployment"
   git push origin main
   ```

2. **Netlify will automatically**:
   - Detect the push
   - Run `npm run build`
   - Deploy to production
   - Give you a URL like: `https://your-site.netlify.app`

3. **Monitor the deployment**:
   - Go to Netlify Dashboard
   - Click on your site
   - View the **Deploys** tab
   - Watch the build logs

### Option B: Manual Deployment

If automatic deployment doesn't work:

1. Go to Netlify Dashboard
2. Click **Deploys** tab
3. Click **Trigger deploy** → **Deploy site**

---

## Step 4: Test Your Production Site

### 4.1 Access Your Site

1. Go to your Netlify URL: `https://your-site.netlify.app`
2. You should see the login page

### 4.2 Login

Use the default credentials:

```
Username: admin
Password: admin123
```

### 4.3 Verify Features

Test these features:
- ✅ Login works
- ✅ Dashboard loads
- ✅ Can create a case
- ✅ Can view cases
- ✅ Can create appointments
- ✅ Admin panel accessible

---

## Step 5: Post-Deployment Security

### 5.1 Change Default Password

**CRITICAL:** Change the admin password immediately!

1. Login as admin
2. Go to **Admin** page
3. Click on admin user
4. Change password from `admin123` to something secure

### 5.2 Create Additional Users

1. Go to **Admin** page
2. Click **Create User**
3. Add your team members

### 5.3 Update Supabase RLS Policies (Optional)

For production, you may want to tighten security:

```sql
-- Example: Restrict user creation to admins only
DROP POLICY IF EXISTS "Anyone can insert courts" ON public.courts;
CREATE POLICY "Admins can insert courts" ON public.courts 
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);
```

---

## Step 6: Custom Domain (Optional)

### 6.1 Add Custom Domain

1. Go to Netlify Dashboard → **Domain settings**
2. Click **Add custom domain**
3. Enter your domain (e.g., `katneshwarkar.com`)
4. Follow DNS configuration instructions

### 6.2 Enable HTTPS

Netlify automatically provides free SSL certificates via Let's Encrypt.

---

## Troubleshooting

### Issue: Build Fails on Netlify

**Solution:**
1. Check build logs in Netlify
2. Verify `package.json` has correct build script:
   ```json
   "scripts": {
     "build": "tsc && vite build"
   }
   ```
3. Ensure all dependencies are in `package.json`

### Issue: Login Doesn't Work

**Solution:**
1. Check browser console (F12) for errors
2. Verify environment variables are set in Netlify
3. Verify Supabase URL and key are correct
4. Check if database setup completed successfully

### Issue: "Invalid username or password"

**Solution:**
1. Verify database has users:
   ```sql
   SELECT * FROM public.user_accounts;
   ```
2. Test authentication function:
   ```sql
   SELECT * FROM public.authenticate_user('admin', 'admin123');
   ```
3. If no users exist, run the database setup again

### Issue: Environment Variables Not Working

**Solution:**
1. Verify variables are named correctly:
   - `VITE_SUPABASE_URL` (not `SUPABASE_URL`)
   - `VITE_SUPABASE_ANON_KEY` (not `SUPABASE_KEY`)
2. Redeploy after adding variables
3. Clear browser cache (Ctrl+Shift+Delete)

### Issue: 404 on Page Refresh

**Solution:**
- Verify `netlify.toml` has the redirect rule (already configured)
- Redeploy if you just added it

---

## Monitoring & Maintenance

### Check Deployment Status

```bash
# View recent deployments
netlify status

# View deploy logs
netlify logs
```

### Database Backups

1. Go to Supabase Dashboard
2. **Database** → **Backups**
3. Enable automatic daily backups

### Monitor Usage

- **Netlify**: Dashboard → Analytics
- **Supabase**: Dashboard → Usage

---

## Quick Reference

### Login Credentials (Default)
```
Username: admin
Password: admin123
```

### Important URLs
- Netlify Dashboard: https://app.netlify.com
- Supabase Dashboard: https://supabase.com/dashboard
- Your Site: https://your-site.netlify.app

### Key Files
- Database Setup: `supabase/migrations/COMPLETE_DATABASE_SETUP.sql`
- Netlify Config: `netlify.toml`
- Environment: `.env` (local only, not in Git)

---

## Success Checklist

- [ ] Database setup completed in Supabase
- [ ] Environment variables added to Netlify
- [ ] Code pushed to Git
- [ ] Netlify deployment successful
- [ ] Can login to production site
- [ ] Admin password changed
- [ ] Additional users created
- [ ] All features tested

---

## Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Review Netlify build logs
3. Check browser console for errors
4. Verify Supabase database is accessible
5. Ensure environment variables are correct

---

## 🎉 Congratulations!

Your Legal Case Management System is now live in production!

**Next Steps:**
1. Share the URL with your team
2. Create user accounts for team members
3. Start managing cases
4. Monitor usage and performance
5. Set up regular database backups

---

**Production URL:** `https://your-site.netlify.app`  
**Admin Login:** `admin` / `admin123` (change this!)  
**Support:** Check documentation or contact your developer
