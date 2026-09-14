-- Migration: init_child_users
-- Description: End customers who purchase through a child panel.
-- Created: 2025-01-01

CREATE TABLE IF NOT EXISTS child_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID NOT NULL REFERENCES child_panels(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password_hash TEXT,
  balance NUMERIC DEFAULT 0 CHECK (balance >= 0),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (panel_id, email)
);

CREATE INDEX IF NOT EXISTS idx_child_users_panel_id ON child_users(panel_id);
