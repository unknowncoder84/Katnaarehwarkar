# 🚨 CRITICAL FIXES NEEDED

## Issues Identified

### 1. Storage Items Disappear on Refresh ❌
**Problem:** Storage items are stored in local state only, not saved to database
**Impact:** All storage items are lost when page refreshes
**Root Cause:** StoragePage uses `useState` instead of database operations

### 2. Library Books Don't Show in L1/L2 Filter ❌
**Problem:** Books might not have location field populated in database
**Impact:** Filtering by L1/L2 shows empty results
**Root Cause:** Existing books in database may have empty/null location field

---

## Fix Plan

### Fix 1: Storage Items Persistence

**Current Code (StoragePage.tsx):**
```typescript
// ❌ WRONG - Local state only
const [storageItems, setStorageItems] = useState<StorageItem[]>([]);
```

**Required Changes:**
1. Add `storageItems` to DataContext
2. Load storage items from database on mount
3. Save storage items to database when added
4. Delete from database when removed

**Files to Modify:**
- `src/contexts/DataContext.tsx` - Add storageItems state and CRUD operations
- `src/pages/StoragePage.tsx` - Use DataContext instead of local state
- `src/lib/supabase.ts` - Already has storageItems operations ✅

---

### Fix 2: Library Books Location Field

**Problem:** Books in database may have empty/null location field

**Solution:**
1. Update existing books to have default location 'L1'
2. Ensure new books always have location
3. Fix filtering logic to handle edge cases

**SQL Fix:**
```sql
-- Update all books with empty/null location to 'L1'
UPDATE books 
SET location = 'L1' 
WHERE location IS NULL OR location = '';
```

---

## Implementation Steps

### Step 1: Fix DataContext for Storage Items

Add to DataContext.tsx:
```typescript
const [storageItems, setStorageItems] = useState<StorageItem[]>([]);

// In fetchAllData:
const storageItemsRes = await db.storageItems.getAll();
if (storageItemsRes.data) {
  setStorageItems(toCamelCase(storageItemsRes.data));
}

// Add CRUD operations:
const addStorageItem = async (item: Omit<StorageItem, 'id' | 'addedAt'>) => {
  const { data, error } = await db.storageItems.create({
    ...item,
    added_by: user?.id || ''
  });
  if (error) return { success: false, error: error.message };
  if (data) setStorageItems(prev => [toCamelCase(data), ...prev]);
  return { success: true };
};

const deleteStorageItem = async (id: string) => {
  const { error } = await db.storageItems.delete(id);
  if (error) return { success: false, error: error.message };
  setStorageItems(prev => prev.filter(item => item.id !== id));
  return { success: true };
};
```

### Step 2: Update StoragePage

Replace local state with DataContext:
```typescript
// ❌ Remove this:
const [storageItems, setStorageItems] = useState<StorageItem[]>([]);

// ✅ Use this:
const { storageItems, addStorageItem, deleteStorageItem } = useData();
```

### Step 3: Fix Books Location

Run SQL to update existing books:
```sql
UPDATE books 
SET location = 'L1' 
WHERE location IS NULL OR location = '' OR TRIM(location) = '';
```

---

## Testing Checklist

### Storage Items
- [ ] Add storage item
- [ ] Refresh page
- [ ] Item still shows ✅
- [ ] Delete item
- [ ] Refresh page
- [ ] Item is gone ✅

### Library Books
- [ ] Add book to L1
- [ ] Click L1 filter
- [ ] Book shows ✅
- [ ] Add book to L2
- [ ] Click L2 filter
- [ ] Book shows ✅
- [ ] Refresh page
- [ ] Filters still work ✅

---

## Priority: CRITICAL 🔴

These issues prevent core functionality from working properly.
Must be fixed before deployment.
