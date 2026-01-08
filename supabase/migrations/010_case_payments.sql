-- =====================================================
-- CASE PAYMENTS TABLE
-- Store individual payments for cases with admin approval
-- =====================================================

CREATE TABLE IF NOT EXISTS public.case_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  date DATE NOT NULL,
  received_by VARCHAR(255) NOT NULL,
  payment_mode VARCHAR(50) NOT NULL CHECK (payment_mode IN ('CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'CARD', 'OTHER')),
  reference_id VARCHAR(255),
  tds DECIMAL(12, 2) DEFAULT 0,
  is_accepted BOOLEAN DEFAULT FALSE,
  accepted_by VARCHAR(255),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.case_payments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all case payments" ON public.case_payments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert payments" ON public.case_payments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update payments" ON public.case_payments FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete payments" ON public.case_payments FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_case_payments_case_id ON public.case_payments(case_id);
CREATE INDEX IF NOT EXISTS idx_case_payments_is_accepted ON public.case_payments(is_accepted);
CREATE INDEX IF NOT EXISTS idx_case_payments_date ON public.case_payments(date);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_case_payments_updated_at ON public.case_payments;
CREATE TRIGGER update_case_payments_updated_at BEFORE UPDATE ON public.case_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.case_payments TO authenticated;
GRANT DELETE ON public.case_payments TO authenticated;

-- Also update cases table to store fees_paid (calculated from accepted payments)
-- This is optional - we can calculate it dynamically from case_payments
