-- Weekly newsletter: opt-in subscribers and the weekly issues awaiting approval.
--
-- Consent model (DPDP): only people who explicitly opt in get the newsletter.
-- Every subscription is double opt-in: a row starts 'pending' and becomes
-- 'active' only when the confirmation link is clicked. Existing registered
-- users are NOT backfilled.
--
-- Both tables are service-role only (RLS on, no policies), like
-- assessment_entitlements: all reads and writes go through /api/newsletter/*.
-- This is a deliberate exception to CLAUDE.md sec 8 -- anonymous visitors
-- subscribe via an API route, never by writing to the table directly.

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,                 -- stored lower-cased
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'unsubscribed')),
  source TEXT NOT NULL,                       -- 'home' | 'checkout' | 'email_gate'
  consent_text TEXT NOT NULL,                 -- exact wording the person agreed to
  consent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmation_sent_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active
  ON public.newsletter_subscribers(id) WHERE status = 'active';

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.newsletter_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_of DATE NOT NULL UNIQUE,               -- IST date the draft was built; one issue per week
  subject TEXT NOT NULL,
  html TEXT NOT NULL,                         -- contains {{UNSUBSCRIBE_URL}} placeholder
  text_body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sending', 'sent', 'discarded')),
  send_cursor BIGINT NOT NULL DEFAULT 0,      -- last newsletter_subscribers.id sent to
  sent_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ
);

ALTER TABLE public.newsletter_issues ENABLE ROW LEVEL SECURITY;
