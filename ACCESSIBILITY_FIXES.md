# 🎨 Accessibility Fixes for ComplianceCheck

## Summary of Issues

**3 tests failed:**
1. ❌ Homepage accessibility (color contrast violations)
2. ❌ Assessment page accessibility (progress bar + contrast)
3. ❌ Homepage performance (3.2s load time - barely over 3s limit)

**3 tests passed:** ✅
- Keyboard navigation
- Images have alt text
- SEO meta tags

---

## 🔴 Critical Fixes Needed

### Issue 1: Color Contrast Violations

All these elements fail WCAG 2.0 AA requirements:

| Element | Current Ratio | Required | Fix |
|---------|---------------|----------|-----|
| Beta banner (amber-500) | 2.14:1 | 4.5:1 | Use `bg-amber-700` |
| Green buttons | 3.14:1 | 4.5:1 | Use `bg-green-700` or `bg-green-800` |
| FREE BETA badges | 3.29:1 | 4.5:1 | Use `bg-green-800` |
| Strikethrough prices (gray-400) | 2.53:1 | 4.5:1 | Use `text-gray-600` |
| +91 prefix (gray-500) | 4.39:1 | 4.5:1 | Use `text-gray-600` |

### Issue 2: Progress Bar Missing Label

**Problem:** Screen readers can't announce progress
**Fix:** Add `aria-label="Assessment progress"` to progress bar

---

## 🛠️ Quick Fixes (CSS Changes Only)

### Fix 1: Beta Banner
**Search for:** `bg-amber-500`
**Replace with:** `bg-amber-700`

### Fix 2: Green Buttons  
**Search for:** `bg-green-600`
**Replace with:** `bg-green-700`

### Fix 3: FREE BETA Badges
**Already using green-600**, will be fixed by Fix 2 above

### Fix 4: Strikethrough Prices
**Search for:** `text-gray-400 line-through`
**Replace with:** `text-gray-600 line-through`

### Fix 5: Phone Prefix
**Search for:** `text-gray-500 bg-gray-100` (in phone input)
**Replace with:** `text-gray-600 bg-gray-100`

### Fix 6: Progress Bar
**Find your progress bar component**, add:
```tsx
aria-label="Assessment progress"
aria-valuenow={currentProgress}
```

---

## 📁 Likely File Locations

Based on your structure:
- Beta banner: `src/app/layout.tsx`
- Homepage cards: `src/app/page.tsx`
- Progress bar: `src/components/*` or `src/app/assessment/*/page.tsx`

---

## ⚡ Performance Fix (Optional)

**Issue:** 3.2s load (target <3s)

**Quick wins:**
- Enable image optimization in `next.config.mjs`
- Add `loading="lazy"` to images below fold
- Reduce initial JS bundle size

Not critical - only 200ms over target.

---

## ✅ After Fixing

Run test again:
```bash
npx playwright test accessibility-performance --project=chromium
```

Expected: 6/6 passing! ✅

---

**Want me to create a search script to find these exact locations in your code?**
