-- =====================================================
-- CLEAN DATABASE AND RUN COMPLETE SETUP
-- ⚠️ WARNING: This will DELETE ALL existing data!
-- Only use if you want to start fresh
-- =====================================================

-- Step 1: Drop all existing tables and objects
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.counsel_cases CASCADE;
DROP TABLE IF EXISTS public.sofa_items CASCADE;
DROP TABLE IF EXISTS public.books CASCADE;
DROP TABLE IF EXISTS public.case_documents CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.counsel CASCADE;
DROP TABLE IF EXISTS public.cases CASCADE;
DROP TABLE IF EXISTS public.case_types CASCADE;
DROP TABLE IF EXISTS public.courts CASCADE;
DROP TABLE IF EXISTS public.user_accounts CASCADE;

-- Drop views
DROP VIEW IF EXISTS public.disposed_cases CASCADE;
DROP VIEW IF EXISTS public.pending_cases CASCADE;
DROP VIEW IF EXISTS public.active_cases CASCADE;
DROP VIEW IF EXISTS public.on_hold_cases CASCADE;
DROP VIEW IF EXISTS public.upcoming_hearings CASCADE;
DROP VIEW IF EXISTS public.todays_appointments CASCADE;
DROP VIEW IF EXISTS public.cases_with_transactions CASCADE;
DROP VIEW IF EXISTS public.counsel_with_cases CASCADE;
DROP VIEW IF EXISTS public.sofa_items_with_cases CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS public.update_counsel_case_count CASCADE;
DROP FUNCTION IF EXISTS public.hash_password CASCADE;
DROP FUNCTION IF EXISTS public.verify_password CASCADE;
DROP FUNCTION IF EXISTS public.authenticate_user CASCADE;
DROP FUNCTION IF EXISTS public.create_user_account CASCADE;
DROP FUNCTION IF EXISTS public.get_all_users CASCADE;
DROP FUNCTION IF EXISTS public.update_user_role CASCADE;
DROP FUNCTION IF EXISTS public.toggle_user_status CASCADE;
DROP FUNCTION IF EXISTS public.delete_user_account CASCADE;
DROP FUNCTION IF EXISTS public.get_dashboard_stats CASCADE;
DROP FUNCTION IF EXISTS public.search_cases CASCADE;
DROP FUNCTION IF EXISTS public.get_cases_by_date CASCADE;

-- =====================================================
-- NOW RUN THE COMPLETE_DATABASE_SETUP.sql FILE
-- Copy and paste the entire COMPLETE_DATABASE_SETUP.sql
-- file contents below this line, or run it separately
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Continue with the rest of COMPLETE_DATABASE_SETUP.sql...
-- (You can paste the entire file here, or run it as a separate query)
