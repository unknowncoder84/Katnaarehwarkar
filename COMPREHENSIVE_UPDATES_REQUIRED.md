# Comprehensive Updates Required

## Summary of All Changes Needed

### 1. Storage Page Enhancements
**Current Issue**: Name field is a text input
**Required Change**: 
- Replace "Name" text input with a **dropdown** showing all cases from the cases list
- When a case is selected from dropdown:
  - Auto-fill the "Number" field with the case's file number
  - Auto-fill other relevant details automatically
- Dropdown should show:
  - Client Name
  - File Number
  - Case details
- Should work dynamically for:
  - All existing cases
  - All newly created cases
  - Real-time updates when new cases are added

**Files to Update**:
- `src/pages/StoragePage.tsx`
- `src/contexts/DataContext.tsx` (if needed for case data)

---

### 2. Library Location Filtering
**Current Issue**: Clicking L1 or L2 buttons shows all books, not filtered by location
**Required Change**:
- When clicking **L1** button → Show ONLY books stored in L1 location
- When clicking **L2** button → Show ONLY books stored in L2 location
- When clicking **All Locations** → Show all books
- Filter should work dynamically based on the `location` field in the books table

**Files to Update**:
- `src/pages/LibraryBooksPage.tsx`
- `src/contexts/DataContext.tsx` (library filtering logic)

---

### 3. Appointments Page - Split into Two Sections
**Current Issue**: All appointments shown together
**Required Change**:
- Create **TWO separate sections**:

#### Section 1: Completed Appointments
- Show appointments where the date has **already passed**
- Automatically move appointments here when their date passes
- Sort by date (most recent first)

#### Section 2: Upcoming Appointments
- Show appointments where the date is **today or in the future**
- Sort by date (nearest first)
- Automatically update as dates pass

**Logic**:
```javascript
const today = new Date();
const completedAppointments = appointments.filter(apt => new Date(apt.date) < today);
const upcomingAppointments = appointments.filter(apt => new Date(apt.date) >= today);
```

**Files to Update**:
- `src/pages/AppointmentsPage.tsx`

---

### 4. Cases Page - Add Sort by File Number
**Current Issue**: No sorting option for file numbers
**Required Change**:
- Add a **"Sort by File Number"** button/dropdown
- Allow sorting:
  - Ascending (1, 2, 3...)
  - Descending (999, 998, 997...)
- Should sort numerically, not alphabetically

**Files to Update**:
- `src/pages/CasesPage.tsx`

---

### 5. Sidebar - Remove Profile Photo in Dark Mode
**Current Issue**: Profile photo shows in dark mode sidebar
**Required Change**:
- **Hide/Remove** the profile photo when in dark mode
- Keep it visible in light mode (if desired)
- Or remove it completely from sidebar

**Files to Update**:
- `src/components/Sidebar.tsx`

---

### 6. Case Management Filters - Fix Filter Logic
**Current Issue**: Filters (IR Favor, IR Against, Circulated, Non-Circulated) not working correctly

**Required Changes**:

#### IR Favor Filter:
- Show only cases where `interimRelief === 'FAVOR'`

#### IR Against Filter:
- Show only cases where `interimRelief === 'AGAINST'`

#### Circulated Filter:
- Show only cases where:
  - `circulationStatus === 'CIRCULATED'` **AND**
  - Has a valid `nextDate` (next date exists and is in the future)

#### Non-Circulated Filter:
- Show only cases where:
  - `circulationStatus === 'NON CIRCULATED'` **OR**
  - `nextDate` is null/empty **OR**
  - `nextDate` has already passed (date < today)

**Logic Example**:
```javascript
// Non-Circulated Filter
const nonCirculatedCases = cases.filter(c => {
  const today = new Date();
  const nextDate = c.nextDate ? new Date(c.nextDate) : null;
  
  return (
    c.circulationStatus === 'NON CIRCULATED' ||
    !nextDate ||
    nextDate < today
  );
});

// Circulated Filter
const circulatedCases = cases.filter(c => {
  const today = new Date();
  const nextDate = c.nextDate ? new Date(c.nextDate) : null;
  
  return (
    c.circulationStatus === 'CIRCULATED' &&
    nextDate &&
    nextDate >= today
  );
});
```

**Files to Update**:
- `src/pages/CasesPage.tsx`
- Filter button handlers

---

## Implementation Priority

1. **High Priority** (User-facing issues):
   - Case Management Filters (affects case visibility)
   - Library Location Filtering (not working at all)
   - Appointments Split (important for workflow)

2. **Medium Priority** (Enhancements):
   - Storage Page Case Dropdown (improves UX)
   - Sort by File Number (useful feature)

3. **Low Priority** (Cosmetic):
   - Remove Sidebar Profile Photo in Dark Mode

---

## Testing Checklist

After implementation, test:

### Storage Page:
- [ ] Dropdown shows all cases
- [ ] Selecting a case auto-fills number
- [ ] Works with newly created cases
- [ ] Dropdown updates in real-time

### Library:
- [ ] L1 button shows only L1 books
- [ ] L2 button shows only L2 books
- [ ] All Locations shows all books
- [ ] Filter persists when adding new books

### Appointments:
- [ ] Completed section shows past appointments
- [ ] Upcoming section shows future appointments
- [ ] Appointments move automatically when date passes
- [ ] Both sections sort correctly

### Cases Sorting:
- [ ] Sort by file number works
- [ ] Ascending order correct
- [ ] Descending order correct
- [ ] Numeric sorting (not alphabetic)

### Sidebar:
- [ ] Profile photo hidden in dark mode
- [ ] Sidebar still looks good without photo

### Case Filters:
- [ ] IR Favor shows only FAVOR cases
- [ ] IR Against shows only AGAINST cases
- [ ] Circulated shows only circulated cases with future dates
- [ ] Non-Circulated shows cases without dates or past dates
- [ ] All filters work independently

---

## Notes

- All changes should be **dynamic** and update in real-time
- Use existing DataContext for data management
- Maintain current styling and theme
- Ensure mobile responsiveness
- Test with both light and dark themes
- **DO NOT PUSH CODE YET** - Wait for approval

---

## Files That Will Be Modified

1. `src/pages/StoragePage.tsx` - Case dropdown
2. `src/pages/LibraryBooksPage.tsx` - Location filtering
3. `src/pages/AppointmentsPage.tsx` - Split sections
4. `src/pages/CasesPage.tsx` - Sorting + Filter logic
5. `src/components/Sidebar.tsx` - Remove photo in dark mode
6. `src/contexts/DataContext.tsx` - May need updates for filtering

---

**Status**: Ready to implement
**Estimated Time**: 2-3 hours for all changes
**Push Code**: NO - Wait for user approval
