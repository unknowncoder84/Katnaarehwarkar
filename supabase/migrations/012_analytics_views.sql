-- =====================================================
-- ANALYTICS VIEWS
-- Dashboard and reporting views
-- =====================================================

-- View for case performance metrics
CREATE OR REPLACE VIEW public.case_performance_metrics AS
SELECT 
  c.id,
  c.client_name,
  c.file_no,
  c.status,
  c.stage,
  COUNT(DISTINCT cn.id) as total_notes,
  COUNT(DISTINCT cr.id) as total_reminders,
  COUNT(DISTINCT cc.id) as total_communications,
  COUNT(DISTINCT t.id) as total_transactions,
  COALESCE(SUM(t.amount) FILTER (WHERE t.status = 'received'), 0) as total_received,
  c.created_at,
  c.updated_at
FROM public.cases c
LEFT JOIN public.case_notes cn ON c.id = cn.case_id
LEFT JOIN public.case_reminders cr ON c.id = cr.case_id
LEFT JOIN public.client_communications cc ON c.id = cc.case_id
LEFT JOIN public.transactions t ON c.id = t.case_id
GROUP BY c.id;

-- View for pending reminders
CREATE OR REPLACE VIEW public.pending_reminders AS
SELECT 
  cr.*,
  c.client_name,
  c.file_no,
  c.parties_name
FROM public.case_reminders cr
JOIN public.cases c ON cr.case_id = c.id
WHERE cr.is_completed = false AND cr.reminder_date <= CURRENT_DATE
ORDER BY cr.reminder_date ASC;

-- Grant permissions
GRANT SELECT ON public.case_performance_metrics TO authenticated;
GRANT SELECT ON public.pending_reminders TO authenticated;
