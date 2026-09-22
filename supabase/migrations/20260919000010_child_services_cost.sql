-- A5a-2: child_services.cost — the wholesale cost the reseller pays
-- Author: Kilo Extension Agent
-- Date: 2026-09-22
-- Target: Business Side island Supabase (fjkzrhyxmjtejjarlxxz)
--
-- Gap: app/api/child/orders/route.ts:52 selects service.cost to compute the
-- reseller's margin, but the column did not exist. Every child order
-- submission 500ed at the service lookup. The cost is the Janjez wholesale
-- price the reseller pays; child_price is what they charge their own
-- customers. markup = child_price - cost.
--
-- Nullable: services imported before the cost-tracking migration have no
-- known cost and fall back to child_price (zero margin) rather than failing.

ALTER TABLE child_services
  ADD COLUMN IF NOT EXISTS cost NUMERIC;

CREATE INDEX IF NOT EXISTS idx_child_services_cost ON child_services(cost);

-- DOWN (rollback):
-- ALTER TABLE child_services DROP COLUMN IF EXISTS cost;