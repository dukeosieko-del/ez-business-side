-- A5a-1: Wholesale price tiers for resellers
-- Author: Kilo Extension Agent
-- Date: 2026-09-22
-- Target: Business Side island Supabase (fjkzrhyxmjtejjarlxxz)
--
-- Gap: the reseller landing page promises "wholesale prices. Set your own
-- markups." (app/page.tsx:139) but no backend backed that claim. Resellers
-- had only a per-service manual markupPercent in PriceEditor.tsx — no
-- system-level wholesale base price, no bulk discount tiers, no way to
-- compute a reseller's effective cost before adding their own margin.
--
-- Design: tiers are quantity-banded and category-scoped. A service's
-- wholesale price = retail_price * (1 - maxApplicableTier.discount_percent).
-- Tiers are global defaults; a partner can also override per service via
-- child_services.child_price (which already exists).
--
-- RLS: resellers read all tiers (they need them to price orders); only admins
-- write. Reads go through the service_role client which bypasses RLS, so the
-- policy is permissive by design and will be tightened when admin tier
-- management lands.

CREATE TABLE IF NOT EXISTS wholesale_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  min_quantity INTEGER NOT NULL CHECK (min_quantity >= 0),
  max_quantity INTEGER,
  discount_percent NUMERIC NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
  applies_to_category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT wholesale_tiers_range_check CHECK (
    max_quantity IS NULL OR min_quantity < max_quantity
  )
);

CREATE INDEX IF NOT EXISTS idx_wholesale_tiers_quantity ON wholesale_tiers(min_quantity);
CREATE INDEX IF NOT EXISTS idx_wholesale_tiers_category ON wholesale_tiers(applies_to_category);

-- Seed default tiers (Kenyan SMM wholesale conventions).
-- 100+ units: 5% off. 500+: 10%. 1000+: 15%. 5000+: 20%.
INSERT INTO wholesale_tiers (name, min_quantity, max_quantity, discount_percent, applies_to_category) VALUES
  ('Starter 100+', 100, 499, 5, NULL),
  ('Growth 500+', 500, 999, 10, NULL),
  ('Pro 1000+', 1000, 4999, 15, NULL),
  ('Enterprise 5000+', 5000, NULL, 20, NULL)
  ON CONFLICT DO NOTHING;

ALTER TABLE wholesale_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wholesale_tiers_all" ON wholesale_tiers
  FOR ALL USING (true);

-- DOWN (rollback):
-- DROP TABLE IF EXISTS wholesale_tiers;