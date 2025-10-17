# SQL Scripts

This directory contains all SQL scripts for the Survival Dashboard database.

## Main Setup Script

### `database-setup.sql`
**Complete database schema setup script.** Run this to create a fresh database from scratch.

**Creates:**
- `users` table - User accounts with authentication
- `sessions` table - Work session tracking
- `bills` table - Bill management
- `user_settings` table - User-specific configuration (sprint dates, rates, initial balance, etc.)
- All indexes for performance
- All triggers for auto-updating timestamps
- All constraints and foreign keys

**Usage:**
```sql
-- Via psql
psql -h <host> -U <user> -d <database> -f database-setup.sql

-- Via DBeaver
-- Open file and execute in order
```

## Update/Migration Scripts

### `database-update-fix.sql`
Fix for adding `initial_balance_currency` column with proper CHECK constraint.

### `add-constraint-only.sql`
Adds CHECK constraint for `initial_balance_currency` (USD/CAD only).

### `fix-initial-balance-nulls.sql`
Updates NULL `initial_balance` values to 0 and sets default.

---

## Setup Instructions

### Fresh Database Setup
1. Run `database-setup.sql` in full
2. That's it! Everything is configured.

### Existing Database Updates
If you already have a database and need to apply updates:
1. Check which tables you have
2. Apply only the relevant update scripts in order
3. Scripts are idempotent where possible (use `IF NOT EXISTS`, `IF EXISTS`)

---

## Schema Overview

```
users (id, email, password_hash, name, timestamps)
  └── sessions (user_id FK, time tracking data)
  └── bills (user_id FK, bill data)
  └── user_settings (user_id FK UNIQUE, configuration)
```

---

## Notes

- All foreign keys have `ON DELETE CASCADE` for automatic cleanup
- All tables have `created_at` and `updated_at` timestamps
- Indexes are created for all frequently queried columns
- Constraints ensure data integrity (email format, positive amounts, etc.)
- Row Level Security policies are available but commented out (optional)

---

Last Updated: October 2025

