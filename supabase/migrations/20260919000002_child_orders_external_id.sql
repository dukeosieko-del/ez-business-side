-- A4a-2: External Janjez order ID on child_orders
-- Author: Kilo Extension Agent
-- Date: 2026-09-22
-- Target: Business Side island Supabase (fjkzrhyxmjtejjarlxxz)
--
-- Gap source: app/api/child/orders/route.ts:142 sets external_order_id on
-- submission to Janjez Main, but the column did not exist. Every successful
-- child order submission 500s at the update step.
--
-- Nullable: legacy rows predate the Janjez submission integration.

ALTER TABLE child_orders
  ADD COLUMN IF NOT EXISTS external_order_id TEXT;

CREATE INDEX IF NOT EXISTS idx_child_orders_external ON child_orders(external_order_id);

-- DOWN (rollback):
-- ALTER TABLE child_orders DROP COLUMN IF EXISTS external_order_id;