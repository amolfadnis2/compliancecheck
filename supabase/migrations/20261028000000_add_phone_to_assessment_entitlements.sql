-- WhatsApp delivery of paid reports: keep the buyer's mobile alongside their
-- email on the entitlement (the record of who bought which report).
--
-- Written as 91XXXXXXXXXX by /api/payment/create-order, /verify and
-- /redeem-waiver when the buyer enters a number at checkout (optional).
-- No RLS change: this table stays service-role only (see 20261027000000).

ALTER TABLE public.assessment_entitlements
  ADD COLUMN IF NOT EXISTS phone TEXT;
