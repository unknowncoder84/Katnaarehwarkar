# Component Color Updates - Purple to Orange

## Quick Copy-Paste Updates for Each Component

---

## 1. Header.tsx

### Find and Replace Sections:

**Section 1: Input Background Class**
```typescript
// OLD
const inputBgClass = theme === 'light' 
  ? 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500' 
  : 'bg-white/5 border-purple-500/30 text-white placeholder-gray-400';

// NEW
const inputBgClass = theme === 'light' 
  ? 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500' 
  : 'bg-white/5 border-orange-500/30 text-white placeholder-gray-400';
```

**Section 2: Menu Button Hover**
```typescript
// OLD
className={`p-2.5 rounded-xl transition-all duration-300 ${theme === 'light' ? 'hover:bg-purple-50' : 'hover:bg-white/5'} group`}

// NEW
className={`p-2.5 rounded-xl transition-all duration-300 ${theme === 'light' ? 'hover:bg-orange-50' : 'hover:bg-white/5'} group`}
```

**Section 3: Menu Icon Hover Color**
```typescript
// OLD
<Menu size={22} className={`${textClass} group-hover:text-purple-500 transition-colors`} />

// NEW
<Menu size={22} className={`${textClass} group-hover:text-orange-500 transition-colors`} />
```

**Section 4: Search Gradient Background**
```typescript
// OLD
<div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />

// NEW
<div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
```

**Section 5: Search Icon Focus Color**
```typescript
// OLD
<Search size={16} className={`absolute left-3 md:left-4 top-1/2 -translate-y-1/2 ${secondaryText} group-focus-within:text-purple-500 transition-colors`} />

// NEW
<Search size={16} className={`absolute left-3 md:left-4 top-1/2 -translate-y-1/2 ${secondaryText} group-focus-within:text-orange-500 transition-colors`} />
```

**Section 6: Search Input Focus Border**
```typescript
// OLD
className={`w-full pl-10 md:pl-11 pr-8 md:pr-10 py-2 md:py-3 ${inputBgClass} border rounded-xl md:rounded-2xl focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-sm`}

// NEW
className={`w-full pl-10 md:pl-11 pr-8 md:pr-10 py-2 md:py-3 ${inputBgClass} border rounded-xl md:rounded-2xl focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all text-sm`}
```

**Section 7: Search Results Dropdown Border**
```typescript
// OLD
<div className={`absolute top-full left-0 right-0 mt-2 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1a1a2e] border-purple-500/30'} border rounded-xl shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto`}>

// NEW
<div className={`absolute top-full left-0 right-0 mt-2 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1a1a2e] border-orange-500/30'} border rounded-xl shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto`}>
```

**Section 8: Search Result Hover**
```typescript
// OLD
className={`w-full px-4 py-3 text-left ${theme === 'light' ? 'hover:bg-purple-50' : 'hover:bg-white/5'} transition-colors`}

// NEW
className={`w-full px-4 py-3 text-left ${theme === 'light' ? 'hover:bg-orange-50' : 'hover:bg-white/5'} transition-colors`}
```

**Section 9: Notification Button Hover**
```typescript
// OLD
className={`relative p-2.5 rounded-xl transition-all duration-300 ${theme === 'light' ? 'hover:bg-purple-50' : 'hover:bg-white/5'} group`}

// NEW
className={`relative p-2.5 rounded-xl transition-all duration-300 ${theme === 'light' ? 'hover:bg-orange-50' : 'hover:bg-white/5'} group`}
```

**Section 10: Notification Icon Hover Color**
```typescript
// OLD
<Bell size={20} className={`${textClass} group-hover:text-purple-500 transition-colors`} />

// NEW
<Bell size={20} className={`${textClass} group-hover:text-orange-500 transition-colors`} />
```

**Section 11: Notifications Dropdown Border**
```typescript
// OLD
<div className={`absolute top-full right-0 mt-2 w-80 md:w-96 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1a1a2e] border-purple-500/30'} border rounded-xl shadow-2xl z-[9999] overflow-hidden max-h-96 overflow-y-auto`}>

// NEW
<div className={`absolute top-full right-0 mt-2 w-80 md:w-96 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1a1a2e] border-orange-500/30'} border rounded-xl shadow-2xl z-[9999] overflow-hidden max-h-96 overflow-y-auto`}>
```

**Section 12: Notification Header Border**
```typescript
// OLD
<div className={`px-4 py-3 border-b ${theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-purple-500/30 bg-white/5'}`}>

// NEW
<div className={`px-4 py-3 border-b ${theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-orange-500/30 bg-white/5'}`}>
```

**Section 13: Notification Item Hover**
```typescript
// OLD
className={`px-4 py-3 border-b ${theme === 'light' ? 'border-gray-100 hover:bg-purple-50' : 'border-white/5 hover:bg-white/5'} transition-colors cursor-pointer`}

// NEW
className={`px-4 py-3 border-b ${theme === 'light' ? 'border-gray-100 hover:bg-orange-50' : 'border-white/5 hover:bg-white/5'} transition-colors cursor-pointer`}
```

**Section 14: Notification Footer Border**
```typescript
// OLD
<div className={`px-4 py-3 text-center border-t ${theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-purple-500/30 bg-white/5'}`}>

// NEW
<div className={`px-4 py-3 text-center border-t ${theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-orange-500/30 bg-white/5'}`}>
```

---

## 2. Sidebar.tsx

### Find and Replace Sections:

**Section 1: Logo Gradient**
```typescript
// OLD
<div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-50" />
<div className="relative w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-glow">

// NEW
<div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl blur-lg opacity-50" />
<div className="relative w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-glow">
```

**Section 2: Active Button Class**
```typescript
// OLD
const activeBgClass = 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30';

// NEW
const activeBgClass = 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/30';
```

**Section 3: Office Cases Submenu Active**
```typescript
// OLD
className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
  isOfficeCasesOpen ? (theme === 'light' ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/20 text-purple-400') : `${textClass} ${hoverClass}`
}`}

// NEW
className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
  isOfficeCasesOpen ? (theme === 'light' ? 'bg-orange-100 text-orange-700' : 'bg-orange-500/20 text-orange-400') : `${textClass} ${hoverClass}`
}`}
```

**Section 4: Submenu Border**
```typescript
// OLD
<div className="ml-4 mt-2 space-y-1 border-l-2 border-purple-500/30 pl-4">

// NEW
<div className="ml-4 mt-2 space-y-1 border-l-2 border-orange-500/30 pl-4">
```

**Section 5: Submenu Item Active**
```typescript
// OLD
className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${active ? (theme === 'light' ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/20 text-purple-400') : `${textClass} ${hoverClass}`}`}

// NEW
className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${active ? (theme === 'light' ? 'bg-orange-100 text-orange-700' : 'bg-orange-500/20 text-orange-400') : `${textClass} ${hoverClass}`}`}
```

---

## 3. DashboardPage.tsx

### Find and Replace Sections:

**Section 1: Stat Card Gradient (Light Mode)**
```typescript
// OLD
const cardClass = theme === 'light'
  ? 'bg-white/95 backdrop-blur-xl border-gray-200 hover:border-purple-400 hover:shadow-xl shadow-md'
  : `bg-gradient-to-br ${stat.gradient} border-purple-blue/30 hover:border-purple-blue/60`;

// NEW
const cardClass = theme === 'light'
  ? 'bg-white/95 backdrop-blur-xl border-gray-200 hover:border-orange-400 hover:shadow-xl shadow-md'
  : `bg-gradient-to-br ${stat.gradient} border-cyber-blue/30 hover:border-cyber-blue/60`;
```

**Section 2: Statistics Table Hover**
```typescript
// OLD
className={`${theme === 'light' ? 'hover:bg-purple-50/80' : 'hover:bg-white/5'} transition-colors cursor-pointer group`}

// NEW
className={`${theme === 'light' ? 'hover:bg-orange-50/80' : 'hover:bg-white/5'} transition-colors cursor-pointer group`}
```

**Section 3: Statistics Table Total Row**
```typescript
// OLD
className={`${theme === 'light' ? 'bg-purple-100/50 hover:bg-purple-200/50' : 'bg-purple-500/10 hover:bg-purple-500/20'} cursor-pointer transition-colors`}

// NEW
className={`${theme === 'light' ? 'bg-orange-100/50 hover:bg-orange-200/50' : 'bg-orange-500/10 hover:bg-orange-500/20'} cursor-pointer transition-colors`}
```

**Section 4: Total Cases Text Color**
```typescript
// OLD
<td className={`py-4 px-4 uppercase text-sm font-bold tracking-wide ${theme === 'light' ? 'text-purple-700' : 'text-purple-400'}`}>Total Cases</td>
<td className={`py-4 px-4 text-right font-bold text-xl ${theme === 'light' ? 'text-purple-700' : 'text-purple-400'}`}>{cases.length}</td>

// NEW
<td className={`py-4 px-4 uppercase text-sm font-bold tracking-wide ${theme === 'light' ? 'text-orange-700' : 'text-orange-400'}`}>Total Cases</td>
<td className={`py-4 px-4 text-right font-bold text-xl ${theme === 'light' ? 'text-orange-700' : 'text-orange-400'}`}>{cases.length}</td>
```

---

## 4. StoragePage.tsx

### Find and Replace Sections:

**Section 1: Input Background**
```typescript
// OLD
const inputBg = theme === 'light' ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500' : 'bg-white/5 border-purple-500/30 text-white placeholder-gray-400';

// NEW
const inputBg = theme === 'light' ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500' : 'bg-white/5 border-orange-500/30 text-white placeholder-gray-400';
```

**Section 2: Icon Gradient**
```typescript
// OLD
<div className="p-2 md:p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg md:rounded-xl">

// NEW
<div className="p-2 md:p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg md:rounded-xl">
```

**Section 3: Add Button Gradient**
```typescript
// OLD
className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all"

// NEW
className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all"
```

**Section 4: Filter Button Active**
```typescript
// OLD
className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${selectedLocation === null ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg' : theme === 'light' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}

// NEW
className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${selectedLocation === null ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg' : theme === 'light' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
```

**Section 5: File Upload Border**
```typescript
// OLD
<div className={`border-2 border-dashed rounded-xl p-4 text-center ${theme === 'light' ? 'border-gray-300 hover:border-indigo-400' : 'border-purple-500/30 hover:border-indigo-500/50'} transition-colors`}>

// NEW
<div className={`border-2 border-dashed rounded-xl p-4 text-center ${theme === 'light' ? 'border-gray-300 hover:border-orange-400' : 'border-orange-500/30 hover:border-orange-500/50'} transition-colors`}>
```

**Section 6: Submit Button**
```typescript
// OLD
className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"

// NEW
className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
```

---

## 5. SofaPage.tsx

### Find and Replace Sections:

**Section 1: Input Background**
```typescript
// OLD
const inputBg = theme === 'light' 
  ? 'bg-white border-gray-300 text-gray-900' 
  : 'bg-white/5 border-purple-500/30 text-white';

// NEW
const inputBg = theme === 'light' 
  ? 'bg-white border-gray-300 text-gray-900' 
  : 'bg-white/5 border-orange-500/30 text-white';
```

**Section 2: Compartment Gradient**
```typescript
// OLD
<div className={`p-4 border-b ${theme === 'light' ? 'border-gray-200' : 'border-white/10'} ${compartment === 'C1' ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10' : 'bg-gradient-to-r from-purple-500/10 to-pink-500/10'}`}>

// NEW
<div className={`p-4 border-b ${theme === 'light' ? 'border-gray-200' : 'border-white/10'} ${compartment === 'C1' ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10' : 'bg-gradient-to-r from-orange-500/10 to-amber-500/10'}`}>
```

**Section 3: Item Hover**
```typescript
// OLD
className={`p-4 flex items-center justify-between ${theme === 'light' ? 'hover:bg-purple-50/50' : 'hover:bg-white/5'} transition-colors`}

// NEW
className={`p-4 flex items-center justify-between ${theme === 'light' ? 'hover:bg-orange-50/50' : 'hover:bg-white/5'} transition-colors`}
```

**Section 4: Icon Background**
```typescript
// OLD
<div className={`p-2 rounded-lg ${compartment === 'C1' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
  <FileText size={20} className={compartment === 'C1' ? 'text-blue-500' : 'text-purple-500'} />

// NEW
<div className={`p-2 rounded-lg ${compartment === 'C1' ? 'bg-blue-500/20' : 'bg-orange-500/20'}`}>
  <FileText size={20} className={compartment === 'C1' ? 'text-blue-500' : 'text-orange-500'} />
```

**Section 5: Logo Gradient**
```typescript
// OLD
<div className="p-2 md:p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg md:rounded-xl">

// NEW
<div className="p-2 md:p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg md:rounded-xl">
```

**Section 6: Input Focus Border**
```typescript
// OLD
className={`w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl border ${inputBg} focus:outline-none focus:border-purple-500 transition-all text-sm md:text-base`}

// NEW
className={`w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl border ${inputBg} focus:outline-none focus:border-orange-500 transition-all text-sm md:text-base`}
```

**Section 7: Submit Button**
```typescript
// OLD
className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl font-semibold font-cyber hover:shadow-lg transition-all text-sm md:text-base w-full sm:w-auto sm:self-start"

// NEW
className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl font-semibold font-cyber hover:shadow-lg transition-all text-sm md:text-base w-full sm:w-auto sm:self-start"
```

---

## 6. SettingsPage.tsx

### Find and Replace Sections:

**Section 1: Input Background**
```typescript
// OLD
const inputBgClass = theme === 'light' ? 'bg-white text-gray-900 border-gray-300 placeholder-gray-500' : 'bg-white/5 text-white border-purple-500/30 placeholder-gray-400';

// NEW
const inputBgClass = theme === 'light' ? 'bg-white text-gray-900 border-gray-300 placeholder-gray-500' : 'bg-white/5 text-white border-orange-500/30 placeholder-gray-400';
```

**Section 2: Input Focus Border**
```typescript
// OLD
className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:border-purple-500 transition-colors resize-none ${inputBgClass}`}

// NEW
className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:border-orange-500 transition-colors resize-none ${inputBgClass}`}
```

**Section 3: Icon Gradient**
```typescript
// OLD
<div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">

// NEW
<div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg">
```

---

## 7. All Other Page Components

For any other components, use this global find & replace:

| Find | Replace |
|------|---------|
| `from-purple-500 to-purple-500` | `from-orange-500 to-amber-500` |
| `from-indigo-500 to-purple-500` | `from-orange-500 to-amber-500` |
| `border-purple-500/30` | `border-orange-500/30` |
| `text-purple-500` | `text-orange-500` |
| `bg-purple-500/20` | `bg-orange-500/20` |
| `bg-purple-500/10` | `bg-orange-500/10` |
| `hover:bg-purple-50` | `hover:bg-orange-50` |
| `hover:border-purple-400` | `hover:border-orange-400` |
| `focus:border-purple-500` | `focus:border-orange-500` |
| `text-purple-700` | `text-orange-700` |
| `text-purple-400` | `text-orange-400` |
| `bg-purple-100` | `bg-orange-100` |
| `bg-purple-200` | `bg-orange-200` |

---

## Testing After Updates

```bash
# 1. Run linter
npm run lint

# 2. Build
npm run build

# 3. Preview
npm run preview

# 4. Check in browser:
# - All buttons are orange
# - Gradients are orange/amber
# - Hover effects work
# - No console errors
```

---

**Total Components to Update:** 7+
**Estimated Time:** 15-20 minutes
**Difficulty:** Easy (mostly find & replace)

All changes are cosmetic and don't affect functionality!
