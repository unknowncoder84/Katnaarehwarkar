# ⚡ Netlify Quick Fix - 3 Steps

## 🔴 Problem
Your GitHub repo isn't deploying to Netlify.

## ✅ Solution (3 Steps)

### Step 1: Fixed netlify.toml ✅ DONE
Changed build command from `vite build` to `npm run build`

### Step 2: Set Environment Variables in Netlify ⚠️ YOU NEED TO DO THIS

**Go to Netlify Dashboard:**
1. https://app.netlify.com/
2. Select your site
3. **Site settings** → **Environment variables**
4. Click **Add a variable**

**Add these 2 variables:**

```
Variable 1:
Key: VITE_SUPABASE_URL
Value: https://cdqzqvllbefryyrxmmls.supabase.co

Variable 2:
Key: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcXpxdmxsYmVmcnl5cnhtbWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDMyMzMsImV4cCI6MjA4MDE3OTIzM30.6aRcT8XLfAxdQ0BLVXqyaG7iCvxcOjWVONhFgj1UbBQ
```

### Step 3: Push to GitHub

```bash
git add .
git commit -m "Fix Netlify deployment"
git push origin main
```

## 🎯 That's It!

Netlify will automatically detect the push and start deploying.

**Check deployment:** https://app.netlify.com/sites/YOUR-SITE-NAME/deploys

---

## ❓ Why This Happens

1. **Wrong build command** - Netlify was running `vite build` instead of `npm run build` (which includes TypeScript compilation)
2. **Missing environment variables** - Your `.env` file is not in GitHub (correct for security), so Netlify doesn't have your Supabase credentials

---

## 🚨 If Still Not Working

**Check build logs in Netlify:**
1. Go to Netlify dashboard
2. Click **Deploys**
3. Click on the failed deploy
4. Read the error message

**Common issues:**
- Environment variables not set → Set them in Netlify dashboard
- TypeScript errors → Run `npm run build` locally to see errors
- Wrong branch → Make sure Netlify is watching the correct branch

---

**Need detailed help?** See `NETLIFY_DEPLOYMENT_FIX.md`
