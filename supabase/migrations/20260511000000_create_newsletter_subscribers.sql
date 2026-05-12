-- Newsletter subscribers table for blog email list
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  confirmation_token UUID DEFAULT gen_random_uuid(),
  unsubscribe_token UUID DEFAULT gen_random_uuid(),
  source TEXT,
  consent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_confirmation ON newsletter_subscribers(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_newsletter_unsubscribe ON newsletter_subscribers(unsubscribe_token);

-- Enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- No anonymous reads (admin only)
CREATE POLICY "Service role only" ON newsletter_subscribers
  USING (false)
  WITH CHECK (false);
