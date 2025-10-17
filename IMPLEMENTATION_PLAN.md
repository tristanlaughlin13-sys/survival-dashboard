# Implementation Plan - Survival Dashboard Improvements

## 🐛 Critical Bug Fix
**Issue:** NaN values in all calculations
**Root Cause:** `loadSettings()` calculates `TOTAL_NEEDED` from `bills` array before `loadBills()` runs
**Fix:** 
- Move `TOTAL_NEEDED` calculation to AFTER bills are loaded
- Create a separate `recalculateTarget()` function called after data loads

---

## 🎯 Feature Improvements

### 1. Bill Editing
**Current:** Bills can only be deleted or marked paid/unpaid
**New:** Add full edit capability like sessions have
- Create `Edit Bill` modal with all fields (name, CAD amount, USD amount, due date, paid status)
- Add edit button to bill actions
- Reuse modal pattern from session editing

### 2. Swipeable Item Actions (Mobile UX)
**Current:** All action buttons always visible
**New:** Hidden action panel that slides in
**Implementation:**
- For Bills: Swipe left reveals [Edit | Delete | Mark Paid]
- For Sessions: Swipe left reveals [Edit | Delete]
- Desktop: Hover shows actions, or click "⋮" menu button
- Mobile: Swipe gesture or tap "⋮" button

**Technical Approach:**
- CSS transitions for slide-in effect
- Touch event handlers (touchstart, touchmove, touchend)
- Threshold detection (swipe > 60px triggers open)
- Click outside or tap item again to close

### 3. Filtering & Sorting
**Bills:**
- Filter: [All | Unpaid | Paid]
- Sort: [Due Date | Amount | Name | Recently Added]
- "Hide Paid Bills" toggle

**Sessions:**
- Filter: [All | Work | Leisure | Today | This Week]
- Sort: [Recent First | Oldest First | Highest Earnings | Most Hours]

**UI Placement:**
- Add filter/sort controls above each section
- Use dropdown selects styled to match theme
- Remember user preference in localStorage

### 4. USD Display in Bills Total
**Current:** Only shows CAD total at bottom
**New:** Show both currencies
```
Total Unpaid: $3,026.71 CAD (~$2,186 USD)
```

### 5. Tax Savings Tracker
**Purpose:** Show how much should be saved for taxes
**Location:** New stat card or expand "Bills Breakdown" section

**Display:**
```
💰 TAX RESERVE TRACKING
├─ Earnings (Work Sessions): $152.00
├─ Initial Balance: $475.00
├─ Total Earned: $627.00
├─ Tax Reserve Rate: 30%
├─ Should Be Saved: $188.10
└─ After Taxes: $438.90

Toggle: [Include Initial Balance] ✓
```

**Calculation:**
- `taxAmount = totalEarned * (taxReserveRate / 100)`
- Option to include/exclude initial balance
- Shows what's "actually available" after setting aside taxes

**UX Details:**
- Add to "Bills Breakdown" section as extra row
- Or create new "💰 TAX TRACKING" card in stats row
- Color-code: Green if on track, Yellow if close, Red if behind
- Show difference between "should save" vs "bills covered"

---

## 📐 Implementation Order

### Phase 1: Critical Bug Fix (Do First!)
1. Fix NaN calculation issue
2. Reorder data loading logic
3. Test all calculations work

### Phase 2: Data Management
1. Add Edit Bill modal + backend support
2. Add bill editing functionality
3. Update backend to support bill updates

### Phase 3: Filtering & Sorting
1. Add filter/sort UI components
2. Implement filter/sort logic
3. Add localStorage persistence

### Phase 4: Mobile UX Enhancement
1. Implement swipe gestures for mobile
2. Add "⋮" menu button for desktop
3. Hide/show actions based on interaction
4. Test on various screen sizes

### Phase 5: Financial Tracking
1. Add USD to bills total display
2. Create Tax Savings Tracker component
3. Add toggle for initial balance inclusion
4. Style and position appropriately

---

## 🎨 UX Principles
- **Consistency:** Same patterns for bills and sessions
- **Progressive Disclosure:** Hide complexity until needed
- **Mobile-First:** Touch-friendly, swipeable
- **Visual Feedback:** Clear states (editing, deleting, completed)
- **Accessibility:** Keyboard navigation, screen reader support

---

## 🚀 Testing Checklist
- [ ] NaN bug fixed and all calculations correct
- [ ] Bills can be edited (all fields)
- [ ] Swipe works on mobile (both bills & sessions)
- [ ] Desktop menu (⋮) works properly
- [ ] Filters work correctly
- [ ] Sorting works correctly
- [ ] USD amounts display correctly
- [ ] Tax tracker calculates correctly
- [ ] Initial balance toggle works
- [ ] Settings persist across sessions
- [ ] Works on: Mobile, Tablet, Desktop
- [ ] Works on: Chrome, Firefox, Safari, Edge

---

## 📝 Database Changes Needed
None for these features! Everything can be done frontend + existing backend.
(Bills already have all fields needed for editing)

---

## ⚠️ Potential Issues & Solutions

**Issue:** Touch events might conflict with scrolling
**Solution:** Use threshold detection, only trigger after 60px horizontal movement

**Issue:** Too many UI elements on small screens
**Solution:** Progressive disclosure - hide until interaction

**Issue:** Filter state lost on page refresh
**Solution:** Save to localStorage with key `survival_filters`

**Issue:** Tax calculation might confuse users
**Solution:** Clear labels, help text, example calculation shown


