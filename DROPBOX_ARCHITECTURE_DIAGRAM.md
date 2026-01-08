# 🏗️ Dropbox Integration Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     YOUR APPLICATION                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   FRONTEND   │      │   BACKEND    │      │FILE STORAGE  │
│   (React)    │─────▶│  (Supabase)  │─────▶│  (Dropbox)   │
│   Netlify    │      │   Database   │      │   Cloud      │
└──────────────┘      └──────────────┘      └──────────────┘
```

---

## Detailed Flow Diagram

### 📤 File Upload Process

```
┌─────────┐
│  USER   │
│ Browser │
└────┬────┘
     │ 1. Selects file (PDF, image, etc.)
     ▼
┌─────────────────┐
│  React Frontend │
│  (Your Website) │
└────┬────────────┘
     │ 2. Converts file to base64
     │ 3. Sends to Supabase Edge Function
     ▼
┌──────────────────────┐
│ Supabase Edge        │
│ Function             │
│ dropbox-file-handler │
└────┬─────────────────┘
     │ 4. Receives file data
     │ 5. Uses Dropbox API token
     │ 6. Uploads to Dropbox
     ▼
┌──────────────────┐
│    DROPBOX       │
│  Cloud Storage   │
│                  │
│ /cases/          │
│   case-123/      │
│     file.pdf     │
└────┬─────────────┘
     │ 7. Returns shareable link
     ▼
┌──────────────────┐
│ Supabase         │
│ Database         │
│                  │
│ case_documents   │
│ table            │
└──────────────────┘
     │ 8. Stores link + metadata
     ▼
┌─────────┐
│  USER   │
│ Sees    │
│ Success │
└─────────┘
```

### 📥 File Download Process

```
┌─────────┐
│  USER   │
│ Clicks  │
│Download │
└────┬────┘
     │ 1. Clicks download button
     ▼
┌─────────────────┐
│  React Frontend │
└────┬────────────┘
     │ 2. Gets file link from database
     ▼
┌──────────────────┐
│ Supabase         │
│ Database         │
│ Returns link     │
└────┬─────────────┘
     │ 3. Shareable Dropbox link
     ▼
┌──────────────────┐
│    DROPBOX       │
│  Cloud Storage   │
└────┬─────────────┘
     │ 4. Streams file
     ▼
┌─────────┐
│  USER   │
│Downloads│
│  File   │
└─────────┘
```

---

## Data Storage Strategy

### What Goes Where?

#### 🗄️ Supabase Database (Small Data)
```
cases table:
├── id
├── client_name
├── file_no
├── status
├── next_date
└── ... (all case metadata)

case_documents table:
├── id
├── case_id (links to case)
├── file_name
├── dropbox_path
├── dropbox_link ← Shareable link
├── file_size
└── uploaded_at
```

#### 📦 Dropbox Storage (Large Files)
```
/Katneshwarkar-Legal-Files/
├── cases/
│   ├── case-abc123/
│   │   ├── court-order-2024-01-15.pdf (2.5 MB)
│   │   ├── petition.pdf (1.8 MB)
│   │   ├── evidence-photo.jpg (3.2 MB)
│   │   └── witness-statement.pdf (1.1 MB)
│   │
│   ├── case-def456/
│   │   ├── contract.pdf (5.4 MB)
│   │   └── agreement.pdf (2.1 MB)
│   │
│   └── case-ghi789/
│       └── legal-notice.pdf (800 KB)
│
└── temp/
    └── (temporary uploads)
```

---

## Security Architecture

```
┌──────────────────────────────────────────────────────┐
│                  SECURITY LAYERS                      │
└──────────────────────────────────────────────────────┘

Layer 1: Frontend Authentication
┌─────────────────┐
│ User Login      │ ← Supabase Auth
│ JWT Token       │ ← Stored in browser
└─────────────────┘

Layer 2: API Security
┌─────────────────┐
│ Edge Function   │ ← Validates JWT
│ Server-side     │ ← Token never exposed
└─────────────────┘

Layer 3: Dropbox Security
┌─────────────────┐
│ Access Token    │ ← Stored in Supabase Secrets
│ API Calls       │ ← Only from Edge Function
└─────────────────┘

Layer 4: Database Security
┌─────────────────┐
│ Row Level       │ ← Users see only their data
│ Security (RLS)  │ ← Enforced by Supabase
└─────────────────┘
```

---

## File Upload Flow (Technical)

```javascript
// 1. User selects file
<input type="file" onChange={handleFileSelect} />

// 2. Frontend converts to base64
const base64 = await fileToBase64(file)

// 3. Call Edge Function
const response = await fetch(
  'https://cdqzqvllbefryyrxmmls.supabase.co/functions/v1/dropbox-file-handler',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'upload',
      fileName: file.name,
      fileContent: base64,
      caseId: currentCaseId
    })
  }
)

// 4. Edge Function processes
// - Validates user
// - Uploads to Dropbox
// - Creates shareable link
// - Saves to database

// 5. Returns result
const { dropboxLink, filePath } = await response.json()

// 6. Update UI
showSuccess('File uploaded successfully!')
```

---

## Environment Variables Flow

```
┌─────────────────────────────────────────────────────┐
│              ENVIRONMENT VARIABLES                   │
└─────────────────────────────────────────────────────┘

Development (.env file):
├── VITE_SUPABASE_URL
├── VITE_SUPABASE_ANON_KEY
└── DROPBOX_ACCESS_TOKEN ← Not used in frontend!

Production (Netlify):
├── VITE_SUPABASE_URL ← Add to Netlify
└── VITE_SUPABASE_ANON_KEY ← Add to Netlify

Supabase Secrets:
└── DROPBOX_ACCESS_TOKEN ← Add to Supabase Dashboard
    (Used by Edge Function only)
```

---

## API Endpoints

### Edge Function Endpoint
```
POST https://cdqzqvllbefryyrxmmls.supabase.co/functions/v1/dropbox-file-handler

Actions:
├── upload    - Upload file to Dropbox
├── download  - Get file from Dropbox
├── delete    - Delete file from Dropbox
├── list      - List files in folder
└── get-link  - Get shareable link
```

### Request Format
```json
{
  "action": "upload",
  "fileName": "court-order.pdf",
  "fileContent": "base64_encoded_content",
  "caseId": "abc123"
}
```

### Response Format
```json
{
  "success": true,
  "dropboxPath": "/cases/abc123/court-order.pdf",
  "shareableLink": "https://www.dropbox.com/s/...",
  "fileSize": 2458624
}
```

---

## Cost Breakdown

### Free Tier (Good for starting)
```
Supabase Free:
├── Database: 500 MB
├── Storage: 1 GB
├── Bandwidth: 2 GB/month
└── Edge Functions: 500K invocations/month

Dropbox Free:
├── Storage: 2 GB
├── File size: 150 MB per file
└── API calls: 1000/hour

Netlify Free:
├── Bandwidth: 100 GB/month
├── Build minutes: 300/month
└── Sites: Unlimited
```

### When to Upgrade
```
Upgrade Supabase ($25/month) when:
├── Database > 500 MB
├── Need more bandwidth
└── Need better performance

Upgrade Dropbox ($11.99/month) when:
├── Storage > 2 GB
├── Need files > 150 MB
└── Need more API calls

Upgrade Netlify ($19/month) when:
├── Bandwidth > 100 GB
└── Need more build minutes
```

---

## Performance Optimization

### File Upload Optimization
```
1. Compress PDFs before upload
   ├── Use PDF compression tools
   └── Reduce file size by 50-70%

2. Resize images
   ├── Max width: 1920px
   └── Quality: 85%

3. Show upload progress
   ├── Progress bar
   └── Estimated time remaining

4. Handle large files
   ├── Chunk uploads for files > 50MB
   └── Resume failed uploads
```

### File Download Optimization
```
1. Use Dropbox direct links
   ├── Faster than API downloads
   └── Better for mobile

2. Cache file metadata
   ├── Store in browser
   └── Reduce database queries

3. Lazy load file lists
   ├── Load 20 files at a time
   └── Infinite scroll
```

---

## Monitoring & Alerts

### What to Monitor
```
Dropbox:
├── Storage usage (% of limit)
├── API call rate
├── Failed uploads
└── File access patterns

Supabase:
├── Database size
├── Edge Function errors
├── API response times
└── Active connections

Application:
├── Upload success rate
├── Download success rate
├── Average file size
└── User activity
```

---

## Backup Strategy

```
┌─────────────────────────────────────────┐
│           BACKUP STRATEGY                │
└─────────────────────────────────────────┘

Level 1: Dropbox (Automatic)
├── 30-day version history
├── Deleted file recovery
└── Automatic sync

Level 2: Supabase (Automatic)
├── Daily database backups
├── Point-in-time recovery
└── 7-day retention

Level 3: Manual (Recommended)
├── Weekly export of critical data
├── Download important files
└── Store in separate location
```

---

This architecture ensures:
✅ Secure file storage
✅ Fast uploads/downloads
✅ Scalable solution
✅ Cost-effective
✅ Easy to maintain
