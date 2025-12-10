-- =====================================================
-- CASE NOTES TABLE
-- Add detailed notes to cases
-- =====================================================

CREATE TABLE IF NOT EXISTS public.case_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  note_type VARCHAR(50) DEFAULT 'general' CHECK (note_type IN ('general', 'hearing', 'decision', 'urgent', 'follow-up')),
  created_by UUID REFERENCES public.user_accounts(id),
  created_by_name VARCHAR(255),
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.case_notes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view case notes" ON public.case_notes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert notes" ON public.case_notes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own notes" ON public.case_notes FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Admins can delete notes" ON public.case_notes FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_case_notes_case_id ON public.case_notes(case_id);
CREATE INDEX IF NOT EXISTS idx_case_notes_created_by ON public.case_notes(created_by);
CREATE INDEX IF NOT EXISTS idx_case_notes_is_pinned ON public.case_notes(is_pinned);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_case_notes_updated_at ON public.case_notes;
CREATE TRIGGER update_case_notes_updated_at BEFORE UPDATE ON public.case_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.case_notes TO authenticated;
GRANT DELETE ON public.case_notes TO authenticated;
