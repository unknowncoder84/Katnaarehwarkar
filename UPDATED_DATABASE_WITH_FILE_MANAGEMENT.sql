-- =====================================================
-- UPDATED DATABASE SETUP WITH FILE MANAGEMENT
-- Includes Universal Search & File Upload/Download
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- CASE DOCUMENTS TABLE (File Management)
-- =====================================================

-- Create case_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.case_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_title VARCHAR(255) NOT NULL,
  dropbox_path TEXT,
  dropbox_id TEXT,
  file_url TEXT,
  file_type VARCHAR(50),
  file_size BIGINT,
  uploaded_by UUID REFERENCES public.user_accounts(id),
  uploaded_by_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.case_documents ENABLE ROW LEVEL SECURITY;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_case_documents_case_id ON public.case_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_case_documents_uploaded_by ON public.case_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_case_documents_created_at ON public.case_documents(created_at);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES FOR CASE DOCUMENTS
-- =====================================================

-- Drop ALL existing policies for case_documents
DROP POLICY IF EXISTS "Anyone can view documents" ON public.case_documents;
DROP POLICY IF EXISTS "Authenticated users can insert documents" ON public.case_documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.case_documents;
DROP POLICY IF EXISTS "Admins can delete any document" ON public.case_documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.case_documents;
DROP POLICY IF EXISTS "Users can delete documents" ON public.case_documents;
DROP POLICY IF EXISTS "Users can update documents" ON public.case_documents;
DROP POLICY IF EXISTS "Users can view all documents" ON public.case_documents;
DROP POLICY IF EXISTS "Anyone can insert documents" ON public.case_documents;
DROP POLICY IF EXISTS "Anyone can delete documents" ON public.case_documents;
DROP POLICY IF EXISTS "Anyone can update documents" ON public.case_documents;

-- Create new policies
CREATE POLICY "Anyone can view documents" 
  ON public.case_documents 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert documents" 
  ON public.case_documents 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can delete documents" 
  ON public.case_documents 
  FOR DELETE 
  USING (true);

CREATE POLICY "Users can update documents" 
  ON public.case_documents 
  FOR UPDATE 
  USING (true);

-- =====================================================
-- FUNCTIONS FOR FILE MANAGEMENT
-- =====================================================

-- Function to get all documents for a case
CREATE OR REPLACE FUNCTION public.get_case_documents(p_case_id UUID)
RETURNS TABLE (
  id UUID,
  case_id UUID,
  file_name VARCHAR(255),
  file_title VARCHAR(255),
  dropbox_path TEXT,
  dropbox_id TEXT,
  file_url TEXT,
  file_type VARCHAR(50),
  file_size BIGINT,
  uploaded_by UUID,
  uploaded_by_name VARCHAR(255),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cd.id,
    cd.case_id,
    cd.file_name,
    cd.file_title,
    cd.dropbox_path,
    cd.dropbox_id,
    cd.file_url,
    cd.file_type,
    cd.file_size,
    cd.uploaded_by,
    cd.uploaded_by_name,
    cd.created_at,
    cd.updated_at
  FROM public.case_documents cd
  WHERE cd.case_id = p_case_id
  ORDER BY cd.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add a document to a case
CREATE OR REPLACE FUNCTION public.add_case_document(
  p_case_id UUID,
  p_file_name VARCHAR(255),
  p_file_title VARCHAR(255),
  p_dropbox_path TEXT DEFAULT NULL,
  p_dropbox_id TEXT DEFAULT NULL,
  p_file_url TEXT DEFAULT NULL,
  p_file_type VARCHAR(50) DEFAULT NULL,
  p_file_size BIGINT DEFAULT NULL,
  p_uploaded_by UUID DEFAULT NULL,
  p_uploaded_by_name VARCHAR(255) DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  document_id UUID,
  error_message TEXT
) AS $$
DECLARE
  v_document_id UUID;
BEGIN
  -- Check if case exists
  IF NOT EXISTS (SELECT 1 FROM public.cases WHERE id = p_case_id) THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'Case not found'::TEXT;
    RETURN;
  END IF;

  -- Insert document
  INSERT INTO public.case_documents (
    case_id,
    file_name,
    file_title,
    dropbox_path,
    dropbox_id,
    file_url,
    file_type,
    file_size,
    uploaded_by,
    uploaded_by_name
  ) VALUES (
    p_case_id,
    p_file_name,
    p_file_title,
    p_dropbox_path,
    p_dropbox_id,
    p_file_url,
    p_file_type,
    p_file_size,
    p_uploaded_by,
    p_uploaded_by_name
  )
  RETURNING case_documents.id INTO v_document_id;

  RETURN QUERY SELECT TRUE, v_document_id, NULL::TEXT;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a document
CREATE OR REPLACE FUNCTION public.delete_case_document(
  p_document_id UUID,
  p_deleted_by UUID DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  error_message TEXT
) AS $$
BEGIN
  -- Check if document exists
  IF NOT EXISTS (SELECT 1 FROM public.case_documents WHERE id = p_document_id) THEN
    RETURN QUERY SELECT FALSE, 'Document not found'::TEXT;
    RETURN;
  END IF;

  -- Delete document
  DELETE FROM public.case_documents WHERE id = p_document_id;

  RETURN QUERY SELECT TRUE, NULL::TEXT;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update document metadata
CREATE OR REPLACE FUNCTION public.update_case_document(
  p_document_id UUID,
  p_file_title VARCHAR(255) DEFAULT NULL,
  p_file_url TEXT DEFAULT NULL,
  p_dropbox_path TEXT DEFAULT NULL,
  p_dropbox_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  error_message TEXT
) AS $$
BEGIN
  -- Check if document exists
  IF NOT EXISTS (SELECT 1 FROM public.case_documents WHERE id = p_document_id) THEN
    RETURN QUERY SELECT FALSE, 'Document not found'::TEXT;
    RETURN;
  END IF;

  -- Update document
  UPDATE public.case_documents
  SET 
    file_title = COALESCE(p_file_title, file_title),
    file_url = COALESCE(p_file_url, file_url),
    dropbox_path = COALESCE(p_dropbox_path, dropbox_path),
    dropbox_id = COALESCE(p_dropbox_id, dropbox_id),
    updated_at = NOW()
  WHERE id = p_document_id;

  RETURN QUERY SELECT TRUE, NULL::TEXT;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGER FOR UPDATED_AT (if not exists)
-- =====================================================

-- Create the update function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for case_documents updated_at
DROP TRIGGER IF EXISTS update_case_documents_updated_at ON public.case_documents;
CREATE TRIGGER update_case_documents_updated_at 
  BEFORE UPDATE ON public.case_documents
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS FOR FILE MANAGEMENT
-- =====================================================

-- View to get cases with document counts
CREATE OR REPLACE VIEW public.cases_with_document_counts AS
SELECT 
  c.*,
  COUNT(cd.id) as document_count,
  MAX(cd.created_at) as last_document_added
FROM public.cases c
LEFT JOIN public.case_documents cd ON c.id = cd.case_id
GROUP BY c.id;

-- View to get recent documents across all cases
CREATE OR REPLACE VIEW public.recent_documents AS
SELECT 
  cd.*,
  c.client_name,
  c.file_no,
  c.parties_name
FROM public.case_documents cd
JOIN public.cases c ON cd.case_id = c.id
ORDER BY cd.created_at DESC
LIMIT 50;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if case_documents table exists
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'case_documents';

-- Check case_documents columns
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'case_documents'
ORDER BY ordinal_position;
