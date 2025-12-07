# Supabase User Management Setup Guide

## Overview
This guide explains how to set up the complete user management system with Supabase backend integration.

## Files Created/Updated

### 1. SQL Migration File
**File:** `supabase/migrations/003_update_user_management.sql`

This migration creates:
- ✅ Updated `user_accounts` table with email and name columns
- ✅ Password hashing functions using bcrypt
- ✅ User authentication function
- ✅ Create user function with duplicate checking
- ✅ Update user role function
- ✅ Toggle user status function (activate/deactivate)
- ✅ Delete user function (soft delete)
- ✅ Get all users function
- ✅ Proper RLS policies
- ✅ Default admin user (username: `admin`, password: `admin`)

### 2. User Management Helper
**File:** `src/lib/userManagement.ts`

Helper functions to interact with Supabase:
- `authenticateUser()` - Login with username/password
- `getAllUsers()` - Fetch all users (admin only)
- `createUserAccount()` - Create new user
- `updateUserRoleDb()` - Update user role
- `toggleUserStatusDb()` - Activate/deactivate user
- `deleteUserAccountDb()` - Soft delete user

### 3. Updated AuthContext
**File:** `src/contexts/AuthContext.tsx`

Now uses Supabase backend instead of localStorage:
- All user operations go through Supabase
- Data persists in the database
- Proper error handling
- Real-time updates

### 4. Updated Types
**File:** `src/types/index.ts`

Added 'vipin' to UserRole type:
```typescript
export type UserRole = 'admin' | 'user' | 'vipin';
```

## Setup Instructions

### Step 1: Run the SQL Migration

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire content from `supabase/migrations/003_update_user_management.sql`
5. Paste and click **Run**

### Step 2: Verify Default Admin User

After running the migration, a default admin user is created:
- **Username:** `admin`
- **Password:** `admin`
- **Email:** `admin@katneshwarkar.com`
- **Role:** `admin`

### Step 3: Test the System

1. **Login:**
   ```
   Username: admin
   Password: admin
   ```

2. **Create a New User:**
   - Click "Add New User" button
   - Fill in the form
   - User will be created in Supabase database

3. **Change User Role:**
   - Select role from dropdown
   - Changes saved to database immediately

4. **Deactivate/Activate User:**
   - Click the toggle button (UserX/UserCheck icon)
   - Status updated in database

5. **Delete User:**
   - Click delete button (Trash icon)
   - User soft-deleted (deactivated) in database

## Database Functions

### 1. Authenticate User
```sql
SELECT * FROM public.authenticate_user('admin', 'admin');
```

Returns:
- success (boolean)
- user_id (uuid)
- name (varchar)
- email (varchar)
- username (varchar)
- role (varchar)
- is_active (boolean)
- error_message (text)

### 2. Create User
```sql
SELECT * FROM public.create_user_account(
  'John Doe',                    -- name
  'john@example.com',            -- email
  'john',                        -- username
  'password123',                 -- password
  'user',                        -- role
  NULL                           -- created_by (optional)
);
```

### 3. Get All Users
```sql
SELECT * FROM public.get_all_users();
```

### 4. Update User Role
```sql
SELECT * FROM public.update_user_role(
  'user-uuid',                   -- user_id
  'admin',                       -- new_role
  'admin-uuid'                   -- updated_by
);
```

### 5. Toggle User Status
```sql
SELECT * FROM public.toggle_user_status(
  'user-uuid',                   -- user_id
  'admin-uuid'                   -- updated_by
);
```

### 6. Delete User
```sql
SELECT * FROM public.delete_user_account(
  'user-uuid',                   -- user_id
  'admin-uuid'                   -- deleted_by
);
```

## Features

### ✅ User Creation
- Duplicate email checking
- Duplicate username checking
- Password hashing with bcrypt
- Automatic profile creation
- Role assignment (admin/user/vipin)

### ✅ User Authentication
- Secure password verification
- Active user checking
- Returns complete user data
- Error messages for invalid credentials

### ✅ Role Management
- Admin can change user roles
- Prevents self-demotion
- Three roles: admin, user, vipin
- Real-time updates

### ✅ User Status Management
- Activate/deactivate users
- Prevents self-deactivation
- Soft delete (deactivation)
- Inactive users cannot login

### ✅ Data Persistence
- All data stored in Supabase
- Survives page refreshes
- Survives browser restarts
- Accessible from any device

### ✅ Security
- Password hashing with bcrypt (10 rounds)
- Row Level Security (RLS) policies
- Admin-only operations
- Prevents self-harm operations

## Troubleshooting

### Issue: "Function does not exist"
**Solution:** Make sure you ran the migration SQL in Supabase SQL Editor

### Issue: "Permission denied"
**Solution:** Check that RLS policies are properly set up

### Issue: "Cannot login"
**Solution:** 
1. Verify default admin user exists:
   ```sql
   SELECT * FROM public.user_accounts WHERE username = 'admin';
   ```
2. If not, create it:
   ```sql
   INSERT INTO public.user_accounts (name, email, username, password_hash, role, is_active)
   VALUES (
     'Admin User',
     'admin@katneshwarkar.com',
     'admin',
     public.hash_password('admin'),
     'admin',
     TRUE
   );
   ```

### Issue: "User already exists" when creating user
**Solution:** This is working correctly! The system prevents duplicate emails/usernames

### Issue: Deactivate button not working
**Solution:** 
1. Check browser console for errors
2. Verify you're logged in as admin
3. Make sure you're not trying to deactivate yourself

## Testing Checklist

- [ ] Run SQL migration successfully
- [ ] Login with default admin user (admin/admin)
- [ ] Create a new user
- [ ] Try creating duplicate user (should fail)
- [ ] Change user role
- [ ] Deactivate a user
- [ ] Try to login as deactivated user (should fail)
- [ ] Reactivate the user
- [ ] Delete a user
- [ ] Logout and login again (data should persist)

## Next Steps

1. **Change Default Admin Password:**
   ```sql
   UPDATE public.user_accounts
   SET password_hash = public.hash_password('your_new_password')
   WHERE username = 'admin';
   ```

2. **Create Additional Admin Users:**
   Use the "Add New User" button in the Admin Panel

3. **Monitor Database:**
   Check Supabase Dashboard → Table Editor → user_accounts

4. **Set Up Backup:**
   Configure automatic backups in Supabase Dashboard

## Support

If you encounter any issues:
1. Check Supabase logs in Dashboard → Logs
2. Check browser console for JavaScript errors
3. Verify environment variables in `.env` file
4. Ensure Supabase URL and keys are correct

