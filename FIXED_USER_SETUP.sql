-- =====================================================
-- COMPLETE USER AUTHENTICATION SETUP
-- Run this ENTIRE file in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: Fix user_accounts table structure
-- =====================================================

-- Drop the old table if it exists and recreate with correct structure
DROP TABLE IF EXISTS public.user_accounts CASCADE;

CREATE TABLE public.user_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,  -- Store plain password (for development only!)
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'vipin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.user_accounts(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;

-- Policies for user_accounts
CREATE POLICY "Anyone can view active users" ON public.user_accounts FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can insert users" ON public.user_accounts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update users" ON public.user_accounts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete users" ON public.user_accounts FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Allow first admin creation" ON public.user_accounts FOR INSERT WITH CHECK (
  NOT EXISTS (SELECT 1 FROM public.user_accounts)
);

-- Indexes
CREATE INDEX idx_user_accounts_username ON public.user_accounts(username);
CREATE INDEX idx_user_accounts_role ON public.user_accounts(role);

-- =====================================================
-- STEP 2: Create authentication function
-- =====================================================

CREATE OR REPLACE FUNCTION authenticate_user(
  p_username VARCHAR,
  p_password VARCHAR
)
RETURNS TABLE (
  success BOOLEAN,
  user_id UUID,
  username VARCHAR,
  name VARCHAR,
  email VARCHAR,
  role VARCHAR,
  is_active BOOLEAN,
  error_message TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN ua.password = p_password AND ua.is_active = true THEN true
      ELSE false
    END as success,
    ua.id as user_id,
    ua.username,
    ua.name,
    ua.email,
    ua.role,
    ua.is_active,
    CASE 
      WHEN ua.id IS NULL THEN 'Invalid username or password'
      WHEN ua.is_active = false THEN 'Account is inactive'
      WHEN ua.password != p_password THEN 'Invalid username or password'
      ELSE NULL
    END as error_message
  FROM public.user_accounts ua
  WHERE ua.username = p_username
  LIMIT 1;
  
  -- If no user found, return error
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, NULL::BOOLEAN, 'Invalid username or password'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 3: Create get_all_users function
-- =====================================================

CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  id UUID,
  username VARCHAR,
  name VARCHAR,
  email VARCHAR,
  role VARCHAR,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ua.id,
    ua.username,
    ua.name,
    ua.email,
    ua.role,
    ua.is_active,
    ua.created_at,
    ua.updated_at
  FROM public.user_accounts ua
  ORDER BY ua.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 4: Create user management functions
-- =====================================================

-- Create user function
CREATE OR REPLACE FUNCTION create_user_account(
  p_name VARCHAR,
  p_email VARCHAR,
  p_username VARCHAR,
  p_password VARCHAR,
  p_role VARCHAR,
  p_created_by UUID
)
RETURNS TABLE (
  success BOOLEAN,
  user_id UUID,
  error_message TEXT
) AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Check if username already exists
  IF EXISTS (SELECT 1 FROM public.user_accounts WHERE username = p_username) THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Username already exists'::TEXT;
    RETURN;
  END IF;
  
  -- Insert new user
  INSERT INTO public.user_accounts (name, email, username, password, role, created_by)
  VALUES (p_name, p_email, p_username, p_password, p_role, p_created_by)
  RETURNING id INTO v_user_id;
  
  RETURN QUERY SELECT true, v_user_id, NULL::TEXT;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT false, NULL::UUID, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user role function
CREATE OR REPLACE FUNCTION update_user_role(
  p_user_id UUID,
  p_new_role VARCHAR,
  p_updated_by UUID
)
RETURNS TABLE (
  success BOOLEAN,
  error_message TEXT
) AS $$
BEGIN
  UPDATE public.user_accounts
  SET role = p_new_role, updated_at = NOW()
  WHERE id = p_user_id;
  
  IF FOUND THEN
    RETURN QUERY SELECT true, NULL::TEXT;
  ELSE
    RETURN QUERY SELECT false, 'User not found'::TEXT;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT false, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Toggle user status function
CREATE OR REPLACE FUNCTION toggle_user_status(
  p_user_id UUID,
  p_updated_by UUID
)
RETURNS TABLE (
  success BOOLEAN,
  new_status BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  v_new_status BOOLEAN;
BEGIN
  UPDATE public.user_accounts
  SET is_active = NOT is_active, updated_at = NOW()
  WHERE id = p_user_id
  RETURNING is_active INTO v_new_status;
  
  IF FOUND THEN
    RETURN QUERY SELECT true, v_new_status, NULL::TEXT;
  ELSE
    RETURN QUERY SELECT false, NULL::BOOLEAN, 'User not found'::TEXT;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT false, NULL::BOOLEAN, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete user function (soft delete)
CREATE OR REPLACE FUNCTION delete_user_account(
  p_user_id UUID,
  p_deleted_by UUID
)
RETURNS TABLE (
  success BOOLEAN,
  error_message TEXT
) AS $$
BEGIN
  UPDATE public.user_accounts
  SET is_active = false, updated_at = NOW()
  WHERE id = p_user_id;
  
  IF FOUND THEN
    RETURN QUERY SELECT true, NULL::TEXT;
  ELSE
    RETURN QUERY SELECT false, 'User not found'::TEXT;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT false, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 5: Insert default users
-- =====================================================

-- Insert admin user
INSERT INTO public.user_accounts (username, password, name, email, role, is_active)
VALUES ('admin', 'admin123', 'Administrator', 'admin@katneshwarkar.com', 'admin', true)
ON CONFLICT (username) DO UPDATE
SET password = EXCLUDED.password, is_active = true;

-- Insert vipin user
INSERT INTO public.user_accounts (username, password, name, email, role, is_active)
VALUES ('vipin', 'vipin123', 'Vipin Katneshwarkar', 'vipin@katneshwarkar.com', 'vipin', true)
ON CONFLICT (username) DO UPDATE
SET password = EXCLUDED.password, is_active = true;

-- Insert regular user
INSERT INTO public.user_accounts (username, password, name, email, role, is_active)
VALUES ('user', 'user123', 'Regular User', 'user@katneshwarkar.com', 'user', true)
ON CONFLICT (username) DO UPDATE
SET password = EXCLUDED.password, is_active = true;

-- =====================================================
-- STEP 6: Verify setup
-- =====================================================

-- Test authentication function
SELECT * FROM authenticate_user('admin', 'admin123');

-- View all users
SELECT username, name, email, role, is_active FROM public.user_accounts;

-- =====================================================
-- DONE! 
-- =====================================================
-- 
-- LOGIN CREDENTIALS:
-- 
-- Admin User:
--   Username: admin
--   Password: admin123
--
-- Vipin User:
--   Username: vipin
--   Password: vipin123
--
-- Regular User:
--   Username: user
--   Password: user123
--
-- ⚠️ SECURITY WARNING:
-- This setup stores passwords in plain text for development only!
-- In production, you should use proper password hashing (bcrypt, argon2, etc.)
-- =====================================================
