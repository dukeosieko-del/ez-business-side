-- B1-2: Per-service configurable parameters
-- Each service declares supported parameters (target, quantity, runs, interval, etc.).

CREATE TABLE IF NOT EXISTS service_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES child_services(id) ON DELETE CASCADE,
  param_key TEXT NOT NULL,
  param_type TEXT NOT NULL CHECK (param_type IN ('string','number','boolean','enum','json')),
  param_value JSONB,
  is_required BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  label TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(service_id, param_key)
);

CREATE INDEX IF NOT EXISTS idx_service_parameters_service_id ON service_parameters(service_id);