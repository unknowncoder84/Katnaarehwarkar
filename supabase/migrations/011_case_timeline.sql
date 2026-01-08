-- =====================================================
-- CASE TIMELINE TABLE
-- Store timeline events for cases
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

-- Policies
CREATE POLICY "Users can view all timeline events" ON public.case_timeline FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert timeline events" ON public.case_timeline FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update timeline events" ON public.case_timeline FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete timeline events" ON public.case_timeline FOR DELETE USING (auth.uid() IS NOT NULL);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_case_timeline_case_id ON public.case_timeline(case_id);
CREATE INDEX IF NOT EXISTS idx_case_timeline_event_date ON public.case_timeline(event_date);

-- Grant permissions
GRANT ALL ON public.case_timeline TO authenticated;
GRANT ALL ON public.case_timeline TO anon;
