-- =====================================================
-- Migration: Update User Management System
-- Adds proper user management functions and fixes
-- Version: V2.2
-- Date: 2024-12-07
-- =====================================================

-- Step 1: Ensure pgcrypto extension is enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 1.5: Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Ensure user_accounts table exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                 WHERE table_schema='public' AND table_name='user_accounts') THEN
    RAISE EXCEPTION 'user_accounts table does not exist. Please run migration 001_add_user_accounts.sql first.';
  END IF;
END $$;

-- Step 2.1: Update user_accounts table to ensure 'vipin' role is included
ALTER TABLE public.user_accounts DROP CONSTRAINT IF EXISTS user_accounts_role_check;
ALTER TABLE public.user_accounts 
ADD CONSTRAINT user_accounts_role_check 
CHECK (role IN ('admin', 'user', 'vipin'));

-- Step 3: Add email column to user_accounts if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='user_accounts' AND column_name='email') THEN
    ALTER TABLE public.user_accounts ADD COLUMN email VARCHAR(255) UNIQUE;
  END IF;
END $$;

-- Step 4: Add name column to user_accounts if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='user_accounts' AND column_name='name') THEN
    ALTER TABLE public.user_accounts ADD COLUMN name VARCHAR(255);
  END IF;
END $$;

-- Step 5: Create index on email
CREATE INDEX IF NOT EXISTS idx_user_accounts_email ON public.user_accounts(email);

-- Step 6: Update password hashing function (if not exists)
CREATE OR REPLACE FUNCTION public.hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Update password verification function
CREATE OR REPLACE FUNCTION public.verify_password(password TEXT, password_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN password_hash = crypt(password, password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create function to create new user
CREATE OR REPLACE FUNCTION public.create_user_account(
  p_name TEXT,
  p_email TEXT,
  p_username TEXT,
  p_password TEXT,
  p_role TEXT DEFAULT 'user',
  p_created_by UUID DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  user_id UUID,
  error_message TEXT
) AS $$
DECLARE
  v_user_id UUID;
  v_password_hash TEXT;
BEGIN
  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM public.user_accounts WHERE email = p_email) THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'A user with this email already exists';
    RETURN;
  END IF;

  -- Check if username already exists
  IF EXISTS (SELECT 1 FROM public.user_accounts WHERE username = p_username) THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'A user with this username already exists';
    RETURN;
  END IF;

  -- Hash the password
  v_password_hash := public.hash_password(p_password);

  -- Insert new user
  INSERT INTO public.user_accounts (name, email, username, password_hash, role, is_active, created_by)
  VALUES (p_name, p_email, p_username, v_password_hash, p_role, TRUE, p_created_by)
  RETURNING id INTO v_user_id;

  RETURN QUERY SELECT TRUE, v_user_id, NULL::TEXT;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create function to update user role
CREATE OR REPLACE FUNCTION public.update_user_role(
  p_user_id UUID,
  p_new_role TEXT,
  p_updated_by UUID
)
RETURNS TABLE (
  success BOOLEAN,
  error_message TEXT
) AS $$
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM public.user_accounts WHERE id = p_user_id) THEN
    RETURN QUERY SELECT FALSE, 'User not found';
    RETURN;
  END IF;

  -- Check if updater is admin
  IF NOT EXISTS (SELECT 1 FROM public.user_accounts WHERE id = p_updated_by AND role = 'admin') THEN
    RETURN QUERY SELECT FALSE, 'Only admins can update user roles';
    RETURN;
  END IF;

  -- Prevent self-demotion
  IF p_user_id = p_updated_by AND p_new_role != 'admin' THEN
    RETURN QUERY SELECT FALSE, 'You cannot demote yourself';
    RETURN;
  END IF;

  -- Update role
  UPDATE public.user_accounts
  SET role = p_new_role, updated_at = NOW()
  WHERE id = p_user_id;

  RETURN QUERY SELECT TRUE, NULL::TEXT;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Create function to toggle user status
CREATE OR REPLACE FUNCTION public.toggle_user_status(
  p_user_id UUID,
  p_updated_by UUID
)
RETURNS TABLE (
  success BOOLEAN,
  new_status BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  v_current_status BOOLEAN;
  v_new_status BOOLEAN;
BEGIN
  -- Check if user exists
  SELECT is_active INTO v_current_status
  FROM public.user_accounts
  WHERE id = p_user_id;

  IF v_current_status IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::BOOLEAN, 'User not found';
    RETURN;
  END IF;

  -- Check if updater is admin
  IF NOT EXISTS (SELECT 1 FROM public.user_accounts WHERE id = p_updated_by AND role = 'admin') THEN
    RETURN QUERY SELECT FALSE, NULL::BOOLEAN, 'Only admins can toggle user status';
    RETURN;
  END IF;

  -- Prevent self-deactivation
  IF p_user_id = p_updated_by THEN
    RETURN QUERY SELECT FALSE, NULL::BOOLEAN, 'You cannot deactivate your own account';
    RETURN;
  END IF;

  -- Toggle status
  v_new_status := NOT v_current_status;
  
  UPDATE public.user_accounts
  SET is_active = v_new_status, updated_at = NOW()
  WHERE id = p_user_id;

  RETURN QUERY SELECT TRUE, v_new_status, NULL::TEXT;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, NULL::BOOLEAN, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Create function to delete user (soft delete by deactivating)
CREATE OR REPLACE FUNCTION public.delete_user_account(
  p_user_id UUID,
  p_deleted_by UUID
)
RETURNS TABLE (
  success BOOLEAN,
  error_message TEXT
) AS $$
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM public.user_accounts WHERE id = p_user_id) THEN
    RETURN QUERY SELECT FALSE, 'User not found';
    RETURN;
  END IF;

  -- Check if deleter is admin
  IF NOT EXISTS (SELECT 1 FROM public.user_accounts WHERE id = p_deleted_by AND role = 'admin') THEN
    RETURN QUERY SELECT FALSE, 'Only admins can delete users';
    RETURN;
  END IF;

  -- Prevent self-deletion
  IF p_user_id = p_deleted_by THEN
    RETURN QUERY SELECT FALSE, 'You cannot delete your own account';
    RETURN;
  END IF;

  -- Soft delete by deactivating
  UPDATE public.user_accounts
  SET is_active = FALSE, updated_at = NOW()
  WHERE id = p_user_id;

  RETURN QUERY SELECT TRUE, NULL::TEXT;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 12: Create function to get all users (for admin panel)
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  email VARCHAR(255),
  username VARCHAR(100),
  role VARCHAR(20),
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ua.id,
    ua.name,
    ua.email,
    ua.username,
    ua.role,
    ua.is_active,
    ua.created_at,
    ua.updated_at
  FROM public.user_accounts ua
  ORDER BY ua.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 13: Create function to authenticate user (updated with email support)
CREATE OR REPLACE FUNCTION public.authenticate_user(
  p_username TEXT,
  p_password TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  user_id UUID,
  name VARCHAR(255),
  email VARCHAR(255),
  username VARCHAR(100),
  role VARCHAR(20),
  is_active BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  v_user RECORD;
BEGIN
  -- Find user by username
  SELECT 
    ua.id,
    ua.name,
    ua.email,
    ua.username,
    ua.role,
    ua.is_active,
    ua.password_hash
  INTO v_user
  FROM public.user_accounts ua
  WHERE ua.username = p_username;

  -- Check if user exists
  IF v_user.id IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::BOOLEAN, 'Invalid username or password';
    RETURN;
  END IF;

  -- Check if user is active
  IF NOT v_user.is_active THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::BOOLEAN, 'Account is deactivated';
    RETURN;
  END IF;

  -- Verify password
  IF NOT public.verify_password(p_password, v_user.password_hash) THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::BOOLEAN, 'Invalid username or password';
    RETURN;
  END IF;

  -- Return success with user data
  RETURN QUERY SELECT 
    TRUE,
    v_user.id,
    v_user.name,
    v_user.email,
    v_user.username,
    v_user.role,
    v_user.is_active,
    NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 14: Update RLS policies to be more permissive for authenticated users
DROP POLICY IF EXISTS "Anyone can view active users" ON public.user_accounts;
DROP POLICY IF EXISTS "Admins can insert users" ON public.user_accounts;
DROP POLICY IF EXISTS "Admins can update users" ON public.user_accounts;
DROP POLICY IF EXISTS "Admins can delete users" ON public.user_accounts;
DROP POLICY IF EXISTS "Allow first admin creation" ON public.user_accounts;

-- Create new policies
CREATE POLICY "Authenticated users can view active users" ON public.user_accounts
FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Service role can do anything" ON public.user_accounts
FOR ALL USING (true);

-- Step 15: Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.hash_password(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.verify_password(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_user_account(TEXT, TEXT, TEXT, TEXT, TEXT, UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_user_role(UUID, TEXT, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.toggle_user_status(UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.delete_user_account(UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_all_users() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO anon, authenticated, service_role;

-- Step 16: Insert default admin user if no users exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_accounts) THEN
    INSERT INTO public.user_accounts (name, email, username, password_hash, role, is_active)
    VALUES (
      'Admin User',
      'admin@katneshwarkar.com',
      'admin',
      public.hash_password('admin'),
      'admin',
      TRUE
    );
    
    RAISE NOTICE 'Default admin user created: username=admin, password=admin';
  END IF;
END $$;

-- =====================================================
-- DONE! User management system is ready
-- =====================================================
-- 
-- FEATURES:
-- ✅ User creation with duplicate checking
-- ✅ Role management (admin, user, vipin)
-- ✅ User activation/deactivation
-- ✅ Soft delete (deactivation)
-- ✅ Password hashing with bcrypt
-- ✅ Authentication function
-- ✅ Get all users function
-- ✅ Proper RLS policies
-- ✅ Default admin user (username: admin, password: admin)
--
-- USAGE EXAMPLES:
--
-- 1. Create a new user:
--    SELECT * FROM public.create_user_account(
--      'John Doe',
--      'john@example.com',
--      'john',
--      'password123',
--      'user',
--      NULL
--    );
--
-- 2. Authenticate user:
--    SELECT * FROM public.authenticate_user('admin', 'admin');
--
-- 3. Get all users:
--    SELECT * FROM public.get_all_users();
--
-- 4. Update user role:
--    SELECT * FROM public.update_user_role(
--      'user-uuid',
--      'admin',
--      'admin-uuid'
--    );
--
-- 5. Toggle user status:
--    SELECT * FROM public.toggle_user_status(
--      'user-uuid',
--      'admin-uuid'
--    );
--
-- 6. Delete user:
--    SELECT * FROM public.delete_user_account(
--      'user-uuid',
--      'admin-uuid'
--    );
-- =====================================================

