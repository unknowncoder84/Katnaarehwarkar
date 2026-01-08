# 🎯 Netlify Environment Variables - Visual Step-by-Step Guide

**Status:** You're at Step 2 - Adding Environment Variables  
**Time:** 5 minutes  
**Difficulty:** Easy

---

## 📍 Where You Are Now

You've completed:
- ✅ Database setup (Supabase)
- ✅ Edge function deployed
- ❌ **Environment variables (YOU ARE HERE)**
- ⏳ Redeploy site
- ⏳ Test everything

---

## 🌐 Step 1: Open Netlify Dashboard

### Action:
1. Open your browser
2. Go to: **https://app.netlify.com**
3. Login with your account

### What You'll See:
```
┌─────────────────────────────────────────┐
│  Netlify Dashboard                      │
├─────────────────────────────────────────┤
│  Your Sites:                            │
│  ┌─────────────────────────────────┐   │
│  │ prks-office (or your site name) │   │
│  │ Status: Published               │   │
│  │ URL: https://...netlify.app     │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**✅ Checkpoint:** You see your site listed

---

## 🔧 Step 2: Click on Your Site

### Action:
1. Find your site in the list
2. Click on the site name (e.g., "prks-office")

### What You'll See:
```
┌─────────────────────────────────────────┐
│  prks-office                            │
├─────────────────────────────────────────┤
│  [Deploys] [Analytics] [Settings]       │
│                                         │
│  Status: Published                      │
│  URL: https://prks-office.netlify.app   │
│                                         │
│  Recent Deploys:                        │
│  ✅ Deploy successful (2 hours ago)     │
└─────────────────────────────────────────┘
```

**✅ Checkpoint:** You're in your site dashboard

---

## ⚙️ Step 3: Go to Site Settings

### Action:
1. Click **"Site settings"** button (top right area)

### What You'll See:
```
┌─────────────────────────────────────────┐
│  Site settings                          │
├─────────────────────────────────────────┤
│  Left Sidebar:                          │
│  • General                              │
│  • Build & deploy                       │
│  • Domain management                    │
│  • Environment variables  ← CLICK HERE  │
│  • Functions                            │
│  • Redirects and rewrites               │
│  • Headers                              │
│  • Forms                                │
└─────────────────────────────────────────┘
```

**✅ Checkpoint:** You see the settings menu

---

## 🔐 Step 4: Click "Environment variables"

### Action:
1. In the left sidebar, click **"Environment variables"**

### What You'll See:
```
┌─────────────────────────────────────────┐
│  Environment variables                  │
├─────────────────────────────────────────┤
│                                         │
│  [Add a variable] button                │
│                                         │
│  Current variables:                     │
│  (empty or existing ones)               │
│                                         │
└─────────────────────────────────────────┘
```

**✅ Checkpoint:** You're in the Environment variables section

---

## ➕ Step 5: Add First Variable

### Action:
1. Click **"Add a variable"** button

### What You'll See:
```
┌─────────────────────────────────────────┐
│  Add a new variable                     │
├─────────────────────────────────────────┤
│                                         │
│  Key:   [________________]              │
│  Value: [________________]              │
│                                         │
│  [Save] [Cancel]                        │
│                                         │
└─────────────────────────────────────────┘
```

### Now Fill In:

**In the "Key" field, type:**
```
VITE_SUPABASE_URL
```

**In the "Value" field, type:**
```
https://cdqzqvllbefryyrxmmls.supabase.co
```

### What It Looks Like:
```
┌─────────────────────────────────────────┐
│  Add a new variable                     │
├─────────────────────────────────────────┤
│                                         │
│  Key:   [VITE_SUPABASE_URL]             │
│  Value: [https://cdqzqvllbefryyrxmmls.  │
│         supabase.co]                    │
│                                         │
│  [Save] [Cancel]                        │
│                                         │
└─────────────────────────────────────────┘
```

### Action:
1. Click **"Save"** button
2. Wait for confirmation message

**✅ Checkpoint:** First variable saved

---

## ➕ Step 6: Add Second Variable

### Action:
1. Click **"Add a variable"** button again

### Now Fill In:

**In the "Key" field, type:**
```
VITE_SUPABASE_ANON_KEY
```

**In the "Value" field, type (copy the entire thing):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcXpxdmxsYmVmcnl5cnhtbWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDMyMzMsImV4cCI6MjA4MDE3OTIzM30.6aRcT8XLfAxdQ0BLVXqyaG7iCvxcOjWVONhFgj1UbBQ
```

### What It Looks Like:
```
┌─────────────────────────────────────────┐
│  Add a new variable                     │
├─────────────────────────────────────────┤
│                                         │
│  Key:   [VITE_SUPABASE_ANON_KEY]        │
│  Value: [eyJhbGciOiJIUzI1NiIsInR5cCI... │
│         (long key)]                     │
│                                         │
│  [Save] [Cancel]                        │
│                                         │
└─────────────────────────────────────────┘
```

### Action:
1. Click **"Save"** button
2. Wait for confirmation message

**✅ Checkpoint:** Second variable saved

---

## ✅ Step 7: Verify Both Variables Are Set

### What You Should See:
```
┌─────────────────────────────────────────┐
│  Environment variables                  │
├─────────────────────────────────────────┤
│                                         │
│  ✅ VITE_SUPABASE_URL                   │
│     https://cdqzqvllbefryyrxmmls...     │
│                                         │
│  ✅ VITE_SUPABASE_ANON_KEY              │
│     eyJhbGciOiJIUzI1NiIsInR5cCI...      │
│                                         │
│  [Add a variable]                       │
│                                         │
└─────────────────────────────────────────┘
```

**✅ Checkpoint:** Both variables are visible

---

## 🚀 Step 8: Redeploy Your Site

### Action:
1. Click **"Deploys"** tab (top menu)
2. Click **"Trigger deploy"** button
3. Select **"Deploy site"**

### What You'll See:
```
┌─────────────────────────────────────────┐
│  Deploys                                │
├─────────────────────────────────────────┤
│                                         │
│  [Trigger deploy ▼]                     │
│                                         │
│  Recent Deploys:                        │
│  🔄 Building... (just now)              │
│     Commit: abc123...                   │
│                                         │
│  ✅ Deploy successful (2 hours ago)     │
│                                         │
└─────────────────────────────────────────┘
```

### Wait For:
```
🔄 Building...
    ↓
✅ Build successful
    ↓
✅ Deploy successful
```

**This takes 2-3 minutes**

**✅ Checkpoint:** Deployment complete

---

## 🎉 You're Done!

Once you see **"✅ Deploy successful"**, your site is live with the environment variables!

---

## 📋 Quick Checklist

Before moving to testing:

- [ ] Opened Netlify dashboard
- [ ] Clicked on your site
- [ ] Went to Site settings
- [ ] Clicked Environment variables
- [ ] Added VITE_SUPABASE_URL
- [ ] Added VITE_SUPABASE_ANON_KEY
- [ ] Clicked Trigger deploy
- [ ] Waited for deployment to complete
- [ ] See "✅ Deploy successful"

---

## 🚨 If Something Goes Wrong

### "I can't find Environment variables"
```
Solution:
1. Make sure you're in "Site settings" (not general settings)
2. Look in the left sidebar
3. Scroll down if needed
4. Click "Environment variables"
```

### "The value field is too small"
```
Solution:
1. The field expands as you type
2. Just paste the entire key
3. It will fit
```

### "I got an error when saving"
```
Solution:
1. Check that you copied the entire value
2. Make sure there are no extra spaces
3. Try again
```

### "Deployment is taking too long"
```
Solution:
1. Wait at least 5 minutes
2. Refresh the page
3. Check the build logs for errors
```

---

## ✨ Next Step

Once deployment is complete, go to **PHASE 4: Testing Everything**

You'll:
1. Open your site URL
2. Login with your admin credentials
3. Create a test case
4. Upload a test file
5. Verify everything works

---

**Let me know once you see "✅ Deploy successful"!** 🚀

