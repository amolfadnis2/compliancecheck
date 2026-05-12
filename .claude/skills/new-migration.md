# Skill: new-migration

Generate a Supabase migration file following this project's conventions. Prevents the two most common mistakes: missing RLS policies (writes silently rejected) and module-level client instantiation (Netlify build failures).

## Inputs to gather from the user

Before starting, confirm:
1. **Table name** — e.g. `cyber_security_assessments` (snake_case)
2. **Column definitions** — name, type, nullable, default for each custom column
3. **Anonymous writes?** — will unauthenticated users INSERT into this table? (yes/no)
4. **Linked to a user?** — does it have a `user_id UUID` column that references `auth.users`? (yes/no)
5. **Assessment type** (optional) — if this backs a new assessment, which `ASSESSMENT_TYPES` key?

---

## Step 1 — Determine filename

Use today's date + time in `YYYYMMDDHHMMSS` format with a descriptive suffix:

```
supabase/migrations/{YYYYMMDDHHMMSS}_create_{table_name}.sql
```

Read existing migrations in `supabase/migrations/` to see the highest timestamp and ensure the new one is strictly greater.

---

## Step 2 — Write the migration

**Template** (adapt columns as needed):

```sql
-- Migration: create {table_name}
-- Created: {YYYY-MM-DD}

-- ============================================================
-- TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.{table_name} (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- INSERT CUSTOM COLUMNS HERE --
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUTO-UPDATE TRIGGER (required — never omit)
-- ============================================================
CREATE TRIGGER trg_{table_name}_updated_at
  BEFORE UPDATE ON public.{table_name}
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- INDEXES
-- ============================================================
-- Add only indexes that will actually be queried:
-- CREATE INDEX IF NOT EXISTS idx_{table_name}_user_id   ON public.{table_name} (user_id);
-- CREATE INDEX IF NOT EXISTS idx_{table_name}_created   ON public.{table_name} (created_at DESC);
-- CREATE INDEX IF NOT EXISTS idx_{table_name}_status    ON public.{table_name} (status) WHERE status IS NOT NULL;

-- ============================================================
-- ROW LEVEL SECURITY (required — never omit)
-- ============================================================
ALTER TABLE public.{table_name} ENABLE ROW LEVEL SECURITY;

-- Users can read their own rows
CREATE POLICY "{table_name}_select_own"
  ON public.{table_name}
  FOR SELECT
  USING (auth.uid() = user_id);   -- omit if no user_id column

-- [ANONYMOUS WRITES — include if anonymous writes expected]
CREATE POLICY "{table_name}_insert_anon"
  ON public.{table_name}
  FOR INSERT
  WITH CHECK (true);

-- Authenticated users update their own rows
CREATE POLICY "{table_name}_update_own"
  ON public.{table_name}
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);  -- omit if no user_id column

-- ============================================================
-- GRANTS
-- ============================================================
GRANT SELECT, INSERT, UPDATE ON public.{table_name} TO anon, authenticated;
```

### Rules to follow

- **Always** include the `update_updated_at_column()` trigger — it is defined in the initial migration and exists in every environment.
- **Always** enable RLS — even for tables with no auth requirement (use `WITH CHECK (true)` for SELECT too if fully public).
- **If anonymous writes are expected** (CLAUDE.md §8): the `INSERT WITH CHECK (true)` policy is **mandatory** or writes will be silently rejected.
- **If no `user_id` column**: omit the SELECT/UPDATE policies that reference `auth.uid()` and replace with appropriate logic (or a simple `USING (true)` for public-read tables).
- **Never** edit a previously applied migration — always create a new one.

---

## Step 3 — Register the type (if applicable)

If this table backs a new assessment type, check `src/lib/constants/assessment-types.ts` and ensure the type is already registered. If not, run the `new-assessment` skill first.

---

## Validation

After writing the file:
1. Review the SQL manually — check every column name, type, and policy is correct.
2. If the Supabase MCP is available, apply via `apply_migration`. Otherwise note that the migration must be applied via `supabase db push` or the Supabase dashboard.
3. Verify the anonymous INSERT policy exists if anonymous writes are expected.
