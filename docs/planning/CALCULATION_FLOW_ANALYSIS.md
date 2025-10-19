# Calculation Flow Analysis - USD Throughout

## Summary
**All calculations are correctly using USD throughout the system.** There is no CAD conversion happening in the calculation pipeline.

## Data Flow Diagram

```
[Sessions] → earnings (USD)
             ↓
         sessionsEarned (USD)
             +
    [Initial Balance] → converted to USD if CAD
             ↓
        totalEarned (USD)

[Bills] → amount_usd (USD)
          ↓
      TOTAL_NEEDED (USD)
          ×
    afterTaxMultiplier
          ↓
      totalWithTax (USD)

totalWithTax - totalEarned = remaining (USD)
        ↓
remaining / daysLeft = dailyGoal (USD)
        ↓
dailyGoal / hourlyRate = hoursPerDay
```

## Detailed Trace

### 1. Session Earnings (USD)
**Source:** `frontend/index.html` lines 922, 935, 949
```javascript
const earnings = hours * rate;  // rate is USD hourly rate
```
- Hourly rate input is in USD (default: $24, $55, etc.)
- Earnings = hours × USD rate
- **Result: earnings stored in USD**

### 2. Total Earned (USD)
**Source:** `frontend/index.html` lines 1203, 1228
```javascript
const sessionsEarned = sessions.filter(s => !s.is_leisure)
    .reduce((sum, s) => sum + parseFloat(s.earnings || 0), 0);  // USD

let initialBalance = parseFloat(userSettings.initial_balance);

// Convert to USD if in CAD
if (initialBalance > 0 && userSettings.initial_balance_currency === 'CAD') {
    initialBalance = initialBalance * exchangeRate;  // Now USD
}

const totalEarned = sessionsEarned + initialBalance;  // USD + USD = USD
```
- **Result: totalEarned is in USD**

### 3. Total Needed (USD)
**Source:** `frontend/index.html` lines 844, 846
```javascript
// Auto mode - all bills
TOTAL_NEEDED = bills.reduce((sum, bill) =>
    sum + parseFloat(bill.amount_usd || 0), 0);  // Using amount_usd

// Auto mode - unpaid bills only
TOTAL_NEEDED = bills.filter(b => !b.paid).reduce((sum, bill) =>
    sum + parseFloat(bill.amount_usd || 0), 0);  // Using amount_usd
```
- **Result: TOTAL_NEEDED is in USD**

### 4. Total With Tax (USD)
**Source:** `frontend/index.html` lines 1231, 1237
```javascript
const totalBillsUSD = parseFloat(TOTAL_NEEDED) || 0;  // USD
const taxReserveRate = userSettings.tax_reserve_rate || 30;
const afterTaxMultiplier = 1 / (1 - (taxReserveRate / 100));
const totalWithTax = totalBillsUSD * afterTaxMultiplier;  // USD × multiplier = USD
```
- Example: $2000 bills × 1.43 (for 30% tax) = $2857 needed
- **Result: totalWithTax is in USD**

### 5. Remaining "To Earn" (USD)
**Source:** `frontend/index.html` line 1239
```javascript
const remaining = Math.max(0, totalWithTax - totalEarned);  // USD - USD = USD
```
- **Result: remaining is in USD**

### 6. Daily Goal (USD)
**Source:** `frontend/index.html` line 1241
```javascript
const daysLeft = Math.max(1, Math.ceil((DEADLINE - new Date()) / (1000 * 60 * 60 * 24)));
const dailyGoal = remaining / daysLeft;  // USD / days = USD/day
```
- **Result: dailyGoal is in USD**

### 7. Hours Needed
**Source:** `frontend/index.html` lines 1246-1247
```javascript
const rate = parseFloat(hourlyRate.value) || defaultRate;  // USD/hour
const hoursPerDay = rate > 0 ? dailyGoal / rate : 0;  // (USD/day) / (USD/hour) = hours/day
const totalHours = rate > 0 ? remaining / rate : 0;  // USD / (USD/hour) = hours
```
- **Result: Hours calculations are dimensionally correct**

## Display Values (All USD)

### 9-Day Sprint Card
**Source:** `frontend/index.html` lines 105-119
```javascript
els.totalEarned.textContent = `$${Math.round(totalEarned)}`;      // USD
els.totalNeeded.textContent = Math.round(totalWithTax);           // USD
els.remaining.textContent = `$${Math.round(remaining)}`;          // USD ("To Earn")
```

### Today's Goal Card
**Source:** `frontend/index.html` lines 68-76
```javascript
els.dailyGoal.textContent = `$${Math.round(dailyGoal)}`;          // USD
els.todayProgressText = `$${Math.round(todayEarnings)} / $${Math.round(dailyGoal)}`;  // USD / USD
```

### Hours Display
```javascript
els.hoursNeeded.textContent = hoursPerDay.toFixed(1);             // hours/day
els.totalHoursNeeded.textContent = Math.round(totalHours);        // total hours
```

## Where CAD Appears (Correctly)

### Bills Display
**Source:** `frontend/index.html` lines 1061-1062
```javascript
$${parseFloat(bill.amount_cad).toFixed(2)}
<span class="bill-amount-usd">~$${Math.round(parseFloat(bill.amount_usd))} USD</span>
```
- Shows CAD amount (primary display)
- Shows USD conversion as hint
- **Does NOT affect calculations**

### Bills Breakdown Stats
**Source:** `frontend/index.html` lines 1353-1355
```javascript
els.billsTotalCAD.textContent = `$${Math.round(totalBillsCAD)}`;  // Display only
els.billsTotalUSD.textContent = `$${Math.round(totalBillsUSD)}`;  // Display only
els.billsWithTax.textContent = `$${Math.round(totalWithTax)}`;    // Used in calculations
```
- `totalBillsCAD` is calculated but **NOT used** in sprint calculations
- `totalBillsUSD` is used via `TOTAL_NEEDED`

## Conclusion

### ✅ Everything is Already Correct!

The calculation pipeline is:
1. **Sessions earn in USD** (hourly rate × hours)
2. **Initial balance converted to USD** (if entered in CAD)
3. **Bills use amount_usd for calculations** (TOTAL_NEEDED)
4. **All downstream calcs use USD** (totalWithTax, remaining, dailyGoal)

### No Changes Needed

The system is already doing exactly what you described:
- ✅ Total remaining (USD) used in 9-day sprint card
- ✅ To Earn correctly calculated from totalNeeded - totalEarned (USD - USD)
- ✅ Today's Goal correctly derived from remaining/daysLeft (USD/days)

### Potential Issue: Bill Data

If you're seeing incorrect values, the issue is likely:
1. **Bills have wrong USD amounts stored** (from previous hardcoded 1.4 conversion)
   - Fix: Edit each bill to recalculate USD using correct exchange rate
   - Or: Delete and re-add bills with correct conversion

2. **Initial balance in wrong currency**
   - Check Sprint Settings → Initial Balance Currency setting
   - If set to CAD, it converts to USD using exchange rate
   - If set to USD, it uses the value directly

### Testing Recommendation

1. Check your current exchange rate setting:
   - Menu → Sprint Settings → "CAD to USD Exchange Rate"

2. Check your existing bills:
   - For each bill, verify the USD amount makes sense
   - Edit bills if USD amounts seem wrong (will auto-recalculate)

3. Check initial balance:
   - Sprint Settings → Initial Balance
   - Verify currency is set correctly (USD vs CAD)

4. Add a new test bill:
   - $100 CAD should convert to ~$71.43 USD (with 0.7143 rate)
   - Verify "To Earn" updates correctly