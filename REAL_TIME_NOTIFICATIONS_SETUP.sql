-- =====================================================
-- REAL-TIME NOTIFICATIONS SYSTEM
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_accounts(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('case', 'task', 'appointment', 'expense', 'book', 'sofa', 'counsel', 'transaction')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(10) DEFAULT '🔔',
  related_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.user_accounts(id) ON DELETE SET NULL,
  created_by_name VARCHAR(255)
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies - users can see all notifications or their own
DROP POLICY IF EXISTS "Users can view all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their notifications" ON public.notifications;

CREATE POLICY "Users can view all notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Users can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Users can delete their notifications" ON public.notifications FOR DELETE USING (user_id = auth.uid() OR user_id IS NULL);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Function to create notification for all users
CREATE OR REPLACE FUNCTION public.create_notification_for_all(
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_description TEXT,
  p_icon VARCHAR(10),
  p_related_id UUID,
  p_created_by UUID,
  p_created_by_name VARCHAR(255)
)
RETURNS VOID AS $$
BEGIN
  -- Create notification for all active users
  INSERT INTO public.notifications (user_id, type, title, description, icon, related_id, created_by, created_by_name)
  SELECT 
    id,
    p_type,
    p_title,
    p_description,
    p_icon,
    p_related_id,
    p_created_by,
    p_created_by_name
  FROM public.user_accounts
  WHERE is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification for specific user
CREATE OR REPLACE FUNCTION public.create_notification_for_user(
  p_user_id UUID,
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_description TEXT,
  p_icon VARCHAR(10),
  p_related_id UUID,
  p_created_by UUID,
  p_created_by_name VARCHAR(255)
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, description, icon, related_id, created_by, created_by_name)
  VALUES (p_user_id, p_type, p_title, p_description, p_icon, p_related_id, p_created_by, p_created_by_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = TRUE
  WHERE id = p_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = TRUE
  WHERE user_id = p_user_id AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete old notifications (older than 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.notifications
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON public.notifications TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_notification_for_all TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_notification_for_user TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mark_notification_read TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mark_all_notifications_read TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_old_notifications TO anon, authenticated, service_role;

-- Success message
SELECT 'Real-time notifications system created successfully!' as status;
