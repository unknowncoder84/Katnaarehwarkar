import { supabase } from './supabase';

const BUCKET_NAME = 'case-files';

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

/**
 * Initialize the storage bucket (run this once in Supabase dashboard or via migration)
 * This creates a public bucket for case files with RLS policies
 */
export const initializeStorage = async () => {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);
    
    if (!bucketExists) {
      // Create bucket
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png',
          'image/jpg',
          'text/plain'
        ]
      });
      
      if (error) {
        console.error('Error creating bucket:', error);
        return { success: false, error: error.message };
      }
      
      console.log('✅ Storage bucket created successfully');
      return { success: true };
    }
    
    console.log('✅ Storage bucket already exists');
    return { success: true };
  } catch (err: any) {
    console.error('Error initializing storage:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param caseId - The case ID to organize files
 * @param fileName - Optional custom file name
 * @returns Upload result with public URL
 */
export const uploadFile = async (
  file: File,
  caseId: string,
  fileName?: string
): Promise<UploadResult> => {
  try {
    // Generate unique file name
    const timestamp = Date.now();
    const sanitizedFileName = fileName || file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${caseId}/${timestamp}_${sanitizedFileName}`;
    
    console.log('📤 Uploading file:', filePath);
    
    // Upload file to Supabase Storage
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('❌ Upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    console.log('✅ File uploaded successfully:', urlData.publicUrl);
    
    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath
    };
  } catch (err: any) {
    console.error('❌ Upload exception:', err);
    return {
      success: false,
      error: err.message || 'Unknown error occurred'
    };
  }
};

/**
 * Delete a file from Supabase Storage
 * @param filePath - The path of the file to delete
 * @returns Delete result
 */
export const deleteFile = async (filePath: string): Promise<DeleteResult> => {
  try {
    console.log('🗑️ Deleting file:', filePath);
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);
    
    if (error) {
      console.error('❌ Delete error:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    console.log('✅ File deleted successfully');
    return { success: true };
  } catch (err: any) {
    console.error('❌ Delete exception:', err);
    return {
      success: false,
      error: err.message || 'Unknown error occurred'
    };
  }
};

/**
 * Get the download URL for a file
 * @param filePath - The path of the file
 * @returns Public URL
 */
export const getFileUrl = (filePath: string): string => {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

/**
 * Download a file (opens in new tab or triggers download)
 * @param url - The public URL of the file
 * @param fileName - Optional file name for download
 */
export const downloadFile = (url: string, fileName?: string) => {
  try {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    if (fileName) {
      link.download = fileName;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Error downloading file:', err);
    // Fallback: open in new tab
    window.open(url, '_blank');
  }
};
