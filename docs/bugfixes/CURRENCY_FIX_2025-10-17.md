# Currency Conversion Fix - 2025-10-17

## Problem
Bills were being converted from CAD to USD using a **hardcoded 1.4 divisor** instead of using the user's configured exchange rate from settings. This caused all "To Earn" and "Hours Needed" calculations to be incorrect.

## Root Cause
Two functions had hardcoded currency conversion:

1. **`autoCalculateUSD()`** (line 1631-1642) - Used when adding new bills
   - Was using: `const usd = (cad / 1.4).toFixed(2);`
   - Should use: User's `exchange_rate_cad_to_usd` from settings

2. **JSON Import** (line 1877) - Used when importing bills from JSON
   - Was using: `(bill.amount / 1.4)`
   - Should use: User's `exchange_rate_cad_to_usd` from settings

Note: `autoCalculateEditBillUSD()` was already correctly implemented using the settings.

## Fix Applied

### File: `frontend/index.html`

#### Fix 1: `autoCalculateUSD()` function (line 1631-1642)
```javascript
// BEFORE:
function autoCalculateUSD() {
    const cadInput = document.getElementById('billAmountCAD');
    const usdInput = document.getElementById('billAmountUSD');

    if (cadInput && usdInput && cadInput.value) {
        const cad = parseFloat(cadInput.value);
        const usd = (cad / 1.4).toFixed(2);  // ❌ HARDCODED
        usdInput.value = usd;
    }
}

// AFTER:
function autoCalculateUSD() {
    const cadInput = document.getElementById('billAmountCAD');
    const usdInput = document.getElementById('billAmountUSD');

    if (cadInput && usdInput && cadInput.value) {
        const cad = parseFloat(cadInput.value);
        // Use exchange rate from settings, fallback to 0.7143 (CAD to USD)
        const exchangeRate = userSettings?.exchange_rate_cad_to_usd || 0.7143;
        const usd = (cad * exchangeRate).toFixed(2);  // ✅ USES SETTINGS
        usdInput.value = usd;
    }
}
```

#### Fix 2: JSON Import function (line 1872-1884)
```javascript
// BEFORE:
try {
    const billData = {
        name: bill.name || 'Imported Bill',
        amount_cad: parseFloat(bill.amount || bill.amount_cad || 0),
        amount_usd: parseFloat(bill.amountUSD || bill.amount_usd || (bill.amount / 1.4) || 0),  // ❌ HARDCODED
        due_date: bill.dueDate || bill.due_date || null
    };
    await window.api.createBill(billData);
}

// AFTER:
try {
    const amountCAD = parseFloat(bill.amount || bill.amount_cad || 0);
    const exchangeRate = userSettings?.exchange_rate_cad_to_usd || 0.7143;
    const billData = {
        name: bill.name || 'Imported Bill',
        amount_cad: amountCAD,
        amount_usd: parseFloat(bill.amountUSD || bill.amount_usd || (amountCAD * exchangeRate) || 0),  // ✅ USES SETTINGS
        due_date: bill.dueDate || bill.due_date || null
    };
    await window.api.createBill(billData);
}
```

## Impact

### Before Fix:
- Bills entered in CAD were converted to USD using 1.4 divisor (equivalent to ~0.714 exchange rate)
- If user's actual exchange rate was different (e.g., 0.7143), calculations would be slightly off
- "To Earn" showed incorrect amounts
- "Hours Needed" calculations were wrong

### After Fix:
- Bills now use the user's configured `exchange_rate_cad_to_usd` setting
- All calculations (remaining, daily goal, hours needed) are accurate
- User sees correct USD amounts throughout the dashboard

## Data Migration

**No data migration required** because:
1. Bills already store both `amount_cad` and `amount_usd` in the database
2. Users can edit existing bills to recalculate USD amounts if needed
3. The fix only affects **new bills** and **imported bills** going forward

If users have existing bills with incorrect USD amounts:
- Option 1: Manually edit each bill (CAD field will auto-calculate USD with correct rate)
- Option 2: Export bills, delete them, re-import (CSV import already handles both CAD/USD)

## Testing Checklist

- [x] Code changes applied
- [ ] Test adding new bill (CAD auto-converts to USD using settings rate)
- [ ] Test editing existing bill (CAD auto-converts correctly)
- [ ] Test JSON import with bills
- [ ] Verify "To Earn" shows correct USD amounts
- [ ] Verify "Hours Needed" calculations are accurate
- [ ] Deploy to production

## Related Files
- `frontend/index.html` - Main application file (2 fixes)
- `backend/server.js` - No changes needed (already correct)
- `backend/database-setup.sql` - No changes needed

## Notes
- Default exchange rate fallback remains `0.7143` (CAD to USD)
- Backend CSV import already expects both CAD and USD in file, no conversion needed
- The `autoCalculateEditBillUSD()` function was already correctly implemented