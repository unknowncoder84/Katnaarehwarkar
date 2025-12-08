-- Migration: Library and Storage Locations
-- Description: Creates tables for managing library and storage locations

-- Create library_locations table
CREATE TABLE IF NOT EXISTS library_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create storage_locations table
CREATE TABLE IF NOT EXISTS storage_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on library_locations
ALTER TABLE library_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for library_locations
CREATE POLICY "Allow authenticated users to read library_locations"
  ON library_locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert library_locations"
  ON library_locations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete library_locations"
  ON library_locations FOR DELETE
  TO authenticated
  USING (true);

-- Enable RLS on storage_locations
ALTER TABLE storage_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for storage_locations
CREATE POLICY "Allow authenticated users to read storage_locations"
  ON storage_locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert storage_locations"
  ON storage_locations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete storage_locations"
  ON storage_locations FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_library_locations_name ON library_locations(name);
CREATE INDEX IF NOT EXISTS idx_storage_locations_name ON storage_locations(name);
