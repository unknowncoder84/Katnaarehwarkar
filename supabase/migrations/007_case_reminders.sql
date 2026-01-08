-- =====================================================
-- CASE REMINDERS TABLE
-- Set reminders for important dates
-- =====================================================

CREATE TABLE IF NOT EXISTS public.case_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  reminder_date DATE NOT NULL,
  reminder_time TIME,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  reminder_type VARCHAR(50) DEFAULT 'hearing' CHECK (reminder_type IN ('hearing', 'filing', 'submission', 'payment', 'follow-up', 'custom')),
  is_completed BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.user_accounts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.case_reminders ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view reminders" ON public.case_reminders FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reminders" ON public.case_reminders FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update reminders" ON public.case_reminders FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete reminders" ON public.case_reminders FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_case_reminders_case_id ON public.case_reminders(case_id);
CREATE INDEX IF NOT EXISTS idx_case_reminders_reminder_date ON public.case_reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_case_reminders_is_completed ON public.case_reminders(is_completed);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_case_reminders_updated_at ON public.case_reminders;
CREATE TRIGGER update_case_reminders_updated_at BEFORE UPDATE ON public.case_reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.case_reminders TO authenticated;
GRANT DELETE ON public.case_reminders TO authenticated;
