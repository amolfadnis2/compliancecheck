# PF calculator — analytics

Page: `/calculator/pf` · Helpers: `src/lib/analytics/pf-events.ts` · Flags: `src/lib/feature-flags/pf.ts`

All events go through the shared `trackEvent` wrapper, so they're no-ops until PostHog loads. Nothing here changes the site-wide PostHog setup: no consent gate, and `person_profiles` is left at the project default.

## Privacy rules

- **Never sent:** email, name, phone, exact salary (Basic + DA), allowances, PF balance or corpus. Money goes out as bands only (`salary_band`, `corpus_band`).
- `sanitize()` in `pf-events.ts` drops any property key matching `/email|name|phone|salary|balance/`. The one exception is `salary_band`, which is a coarse band. A unit test checks every event (`tests/unit/pf-analytics.test.ts`).
- **URLs:** the calculator keeps its state in the query string (`?b=40000&o=200000…`), and a share slug (`?s=`) resolves to exact inputs. `pfBeforeSend` (`src/lib/analytics/pf-url-sanitizer.ts`, registered as `before_send` in `posthog-provider.tsx`) strips every non-`utm_*` param from `/calculator/pf` URLs in `$current_url`, `$referrer` and the `$initial_*` person properties.
- **Autocapture and session recordings:** the calculator root has the `ph-no-capture` class. Clicks inside it don't send element text (scenario buttons show amounts), and recordings mask the region.
- The anonymous Supabase log (`pf_calc_sessions`) stores `salary_band` and `results_summary` only, never the IP address; rate limiting uses a one-way hash.

## Common properties (every event)

| Property | Example | Source |
|---|---|---|
| `calc_version` | `1.0.0` | `ENGINE_VERSION` |
| `params_version` | `2026-10-22` | latest `statutory_params.verified_at` |

## Event dictionary

| Event | When | Properties |
|---|---|---|
| `pf_calculator_viewed` | Page mount | `entry_source` (`direct` \| `internal` \| `referral` \| `utm` \| `share_link`), `has_shared_state`, `utm_source/medium/campaign/term/content` when present |
| `pf_inputs_changed` | 1000 ms after the last valid input change (debounced) | `fields_changed[]`, `salary_band`, `hike_pct`, `basis`, `vpf_on`, `labour_code_mode` |
| `pf_calculation_completed` | On mount, and after each debounced input change | `years`, `corpus_band`, `xirr_corpus`, `xirr_own` (percent, 2 dp), `pension_eligible`, `tax_threshold_hit`, `cap_freeze`, `engine_ms` |
| `pf_scenario_toggled` | Future-rate scenario picked (input row or comparison chips) | `scenario`, `custom_rate` (custom only, else null) |
| `pf_view_toggled` | Future ₹ / Today's ₹ | `view` (`nominal` \| `real`) |
| `pf_advanced_opened` | "More options" opened | — |
| `pf_pdf_downloaded` | PDF saved | `gated` (an email was given first), `gen_ms` |
| `pf_csv_downloaded` | CSV saved | — |
| `pf_share_clicked` | Share channel used | `channel` (`copy` \| `whatsapp` \| `linkedin`) |
| `pf_saved` | Logged-in save succeeded | — |
| `pf_lead_captured` | Lead stored with consent | `purpose` (`pdf_report` \| `employer_pack`), `team_size_band` |
| `pf_cross_link_clicked` | Related-tool link | `target` (`gratuity` \| `ctc` \| `statutory_health`) |
| `pf_calc_error` | Validation errors (once per distinct set), engine or PDF failure | `error_code` (`validation`, `NO_CEILING_FOR_DATE`, `NO_RATE_FOR_FY`, `ENGINE_ERROR`, `PDF_FAILED`), `field`. Engine and PDF failures also call `posthog.captureException` |

## Funnel

`pf_calculator_viewed` → `pf_calculation_completed` → any of `pf_pdf_downloaded` | `pf_share_clicked` | `pf_saved` | `pf_lead_captured`

In PostHog: Funnel insight, conversion window 1 day, ordered steps, step 3 as an "any of" group. Break down by `entry_source` and by the `pf_pdf_gate` flag variant.

## Dashboard: "PF calculator"

| Insight | Type | Definition |
|---|---|---|
| Views and completions | Trends (daily) | `pf_calculator_viewed`, `pf_calculation_completed` (unique users) |
| Core funnel | Funnel | As above |
| Engagement actions | Trends (weekly, stacked) | `pf_pdf_downloaded`, `pf_csv_downloaded`, `pf_share_clicked`, `pf_saved` |
| Share channels | Trends, breakdown `channel` | `pf_share_clicked` |
| Lead conversion | Trends + formula | `pf_lead_captured` ÷ `pf_pdf_downloaded`, breakdown `purpose` |
| Who uses it | Trends, breakdown `salary_band` | `pf_inputs_changed` (unique users) |
| Cap freeze share | Trends, formula | `pf_calculation_completed` where `cap_freeze = true` ÷ all |
| Scenario interest | Trends, breakdown `scenario` | `pf_scenario_toggled` |
| Real vs nominal | Trends, breakdown `view` | `pf_view_toggled` |
| Cross-links | Trends, breakdown `target` | `pf_cross_link_clicked` |
| Errors | Trends, breakdown `error_code` | `pf_calc_error` |
| Engine speed | Trends, p95 of `engine_ms` | `pf_calculation_completed` |
| Params versions in use | Trends, breakdown `params_version` | `pf_calculation_completed` |

## Feature flags

Each flag resolves in this order: the PostHog value, then the env var, then the default. That keeps the page working when PostHog is blocked.

| Flag | Variants | Env fallback | Default | Effect |
|---|---|---|---|---|
| `pf_pdf_gate` | `none` \| `optional` \| `required` | `NEXT_PUBLIC_FF_PF_PDF_GATE` | `optional` | Email step before the PDF: none, skippable, or mandatory |
| `pf_default_chart` | `nominal` \| `real` | `NEXT_PUBLIC_FF_PF_DEFAULT_CHART` | `nominal` | Initial chart basis, unless the URL sets one |
| `pf_hero_metric` | `corpus` \| `return` | `NEXT_PUBLIC_FF_PF_HERO_METRIC` | `corpus` | Whether the headline leads with the corpus or the ₹1 multiple |
| `pf_employer_view_cta` | `on` \| `off` (boolean flags map true→on) | `NEXT_PUBLIC_FF_PF_EMPLOYER_CTA` | `off` | Shows the "Get the employer pack" card |
