# Sprint Date Bugs Fix

## Issue 1: Days Left Not Updating After Changing Deadline
**Problem:** When you change the sprint end date in settings, the "Days Left" stat doesn't update immediately.

**Root Cause:** While `loadDashboardData()` does call `loadSettings()` which updates `DEADLINE`, the `updateStats()` function needs to be explicitly called after settings are reloaded to refresh all displays.

**Fix:** Add explicit `updateStats()` call after `loadDashboardData()` completes in `saveSprintSettings()`.

## Issue 2: Sprint Settings Modal Shows Wrong Default Date
**Problem:** Modal shows "9 days from now" instead of current deadline.

**Root Cause:** Database default for `sprint_end_date` is `CURRENT_TIMESTAMP + INTERVAL '9 days'`, which creates a NEW timestamp every time a new user_settings row is created. If settings don't exist yet, they're created with a fresh "9 days from now" value.

**Fix:** 
1. Ensure settings are created during user registration with specific sprint_end_date
2. Add better default handling in frontend

---

## Quick Fix SQL
Run this in DBeaver to see if your sprint_end_date is stale:

```sql
SELECT 
    user_id,
    sprint_end_date,
    sprint_end_date - NOW() as time_until_deadline
FROM user_settings;
```

If it's not what you expect, update it manually:
```sql
UPDATE user_settings
SET sprint_end_date = '2025-10-24 23:59:59'
WHERE user_id = 1;
```

