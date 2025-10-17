# 🔧 Comprehensive Bugfix & Feature Update Plan

## Executive Summary

**Scope:** 15 bugs/features identified across logged-in mode and guest mode  
**Priority:** Guest mode blocking issue first, then logged-in improvements  
**Approach:** Fix, test, commit in phases  

---

## 🚨 CRITICAL: Guest Mode Blocker

### Issue: `renderSessions is not defined`

**Root Cause:** During refactor, rendering functions were not extracted to modules and not exposed to global scope.

**Functions Missing:**
- `renderSessions()` - Renders session history list
- `renderBills()` - Renders bills conveyor belt
- `updateStats()` - Updates all dashboard statistics
- `recalculateTarget()` - Recalculates target based on bills

**Fix:**
1. Verify these functions exist in `index.html`
2. Add them to the `window.*` exposure section
3. Test guest mode loads with data

**Priority:** 🔴 CRITICAL (blocks all guest mode testing)  
**Estimated Time:** 15 minutes  

---

## 💰 LOGGED IN MODE: Financial Calculations

### 1. Currency Conversion Error - "To Earn" showing CAD instead of USD

**Issue:** Hourly rate is in USD, but "To Earn" displays converted CAD value, making all calculations look 1.4x too large.

**Root Cause:** Likely mixing up which currency should be displayed where.

**Fix:**
- Review `updateStats()` function
- Ensure "To Earn" uses USD (not CAD)
- Verify all hourly rate calculations use USD
- Only convert to CAD for display where explicitly labeled

**Priority:** 🔴 HIGH (affects all financial planning)  
**Estimated Time:** 20 minutes  

---

### 2. USD+Tax Calculation Confusion

**Current:** Shows "USD + Tax" with confusing value  
**User Need:** Clear understanding of tax withholding

**Proposed Solution:**
Replace "USD + Tax" with "CAD Tax Reserve":
- Calculate: `CAD Earned - USD Earned = Tax Amount to Save`
- Display: "CAD Tax Reserve: $XXX (YY%)"
- Shows actual CAD amount to set aside for taxes
- Makes it clear this is the conversion difference

**Alternative:** Remove entirely if not useful

**Priority:** 🟡 MEDIUM (confusing but not blocking)  
**Estimated Time:** 15 minutes  

---

### 3. Exchange Rate Direction Change

**Current:** CAD → USD (0.7143)  
**Requested:** USD → CAD (1.35xx)

**Rationale:** PayPal shows 1.35xx, easier to understand

**Changes Needed:**
1. Database: Change `exchange_rate_cad_to_usd` semantics
2. Frontend: Flip conversion calculations
3. Settings UI: Update label to "USD to CAD Exchange Rate"
4. Default: Set to 1.35 instead of 0.7143
5. Tax Reserve Default: `(exchangeRate - 1) * 100` = ~30%

**Priority:** 🟡 MEDIUM (improves UX)  
**Estimated Time:** 30 minutes  

---

## 🎨 UI/UX Improvements

### 4. No Login/Register Button on Homepage

**Issue:** Must manually navigate to `/login` to access login page

**Solution Options:**

#### Option A: Add Login Button to Guest Mode (Quick)
- Add "Login / Register" buttons in guest mode header
- Keep single `index.html` with conditional rendering
- Simplest approach

#### Option B: Separate Home Page (Better Long-term)
- Create `home.html` - Public landing/guest demo
- Keep `index.html` - Authenticated dashboard
- Redirect logic: No token → `home.html`, Has token → `index.html`
- Cleaner separation of concerns

**Recommendation:** **Option A for now** (faster), plan Option B for Phase 3 refactor

**Priority:** 🟡 MEDIUM (workaround exists)  
**Estimated Time:** 
- Option A: 10 minutes
- Option B: 2-3 hours

---

### 5. Timer Font Mismatch

**Issue:** Timer displays in `'Courier New', monospace` instead of document font

**Root Cause:** 
```css
.timer-display {
    font-family: 'Courier New', monospace;
}
```

**Fix:** 
```css
.timer-display {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    /* Or keep tabular-nums for alignment */
    font-variant-numeric: tabular-nums;
}
```

**Priority:** 🟢 LOW (cosmetic)  
**Estimated Time:** 5 minutes  

---

### 6. Bill Sorting - Paid Bills at Bottom

**Current:** Paid bills sorted to bottom (out of chronological order)  
**Requested:** Keep chronological, paid bills at top for clarity

**Solution:**
1. Change sort logic: Sort by `due_date` ONLY (no paid/unpaid split)
2. Add visual distinction: Paid bills have opacity/strikethrough
3. Add filter toggle: "Show Paid Bills" checkbox

**Bill Filtering Mechanism:**
```javascript
// Filter Options:
- [x] Show Paid Bills (default: true)
- [x] Show Overdue Only
- [x] Show Upcoming Only (next 7 days)

// Sort Options:
- Due Date (Ascending) - default
- Due Date (Descending)
- Amount (High to Low)
- Amount (Low to High)
```

**Priority:** 🟡 MEDIUM (affects UX)  
**Estimated Time:** 30 minutes (with filtering)  

---

### 7. Button Size Reduction

**Current:** "Add Manual Entry" and "Add Bill" are large text buttons  
**Requested:** Shrink to icon buttons with "+"

**Changes:**
```html
<!-- Before -->
<button class="btn-small primary">➕ Add Manual Entry</button>

<!-- After -->
<button class="btn-icon" title="Add Session">➕</button>
```

**CSS:**
```css
.btn-icon {
    width: 36px;
    height: 36px;
    padding: 0;
    font-size: 1.2em;
    border-radius: 50%; /* circular */
}
```

**Priority:** 🟢 LOW (cosmetic)  
**Estimated Time:** 15 minutes  

---

## ⚙️ Sprint Settings Issues

### 8. Sprint End Date Keeps Resetting

**Issue:** Date defaults to 2025-10-25 06:59 instead of current setting

**Root Cause:** Modal not pre-filling with current values

**Fix:**
```javascript
function showSprintSettingsModal() {
    // Pre-fill with CURRENT values from userSettings
    document.getElementById('sprintEndDate').value = 
        formatDateTimeLocal(userSettings.sprint_end_date);
    // ... other fields
}
```

**Priority:** 🔴 HIGH (data loss risk)  
**Estimated Time:** 15 minutes  

---

### 9. Currency Dropdown Alignment Issue

**Issue:** Dropdown floating above input field

**Root Cause:** CSS layout issue

**Fix:** Use flexbox for proper alignment:
```html
<div class="input-row">
    <input type="number" id="initialBalance" />
    <select id="initialBalanceCurrency">...</select>
</div>
<span class="input-hint">Will auto convert to USD</span>
```

**Priority:** 🟢 LOW (cosmetic)  
**Estimated Time:** 10 minutes  

---

### 10. Default Tax Reserve Rate

**Current:** 30% (hardcoded)  
**Requested:** Auto-calculate from exchange rate

**Formula (with new USD→CAD direction):**
```javascript
defaultTaxRate = (exchangeRate - 1) * 100
// Example: (1.35 - 1) * 100 = 35%
```

**Priority:** 🟡 MEDIUM (improves defaults)  
**Estimated Time:** 10 minutes  

---

## 📦 Import/Export Consolidation

### 11. Reduce 4 Buttons to 2 (or 1)

**Current:**
- 📥 Export Data (JSON)
- 📤 Import Data (JSON)
- 📋 Export Bills (CSV)
- 📤 Import Bills (CSV)

**Proposed Option A: 2 Buttons**
```
📤 Export Data → Menu: JSON (All) | CSV (Bills)
📥 Import Data → Menu: JSON (All) | CSV (Bills)
```

**Proposed Option B: 1 Button with Modal**
```
💾 Data Management → Opens modal with:
  - Export (JSON/CSV toggle)
  - Import (auto-detect format)
```

**Import Format Support (Backlog):**
- ✅ JSON (sessions + bills) - Priority 1
- ✅ CSV (bills only) - Priority 2
- 🔜 CSV (sessions) - Backlog
- 🔜 Excel (.xlsx) - Backlog
- 🔜 Google Sheets API - Backlog

**Priority:** 🟢 LOW (works, just cluttered)  
**Estimated Time:** 
- Option A: 30 minutes
- Option B: 1 hour

**Recommendation:** **Option A** (simpler)

---

## 🏗️ Architecture Decision: Separate Pages?

### Question: Create `home.html` for guest mode?

**Pros:**
- ✅ Clear separation (public vs authenticated)
- ✅ Easier to manage routing
- ✅ Smaller file sizes
- ✅ Better for SEO (if needed)
- ✅ Simpler conditional logic

**Cons:**
- ❌ Code duplication (shared components)
- ❌ More files to maintain
- ❌ Requires routing setup
- ❌ Takes more time now

**Recommendation:**
- **SHORT TERM:** Keep single `index.html`, add login buttons
- **LONG TERM:** Plan separate pages for Phase 3 refactor
- **Rationale:** Get functionality working first, structure later

---

## 📋 Implementation Order

### Phase 1: Critical Guest Mode Fix (15 min)
1. ✅ Expose `renderSessions()`, `renderBills()`, `updateStats()`, `recalculateTarget()`
2. ✅ Test guest mode loads with data
3. ✅ Commit & push

### Phase 2: Financial Calculations (50 min)
1. ✅ Fix "To Earn" currency display (USD not CAD)
2. ✅ Replace "USD+Tax" with "CAD Tax Reserve"
3. ✅ Flip exchange rate direction (USD→CAD)
4. ✅ Update tax reserve default calculation
5. ✅ Test all financial calculations
6. ✅ Commit & push

### Phase 3: Sprint Settings Fixes (35 min)
1. ✅ Fix date/time pre-filling in modal
2. ✅ Fix currency dropdown alignment
3. ✅ Test settings save/load correctly
4. ✅ Commit & push

### Phase 4: UI/UX Polish (60 min)
1. ✅ Add login/register buttons to guest mode
2. ✅ Fix timer font
3. ✅ Change bill sorting to chronological
4. ✅ Add bill filtering (show paid toggle)
5. ✅ Shrink add buttons to icons
6. ✅ Test all UI changes
7. ✅ Commit & push

### Phase 5: Import/Export Consolidation (30 min)
1. ✅ Reduce to 2 buttons with menus
2. ✅ Test import/export flows
3. ✅ Commit & push

**Total Estimated Time:** ~3 hours

---

## 🧪 Testing Checklist

### Guest Mode:
- [ ] Page loads without errors
- [ ] Random data generates
- [ ] Sessions render in list
- [ ] Bills render in conveyor
- [ ] Stats calculate correctly
- [ ] Can add/edit/delete data
- [ ] Data persists in session

### Logged In Mode:
- [ ] "To Earn" shows USD (not CAD)
- [ ] "CAD Tax Reserve" makes sense
- [ ] All calculations correct
- [ ] Sprint settings pre-fill correctly
- [ ] Sprint settings save correctly
- [ ] Bills sort chronologically
- [ ] Paid bills visible/filterable
- [ ] Timer font matches document
- [ ] Add buttons are icon-sized
- [ ] Login buttons visible in guest mode
- [ ] Import/export works with new UI

---

## 📁 Files to Modify

| File | Changes | Lines Est. |
|------|---------|------------|
| `frontend/index.html` | Add render functions to window, fix calcs, UI updates | ~100 |
| `frontend/css/components.css` | Button styles, alignment fixes | ~30 |
| `backend/database-setup.sql` | Update exchange rate column (optional) | ~5 |
| `backend/server.js` | Update exchange rate handling (if needed) | ~10 |

---

## 🎯 Success Criteria

### Must Have:
- ✅ Guest mode loads and works
- ✅ Financial calculations accurate (USD display correct)
- ✅ Sprint settings don't reset
- ✅ Login accessible from homepage

### Nice to Have:
- ✅ Bills filter by paid status
- ✅ Cleaner import/export UI
- ✅ Icon-sized add buttons
- ✅ Timer font consistency

### Deferred to Later:
- 🔜 Separate `home.html` page (Phase 3)
- 🔜 Additional import formats (CSV sessions, Excel)
- 🔜 Advanced bill filtering (date ranges, search)

---

## 🚀 Deployment Strategy

1. **Phase 1 (Critical):** Deploy immediately after testing
2. **Phases 2-3:** Deploy together (financial + settings fixes)
3. **Phases 4-5:** Deploy together (UI polish + import/export)

**OR:** Deploy after each phase if user wants to test incrementally

---

## 🤔 Questions for User (userinput.py)

1. **Exchange Rate Change:** Confirm flipping to USD→CAD is OK (will affect existing users)
2. **Import/Export UI:** Prefer Option A (2 buttons) or Option B (1 button + modal)?
3. **Bill Filtering:** Just "show paid" toggle, or full filtering menu?
4. **Deployment:** All at once, or phase by phase?
5. **Separate Pages:** Do now or defer to Phase 3?

---

## 📝 Notes

### On Refactor Cleanup:
The `renderSessions is not defined` error confirms incomplete refactor cleanup. We need to:
1. Identify ALL rendering/update functions
2. Ensure they're exposed to global scope
3. Document which functions should be in modules vs main script

### On Architecture:
User is right - getting functionality working first is smart. The separate pages discussion can wait until everything works correctly.

---

**Ready to proceed with implementation!**

Awaiting user input via `userinput.py` for any clarifications or approval to start Phase 1.

