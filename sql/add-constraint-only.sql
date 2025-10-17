-- Since the column already exists, just add the constraint
-- Run this ONE command in DBeaver:

ALTER TABLE user_settings 
ADD CONSTRAINT check_initial_balance_currency 
CHECK (initial_balance_currency IN ('USD', 'CAD'));

-- If that still fails, try this alternative approach:
-- (Uncomment and run if the above doesn't work)

-- ALTER TABLE user_settings 
-- DROP CONSTRAINT IF EXISTS check_initial_balance_currency;
-- 
-- ALTER TABLE user_settings 
-- ADD CONSTRAINT check_initial_balance_currency 
-- CHECK (initial_balance_currency = 'USD' OR initial_balance_currency = 'CAD');

