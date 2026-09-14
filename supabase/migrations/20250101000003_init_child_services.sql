-- Migration: init_child_services
-- Description: Services resold by each child panel, imported from Janjez Main catalogue.
-- Created: 2025-01-01

CREATE TABLE IF NOT EXISTS child_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID NOT NULL REFERENCES child_panels(id) ON DELETE CASCADE,
  janjez_service_id UUID NOT NULL,
  child_price NUMERIC NOT NULL CHECK (child_price >= 0),
  child_min_quantity INTEGER CHECK (child_min_quantity > 0),
  child_max_quantity INTEGER CHECK (child_max_quantity > 0),
  is_visible BOOLEAN DEFAULT TRUE,
  is_drip_feed_enabled BOOLEAN DEFAULT FALSE,
  display_order INTEGER,
  custom_name TEXT,
  custom_description TEXT,
  imported_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (panel_id, janjez_service_id)
);

CREATE INDEX IF NOT EXISTS idx_child_services_panel_id ON child_services(panel_id);

ALTER TABLE child_services ENABLE ROW LEVEL SECURITY;
