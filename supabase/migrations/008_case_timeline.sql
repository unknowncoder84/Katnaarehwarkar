-- =====================================================
-- CASE TIMELINE TABLE
-- Track case progression with events
-- =====================================================

CREATE TABLE IF NOT EXISTS public.case_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_description TEXT,
  event_outcome VARCHAR(50),
  created_by UUID REFERENCES public.user_accounts(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.case_timeline ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view timeline" ON public.case_timeline FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert timeline" ON public.case_timeline FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete timeline" ON public.case_timeline FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_case_timeline_case_id ON public.case_timeline(case_id);
CREATE INDEX IF NOT EXISTS idx_case_timeline_event_date ON public.case_timeline(event_date);

-- View for case timeline with details
CREATE OR REPLACE VIEW public.case_timeline_with_details AS
SELECT 
  ct.*,
  c.client_name,
  c.file_no,
  c.parties_name
FROM public.case_timeline ct
JOIN public.cases c ON ct.case_id = c.id
ORDER BY ct.event_date DESC;

-- Grant permissions
GRANT SELECT, INSERT ON public.case_timeline TO authenticated;
GRANT DELETE ON public.case_timeline TO authenticated;
GRANT SELECT ON public.case_timeline_with_details TO authenticated;
