-- Fix for adding initial_balance_currency column with constraint
-- Run these commands ONE AT A TIME in DBeaver

-- Step 1: Add the column (without constraint first)
ALTER TABLE user_settings 
ADD COLUMN initial_balance_currency VARCHAR(3) DEFAULT 'USD';

-- Step 2: Add the constraint separately
ALTER TABLE user_settings 
ADD CONSTRAINT check_initial_balance_currency 
CHECK (initial_balance_currency IN ('USD', 'CAD'));

-- Step 3: Verify it worked
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
AND column_name = 'initial_balance_currency';

