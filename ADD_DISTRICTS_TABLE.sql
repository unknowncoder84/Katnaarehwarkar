-- =====================================================
-- ADD DISTRICTS TABLE ONLY
-- =====================================================
-- Run this SQL in Supabase SQL Editor
-- This only creates the districts table if it doesn't exist
-- =====================================================

-- Create Districts Table
CREATE TABLE IF NOT EXISTS districts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (to avoid error)
DROP POLICY IF EXISTS "districts_all" ON districts;
DROP POLICY IF EXISTS "districts_select" ON districts;
DROP POLICY IF EXISTS "districts_insert" ON districts;
DROP POLICY IF EXISTS "districts_update" ON districts;
DROP POLICY IF EXISTS "districts_delete" ON districts;

-- Create permissive policy
CREATE POLICY "districts_all" ON districts FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON districts TO authenticated;
GRANT ALL ON districts TO anon;

-- Insert default districts if table is empty
INSERT INTO districts (name) 
SELECT name FROM (VALUES 
    ('Mumbai'),
    ('Pune'),
    ('Nagpur'),
    ('Nashik'),
    ('Aurangabad'),
    ('Thane'),
    ('Kolhapur'),
    ('Solapur'),
    ('Sangli'),
    ('Satara'),
    ('Ahmednagar'),
    ('Ratnagiri'),
    ('Sindhudurg'),
    ('Raigad'),
    ('Palghar')
) AS default_districts(name)
WHERE NOT EXISTS (SELECT 1 FROM districts LIMIT 1);

-- Verify
SELECT 'Districts table created successfully!' as status;
SELECT COUNT(*) as district_count FROM districts;
