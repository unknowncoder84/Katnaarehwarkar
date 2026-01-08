# 🚀 Quick Login Fix - 3 Steps

## Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left sidebar

## Step 2: Run the Fix Script
1. Open the file: **`FIXED_USER_SETUP.sql`**
2. Copy **ALL** the contents (Ctrl+A, Ctrl+C)
3. Paste into Supabase SQL Editor (Ctrl+V)
4. Click **Run** button (or press Ctrl+Enter)
5. Wait for "Success" message

## Step 3: Login
Go to your app and login with:

```
Username: admin
Password: admin123
```

---

## That's It! 🎉

Your login should now work.

### Other Available Accounts:
- **vipin** / vipin123
- **user** / user123

---

## Still Not Working?

See **LOGIN_FIX_INSTRUCTIONS.md** for detailed troubleshooting.

### Quick Checks:
1. Did the SQL script run without errors?
2. Are you typing the username/password exactly? (no spaces)
3. Check browser console (F12) for errors
4. Try hard refresh (Ctrl+Shift+R)

### Verify Users Exist:
Run this in SQL Editor:
```sql
SELECT username, name, role, is_active FROM user_accounts;
```

You should see 3 users: admin, vipin, user

### Test Authentication:
Run this in SQL Editor:
```sql
SELECT * FROM authenticate_user('admin', 'admin123');
```

Should return `success = true`
