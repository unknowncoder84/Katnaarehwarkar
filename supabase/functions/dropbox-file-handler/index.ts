// Supabase Edge Function for Dropbox File Handling
// Deploy with: supabase functions deploy dropbox-file-handler

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DropboxUploadRequest {
  action: 'upload' | 'download' | 'delete' | 'list' | 'get-link'
  fileName?: string
  fileContent?: string // base64 encoded
  filePath?: string
  caseId?: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const DROPBOX_ACCESS_TOKEN = Deno.env.get('DROPBOX_ACCESS_TOKEN')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!DROPBOX_ACCESS_TOKEN) {
      throw new Error('DROPBOX_ACCESS_TOKEN not configured')
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    const { action, fileName, fileContent, filePath, caseId }: DropboxUploadRequest = await req.json()

    let result: any

    switch (action) {
      case 'upload':
        result = await uploadFile(DROPBOX_ACCESS_TOKEN, fileName!, fileContent!, caseId!)
        // Save reference to Supabase
        if (result.success) {
          await supabase.from('case_documents').insert({
            case_id: caseId,
            file_name: fileName,
            dropbox_path: result.path,
            dropbox_id: result.id,
          })
        }
        break

      case 'download':
        result = await downloadFile(DROPBOX_ACCESS_TOKEN, filePath!)
        break

      case 'delete':
        result = await deleteFile(DROPBOX_ACCESS_TOKEN, filePath!)
        break

      case 'list':
        result = await listFiles(DROPBOX_ACCESS_TOKEN, filePath || '')
        break

      case 'get-link':
        result = await getShareableLink(DROPBOX_ACCESS_TOKEN, filePath!)
        break

      default:
        throw new Error('Invalid action')
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

// Upload file to Dropbox
async function uploadFile(token: string, fileName: string, fileContent: string, caseId: string) {
  const path = `/legal-cases/${caseId}/${fileName}`
  
  // Decode base64 content
  const binaryContent = Uint8Array.from(atob(fileContent), c => c.charCodeAt(0))

  const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify({
        path: path,
        mode: 'add',
        autorename: true,
        mute: false,
      }),
    },
    body: binaryContent,
  })

  const data = await response.json()
  
  if (data.error) {
    throw new Error(data.error_summary || 'Upload failed')
  }

  return {
    success: true,
    path: data.path_display,
    id: data.id,
    name: data.name,
    size: data.size,
  }
}

// Download file from Dropbox
async function downloadFile(token: string, filePath: string) {
  const response = await fetch('https://content.dropboxapi.com/2/files/download', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Dropbox-API-Arg': JSON.stringify({ path: filePath }),
    },
  })

  const metadata = JSON.parse(response.headers.get('dropbox-api-result') || '{}')
  const blob = await response.blob()
  const arrayBuffer = await blob.arrayBuffer()
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

  return {
    success: true,
    content: base64,
    metadata,
  }
}

// Delete file from Dropbox
async function deleteFile(token: string, filePath: string) {
  const response = await fetch('https://api.dropboxapi.com/2/files/delete_v2', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path: filePath }),
  })

  const data = await response.json()
  
  if (data.error) {
    throw new Error(data.error_summary || 'Delete failed')
  }

  return { success: true, deleted: data.metadata }
}

// List files in Dropbox folder
async function listFiles(token: string, folderPath: string) {
  const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      path: folderPath || '',
      recursive: false,
      include_media_info: false,
      include_deleted: false,
    }),
  })

  const data = await response.json()
  
  if (data.error) {
    throw new Error(data.error_summary || 'List failed')
  }

  return {
    success: true,
    files: data.entries,
    hasMore: data.has_more,
  }
}

// Get shareable link for file
async function getShareableLink(token: string, filePath: string) {
  // First try to get existing link
  let response = await fetch('https://api.dropboxapi.com/2/sharing/list_shared_links', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path: filePath, direct_only: true }),
  })

  let data = await response.json()

  if (data.links && data.links.length > 0) {
    return { success: true, url: data.links[0].url }
  }

  // Create new shared link
  response = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      path: filePath,
      settings: { requested_visibility: 'public' },
    }),
  })

  data = await response.json()

  if (data.error) {
    throw new Error(data.error_summary || 'Failed to create link')
  }

  return { success: true, url: data.url }
}
