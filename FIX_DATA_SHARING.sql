-- =====================================================
-- FIX DATA SHARING BETWEEN USERS
-- Run this in Supabase SQL Editor
-- =====================================================

-- This ensures all users can see all data (no user-specific filtering)

-- 1. Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view active users" ON public.user_accounts;
DROP POLICY IF EXISTS "Service role full access" ON public.user_accounts;

-- 2. Create open policies for all tables
-- User accounts - allow all authenticated users to view
CREATE POLICY "Allow all to view users" ON public.user_accounts FOR SELECT USING (true);
CREATE POLICY "Allow all to insert users" ON public.user_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all to update users" ON public.user_accounts FOR UPDATE USING (true);
CREATE POLICY "Allow all to delete users" ON public.user_accounts FOR DELETE USING (true);

-- Cases - ensure all users can see all cases
DROP POLICY IF EXISTS "Anyone can view cases" ON public.cases;
DROP POLICY IF EXISTS "Anyone can insert cases" ON public.cases;
DROP POLICY IF EXISTS "Anyone can update cases" ON public.cases;
DROP POLICY IF EXISTS "Anyone can delete cases" ON public.cases;
CREATE POLICY "All users view all cases" ON public.cases FOR SELECT USING (true);
CREATE POLICY "All users insert cases" ON public.cases FOR INSERT WITH CHECK (true);
CREATE POLICY "All users update cases" ON public.cases FOR UPDATE USING (true);
CREATE POLICY "All users delete cases" ON public.cases FOR DELETE USING (true);

-- Case documents - ensure all users can see all documents
DROP POLICY IF EXISTS "Anyone can view documents" ON public.case_documents;
DROP POLICY IF EXISTS "Anyone can insert documents" ON public.case_documents;
DROP POLICY IF EXISTS "Anyone can delete documents" ON public.case_documents;
CREATE POLICY "All users view all documents" ON public.case_documents FOR SELECT USING (true);
CREATE POLICY "All users insert documents" ON public.case_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "All users update documents" ON public.case_documents FOR UPDATE USING (true);
CREATE POLICY "All users delete documents" ON public.case_documents FOR DELETE USING (true);

-- Grant all permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Verify the fix
SELECT 'RLS Policies Updated Successfully!' as status;
