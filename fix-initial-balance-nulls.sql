-- Fix NULL initial_balance values in user_settings table
-- Run this in DBeaver against your Render PostgreSQL database

-- 1. Check current values (see what needs fixing)
SELECT 
    user_id,
    initial_balance,
    initial_balance_currency,
    created_at
FROM user_settings
WHERE initial_balance IS NULL;

-- 2. Update NULL values to 0
UPDATE user_settings
SET initial_balance = 0
WHERE initial_balance IS NULL;

-- 3. Verify the fix
SELECT 
    user_id,
    initial_balance,
    initial_balance_currency,
    created_at
FROM user_settings;

-- 4. Make sure the default is set for future rows
ALTER TABLE user_settings 
ALTER COLUMN initial_balance SET DEFAULT 0;

-- Expected output: All initial_balance values should now be 0 or a positive number, never NULL

