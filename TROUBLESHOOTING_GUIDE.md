# 🔧 Troubleshooting Guide

## Common Issues and Solutions for Legal Case Management System

---

## 🚨 Authentication Issues

### Problem: Cannot Login with Admin Credentials

**Symptoms:**
- Login fails with "Invalid username or password"
- Admin user not found

**Solutions:**

1. **Verify admin user exists:**
```sql
SELECT * FROM public.user_accounts WHERE username = 'admin';
```

2. **If user doesn't exist, create it:**
```sql
INSERT INTO public.user_accounts (name, email, username, password_hash, role, is_active)
VALUES (
  'Admin User',
  'admin@katneshwarkar.com',
  'admin',
  public.hash_password('admin123'),
  'admin',
  TRUE
);
```

3. **Test authentication:**
```sql
SELECT * FROM public.authenticate_user('admin', 'admin123');
```

4. **Check if password hash function exists:**
```sql
SELECT proname FROM pg_proc WHERE proname = 'hash_password';
```

---

### Problem: "Function does not exist" Error

**Symptoms:**
- Error: `function public.authenticate_user(text, text) does not exist`
- Functions not found in database

**Solutions:**

1. **Check if functions exist:**
```sql
SELECT proname FROM pg_proc 
WHERE proname IN ('authenticate_user', 'hash_password', 'create_user_account');
```

2. **Re-run the complete setup:**
- Open `supabase/migrations/COMPLETE_DATABASE_SETUP.sql`
- Copy entire contents
- Paste in Supabase SQL Editor
- Run the query

3. **Grant permissions:**
```sql
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
```

---

### Problem: User is Deactivated

**Symptoms:**
- Login fails with "Account is deactivated"

**Solution:**
```sql
UPDATE public.user_accounts
SET is_active = TRUE
WHERE username = 'your_username';
```

---

## 🗄️ Database Connection Issues

### Problem: Cannot Connect to Supabase

**Symptoms:**
- Network errors
- "Failed to fetch" errors
- Connection timeout

**Solutions:**

1. **Check environment variables:**
```bash
# Verify .env file exists and contains:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. **Verify Supabase credentials:**
- Go to Supabase Dashboard → Settings → API
- Copy Project URL and anon public key
- Update .env file
- Restart development server

3. **Check Supabase project status:**
- Go to Supabase Dashboard
- Check if project is paused (free tier auto-pauses after inactivity)
- Click "Resume" if paused

4. **Test connection:**
```javascript
// In browser console
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);
```

---

### Problem: CORS Errors

**Symptoms:**
- "Access-Control-Allow-Origin" errors
- Cross-origin request blocked

**Solutions:**

1. **Add your domain to Supabase:**
- Go to Supabase Dashboard → Authentication → URL Configuration
- Add your development URL (e.g., `http://localhost:5173`)
- Add your production URL

2. **Check Site URL:**
- Go to Supabase Dashboard → Authentication → Settings
- Set Site URL to your app URL

---

## 📊 Data Issues

### Problem: Old Mock Data Still Showing

**Symptoms:**
- Seeing old data after database setup
- Data not syncing with Supabase

**Solutions:**

1. **Clear browser localStorage:**
```javascript
// In browser console
localStorage.clear();
location.reload();
```

2. **Clear browser cache:**
- Chrome: Ctrl+Shift+Delete → Clear browsing data
- Firefox: Ctrl+Shift+Delete → Clear recent history
- Safari: Cmd+Option+E

3. **Hard refresh:**
- Windows: Ctrl+Shift+R
- Mac: Cmd+Shift+R

4. **Try incognito/private mode:**
- This ensures no cached data

---

### Problem: Data Not Saving

**Symptoms:**
- Forms submit but data doesn't appear
- No error messages

**Solutions:**

1. **Check RLS policies:**
```sql
-- View policies for a table
SELECT * FROM pg_policies WHERE tablename = 'cases';

-- Temporarily disable RLS for testing (DEVELOPMENT ONLY)
ALTER TABLE public.cases DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
```

2. **Check browser console for errors:**
- Open Developer Tools (F12)
- Go to Console tab
- Look for error messages

3. **Verify user is authenticated:**
```javascript
// In browser console
const { data: { user } } = await supabase.auth.getUser();
console.log(user);
```

4. **Test direct insert:**
```sql
INSERT INTO public.cases (client_name, file_no, case_type, court, status)
VALUES ('Test Client', 'TEST-001', 'Civil', 'District Court', 'active');
```

---

### Problem: Cannot Delete Records

**Symptoms:**
- Delete button doesn't work
- "Permission denied" errors

**Solutions:**

1. **Check if you're admin:**
```sql
SELECT role FROM public.user_accounts WHERE id = 'your-user-id';
```

2. **Check delete policies:**
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'cases' 
AND cmd = 'DELETE';
```

3. **Grant delete permissions:**
```sql
CREATE POLICY "Users can delete cases" ON public.cases
FOR DELETE USING (true);
```

---

## 🔐 Permission Issues

### Problem: "Row Level Security" Errors

**Symptoms:**
- "new row violates row-level security policy"
- Cannot insert/update/delete data

**Solutions:**

1. **Check if RLS is enabled:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

2. **View existing policies:**
```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

3. **Create permissive policies (DEVELOPMENT ONLY):**
```sql
-- For cases table
DROP POLICY IF EXISTS "Allow all operations" ON public.cases;
CREATE POLICY "Allow all operations" ON public.cases
FOR ALL USING (true) WITH CHECK (true);
```

4. **Disable RLS temporarily (DEVELOPMENT ONLY):**
```sql
ALTER TABLE public.cases DISABLE ROW LEVEL SECURITY;
```

---

### Problem: Admin Functions Not Working

**Symptoms:**
- Cannot create users
- Cannot change roles
- "Only admins can..." errors

**Solutions:**

1. **Verify you're logged in as admin:**
```sql
SELECT * FROM public.user_accounts WHERE username = 'admin';
```

2. **Check admin role:**
```sql
UPDATE public.user_accounts
SET role = 'admin'
WHERE username = 'admin';
```

3. **Test admin functions:**
```sql
SELECT * FROM public.create_user_account(
  'Test User',
  'test@example.com',
  'testuser',
  'password123',
  'user',
  (SELECT id FROM public.user_accounts WHERE username = 'admin')
);
```

---

## 🎨 UI/Frontend Issues

### Problem: Blank Page or White Screen

**Symptoms:**
- App shows blank page
- No content loads

**Solutions:**

1. **Check browser console:**
- Open Developer Tools (F12)
- Look for JavaScript errors

2. **Check if Vite server is running:**
```bash
npm run dev
```

3. **Reinstall dependencies:**
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

4. **Check for TypeScript errors:**
```bash
npm run build
```

---

### Problem: Styles Not Loading

**Symptoms:**
- App looks unstyled
- Missing CSS

**Solutions:**

1. **Check if Tailwind is configured:**
```bash
# Verify tailwind.config.js exists
cat tailwind.config.js
```

2. **Rebuild CSS:**
```bash
npm run dev
```

3. **Clear Vite cache:**
```bash
rm -rf node_modules/.vite
npm run dev
```

---

### Problem: Components Not Updating

**Symptoms:**
- Data changes but UI doesn't update
- Stale data showing

**Solutions:**

1. **Check React state management:**
```javascript
// Ensure you're using state properly
const [data, setData] = useState([]);
```

2. **Force re-render:**
```javascript
// Add key prop to force remount
<Component key={Date.now()} />
```

3. **Check useEffect dependencies:**
```javascript
useEffect(() => {
  fetchData();
}, [dependency]); // Make sure dependencies are correct
```

---

## 📱 Mobile/Responsive Issues

### Problem: Layout Broken on Mobile

**Symptoms:**
- Elements overflow
- Text too small
- Buttons not clickable

**Solutions:**

1. **Check viewport meta tag:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

2. **Use responsive Tailwind classes:**
```jsx
<div className="w-full md:w-1/2 lg:w-1/3">
```

3. **Test in browser dev tools:**
- Open Developer Tools (F12)
- Click device toolbar icon
- Test different screen sizes

---

## 🚀 Performance Issues

### Problem: Slow Loading

**Symptoms:**
- App takes long to load
- Queries are slow

**Solutions:**

1. **Check database indexes:**
```sql
-- View existing indexes
SELECT * FROM pg_indexes WHERE schemaname = 'public';

-- Add missing indexes
CREATE INDEX idx_cases_client_name ON public.cases(client_name);
```

2. **Optimize queries:**
```sql
-- Use EXPLAIN ANALYZE to check query performance
EXPLAIN ANALYZE
SELECT * FROM public.cases WHERE client_name LIKE '%John%';
```

3. **Limit result sets:**
```sql
-- Add LIMIT to queries
SELECT * FROM public.cases ORDER BY created_at DESC LIMIT 100;
```

4. **Enable query caching:**
```javascript
// In React Query or SWR
const { data } = useQuery('cases', fetchCases, {
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

---

### Problem: Memory Leaks

**Symptoms:**
- Browser becomes slow over time
- High memory usage

**Solutions:**

1. **Clean up useEffect:**
```javascript
useEffect(() => {
  const subscription = supabase
    .channel('cases')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, handleChange)
    .subscribe();

  return () => {
    subscription.unsubscribe(); // Clean up!
  };
}, []);
```

2. **Avoid memory leaks in state:**
```javascript
useEffect(() => {
  let isMounted = true;

  fetchData().then(data => {
    if (isMounted) {
      setData(data);
    }
  });

  return () => {
    isMounted = false;
  };
}, []);
```

---

## 🔄 Migration Issues

### Problem: Migration Failed

**Symptoms:**
- SQL errors during setup
- Tables not created

**Solutions:**

1. **Check for existing tables:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

2. **Drop and recreate (⚠️ DANGER - LOSES DATA):**
```sql
-- ONLY IF YOU WANT TO START FRESH
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Then re-run COMPLETE_DATABASE_SETUP.sql
```

3. **Run migrations in order:**
- First: `COMPLETE_DATABASE_SETUP.sql`
- Then: Any additional migration files

---

## 🌐 Deployment Issues

### Problem: App Works Locally But Not in Production

**Symptoms:**
- Works on localhost
- Fails on deployed site

**Solutions:**

1. **Check environment variables:**
```bash
# Verify production env vars are set
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

2. **Update Supabase URL configuration:**
- Go to Supabase Dashboard → Authentication → URL Configuration
- Add production URL to allowed URLs

3. **Check build output:**
```bash
npm run build
# Check dist folder for errors
```

4. **Verify CORS settings:**
- Add production domain to Supabase allowed origins

---

## 📞 Getting Help

### Before Asking for Help

1. **Check browser console** for error messages
2. **Check Supabase logs** in dashboard
3. **Try in incognito mode** to rule out cache issues
4. **Test with a fresh database** to rule out data corruption

### Information to Provide

When asking for help, include:
- Error message (full text)
- Browser console logs
- Steps to reproduce
- What you've already tried
- Browser and OS version
- Node.js version (`node --version`)

### Useful Debug Commands

```javascript
// In browser console

// Check Supabase connection
console.log(supabase);

// Check current user
const { data: { user } } = await supabase.auth.getUser();
console.log(user);

// Test query
const { data, error } = await supabase.from('cases').select('*').limit(1);
console.log({ data, error });

// Check environment
console.log(import.meta.env);
```

---

## 🛠️ Emergency Reset

### Complete System Reset (⚠️ LOSES ALL DATA)

If nothing else works:

1. **Backup important data first!**

2. **Drop all tables:**
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

3. **Re-run setup:**
- Run `COMPLETE_DATABASE_SETUP.sql`

4. **Clear browser data:**
```javascript
localStorage.clear();
sessionStorage.clear();
```

5. **Restart development server:**
```bash
npm run dev
```

---

## 📚 Additional Resources

- **Supabase Docs:** https://supabase.com/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **React Docs:** https://react.dev/
- **Tailwind CSS Docs:** https://tailwindcss.com/docs

---

## ✅ Prevention Tips

1. **Regular backups** - Export data weekly
2. **Test in development** - Never test directly in production
3. **Use version control** - Commit working code
4. **Monitor logs** - Check Supabase dashboard regularly
5. **Keep dependencies updated** - Run `npm update` monthly
6. **Document changes** - Keep notes of customizations
7. **Use TypeScript** - Catch errors before runtime
8. **Write tests** - Prevent regressions
9. **Code reviews** - Have someone check your changes
10. **Stay updated** - Follow Supabase changelog

---

**Still having issues?** Contact: sawantrishi152@gmail.com
