-- =====================================================
-- PAYMENT PLANS TABLE
-- Create installment payment schedules
-- =====================================================

CREATE TABLE IF NOT EXISTS public.payment_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  total_amount DECIMAL(12, 2) NOT NULL,
  installment_count INTEGER NOT NULL,
  installment_amount DECIMAL(12, 2) NOT NULL,
  start_date DATE NOT NULL,
  frequency VARCHAR(20) DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'bi-weekly', 'monthly', 'quarterly')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_by UUID REFERENCES public.user_accounts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view payment plans" ON public.payment_plans FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert plans" ON public.payment_plans FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update plans" ON public.payment_plans FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete plans" ON public.payment_plans FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_plans_case_id ON public.payment_plans(case_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_status ON public.payment_plans(status);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_payment_plans_updated_at ON public.payment_plans;
CREATE TRIGGER update_payment_plans_updated_at BEFORE UPDATE ON public.payment_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View for payment plan status
CREATE OR REPLACE VIEW public.payment_plan_status AS
SELECT 
  pp.*,
  c.client_name,
  c.file_no,
  COUNT(DISTINCT t.id) as payments_received,
  COALESCE(SUM(t.amount), 0) as amount_received,
  (pp.total_amount - COALESCE(SUM(t.amount), 0)) as amount_pending
FROM public.payment_plans pp
JOIN public.cases c ON pp.case_id = c.id
LEFT JOIN public.transactions t ON c.id = t.case_id AND t.status = 'received'
GROUP BY pp.id, c.id;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.payment_plans TO authenticated;
GRANT DELETE ON public.payment_plans TO authenticated;
GRANT SELECT ON public.payment_plan_status TO authenticated;
