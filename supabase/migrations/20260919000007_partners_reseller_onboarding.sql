-- A5d-1: Reseller onboarding columns on partners
-- Author: Kilo Extension Agent
-- Date: 2026-09-22
-- Target: Business Side island Supabase (fjkzrhyxmjtejjarlxxz)
--
-- Gap: validateActivationReadiness had no reseller branch, so resellers could
-- activate without completing the wholesale agreement or panel branding steps
-- advertised on the landing page (app/page.tsx:137-148). These two columns
-- give the onboarding checklist its data backing.
--
-- Both nullable so legacy non-reseller partners are unaffected.

ALTER TABLE partners
  ADD COLUMN IF NOT EXISTS reseller_agreement_accepted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS branding_completed BOOLEAN NOT NULL DEFAULT false;

-- DOWN (rollback):
-- ALTER TABLE partners DROP COLUMN IF EXISTS reseller_agreement_accepted;
-- ALTER TABLE partners DROP COLUMN IF EXISTS branding_completed;