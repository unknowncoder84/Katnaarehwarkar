// Dropbox integration via Supabase Edge Function
import { supabase } from './supabase'

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dropbox-file-handler`

// Helper to call the Edge Function
async function callDropboxFunction(payload: any) {
  const { data: { session } } = await supabase.auth.getSession()
  
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || 'Dropbox operation failed')
  }

  return data
}

// Convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1]
      resolve(base64)
    }
    reader.onerror = error => reject(error)
  })
}

// Dropbox API functions
export const dropbox = {
  // Upload a file to Dropbox
  uploadFile: async (file: File, caseId: string) => {
    const fileContent = await fileToBase64(file)
    
    const result = await callDropboxFunction({
      action: 'upload',
      fileName: file.name,
      fileContent,
      caseId,
    })

    return result
  },

  // Download a file from Dropbox
  downloadFile: async (filePath: string) => {
    const result = await callDropboxFunction({
      action: 'download',
      filePath,
    })

    // Convert base64 back to blob for download
    const binaryString = atob(result.content)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    
    return new Blob([bytes])
  },

  // Delete a file from Dropbox
  deleteFile: async (filePath: string) => {
    return await callDropboxFunction({
      action: 'delete',
      filePath,
    })
  },

  // List files in a folder
  listFiles: async (folderPath?: string) => {
    return await callDropboxFunction({
      action: 'list',
      filePath: folderPath || '',
    })
  },

  // Get shareable link for a file
  getShareableLink: async (filePath: string) => {
    return await callDropboxFunction({
      action: 'get-link',
      filePath,
    })
  },

  // Get documents for a case from Supabase
  getCaseDocuments: async (caseId: string) => {
    const { data, error } = await supabase
      .from('case_documents')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Delete document reference from Supabase
  deleteDocumentReference: async (documentId: string) => {
    const { error } = await supabase
      .from('case_documents')
      .delete()
      .eq('id', documentId)

    if (error) throw error
  },
}

// Helper to trigger file download in browser
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
