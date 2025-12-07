// Supabase Edge Function - Dropbox as Database
// All data is stored as JSON files in Dropbox

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DatabaseRequest {
  action: 'read' | 'write' | 'delete'
  collection: string // cases, counsel, appointments, transactions, etc.
  data?: any
  id?: string
}

const DROPBOX_ACCESS_TOKEN = Deno.env.get('DROPBOX_ACCESS_TOKEN')!
const DATA_FOLDER = '/legal-case-data'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, collection, data, id }: DatabaseRequest = await req.json()
    const filePath = `${DATA_FOLDER}/${collection}.json`
    
    let result: any

    switch (action) {
      case 'read':
        result = await readCollection(filePath)
        break
      case 'write':
        result = await writeToCollection(filePath, data, id)
        break
      case 'delete':
        result = await deleteFromCollection(filePath, id!)
        break
      default:
        throw new Error('Invalid action')
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message, data: [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Return 200 with empty data for new collections
    })
  }
})

// Read entire collection from Dropbox
async function readCollection(filePath: string): Promise<any[]> {
  try {
    const response = await fetch('https://content.dropboxapi.com/2/files/download', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DROPBOX_ACCESS_TOKEN}`,
        'Dropbox-API-Arg': JSON.stringify({ path: filePath }),
      },
    })

    if (!response.ok) {
      // File doesn't exist yet, return empty array
      return []
    }

    const text = await response.text()
    return JSON.parse(text)
  } catch {
    return []
  }
}

// Write/Update item in collection
async function writeToCollection(filePath: string, newData: any, id?: string): Promise<any> {
  // Read existing data
  let collection = await readCollection(filePath)
  
  if (id) {
    // Update existing item
    const index = collection.findIndex((item: any) => item.id === id)
    if (index >= 0) {
      collection[index] = { ...collection[index], ...newData, updatedAt: new Date().toISOString() }
    } else {
      // Add new item with provided id
      collection.push({ ...newData, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    }
  } else {
    // Add new item with generated id
    const newItem = {
      ...newData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    collection.push(newItem)
  }

  // Write back to Dropbox
  await uploadToDropbox(filePath, JSON.stringify(collection, null, 2))
  
  return collection
}

// Delete item from collection
async function deleteFromCollection(filePath: string, id: string): Promise<any[]> {
  let collection = await readCollection(filePath)
  collection = collection.filter((item: any) => item.id !== id)
  
  await uploadToDropbox(filePath, JSON.stringify(collection, null, 2))
  
  return collection
}

// Upload file to Dropbox (overwrite mode)
async function uploadToDropbox(path: string, content: string): Promise<void> {
  const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DROPBOX_ACCESS_TOKEN}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify({
        path: path,
        mode: 'overwrite',
        autorename: false,
        mute: true,
      }),
    },
    body: new TextEncoder().encode(content),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Upload failed: ${error}`)
  }
}
