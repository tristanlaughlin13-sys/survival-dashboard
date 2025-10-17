# 🔧 Bugfix Round 2 - Comprehensive Plan

Based on user testing feedback after Phase 1 deployment.

---

## 🚨 CRITICAL: Auth State Bug

### Issue: Login Keeps Returning to Guest Mode
**Priority:** 🔴 CRITICAL (blocks all testing)  
**Status:** Ready to fix

**Problem:**
1. User logs in → gets auth token
2. Page reloads
3. DOMContentLoaded checks for token
4. Calls `window.api.getProfile()` with token
5. If DEBUG_TOKEN, API call fails
6. Catch block removes token → loads demo mode
7. User stuck in guest mode with login buttons

**Root Cause:**
Debug token (`DEBUG_TOKEN_12345`) is not a valid API token, so `getProfile()` fails.

**Solution:**
1. Remove debug toggle button (not needed - use login modal)
2. OR: Handle debug token separately (skip API calls)
3. Ensure demo data is cleared on successful login
4. Ensure user menu shows (not auth buttons)

**Implementation:**
```javascript
// Option A: Remove debug toggle
- Remove debug button from HTML
- Remove toggleDebugMode() function
- Users test via login modal instead

// Option B: Handle debug token
if (token === 'DEBUG_TOKEN_12345') {
    // Debug mode - show fake user data, skip API
    currentUser = { name: 'Debug User', email: 'debug@test.com' };
    loadDebugData(); // Load with API structure but locally
    showUserMenu();
} else {
    // Real token - normal flow
    currentUser = await window.api.getProfile();
    await loadDashboardData();
    showUserMenu();
}
```

**Estimated Time:** 20 minutes

---

## 🎭 Guest Mode Data Generation

### Issue: Data Not Weighted Toward Realistic Usage
**Priority:** 🟡 MEDIUM  
**Status:** Ready to fix

**Problem:**
- Currently generates truly random data
- Often shows sprint 100% complete (not realistic)
- Today's goal shows $0 (because sprint complete)
- Most time spent BEFORE goal reached, not after

**User Request:**
> "Weight data generation so 90% of cases show incomplete sprint, 10% show completed"

**Solution:**
Generate sequential "realistic" data instead of random:

1. **Sprint Configuration:**
   - Start date: 5-7 days ago (not 0, not 14)
   - End date: 2-4 days from now
   - Total target: Realistic ($2000-4000)

2. **Work Sessions:**
   - Generate day by day
   - Start sparse, increase toward deadline
   - 60-80% of target earned so far
   - Today: 20-60% of daily goal complete

3. **Bills:**
   - Mix of past (paid), current (unpaid), future
   - 40% paid, 60% unpaid
   - Some overdue (1-2), most upcoming

**Implementation:**
```javascript
function generateRealisticDemoData() {
    // 1. Sprint config (2-4 days left, 60-80% complete)
    const daysLeft = 2 + Math.random() * 2; // 2-4 days
    const sprintEnd = new Date(Date.now() + daysLeft * 24 * 60 * 60 * 1000);
    const sprintDuration = 9;
    const daysPassed = sprintDuration - daysLeft;
    
    // 2. Target amount
    const target = 2000 + Math.random() * 2000; // $2000-4000
    
    // 3. Sessions (earned 60-80% so far)
    const targetEarned = target * (0.6 + Math.random() * 0.2);
    const sessions = generateSessionsToTarget(daysPassed, targetEarned);
    
    // 4. Today's sessions (20-60% of today's goal)
    const dailyGoal = (target - targetEarned) / daysLeft;
    const todayEarned = dailyGoal * (0.2 + Math.random() * 0.4);
    sessions.push(...generateTodaySessions(todayEarned));
    
    // 5. Bills (40% paid, 60% unpaid)
    const bills = generateRealisticBills(target);
    
    return { sessions, bills, settings: { sprint_end_date: sprintEnd, ... } };
}
```

**Estimated Time:** 45 minutes

---

## 🎨 UI Improvements

### 1. Remove USD + Tax, Reorganize Layout
**Priority:** 🟡 MEDIUM  
**Status:** Ready to fix

**User Request:**
> "Remove USD + Tax. Stack Bills Breakdown (half height) + Tax Tracker (half height) in same space."

**Current Layout:**
```
[Bills Breakdown - Full Height]
  - Bills Total (CAD)
  - Bills Total (USD)
  - USD + Tax (33%)    ← REMOVE THIS
  - Covered %
```

**New Layout:**
```
[Bills Breakdown - Half Height]
  - Bills Total (CAD)  | Bills Total (USD)  | Covered %
  
[Tax Reserve Tracker - Half Height]
  - Total Earned | Tax Reserve | After Tax | Rate %
```

**CSS Changes:**
- Create `.compact-stats-row` wrapper
- Set each card to `flex: 1`
- Reduce card padding
- Stack the two sections vertically

**Estimated Time:** 20 minutes

---

### 2. Bill Card Scaling Issues
**Priority:** 🟡 MEDIUM  
**Status:** Ready to fix

**Problem:**
- Bill cards too tall
- Text stacking poorly (name/amount huge, date/USD tiny and off-screen)
- 3 buttons taking too much space

**Solution:**
1. **Layout:** Use horizontal flex for main content
   ```
   [Name + Amount]  [Due Date]  [Actions Menu ⋮]
   [USD conversion]
   ```

2. **Actions:** Combine 3 buttons into 1 menu button (⋮)
   - Click opens dropdown menu
   - Options: Edit, Mark Paid/Unpaid, Delete
   - OR: Use swipe gestures (mobile-friendly)

3. **Sizing:**
   - Reduce card height: `min-height: 80px` → `60px`
   - Reduce font sizes proportionally
   - Better use of horizontal space

**Estimated Time:** 30 minutes

---

### 3. Collapsible Date Groups in Session History
**Priority:** 🟢 LOW  
**Status:** Ready to fix

**User Request:**
> "Add collapse/expand for dates with subtle down chevron"

**Implementation:**
- Add chevron icon to date group headers: `▼` / `▶`
- Click to toggle `.collapsed` class
- CSS transition for smooth collapse
- Save state in localStorage

```javascript
function toggleDateGroup(date) {
    const group = document.querySelector(`[data-date="${date}"]`);
    group.classList.toggle('collapsed');
    const collapsed = JSON.parse(localStorage.getItem('collapsedDates') || '[]');
    // ... toggle date in array, save back
}
```

**Estimated Time:** 20 minutes

---

### 4. Demo Banner Issues
**Priority:** 🟢 LOW  
**Status:** Ready to fix

**Problems:**
- Covers login/register buttons
- Purple doesn't match color scheme
- Persistent (stays visible)

**Solutions:**
1. **Position:** Move below header (not fixed to top)
2. **Color:** Change to match theme (red/orange accent)
3. **Dismissible:** Keep X button prominent
4. **Auto-hide:** After 10 seconds OR on scroll

**Estimated Time:** 15 minutes

---

## 📋 Implementation Order

### Phase A: Critical Auth Fix (20 min)
1. Fix login → demo mode loop
2. Remove or fix debug toggle
3. Ensure data clears on auth
4. Test login/logout cycle

### Phase B: Data Generation (45 min)
1. Implement realistic demo data algorithm
2. Weight toward incomplete sprints (90%)
3. Generate sequential sessions
4. Test multiple refreshes

### Phase C: Layout Reorganization (20 min)
1. Remove "USD + Tax" stat
2. Create compact layout for bills + tax
3. Stack the two sections
4. Adjust spacing/sizing

### Phase D: Bill Card Redesign (30 min)
1. Horizontal layout for card content
2. Combine 3 buttons into menu
3. Fix text sizing/stacking
4. Test with various bill names/amounts

### Phase E: UI Polish (35 min)
1. Collapsible date groups
2. Fix demo banner (color, position)
3. Test all interactions
4. Responsive check

**Total Estimated Time:** 2.5 hours

---

## 🧪 Testing Checkpoints

After each phase:
- [ ] **Phase A:** Login works, stays logged in, user menu shows
- [ ] **Phase B:** Guest mode shows realistic incomplete sprint
- [ ] **Phase C:** Bills + tax sections fit compactly, look good
- [ ] **Phase D:** Bill cards readable, actions accessible
- [ ] **Phase E:** Date collapse works, banner not annoying

---

## 🚀 Deployment Strategy

**Option 1: Deploy After Each Phase**
- Immediate user feedback
- Catch issues early
- More commits/pushes

**Option 2: Deploy All Together**
- One comprehensive update
- User tests complete fix
- Fewer interruptions

**Recommendation:** Option 1 (Phase A critical, deploy ASAP)

---

## 📝 Notes

### On Debug Toggle:
Given it's causing issues and there's a working login modal, **removing it is simplest**. Users can test both modes by:
- Guest: Open site (no login)
- Logged in: Use login modal

### On Data Generation:
Current approach (truly random) doesn't showcase the app well. Sequential generation that simulates realistic usage will be much better for demos and screenshots.

### On Layout:
User is right - lots of wasted vertical space. Compact layout will look more professional and allow more data on screen.

---

**Ready to implement!**

Awaiting confirmation to proceed via userinput.py check.

