-- 7-day money-back guarantee (P0-A.3): extends assessment_entitlements with
-- refund tracking. Refund handling is a manual queue for now (low volume) —
-- a request sets 'refund_requested' immediately; the founder marks
-- 'refunded' by hand once the Razorpay refund has actually been issued.
-- Filtering getEntitlement() to status IN ('paid', 'waived') already means a
-- 'refunded' row loses report access with no extra code — see
-- src/lib/payment/entitlement.ts.

ALTER TABLE public.assessment_entitlements
  DROP CONSTRAINT IF EXISTS assessment_entitlements_status_check;

ALTER TABLE public.assessment_entitlements
  ADD CONSTRAINT assessment_entitlements_status_check
  CHECK (status IN ('initiated', 'paid', 'failed', 'waived', 'refund_requested', 'refunded'));

ALTER TABLE public.assessment_entitlements
  ADD COLUMN IF NOT EXISTS refund_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;
