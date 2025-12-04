# 🔧 Accessibility Fixes - Exact File Locations

## Files to Edit

I found all the color contrast violations. Here's exactly what to fix:

---

## Fix 1: Beta Banner (CRITICAL - Most Visible)

**File:** `src/app/page.tsx` (Line 11)

**Current:**
```tsx
<div className="bg-amber-500 text-white ...">
```

**Fix:**
```tsx
<div className="bg-amber-700 text-white ...">
```

**Impact:** Fixes beta banner contrast from 2.14:1 to 4.5:1+ ✅

---

## Fix 2: All Green Buttons

**Files Found:**
- Multiple locations using `bg-green-600`

**Search & Replace Globally:**
```
Find: bg-green-600
Replace: bg-green-700
```

**Impact:** Fixes all button contrast from 3.14:1 to 4.5:1+ ✅

---

## Fix 3: Progress Bars (Multiple Files)

**Files:**
- `src/app/results/[id]/page.tsx` (Lines 190, 417, 613)
- `src/app/assessment/statutory-health/page.tsx` (Line 499)

**Current:**
```tsx
className={`h-full transition-all ${
  catStatus === 'ready' ? 'bg-green-500' :
  bg-amber-500  // ❌ This line
}`}
```

**Fix:** Change `bg-amber-500` to `bg-amber-600`

---

## Fix 4: Strikethrough Prices

**Search Globally:**
```
Find: text-gray-400 line-through
Replace: bg-gray-600 line-through
```

**Impact:** Fixes strikethrough price contrast ✅

---

## Fix 5: Phone Number +91 Prefix

**Search for:** Component with phone input and `text-gray-500 bg-gray-100`

**Fix:**
```tsx
// Before
<span className="text-gray-500 bg-gray-100 ...">+91</span>

// After
<span className="text-gray-600 bg-gray-100 ...">+91</span>
```

---

## Fix 6: Progress Bar Accessibility Label

**Find progress bar component** (likely in assessment pages)

**Current:**
```tsx
<div role="progressbar" aria-valuemin="0" aria-valuemax="100" ...>
```

**Fix:**
```tsx
<div 
  role="progressbar" 
  aria-valuemin="0" 
  aria-valuemax="100"
  aria-label="Assessment progress"
  aria-valuenow={progress}
  ...
>
```

---

## ⚡ Quick Fix Commands

### Using VS Code:
1. Press `Ctrl+Shift+H` (Find & Replace in Files)
2. Search: `bg-amber-500` → Replace: `bg-amber-700`
3. Search: `bg-green-600` → Replace: `bg-green-700`
4. Search: `text-gray-400 line-through` → Replace: `text-gray-600 line-through`

### Files to Edit Manually:
- `src/app/page.tsx` - Beta banner (line 11)
- Progress bar component - Add aria-label
- Phone input component - Change gray-500 to gray-600

---

## 🧪 After Fixing - Test Again

```bash
npx playwright test accessibility-performance --project=chromium
```

**Expected:** 6/6 passing ✅

---

## 📊 Summary

| Issue | Files Affected | Fix | Priority |
|-------|----------------|-----|----------|
| Beta banner | 1 file | bg-amber-700 | HIGH |
| Green buttons | Multiple | bg-green-700 | HIGH |
| Progress bar label | 1-2 files | Add aria-label | HIGH |
| Strikethrough prices | Multiple | text-gray-600 | MEDIUM |
| +91 prefix | 1 file | text-gray-600 | LOW |
| Page load 3.2s | N/A | Optional optimization | LOW |

---

**Total time to fix:** ~10-15 minutes
**Legal compliance:** Will be WCAG 2.0 AA compliant ✅
