# 🚀 GitHub & Netlify Deployment Guide

## Current Status
- ✅ Git repository initialized
- ✅ Connected to GitHub: `https://github.com/unknowncoder84/Katnaarehwarkar.git`
- ✅ Netlify configuration file exists (`netlify.toml`)
- ⚠️ Changes ready to commit

---

## 📤 Step 1: Push to GitHub

### Option A: Quick Push (Recommended)

Run these commands in your terminal:

```bash
# Add all changes
git add .

# Commit with a message
git commit -m "Update: Latest features and improvements"

# Push to GitHub
git push origin main
```

### Option B: Review Changes First

```bash
# See what files have changed
git status

# See detailed changes
git diff

# Add specific files
git add src/components/CreateCaseForm.tsx
git add src/pages/AppointmentsPage.tsx
# ... add other files

# Commit
git commit -m "Update: Case form and appointments enhancements"

# Push
git push origin main
```

---

## 🌐 Step 2: Netlify Deployment

### A. If Netlify is Already Connected

If your GitHub repo is already connected to Netlify:

1. **Automatic Deployment**
   - Netlify will automatically detect your push
   - Build will start automatically
   - Check: https://app.netlify.com/sites/YOUR-SITE-NAME/deploys

2. **Manual Trigger** (if needed)
   - Go to: https://app.netlify.com
   - Select your site
   - Click "Trigger deploy" → "Deploy site"

### B. If Netlify is NOT Connected Yet

#### Step 1: Connect to Netlify

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub"
4. Select repository: `unknowncoder84/Katnaarehwarkar`
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 18
6. Click "Deploy site"

#### Step 2: Configure Environment Variables

Go to: **Site settings** → **Environment variables** → **Add a variable**

Add these variables:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Where to find these values:**
- Go to https://supabase.com
- Open your project
- Go to **Settings** → **API**
- Copy:
  - Project URL → `VITE_SUPABASE_URL`
  - anon/public key → `VITE_SUPABASE_ANON_KEY`

---

## 🔐 Step 3: Verify Environment Variables

### Check Your Local .env File

Your `.env` file should have:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_DROPBOX_ACCESS_TOKEN=your-dropbox-token-here
```

⚠️ **IMPORTANT**: Never commit `.env` file to GitHub!

### Verify .gitignore

Make sure `.env` is in your `.gitignore` file:

```
.env
.env.local
.env.production
```

---

## ✅ Step 4: Test Deployment

### After Deployment Completes:

1. **Visit Your Site**
   - URL will be: `https://your-site-name.netlify.app`
   - Or your custom domain if configured

2. **Test Key Features**
   - [ ] Login page loads
   - [ ] Can login with credentials
   - [ ] Dashboard displays
   - [ ] Can create a case
   - [ ] Can view cases
   - [ ] All pages accessible

3. **Check Browser Console**
   - Press F12
   - Look for any errors
   - Verify API calls to Supabase work

---

## 🐛 Troubleshooting

### Issue: Build Fails on Netlify

**Solution 1: Check Build Log**
- Go to Netlify dashboard
- Click on failed deploy
- Read the error message

**Solution 2: Common Fixes**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Test build locally
npm run build

# If successful, commit and push
git add .
git commit -m "Fix: Build configuration"
git push origin main
```

### Issue: Environment Variables Not Working

**Solution:**
1. Go to Netlify dashboard
2. Site settings → Environment variables
3. Make sure variables are added
4. Click "Trigger deploy" to rebuild with new variables

### Issue: 404 Errors on Page Refresh

**Solution:** Already configured in `netlify.toml`
- The redirect rule handles SPA routing
- All routes redirect to `index.html`

### Issue: Supabase Connection Fails

**Solution:**
1. Check environment variables are set in Netlify
2. Verify Supabase project is not paused
3. Check RLS policies in Supabase
4. Test API calls in browser console

---

## 📊 Deployment Checklist

### Before Pushing to GitHub:
- [ ] All changes tested locally
- [ ] `npm run build` works without errors
- [ ] `.env` file is in `.gitignore`
- [ ] No sensitive data in code
- [ ] All dependencies in `package.json`

### After Pushing to GitHub:
- [ ] Changes visible on GitHub
- [ ] Netlify build triggered
- [ ] Build completed successfully
- [ ] Site is accessible
- [ ] All features work on live site

### Environment Setup:
- [ ] Supabase URL configured
- [ ] Supabase Anon Key configured
- [ ] Dropbox token configured (if using file upload)
- [ ] Database migrations run
- [ ] Admin user created

---

## 🎯 Quick Commands Reference

### Git Commands
```bash
# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "Your message"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main

# View commit history
git log --oneline
```

### NPM Commands
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test
```

### Netlify CLI (Optional)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link to existing site
netlify link

# Deploy manually
netlify deploy --prod

# Open site in browser
netlify open
```

---

## 🔗 Important Links

- **GitHub Repository**: https://github.com/unknowncoder84/Katnaarehwarkar
- **Netlify Dashboard**: https://app.netlify.com
- **Supabase Dashboard**: https://supabase.com
- **Dropbox Apps**: https://www.dropbox.com/developers/apps

---

## 📝 Next Steps After Deployment

1. **Set up Custom Domain** (Optional)
   - Go to Netlify → Domain settings
   - Add custom domain
   - Configure DNS

2. **Enable HTTPS** (Automatic)
   - Netlify provides free SSL
   - Automatically enabled

3. **Set up Continuous Deployment**
   - Already configured
   - Every push to `main` triggers deployment

4. **Monitor Deployments**
   - Check Netlify dashboard regularly
   - Review build logs
   - Monitor site performance

5. **Database Setup**
   - Run migrations in Supabase
   - Create admin user
   - Test database connection

---

## 🎉 Success Criteria

Your deployment is successful when:

- ✅ Code is on GitHub
- ✅ Netlify build passes
- ✅ Site is accessible via URL
- ✅ Login works
- ✅ Database connection works
- ✅ All pages load correctly
- ✅ No console errors
- ✅ File upload works (if configured)

---

**Need Help?** Check the other documentation files:
- `COMPLETE_PROJECT_SETUP.md` - Full setup guide
- `PRODUCTION_DEPLOYMENT_CHECKLIST.md` - Deployment checklist
- `TROUBLESHOOTING_GUIDE.md` - Common issues

**Last Updated**: December 2025
