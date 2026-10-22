-- PF calculator (/calculator/pf)
--
-- 1. statutory_params      — date-effective statutory values with sources (public read)
-- 2. epf_interest_rates    — declared EPF rates by FY (public read)
-- 3. pf_calc_sessions      — anonymous calculation log; salary BAND only (server writes only)
-- 4. pf_calc_saved         — logged-in saves; the only place exact salary/balance is kept
-- 5. pf_calc_shares        — share-link state, read by slug through get_pf_share()
-- 6. leads                 — DPDP-consented leads (server writes only, no client read)
-- 7. pg_cron job            — nightly purge of expired sessions and shares
--
-- Seed values must stay in step with src/lib/calculators/epf/defaults.ts
-- (the fallback used only when Supabase is unreachable).
--
-- Rollback: see the bottom of this file.

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ---------------------------------------------------------------------------
-- 1. statutory_params
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.statutory_params (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    status TEXT NOT NULL DEFAULT 'in_force'
        CHECK (status IN ('in_force', 'under_clarification', 'alternative_reading', 'assumption', 'superseded')),
    source_name TEXT NOT NULL,
    source_ref TEXT,
    source_url TEXT,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    UNIQUE (key, effective_from)
);

CREATE INDEX IF NOT EXISTS idx_statutory_params_key ON public.statutory_params(key);

ALTER TABLE public.statutory_params ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read statutory params"
    ON public.statutory_params FOR SELECT
    TO anon, authenticated
    USING (true);

-- Every value is { "amount": <number> } unless noted.
INSERT INTO public.statutory_params
    (key, value, effective_from, effective_to, status, source_name, source_ref, source_url, verified_at, notes)
VALUES
    ('pf_wage_ceiling', '{"amount":15000}', '1900-01-01', '2026-09-16', 'superseded',
     'EPF Scheme, 1952 (para 2(f))', NULL, 'https://www.epfindia.gov.in', '2026-10-22', 'Pre-change ceiling'),
    ('pf_wage_ceiling', '{"amount":25000}', '2026-09-17', NULL, 'in_force',
     'Gazette notification', 'S.O. 5109(E), 17 Sep 2026', 'https://egazette.gov.in', '2026-10-22', NULL),

    ('eps_wage_ceiling', '{"amount":15000}', '1900-01-01', '2026-09-16', 'superseded',
     'EPS 1995 (para 11)', NULL, 'https://www.epfindia.gov.in', '2026-10-22', 'Pre-change ceiling'),
    ('eps_wage_ceiling', '{"amount":25000}', '2026-09-17', NULL, 'under_clarification',
     'PIB release', 'PIB, 23 Sep 2026', 'https://pib.gov.in', '2026-10-22',
     'G.S.R. 890(E) 15-Oct-2026 under clarification'),
    ('eps_wage_ceiling_alt', '{"amount":15000}', '1900-01-01', NULL, 'alternative_reading',
     'Gazette notification', 'G.S.R. 890(E), 15 Oct 2026', 'https://egazette.gov.in', '2026-10-22',
     'One reading of G.S.R. 890(E): EPS ceiling stays at 15,000'),

    ('eps_rate', '{"amount":0.0833}', '1900-01-01', NULL, 'in_force',
     'EPS 2026', NULL, 'https://www.epfindia.gov.in', '2026-10-22', 'Share of employer 12% diverted to EPS'),
    ('edli_rate', '{"amount":0.005}', '2026-07-01', NULL, 'in_force',
     'Gazette notification', 'S.O. 3581(E), 1 Jul 2026', 'https://egazette.gov.in', '2026-10-22', NULL),
    ('admin_rate', '{"amount":0.005}', '2026-07-01', NULL, 'in_force',
     'EPFO FAQs', 'EPFO FAQs, Sep 2026', 'https://www.epfindia.gov.in', '2026-10-22', NULL),
    ('edli_min', '{"amount":250000}', '1900-01-01', NULL, 'in_force',
     'EDLI Scheme, 1976', NULL, 'https://www.epfindia.gov.in', '2026-10-22', 'Minimum assurance benefit'),
    ('edli_max', '{"amount":700000}', '1900-01-01', NULL, 'in_force',
     'EDLI Scheme, 1976', NULL, 'https://www.epfindia.gov.in', '2026-10-22', 'Maximum assurance benefit'),
    ('edli_bonus_cap', '{"amount":175000}', '1900-01-01', NULL, 'in_force',
     'EDLI Scheme, 1976', NULL, 'https://www.epfindia.gov.in', '2026-10-22', 'Cap on the 50%-of-balance component'),
    ('tax_interest_threshold', '{"with_employer":250000,"without_employer":500000}', '1900-01-01', NULL, 'in_force',
     'Income-tax Rules, 1962', 'Rule 9D', 'https://incometaxindia.gov.in', '2026-10-22',
     'Own contributions per FY above which interest is taxable'),
    ('employer_cap', '{"amount":750000}', '1900-01-01', NULL, 'in_force',
     'Income-tax Act, 1961', 'Sec 17(2)(vii)', 'https://incometaxindia.gov.in', '2026-10-22',
     'Employer PF + NPS + superannuation per FY; excess is a perquisite'),
    ('eps_min_pension', '{"amount":1000}', '1900-01-01', NULL, 'in_force',
     'EPS 1995', NULL, 'https://www.epfindia.gov.in', '2026-10-22', 'Minimum monthly pension'),
    ('sec80c', '{"amount":150000}', '1900-01-01', NULL, 'in_force',
     'Income-tax Act, 1961', 'Sec 80C', 'https://incometaxindia.gov.in', '2026-10-22', 'Old regime only'),
    ('epf_rate_scenarios', '{"conservative":7.5,"base":8.25,"optimistic":8.5}', '1900-01-01', NULL, 'assumption',
     'ComplianceCheck assumption', NULL, NULL, '2026-10-22',
     'Future-year rates are assumptions; EPFO declares the rate every year')
ON CONFLICT (key, effective_from) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. epf_interest_rates
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.epf_interest_rates (
    fy TEXT PRIMARY KEY,
    rate NUMERIC(5,3) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('recommended', 'notified', 'credited')),
    cbt_meeting TEXT,
    decided_on DATE,
    notified_on DATE,
    source_url TEXT
);

ALTER TABLE public.epf_interest_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read EPF interest rates"
    ON public.epf_interest_rates FOR SELECT
    TO anon, authenticated
    USING (true);

INSERT INTO public.epf_interest_rates (fy, rate, status, cbt_meeting, decided_on, notified_on, source_url) VALUES
    ('2015-16', 8.80, 'credited', NULL, NULL, NULL, 'https://www.epfindia.gov.in'),
    ('2016-17', 8.65, 'credited', NULL, NULL, NULL, 'https://www.epfindia.gov.in'),
    ('2017-18', 8.55, 'credited', NULL, NULL, NULL, 'https://www.epfindia.gov.in'),
    ('2018-19', 8.65, 'credited', NULL, NULL, NULL, 'https://www.epfindia.gov.in'),
    ('2019-20', 8.50, 'credited', NULL, NULL, NULL, 'https://www.epfindia.gov.in'),
    ('2020-21', 8.50, 'credited', NULL, NULL, NULL, 'https://www.epfindia.gov.in'),
    ('2021-22', 8.10, 'credited', NULL, NULL, NULL, 'https://www.epfindia.gov.in'),
    ('2022-23', 8.15, 'credited', NULL, NULL, NULL, 'https://www.epfindia.gov.in'),
    ('2023-24', 8.25, 'credited', NULL, NULL, NULL, 'https://www.epfindia.gov.in'),
    ('2024-25', 8.25, 'credited', NULL, NULL, NULL, 'https://www.epfindia.gov.in'),
    ('2025-26', 8.25, 'notified', 'CBT 239th meeting', '2026-03-02', '2026-07-01', 'https://www.epfindia.gov.in')
ON CONFLICT (fy) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. pf_calc_sessions — no client access at all (service role only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pf_calc_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    anon_id TEXT,
    engine_version TEXT,
    params_version TEXT,
    salary_band TEXT,
    inputs JSONB,
    results_summary JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '180 days'
);

CREATE INDEX IF NOT EXISTS idx_pf_calc_sessions_expires_at ON public.pf_calc_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_pf_calc_sessions_anon_created ON public.pf_calc_sessions(anon_id, created_at);
CREATE INDEX IF NOT EXISTS idx_pf_calc_sessions_user_id ON public.pf_calc_sessions(user_id);

ALTER TABLE public.pf_calc_sessions ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies: inserts happen in a server action with the service role.

-- ---------------------------------------------------------------------------
-- 4. pf_calc_saved — owner-only
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pf_calc_saved (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
    inputs JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pf_calc_saved_user_id ON public.pf_calc_saved(user_id);

ALTER TABLE public.pf_calc_saved ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own PF saves"
    ON public.pf_calc_saved FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users insert own PF saves"
    ON public.pf_calc_saved FOR INSERT
    TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users delete own PF saves"
    ON public.pf_calc_saved FOR DELETE
    TO authenticated
    USING (user_id = (SELECT auth.uid()));

-- ---------------------------------------------------------------------------
-- 5. pf_calc_shares — no direct table access; public read by exact slug only
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pf_calc_shares (
    slug TEXT PRIMARY KEY CHECK (slug ~ '^[A-Za-z0-9_-]{8,32}$'),
    inputs JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '90 days'
);

CREATE INDEX IF NOT EXISTS idx_pf_calc_shares_expires_at ON public.pf_calc_shares(expires_at);

ALTER TABLE public.pf_calc_shares ENABLE ROW LEVEL SECURITY;
-- No SELECT policy: a policy can't restrict reads to "by slug", so a plain
-- policy would let anyone list every share. Reads go through this function.

CREATE OR REPLACE FUNCTION public.get_pf_share(p_slug TEXT)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT s.inputs
    FROM public.pf_calc_shares s
    WHERE s.slug = p_slug AND s.expires_at > NOW()
$$;

REVOKE ALL ON FUNCTION public.get_pf_share(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_pf_share(TEXT) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 6. leads — server-action inserts only; no client read
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email extensions.citext NOT NULL,
    name TEXT,
    company TEXT,
    team_size_band TEXT,
    purpose TEXT,
    source TEXT NOT NULL,                       -- e.g. 'pf_calculator'
    consent_text_version TEXT NOT NULL,
    consent_at TIMESTAMPTZ NOT NULL,
    source_session_id UUID REFERENCES public.pf_calc_sessions(id) ON DELETE SET NULL,
    withdrawn_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_source_created ON public.leads(source, created_at);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies: the PF lead form inserts via a server action
-- using the service role; nothing on the client can read leads.

-- ---------------------------------------------------------------------------
-- 7. Nightly purge (02:00 IST)
-- ---------------------------------------------------------------------------
SELECT cron.schedule(
    'pf-calc-purge-expired',
    '30 20 * * *',
    $$
      DELETE FROM public.pf_calc_sessions WHERE expires_at < NOW();
      DELETE FROM public.pf_calc_shares WHERE expires_at < NOW();
    $$
);

-- ---------------------------------------------------------------------------
-- Rollback (run manually):
--   SELECT cron.unschedule('pf-calc-purge-expired');
--   DROP FUNCTION IF EXISTS public.get_pf_share(TEXT);
--   DROP TABLE IF EXISTS public.leads, public.pf_calc_shares, public.pf_calc_saved,
--     public.pf_calc_sessions, public.epf_interest_rates, public.statutory_params;
-- ---------------------------------------------------------------------------
