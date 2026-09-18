-- B1-4: External integration registry (provider, M-Pesa, Brevo, etc.)
-- WARNING: config JSONB must NEVER store secrets in plaintext.
-- Secrets must be encrypted at rest (e.g. AES-256-GCM with a KMS-managed key)
-- before insertion. This table stores configuration + encrypted credential blobs only.

CREATE TABLE IF NOT EXISTS integration_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL,
  display_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_tested_at TIMESTAMPTZ,
  last_test_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(partner_id, integration_type)
);

CREATE INDEX IF NOT EXISTS idx_integration_connections_partner_id ON integration_connections(partner_id);
CREATE INDEX IF NOT EXISTS idx_integration_connections_type ON integration_connections(integration_type);