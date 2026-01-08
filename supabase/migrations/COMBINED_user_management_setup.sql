-- =====================================================
-- COMBINED USER MANAGEMENT SETUP
-- Run this single file in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- PART 1: CREATE USER_ACCOUNTS TABLE
-- =====================================================

-- Create user_accounts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'vipin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_created_by' AND table_name = 'user_accounts'
  ) THEN
    ALTER TABLE public.user_accounts 
    ADD CONSTRAINT fk_created_by 
    FOREIGN KEY (created_by) REFERENCES public.user_accounts(id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_accounts_username ON public.user_accounts(username);
CREATE INDEX IF NOT EXISTS idx_user_accounts_email ON public.user_accounts(email);
CREATE INDEX IF NOT EXISTS idx_user_accounts_role ON public.user_accounts(role);
CREATE INDEX IF NOT EXISTS idx_user_accounts_is_active ON public.user_accounts(is_active);

-- =====================================================
-- PART 2: CREATE FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_user_accounts_updated_at ON public.user_accounts;
CREATE TRIGGER update_user_accounts_updated_at 
BEFORE UPDATE ON public.user_accounts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to hash password
CREATE OR REPLACE FUNCTION public.hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify password
CREATE OR REPLACE FUNCTION public.verify_password(password TEXT, password_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN password_hash = crypt(password, password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to authenticate user
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

-- Function to create new user
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

-- Function to get all users
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

-- Function to update user role
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

-- Function to toggle user status
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

-- Function to delete user (soft delete)
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

-- =====================================================
-- PART 3: SET UP RLS POLICIES
-- =====================================================

-- Drop old policies
DROP POLICY IF EXISTS "Anyone can view active users" ON public.user_accounts;
DROP POLICY IF EXISTS "Admins can insert users" ON public.user_accounts;
DROP POLICY IF EXISTS "Admins can update users" ON public.user_accounts;
DROP POLICY IF EXISTS "Admins can delete users" ON public.user_accounts;
DROP POLICY IF EXISTS "Allow first admin creation" ON public.user_accounts;
DROP POLICY IF EXISTS "Authenticated users can view active users" ON public.user_accounts;
DROP POLICY IF EXISTS "Service role can do anything" ON public.user_accounts;

-- Create new policies
CREATE POLICY "Authenticated users can view active users" ON public.user_accounts
FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Service role can do anything" ON public.user_accounts
FOR ALL USING (true);

-- =====================================================
-- PART 4: GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION public.hash_password(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.verify_password(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_user_account(TEXT, TEXT, TEXT, TEXT, TEXT, UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_user_role(UUID, TEXT, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.toggle_user_status(UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.delete_user_account(UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_all_users() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO anon, authenticated, service_role;

-- =====================================================
-- PART 5: CREATE DEFAULT ADMIN USER
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_accounts WHERE username = 'admin') THEN
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
  ELSE
    RAISE NOTICE 'Admin user already exists';
  END IF;
END $$;

-- =====================================================
-- DONE! ✅
-- =====================================================
-- 
-- Default Login Credentials:
-- Username: admin
-- Password: admin
--
-- Test the setup:
-- SELECT * FROM public.authenticate_user('admin', 'admin');
-- SELECT * FROM public.get_all_users();
-- =====================================================

