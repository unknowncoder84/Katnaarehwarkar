# Complete Setup Guide: React + Supabase + Dropbox

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        YOUR APPLICATION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│   │   REACT      │    │   SUPABASE   │    │   DROPBOX    │     │
│   │   Frontend   │◄──►│   Backend    │    │   Storage    │     │
│   │              │    │              │    │              │     │
│   │ • UI/UX      │    │ • Auth       │    │ • Documents  │     │
│   │ • Components │    │ • Database   │    │ • PDFs       │     │
│   │ • State      │    │ • API        │    │ • Attachments│     │
│   │ • Routing    │    │ • Realtime   │    │ • Backups    │     │
│   └──────────────┘    └──────────────┘    └──────────────┘     │
│                              │                    │              │
│                              ▼                    ▼              │
│                       ┌──────────────┐    ┌──────────────┐     │
│                       │  PostgreSQL  │    │  Dropbox API │     │
│                       │  Database    │    │              │     │
│                       └──────────────┘    └──────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Step 1: Supabase Setup

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up / Login
3. Click "New Project"
4. Fill in:
   - Project name: `legal-case-dashboard`
   - Database password: (save this!)
   - Region: Choose closest to you
5. Wait for project to be created (~2 minutes)

### 1.2 Run SQL Schema
1. Go to **SQL Editor** in Supabase Dashboard
2. Click "New Query"
3. Copy entire content from `supabase/schema.sql`
4. Paste and click "Run"
5. You should see "Success" message

### 1.3 Get API Keys
1. Go to **Settings** → **API**
2. Copy these values:
   - `Project URL` (e.g., https://xxxxx.supabase.co)
   - `anon public` key (safe for frontend)
   - `service_role` key (keep secret, for backend only)

### 1.4 Enable Authentication
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Go to **Authentication** → **URL Configuration**
4. Set Site URL: `http://localhost:5173` (for dev)
5. Add Redirect URLs: `http://localhost:5173/*`

---

## Step 2: React App Configuration

### 2.1 Install Supabase Client
```bash
npm install @supabase/supabase-js
```

### 2.2 Create Environment File
Create `.env` file in project root:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_DROPBOX_APP_KEY=your-dropbox-app-key
VITE_DROPBOX_APP_SECRET=your-dropbox-app-secret
```

### 2.3 Update Supabase Client
Your `src/lib/supabase.ts` should look like:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## Step 3: Dropbox Setup (For File Storage)

### 3.1 Create Dropbox App
1. Go to [dropbox.com/developers](https://www.dropbox.com/developers)
2. Click "Create App"
3. Choose:
   - API: Scoped access
   - Access type: Full Dropbox (or App folder)
   - Name: `legal-case-dashboard`
4. Click "Create App"

### 3.2 Get Dropbox Credentials
1. In your app settings, find:
   - App key
   - App secret
2. Under "OAuth 2", generate access token for testing

### 3.3 Install Dropbox SDK
```bash
npm install dropbox
```

---

## Step 4: Data Flow Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA FLOW PIPELINE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  USER ACTION                                                     │
│      │                                                           │
│      ▼                                                           │
│  ┌──────────────┐                                               │
│  │ React Form   │                                               │
│  │ (Frontend)   │                                               │
│  └──────┬───────┘                                               │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐     ┌──────────────┐                         │
│  │ Supabase     │────►│ PostgreSQL   │  ← Structured Data      │
│  │ Client       │     │ Database     │    (cases, users, etc)  │
│  └──────┬───────┘     └──────────────┘                         │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐     ┌──────────────┐                         │
│  │ Dropbox      │────►│ Dropbox      │  ← Files/Documents      │
│  │ Client       │     │ Storage      │    (PDFs, images, etc)  │
│  └──────────────┘     └──────────────┘                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### How Data Flows:

1. **User creates a case** → Data goes to Supabase PostgreSQL
2. **User uploads document** → File goes to Dropbox, URL stored in Supabase
3. **User views case** → React fetches from Supabase
4. **User downloads document** → React fetches from Dropbox using stored URL

---

## Step 5: Database Tables (Already in schema.sql)

| Table | Purpose |
|-------|---------|
| `profiles` | User accounts & roles |
| `cases` | Legal case records |
| `counsel` | Lawyer information |
| `appointments` | Scheduled meetings |
| `transactions` | Financial records |
| `courts` | Court names |
| `case_types` | Case categories |
| `books` | Library books (L1) |
| `sofa_items` | Sofa storage (C1/C2) |
| `counsel_cases` | Counsel-Case links |

---

## Step 6: Common SQL Queries for Supabase

### Authentication Queries
```typescript
// Sign Up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: { name: 'John Doe', role: 'user' }
  }
})

// Sign In
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// Sign Out
await supabase.auth.signOut()

// Get Current User
const { data: { user } } = await supabase.auth.getUser()
```

### Cases Queries
```typescript
// Get all cases
const { data: cases } = await supabase
  .from('cases')
  .select('*')
  .order('created_at', { ascending: false })

// Get single case
const { data: case } = await supabase
  .from('cases')
  .select('*')
  .eq('id', caseId)
  .single()

// Create case
const { data, error } = await supabase
  .from('cases')
  .insert([{
    client_name: 'John Doe',
    file_no: 'CASE-001',
    case_type: 'Civil',
    status: 'active',
    // ... other fields
  }])
  .select()

// Update case
const { data, error } = await supabase
  .from('cases')
  .update({ status: 'closed' })
  .eq('id', caseId)

// Delete case
const { error } = await supabase
  .from('cases')
  .delete()
  .eq('id', caseId)

// Search cases
const { data } = await supabase
  .from('cases')
  .select('*')
  .or(`client_name.ilike.%${search}%,file_no.ilike.%${search}%`)

// Filter by status
const { data } = await supabase
  .from('cases')
  .select('*')
  .eq('status', 'active')

// Get cases by date
const { data } = await supabase
  .from('cases')
  .select('*')
  .eq('next_date', '2024-01-15')
```

### Appointments Queries
```typescript
// Get all appointments
const { data } = await supabase
  .from('appointments')
  .select('*')
  .order('date', { ascending: true })

// Get today's appointments
const today = new Date().toISOString().split('T')[0]
const { data } = await supabase
  .from('appointments')
  .select('*')
  .eq('date', today)

// Create appointment
const { data, error } = await supabase
  .from('appointments')
  .insert([{
    date: '2024-01-15',
    time: '10:00',
    client: 'John Doe',
    details: 'Case discussion'
  }])
```

### Transactions Queries
```typescript
// Get all transactions
const { data } = await supabase
  .from('transactions')
  .select('*, cases(client_name, file_no)')
  .order('created_at', { ascending: false })

// Get transactions for a case
const { data } = await supabase
  .from('transactions')
  .select('*')
  .eq('case_id', caseId)

// Add transaction
const { data, error } = await supabase
  .from('transactions')
  .insert([{
    amount: 5000,
    status: 'received',
    case_id: caseId,
    received_by: 'Admin'
  }])
```

### Dashboard Statistics
```typescript
// Use the helper function
const { data } = await supabase.rpc('get_dashboard_stats')

// Or manual queries
const { count: totalCases } = await supabase
  .from('cases')
  .select('*', { count: 'exact', head: true })

const { count: activeCases } = await supabase
  .from('cases')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'active')
```

---

## Step 7: Dropbox Integration

### Upload File to Dropbox
```typescript
import { Dropbox } from 'dropbox'

const dbx = new Dropbox({ 
  accessToken: import.meta.env.VITE_DROPBOX_ACCESS_TOKEN 
})

// Upload file
async function uploadToDropbox(file: File, caseId: string) {
  const path = `/cases/${caseId}/${file.name}`
  
  const response = await dbx.filesUpload({
    path: path,
    contents: file
  })
  
  // Get shareable link
  const linkResponse = await dbx.sharingCreateSharedLinkWithSettings({
    path: response.result.path_display!
  })
  
  return linkResponse.result.url
}

// After upload, store URL in Supabase
async function saveDocumentReference(caseId: string, dropboxUrl: string, fileName: string) {
  await supabase
    .from('case_documents')
    .insert([{
      case_id: caseId,
      file_name: fileName,
      dropbox_url: dropboxUrl
    }])
}
```

### Download File from Dropbox
```typescript
async function downloadFromDropbox(path: string) {
  const response = await dbx.filesDownload({ path })
  return response.result
}
```

---

## Step 8: Realtime Subscriptions

```typescript
// Subscribe to case changes
const subscription = supabase
  .channel('cases-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'cases' },
    (payload) => {
      console.log('Case changed:', payload)
      // Update your React state here
    }
  )
  .subscribe()

// Unsubscribe when component unmounts
subscription.unsubscribe()
```

---

## Quick Start Checklist

- [ ] Create Supabase project
- [ ] Run `supabase/schema.sql` in SQL Editor
- [ ] Copy API keys to `.env` file
- [ ] Enable Email authentication
- [ ] Install `@supabase/supabase-js`
- [ ] Update `src/lib/supabase.ts`
- [ ] (Optional) Create Dropbox app for file storage
- [ ] Test authentication flow
- [ ] Test CRUD operations

---

## Troubleshooting

### "Invalid API key"
- Check `.env` file has correct keys
- Restart dev server after changing `.env`

### "Row Level Security violation"
- Make sure user is authenticated
- Check RLS policies in Supabase Dashboard

### "Table doesn't exist"
- Run the SQL schema again
- Check for errors in SQL Editor

### "CORS error"
- Add your domain to Supabase allowed origins
- Check Site URL in Authentication settings
