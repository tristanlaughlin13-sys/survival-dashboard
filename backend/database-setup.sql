-- Survival Dashboard Database Schema
-- PostgreSQL 14+

-- Enable UUID extension (optional, for future use)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Work sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    time_display VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    date DATE NOT NULL,
    hours DECIMAL(10, 2) NOT NULL CHECK (hours >= 0),
    rate DECIMAL(10, 2) NOT NULL CHECK (rate >= 0),
    earnings DECIMAL(10, 2) NOT NULL CHECK (earnings >= 0),
    note TEXT,
    is_leisure BOOLEAN DEFAULT FALSE,
    opportunity_cost DECIMAL(10, 2) DEFAULT 0,
    is_manual BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_sessions_timestamp ON sessions(timestamp DESC);

-- Bills table
CREATE TABLE IF NOT EXISTS bills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount_cad DECIMAL(10, 2) NOT NULL CHECK (amount_cad >= 0),
    amount_usd DECIMAL(10, 2) NOT NULL CHECK (amount_usd >= 0),
    due_date DATE,
    paid BOOLEAN DEFAULT FALSE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_paid ON bills(paid);

-- User Settings table for dynamic sprint configuration
CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    sprint_end_date TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '9 days'),
    target_bills_mode VARCHAR(20) DEFAULT 'auto_unpaid' CHECK (target_bills_mode IN ('auto_unpaid', 'auto_all', 'manual')),
    target_bills_manual DECIMAL(10, 2) DEFAULT 0 CHECK (target_bills_manual >= 0),
    initial_balance DECIMAL(10, 2) DEFAULT 0 CHECK (initial_balance >= 0),
    default_hourly_rate DECIMAL(10, 2) DEFAULT 55.00 CHECK (default_hourly_rate >= 0),
    tax_reserve_rate DECIMAL(5, 2) DEFAULT 30.00 CHECK (tax_reserve_rate >= 0 AND tax_reserve_rate <= 100),
    exchange_rate_cad_to_usd DECIMAL(10, 4) DEFAULT 0.7143 CHECK (exchange_rate_cad_to_usd > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster settings lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
-- Note: RLS is optional but recommended for extra security
-- Uncomment below if you want to enable RLS

-- ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY sessions_user_isolation ON sessions
--     FOR ALL
--     TO PUBLIC
--     USING (user_id = current_setting('app.user_id')::INTEGER);

-- ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY bills_user_isolation ON bills
--     FOR ALL
--     TO PUBLIC
--     USING (user_id = current_setting('app.user_id')::INTEGER);

-- Grant permissions (adjust as needed for your database user)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_db_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_db_user;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database schema created successfully!';
    RAISE NOTICE 'Tables created: users, sessions, bills, user_settings';
    RAISE NOTICE 'Indexes and triggers configured.';
END $$;

