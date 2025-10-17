# Bug Fixes for Loading Errors

## Issue 1: Error Loading Sessions/Bills
**Cause:** Likely JavaScript error in rendering or calculation logic

### Potential Causes:
1. `recalculateTarget()` being called with undefined `bills` array
2. Error in `renderBills()` or `updateSessionHistory()` 
3. Settings not loaded before calculations run
4. Missing null checks in calculations

### Fix 1: Add Better Error Handling in recalculateTarget()
```javascript
function recalculateTarget() {
    if (!userSettings) {
        console.warn('Settings not loaded yet');
        return;
    }
    
    if (!Array.isArray(bills)) {
        console.warn('Bills not loaded yet');
        TOTAL_NEEDED = 0;
        return;
    }
    
    // Calculate TOTAL_NEEDED based on settings (AFTER bills are loaded)
    if (userSettings.target_bills_mode === 'manual') {
        TOTAL_NEEDED = userSettings.target_bills_manual || 0;
    } else if (userSettings.target_bills_mode === 'auto_all') {
        TOTAL_NEEDED = bills.reduce((sum, bill) => sum + parseFloat(bill.amount_usd || 0), 0);
    } else { // auto_unpaid (default)
        TOTAL_NEEDED = bills.filter(b => !b.paid).reduce((sum, bill) => sum + parseFloat(bill.amount_usd || 0), 0);
    }
}
```

### Fix 2: Add Null Checks in updateStats()
```javascript
function updateStats() {
    // Guard clause at the top
    if (!Array.isArray(sessions) || !Array.isArray(bills)) {
        console.warn('Data not loaded yet, skipping stats update');
        return;
    }
    
    if (sessions.length === 0 && bills.length === 0) return;
    
    // ... rest of function
}
```

### Fix 3: Better Initialization Order
```javascript
async function loadDashboardData() {
    try {
        // Load settings first
        await loadSettings();
        
        // Load data in parallel
        const [sessionsResult, billsResult] = await Promise.allSettled([
            loadSessions(),
            loadBills()
        ]);
        
        // Check for errors
        if (sessionsResult.status === 'rejected') {
            console.error('Sessions failed:', sessionsResult.reason);
        }
        if (billsResult.status === 'rejected') {
            console.error('Bills failed:', billsResult.reason);
        }
        
        // Recalculate target AFTER bills are loaded (only if bills loaded successfully)
        if (billsResult.status === 'fulfilled') {
            recalculateTarget();
        }
        
        // Load stats last
        await loadStats();
    } catch (error) {
        console.error('Dashboard load error:', error);
    }
}
```

## Issue 2: USD Display Not Styled

### Current Code (line ~1735):
```javascript
if (billsTotalEl) billsTotalEl.textContent = `$${totalUnpaidCAD.toFixed(2)} CAD (~$${totalUnpaidUSD.toFixed(2)} USD)`;
```

### Fixed Code:
```javascript
if (billsTotalEl) billsTotalEl.innerHTML = `
    $${totalUnpaidCAD.toFixed(2)} CAD 
    <span style="font-size: 0.6em; color: #999;">(~$${totalUnpaidUSD.toFixed(2)} USD)</span>
`;
```

---

## Quick Diagnostic Steps

### Step 1: Check Browser Console
Open DevTools (F12) and look for red errors. Common issues:
- `Cannot read property 'reduce' of undefined` → bills/sessions not loaded
- `userSettings is null` → settings not loaded
- `NaN` in calculations → data type mismatch

### Step 2: Check API Responses
In DevTools Network tab, check:
- `/api/sessions` - Returns 200?
- `/api/bills` - Returns 200?
- `/api/settings` - Returns 200?

### Step 3: Check Data Format
Console log in loadSessions/loadBills:
```javascript
async function loadSessions() {
    try {
        sessions = await window.api.getSessions();
        console.log('Sessions loaded:', sessions.length, sessions);
        updateSessionHistory();
        updateStats();
    } catch (error) {
        console.error('Error loading sessions:', error);
        // ...
    }
}
```

---

## Most Likely Culprit

Based on your description (exports work, some calculations work), the issue is probably:

**The `due_date` field is NULL or in wrong format**, causing `new Date(bill.due_date)` to fail in renderBills.

### Test in Console:
```javascript
// Check if any bills have invalid dates
bills.forEach(b => {
    if (b.due_date && isNaN(new Date(b.due_date))) {
        console.error('Invalid date:', b.name, b.due_date);
    }
});
```

### Fix for renderBills():
```javascript
// Around line 1690-1695
const dueDate = bill.due_date ? new Date(bill.due_date) : null;
const daysUntil = dueDate ? Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24)) : null;

let urgencyClass = '';
let dueText = 'No due date';

if (bill.paid) {
    urgencyClass = 'paid';
    dueText = '✅ Paid';
} else if (!dueDate) {
    dueText = 'No due date';
} else if (daysUntil < 0) {
    urgencyClass = 'urgent';
    dueText = `🔴 OVERDUE by ${Math.abs(daysUntil)} days`;
} else if (daysUntil === 0) {
    // ... rest of logic
}
```

---

## Priority Fixes

1. **CRITICAL**: Add null check in `recalculateTarget()`
2. **CRITICAL**: Add null/date validation in `renderBills()`
3. **HIGH**: Fix USD styling in bills total
4. **MEDIUM**: Better error handling in loadDashboardData


