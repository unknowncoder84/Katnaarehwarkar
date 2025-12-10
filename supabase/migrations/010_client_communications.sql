-- =====================================================
-- CLIENT COMMUNICATIONS TABLE
-- Log all client interactions
-- =====================================================

CREATE TABLE IF NOT EXISTS public.client_communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  communication_type VARCHAR(50) NOT NULL CHECK (communication_type IN ('email', 'phone', 'sms', 'meeting', 'letter', 'other')),
  communication_date TIMESTAMPTZ NOT NULL,
  subject VARCHAR(255),
  notes TEXT,
  outcome VARCHAR(255),
  communicated_by UUID REFERENCES public.user_accounts(id),
  communicated_by_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.client_communications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view communications" ON public.client_communications FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert communications" ON public.client_communications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete communications" ON public.client_communications FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_client_communications_case_id ON public.client_communications(case_id);
CREATE INDEX IF NOT EXISTS idx_client_communications_communication_date ON public.client_communications(communication_date);

-- View for communication summary
CREATE OR REPLACE VIEW public.communication_summary AS
SELECT 
  c.id,
  c.client_name,
  c.file_no,
  COUNT(DISTINCT cc.id) as total_communications,
  COUNT(DISTINCT CASE WHEN cc.communication_type = 'email' THEN cc.id END) as email_count,
  COUNT(DISTINCT CASE WHEN cc.communication_type = 'phone' THEN cc.id END) as phone_count,
  COUNT(DISTINCT CASE WHEN cc.communication_type = 'meeting' THEN cc.id END) as meeting_count,
  MAX(cc.communication_date) as last_communication
FROM public.cases c
LEFT JOIN public.client_communications cc ON c.id = cc.case_id
GROUP BY c.id;

-- Grant permissions
GRANT SELECT, INSERT ON public.client_communications TO authenticated;
GRANT DELETE ON public.client_communications TO authenticated;
GRANT SELECT ON public.communication_summary TO authenticated;
