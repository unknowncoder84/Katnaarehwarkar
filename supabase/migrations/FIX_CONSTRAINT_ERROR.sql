-- =====================================================
-- FIX CONSTRAINT ERROR
-- This removes the existing constraint so the setup can run
-- =====================================================

-- Remove the existing constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_created_by' 
    AND table_name = 'user_accounts'
  ) THEN
    ALTER TABLE public.user_accounts DROP CONSTRAINT fk_created_by;
    RAISE NOTICE 'Constraint fk_created_by dropped successfully';
  ELSE
    RAISE NOTICE 'Constraint fk_created_by does not exist';
  END IF;
END $$;

-- Now you can run COMPLETE_DATABASE_SETUP.sql
-- It will recreate the constraint properly
