-- A7a-1: api_keys table — per-user JWT API key storage
-- Author: Kilo Extension Agent
-- Date: 2026-09-22
-- Target: Business Side island Supabase (fjkzrhyxmjtejjarlxxz)
--
-- Root cause of INVALID_API_KEY: the main build authenticates business-side
-- requests against a single static env var (src/lib/business-side/auth.ts:21
-- constant-time compare to BUSINESS_SIDE_API_KEY). There is no per-user key
-- infrastructure, so the business-side cannot obtain or rotate credentials,
-- and scopes cannot be enforced.
--
-- This table gives every user (partner or child-panel tenant) their own
-- keypair: a public key_id embedded in a signed JWT, and a bcrypt/argon2
-- hash of the secret stored server-side. The secret is shown once at
-- issuance time and never again.
--
-- RLS: users read their own keys; admins read all. Writes go through the
-- service_role client which bypasses RLS, so the policy is permissive by
-- design and will be tightened when admin key management lands (A7f).

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID,
  key_id TEXT NOT NULL UNIQUE,
  key_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Default key',
  scopes TEXT[] NOT NULL DEFAULT '{}',
  rate_limit INTEGER NOT NULL DEFAULT 60 CHECK (rate_limit > 0),
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id, revoked_at);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_id ON api_keys(key_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_revoked ON api_keys(revoked_at);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires ON api_keys(expires_at);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "api_keys_all" ON api_keys
  FOR ALL USING (true);

-- DOWN (rollback):
-- DROP TABLE IF EXISTS api_keys;