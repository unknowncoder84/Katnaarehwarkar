-- =====================================================
-- RUN THIS SQL IN SUPABASE SQL EDITOR
-- This creates the case_payments and case_timeline tables
-- to persist payment and timeline data
-- =====================================================

-- =====================================================
-- 1. CASE PAYMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.case_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  date DATE NOT NULL,
  received_by VARCHAR(255) NOT NULL,
  payment_mode VARCHAR(50) NOT NULL,
  reference_id VARCHAR(255),
  tds DECIMAL(12, 2) DEFAULT 0,
  is_accepted BOOLEAN DEFAULT FALSE,
  accepted_by VARCHAR(255),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.case_payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid errors on re-run)
DROP POLICY IF EXISTS "Users can view all case payments" ON public.case_payments;
DROP POLICY IF EXISTS "Authenticated users can insert payments" ON public.case_payments;
DROP POLICY IF EXISTS "Users can update payments" ON public.case_payments;
DROP POLICY IF EXISTS "Admins can delete payments" ON public.case_payments;

-- Create policies
CREATE POLICY "Users can view all case payments" ON public.case_payments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert payments" ON public.case_payments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update payments" ON public.case_payments FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete payments" ON public.case_payments FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_case_payments_case_id ON public.case_payments(case_id);
CREATE INDEX IF NOT EXISTS idx_case_payments_is_accepted ON public.case_payments(is_accepted);
CREATE INDEX IF NOT EXISTS idx_case_payments_date ON public.case_payments(date);

-- Grant permissions
GRANT ALL ON public.case_payments TO authenticated;
GRANT ALL ON public.case_payments TO anon;

-- =====================================================
-- 2. CASE TIMELINE TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.case_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ DEFAULT NOW(),
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.case_timeline ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all timeline events" ON public.case_timeline;
DROP POLICY IF EXISTS "Authenticated users can insert timeline events" ON public.case_timeline;
DROP POLICY IF EXISTS "Users can update timeline events" ON public.case_timeline;
DROP POLICY IF EXISTS "Users can delete timeline events" ON public.case_timeline;

-- Create policies
CREATE POLICY "Users can view all timeline events" ON public.case_timeline FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert timeline events" ON public.case_timeline FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update timeline events" ON public.case_timeline FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete timeline events" ON public.case_timeline FOR DELETE USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_case_timeline_case_id ON public.case_timeline(case_id);
CREATE INDEX IF NOT EXISTS idx_case_timeline_event_date ON public.case_timeline(event_date);

-- Grant permissions
GRANT ALL ON public.case_timeline TO authenticated;
GRANT ALL ON public.case_timeline TO anon;

-- Success message
SELECT 'case_payments and case_timeline tables created successfully!' as status;
