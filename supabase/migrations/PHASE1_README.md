# Phase 1: Identity Foundation — Setup Guide

## 1. Apply the Migration

### Option A — Supabase Dashboard (recommended for production)

1. Go to your Supabase Dashboard → **SQL Editor**
2. Open `20260429000000_phase1_identity_foundation.sql`
3. Paste the entire contents and click **Run**
4. Verify success: run `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';` — you should see `profiles` and `events` in the list.

### Option B — Supabase CLI

```bash
supabase db push
```

Requires `supabase` CLI linked to your project. The migration file is already in `supabase/migrations/`.

---

## 2. Verify the Migration

Run these in the SQL Editor to confirm everything landed correctly:

```sql
-- Tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('profiles', 'events');

-- RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('profiles', 'events');

-- Triggers exist on auth.users
SELECT trigger_name FROM information_schema.triggers
WHERE event_object_schema = 'auth' AND event_object_table = 'users';

-- Test trigger: insert a test auth user and verify profile row appears
-- (Do this via Supabase Dashboard → Authentication → Users → "Add user" → Confirm email)
-- Then: SELECT * FROM public.profiles ORDER BY created_at DESC LIMIT 1;

-- Test RLS cross-user isolation: run as a different user_id and confirm 0 rows returned
-- SET LOCAL role TO authenticated;
-- SET LOCAL "request.jwt.claims" TO '{"sub":"00000000-0000-0000-0000-000000000001"}';
-- SELECT * FROM public.profiles WHERE id = '<different-uuid>'; -- must return 0 rows
```

---

## 3. Configure Custom SMTP via Resend (MANUAL STEP — you must do this)

Supabase's built-in SMTP is rate-limited to 3 emails/hour. For OTP to work in production, wire it through Resend:

1. **Get your Resend SMTP credentials** (Resend Dashboard → SMTP):
   - Host: `smtp.resend.com`
   - Port: `465` (SSL) or `587` (TLS)
   - Username: `resend`
   - Password: your Resend API key (the one starting with `re_`)

2. **In Supabase Dashboard** → **Authentication** → **SMTP Settings**:
   - Toggle **Enable Custom SMTP** → ON
   - Fill in the fields from step 1
   - Sender name: `ComplianceCheck`
   - Sender email: `noreply@compliancecheck.co.in`

3. **OTP email template** → Authentication → **Email Templates** → **Magic Link**:
   - Change subject to: `Your ComplianceCheck verification code`
   - Body: Supabase will automatically embed the OTP token as `{{ .Token }}` when using `signInWithOtp({ options: { shouldCreateUser: false } })`

4. **Set OTP expiry**: Authentication → **Auth Settings** → OTP expiry: `600` seconds (10 minutes)

5. **Enable anonymous sign-ins**: Authentication → **Auth Settings** → **Anonymous sign-ins** → Enable

---

## 4. Required Environment Variables

Add these to your Netlify environment (Site → Environment Variables) and your local `.env.local`:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `RESEND_API_KEY` | Your Resend API key (for deletion confirmation emails) |
| `EMAIL_FROM` | `ComplianceCheck <noreply@compliancecheck.co.in>` |
| `NEXT_PUBLIC_FF_CTC_EMAIL_GATE` | `off` \| `on` \| `split` — controls CTC calculator email gate |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host (default: `https://app.posthog.com`) |

**Never commit secret values** (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`) to the repository.

---

## 5. Future Work (not in this phase)

- **Hard deletion cron**: A scheduled job should query `profiles WHERE deletion_requested_at < NOW() - INTERVAL '30 days'` and call `supabase.auth.admin.deleteUser(id)`. Supabase's `DELETE CASCADE` will clean up all child rows. Implement as a Supabase Edge Function on a cron schedule.
- **Admin dashboard**: Phase 3 will add a read-only admin view of `profiles` and `events`.
- **Calendar subscriptions**: Phase 2 will add a `calendar_subscriptions` table that joins to `profiles.id`.
