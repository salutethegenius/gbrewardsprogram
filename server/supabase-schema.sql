-- Run this in Supabase SQL Editor to create all tables for the loyalty program.

-- Stores
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Admins
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id),
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  fullname TEXT,
  phone TEXT,
  company TEXT,
  timestamp BIGINT,
  UNIQUE(store_id, email)
);

-- Users (legacy store customers)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id),
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  fullname TEXT,
  phone TEXT,
  country_code TEXT,
  points REAL DEFAULT 0,
  timestamp BIGINT,
  UNIQUE(store_id, email)
);

-- Histories
CREATE TABLE IF NOT EXISTS histories (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  store_id UUID REFERENCES stores(id),
  type TEXT NOT NULL,
  timestamp BIGINT,
  by TEXT,
  point REAL,
  amount REAL
);

-- Points
CREATE TABLE IF NOT EXISTS points (
  id SERIAL PRIMARY KEY,
  store_id UUID REFERENCES stores(id),
  type TEXT NOT NULL,
  timestamp BIGINT,
  point REAL,
  by TEXT,
  to_user TEXT,
  amount REAL
);

-- Settings
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
INSERT INTO settings (key, value) VALUES ('shared_rewards_pct', '20') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('point_redemption_value', '0.10') ON CONFLICT (key) DO NOTHING;

-- Vendors
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  logo_url TEXT,
  points_per_dollar REAL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at BIGINT
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  fullname TEXT,
  email TEXT,
  created_at BIGINT
);

-- Balances
CREATE TABLE IF NOT EXISTS balances (
  id SERIAL PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  vendor_id UUID REFERENCES vendors(id),
  points REAL DEFAULT 0,
  UNIQUE(customer_id, vendor_id)
);

-- Shared Pool
CREATE TABLE IF NOT EXISTS shared_pool (
  customer_id UUID PRIMARY KEY REFERENCES customers(id),
  points REAL DEFAULT 0
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  vendor_id UUID REFERENCES vendors(id),
  type TEXT NOT NULL,
  points REAL NOT NULL,
  amount REAL,
  processed_by TEXT,
  timestamp BIGINT
);

-- Customer magic-link login tokens (one-time use, short-lived)
CREATE TABLE IF NOT EXISTS customer_login_tokens (
  token TEXT PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  expires_at BIGINT NOT NULL,
  created_at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_customer_login_tokens_expires ON customer_login_tokens(expires_at);

-- Audit log for compliance (admin/vendor actions)
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  actor_type TEXT NOT NULL,
  actor_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  ip TEXT,
  user_agent TEXT,
  created_at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log(actor_type, actor_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_balances_customer ON balances(customer_id);
CREATE INDEX IF NOT EXISTS idx_balances_vendor ON balances(vendor_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_vendor ON transactions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
