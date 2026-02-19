-- =====================================================
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add event_type column to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS event_type VARCHAR(20) DEFAULT 'appointment' 
CHECK (event_type IN ('appointment', 'birthday', 'anniversary', 'other'));

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_event_type ON appointments(event_type);

-- Add comment
COMMENT ON COLUMN appointments.event_type IS 'Type of event: appointment, birthday, anniversary, or other';

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'appointments' 
AND column_name = 'event_type';
