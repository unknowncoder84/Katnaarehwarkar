-- =====================================================
-- HELPER FUNCTIONS
-- Common operations and analytics
-- =====================================================

-- Function to get case summary
CREATE OR REPLACE FUNCTION get_case_summary(case_id UUID)
RETURNS TABLE (
  case_id UUID,
  client_name VARCHAR,
  file_no VARCHAR,
  status VARCHAR,
  stage VARCHAR,
  total_notes BIGINT,
  total_reminders BIGINT,
  total_communications BIGINT,
  total_received DECIMAL,
  total_pending DECIMAL
) AS $
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.client_name,
    c.file_no,
    c.status,
    c.stage::VARCHAR,
    COUNT(DISTINCT cn.id)::BIGINT,
    COUNT(DISTINCT cr.id)::BIGINT,
    COUNT(DISTINCT cc.id)::BIGINT,
    COALESCE(SUM(t.amount) FILTER (WHERE t.status = 'received'), 0),
    COALESCE(SUM(t.amount) FILTER (WHERE t.status = 'pending'), 0)
  FROM public.cases c
  LEFT JOIN public.case_notes cn ON c.id = cn.case_id
  LEFT JOIN public.case_reminders cr ON c.id = cr.case_id
  LEFT JOIN public.client_communications cc ON c.id = cc.case_id
  LEFT JOIN public.transactions t ON c.id = t.case_id
  WHERE c.id = case_id
  GROUP BY c.id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get upcoming reminders
CREATE OR REPLACE FUNCTION get_upcoming_reminders(days_ahead INTEGER DEFAULT 7)
RETURNS SETOF public.case_reminders AS $
BEGIN
  RETURN QUERY
  SELECT * FROM public.case_reminders
  WHERE is_completed = false 
    AND reminder_date BETWEEN CURRENT_DATE AND CURRENT_DATE + (days_ahead || ' days')::INTERVAL
  ORDER BY reminder_date ASC;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate case age
CREATE OR REPLACE FUNCTION calculate_case_age(case_id UUID)
RETURNS TABLE (
  case_id UUID,
  age_in_days INTEGER,
  age_in_months NUMERIC,
  age_in_years NUMERIC
) AS $
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    (CURRENT_DATE - c.created_at::DATE)::INTEGER,
    ROUND((CURRENT_DATE - c.created_at::DATE)::NUMERIC / 30.44, 2),
    ROUND((CURRENT_DATE - c.created_at::DATE)::NUMERIC / 365.25, 2)
  FROM public.cases c
  WHERE c.id = case_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get case statistics
CREATE OR REPLACE FUNCTION get_case_statistics()
RETURNS TABLE (
  total_cases BIGINT,
  active_cases BIGINT,
  pending_cases BIGINT,
  closed_cases BIGINT,
  total_notes BIGINT,
  pending_reminders BIGINT,
  total_communications BIGINT,
  total_payment_plans BIGINT
) AS $
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.cases)::BIGINT,
    (SELECT COUNT(*) FROM public.cases WHERE status = 'active')::BIGINT,
    (SELECT COUNT(*) FROM public.cases WHERE status = 'pending')::BIGINT,
    (SELECT COUNT(*) FROM public.cases WHERE status = 'closed')::BIGINT,
    (SELECT COUNT(*) FROM public.case_notes)::BIGINT,
    (SELECT COUNT(*) FROM public.case_reminders WHERE is_completed = false AND reminder_date <= CURRENT_DATE)::BIGINT,
    (SELECT COUNT(*) FROM public.client_communications)::BIGINT,
    (SELECT COUNT(*) FROM public.payment_plans WHERE status = 'active')::BIGINT;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_case_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_upcoming_reminders(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_case_age(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_case_statistics() TO authenticated;
