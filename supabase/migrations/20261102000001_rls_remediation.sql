-- RLS remediation: replace permissive ALL USING (true) policies with service-role-only access.
-- Service role bypasses RLS, so application (server-side) continues to work.
-- Anonymous/authenticated direct access is now denied.

DROP POLICY IF EXISTS "affiliate_payouts_all" ON affiliate_payouts;
CREATE POLICY "affiliate_payouts_service_only" ON affiliate_payouts FOR ALL USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "api_keys_all" ON api_keys;
CREATE POLICY "api_keys_service_only" ON api_keys FOR ALL USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "child_panels_all" ON child_panels;
CREATE POLICY "child_panels_service_only" ON child_panels FOR ALL USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "child_users_all" ON child_users;
CREATE POLICY "child_users_service_only" ON child_users FOR ALL USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "reseller_commissions_all" ON reseller_commissions;
CREATE POLICY "reseller_commissions_service_only" ON reseller_commissions FOR ALL USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "wholesale_tiers_all" ON wholesale_tiers;
CREATE POLICY "wholesale_tiers_service_only" ON wholesale_tiers FOR ALL USING (false) WITH CHECK (false);