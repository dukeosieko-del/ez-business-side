-- Migration: init_child_panels
-- Description: Child white-label panels owned by partners.
-- Created: 2025-01-01

CREATE TABLE IF NOT EXISTS child_panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  subdomain TEXT UNIQUE NOT NULL,
  custom_domain TEXT UNIQUE,
  custom_domain_verified BOOLEAN DEFAULT FALSE,
  branding JSONB DEFAULT '{}'::jsonb,
  copy JSONB DEFAULT '{}'::jsonb,
  payment_gateways TEXT[] DEFAULT ARRAY['mpesa']::TEXT[],
  status TEXT NOT NULL DEFAULT 'demo' CHECK (status IN ('demo', 'active', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_child_panels_partner_id ON child_panels(partner_id);
CREATE INDEX IF NOT EXISTS idx_child_panels_subdomain ON child_panels(subdomain);

ALTER TABLE child_panels ENABLE ROW LEVEL SECURITY;
