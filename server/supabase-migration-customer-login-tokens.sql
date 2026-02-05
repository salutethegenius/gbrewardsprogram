-- Run this in Supabase SQL Editor if you already have the main schema and need customer magic-link login.
-- Creates the table used for one-time login links (customer login is now magic-link only).

CREATE TABLE IF NOT EXISTS customer_login_tokens (
  token TEXT PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  expires_at BIGINT NOT NULL,
  created_at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_customer_login_tokens_expires ON customer_login_tokens(expires_at);
