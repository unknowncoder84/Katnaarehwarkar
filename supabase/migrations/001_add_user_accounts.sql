-- =====================================================
-- Migration: Add User Accounts Table for Simple Auth
-- Version: V2.1
-- Date: 2024-12-05
-- =====================================================

-- Step 1: Create user_accounts table
CREATE TABLE IF NOT EXISTS public.user_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'vipin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint after table creation
ALTER TABLE public.user_accounts 
ADD CONSTRAINT fk_created_by 
FOREIGN KEY (created_by) REFERENCES public.user_accounts(id);

-- Step 2: Enable RLS on user_accounts
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policies for user_accounts
CREATE POLICY "Anyone can view active users" ON public.user_accounts 
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can insert users" ON public.user_accounts 
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update users" ON public.user_accounts 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can delete users" ON public.user_accounts 
FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Allow first admin creation" ON public.user_accounts 
FOR INSERT WITH CHECK (
  NOT EXISTS (SELECT 1 FROM public.user_accounts)
);

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_user_accounts_username ON public.user_accounts(username);
CREATE INDEX IF NOT EXISTS idx_user_accounts_role ON public.user_accounts(role);
CREATE INDEX IF NOT EXISTS idx_user_accounts_is_active ON public.user_accounts(is_active);

-- Step 5: Add trigger for updated_at
DROP TRIGGER IF EXISTS update_user_accounts_updated_at ON public.user_accounts;
CREATE TRIGGER update_user_accounts_updated_at 
BEFORE UPDATE ON public.user_accounts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Create function to auto-create profile when user account is created
CREATE OR REPLACE FUNCTION public.handle_new_user_account()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, NEW.username);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create trigger for auto-creating profiles
DROP TRIGGER IF EXISTS on_user_account_created ON public.user_accounts;
CREATE TRIGGER on_user_account_created
  AFTER INSERT ON public.user_accounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_account();

-- Step 8: Update profiles table to reference user_accounts
-- Note: This assumes profiles table exists and needs to be linked to user_accounts
-- If you have existing data, you may need to migrate it first

-- Step 9: Add 'vipin' role to existing role checks if needed
-- This updates the profiles table role constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
-- Note: We're not adding role to profiles anymore since it's in user_accounts

-- Step 10: Create helper function for password hashing (using pgcrypto)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
CREATE OR REPLACE FUNCTION public.authenticate_user(p_username TEXT, p_password TEXT)
RETURNS TABLE (
  user_id UUID,
  username VARCHAR(100),
  role VARCHAR(20),
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ua.id,
    ua.username,
    ua.role,
    ua.is_active
  FROM public.user_accounts ua
  WHERE ua.username = p_username
    AND ua.is_active = true
    AND public.verify_password(p_password, ua.password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DONE! User accounts table is ready
-- =====================================================
-- 
-- NEXT STEPS:
-- 1. Create your first admin user:
--    INSERT INTO public.user_accounts (username, password_hash, role)
--    VALUES ('admin', public.hash_password('your_password'), 'admin');
--
-- 2. Test authentication:
--    SELECT * FROM public.authenticate_user('admin', 'your_password');
-- =====================================================
