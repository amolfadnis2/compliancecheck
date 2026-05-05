#!/usr/bin/env npx tsx
/**
 * PostHog Dashboard Setup for ComplianceCheck
 *
 * Creates a "ComplianceCheck Overview" dashboard with insights covering:
 *   - User acquisition & signup funnel
 *   - Assessment lifecycle funnel
 *   - Report engagement
 *   - Revenue & conversion
 *   - NPS / feedback
 *
 * Usage:
 *   POSTHOG_API_KEY=phx_... POSTHOG_PROJECT_ID=12345 npx tsx scripts/setup-posthog-dashboard.ts
 *
 * Env vars:
 *   POSTHOG_API_KEY      Personal API key (Settings → Personal API keys)
 *   POSTHOG_PROJECT_ID   Numeric project ID (visible in the URL: /project/12345/…)
 *   POSTHOG_HOST         Optional. Defaults to https://app.posthog.com
 */

const API_KEY = process.env.POSTHOG_API_KEY;
const PROJECT_ID = process.env.POSTHOG_PROJECT_ID;
const HOST = (process.env.POSTHOG_HOST ?? "https://app.posthog.com").replace(/\/$/, "");

if (!API_KEY || !PROJECT_ID) {
  console.error("Error: POSTHOG_API_KEY and POSTHOG_PROJECT_ID must be set.");
  process.exit(1);
}

const BASE = `${HOST}/api/projects/${PROJECT_ID}`;
const HEADERS = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Type aliases (just the fields we use)
// ---------------------------------------------------------------------------

interface Dashboard {
  id: number;
  name: string;
}

interface Insight {
  id: number;
  short_id: string;
  name: string;
}

// ---------------------------------------------------------------------------
// Create dashboard
// ---------------------------------------------------------------------------

async function createDashboard(name: string, description: string): Promise<Dashboard> {
  console.log(`\nCreating dashboard: "${name}"…`);
  const dashboard = await post<Dashboard>("/dashboards/", {
    name,
    description,
    pinned: true,
  });
  console.log(`  ✓ Dashboard created (id=${dashboard.id})`);
  return dashboard;
}

// ---------------------------------------------------------------------------
// Insight builders
// ---------------------------------------------------------------------------

type InsightDef = {
  name: string;
  description?: string;
  filters: Record<string, unknown>;
};

async function createInsight(def: InsightDef, dashboardId: number): Promise<Insight> {
  const insight = await post<Insight>("/insights/", {
    name: def.name,
    description: def.description ?? "",
    filters: def.filters,
    dashboards: [dashboardId],
    saved: true,
  });
  console.log(`  ✓ Insight created: "${def.name}" (short_id=${insight.short_id})`);
  return insight;
}

// ---------------------------------------------------------------------------
// Insight definitions
// ---------------------------------------------------------------------------

function trendInsight(
  name: string,
  eventIds: string[],
  opts: {
    display?: string;
    breakdown?: string;
    breakdownType?: string;
    interval?: string;
    dateFrom?: string;
    description?: string;
  } = {}
): InsightDef {
  return {
    name,
    description: opts.description,
    filters: {
      insight: "TRENDS",
      display: opts.display ?? "ActionsLineGraph",
      interval: opts.interval ?? "day",
      date_from: opts.dateFrom ?? "-30d",
      events: eventIds.map((id) => ({ id, name: id, type: "events", math: "total" })),
      ...(opts.breakdown
        ? {
            breakdown: opts.breakdown,
            breakdown_type: opts.breakdownType ?? "event",
          }
        : {}),
    },
  };
}

function funnelInsight(name: string, steps: string[], opts: { dateFrom?: string; description?: string } = {}): InsightDef {
  return {
    name,
    description: opts.description,
    filters: {
      insight: "FUNNELS",
      funnel_viz_type: "steps",
      date_from: opts.dateFrom ?? "-30d",
      events: steps.map((id) => ({ id, name: id, type: "events" })),
    },
  };
}

function retentionInsight(name: string, eventId: string, opts: { description?: string } = {}): InsightDef {
  return {
    name,
    description: opts.description,
    filters: {
      insight: "RETENTION",
      date_from: "-8w",
      period: "Week",
      retention_type: "retention_recurring",
      target_entity: { id: eventId, name: eventId, type: "events" },
      returning_entity: { id: eventId, name: eventId, type: "events" },
    },
  };
}

function hogqlInsight(name: string, query: string, opts: { description?: string } = {}): InsightDef {
  return {
    name,
    description: opts.description,
    filters: {
      insight: "SQL",
      query,
    },
  };
}

// ---------------------------------------------------------------------------
// All insights grouped by section
// ---------------------------------------------------------------------------

function buildInsightDefs(): InsightDef[] {
  return [
    // ── 1. User Acquisition ─────────────────────────────────────────────────

    trendInsight("Daily Signups", ["user_signed_up"], {
      description: "New user registrations per day (last 30 days)",
    }),

    trendInsight("Signup Method Breakdown", ["user_signed_up"], {
      display: "ActionsBar",
      breakdown: "method",
      description: "Signups split by auth method: email, google, magic_link",
    }),

    trendInsight("UTM Source Breakdown", ["user_signed_up"], {
      display: "ActionsBar",
      breakdown: "utm_source",
      breakdownType: "event",
      description: "Which marketing channels are driving signups",
    }),

    {
      name: "Daily Active Users (DAU)",
      description: "Unique daily active users based on page views",
      filters: {
        insight: "TRENDS",
        display: "ActionsLineGraph",
        interval: "day",
        date_from: "-30d",
        events: [{ id: "$pageview", name: "$pageview", type: "events", math: "dau" }],
      },
    },

    trendInsight("Organizations Created", ["organization_created"], {
      description: "New company profiles created per day",
    }),

    // ── 2. Assessment Funnel ─────────────────────────────────────────────────

    funnelInsight(
      "Assessment Completion Funnel",
      ["assessment_started", "assessment_completed"],
      {
        description:
          "Core funnel: how many users who start an assessment actually finish it",
      }
    ),

    trendInsight("Assessments Started by Type", ["assessment_started"], {
      display: "ActionsBar",
      breakdown: "assessment_type",
      description:
        "Which compliance modules are most popular (statutory_health, labour_code, dpdp, posh, food_business, auto_dealer)",
    }),

    trendInsight("Assessments Completed by Type", ["assessment_completed"], {
      display: "ActionsBar",
      breakdown: "assessment_type",
      description: "Completions per assessment module",
    }),

    trendInsight("Assessment Abandonment Rate", ["assessment_abandoned"], {
      breakdown: "assessment_type",
      description:
        "Users who left mid-assessment — broken down by module to find friction points",
    }),

    hogqlInsight(
      "Avg Compliance Score by Assessment Type",
      `SELECT
         properties.assessment_type AS assessment_type,
         round(avg(toFloat64OrNull(properties.compliance_score)), 1) AS avg_score,
         count() AS assessments
       FROM events
       WHERE event = 'assessment_completed'
         AND timestamp >= now() - interval 30 day
       GROUP BY assessment_type
       ORDER BY assessments DESC`,
      {
        description:
          "Average compliance score (0–100) per assessment type over the last 30 days",
      }
    ),

    hogqlInsight(
      "High-Priority Gaps Distribution",
      `SELECT
         properties.assessment_type,
         avg(toFloat64OrNull(properties.high_priority_gaps)) AS avg_high_gaps,
         avg(toFloat64OrNull(properties.gap_count)) AS avg_total_gaps
       FROM events
       WHERE event = 'assessment_completed'
         AND timestamp >= now() - interval 30 day
       GROUP BY properties.assessment_type
       ORDER BY avg_high_gaps DESC`,
      { description: "Average number of high-priority compliance gaps found per assessment type" }
    ),

    trendInsight("Assessment Progress Milestones", ["assessment_progress"], {
      display: "ActionsLineGraph",
      breakdown: "completion_percentage",
      description:
        "How many users reach 25%, 50%, 75% progress — identifies where drop-off occurs",
    }),

    hogqlInsight(
      "Avg Time to Complete Assessment (minutes)",
      `SELECT
         properties.assessment_type,
         round(avg(toFloat64OrNull(properties.time_to_complete_seconds)) / 60, 1) AS avg_minutes
       FROM events
       WHERE event = 'assessment_completed'
         AND timestamp >= now() - interval 30 day
       GROUP BY properties.assessment_type
       ORDER BY avg_minutes DESC`,
      { description: "How long users spend completing each assessment type" }
    ),

    // ── 3. Report Engagement ─────────────────────────────────────────────────

    {
      name: "Report Actions (viewed / downloaded / emailed)",
      description: "Volume of each report action over the last 30 days",
      filters: {
        insight: "TRENDS",
        display: "ActionsLineGraph",
        interval: "day",
        date_from: "-30d",
        events: [
          { id: "report_viewed", name: "Report Viewed", type: "events", math: "total" },
          { id: "report_downloaded", name: "Report Downloaded", type: "events", math: "total" },
          { id: "report_emailed", name: "Report Emailed", type: "events", math: "total" },
        ],
      },
    },

    funnelInsight(
      "Report Engagement Funnel",
      ["assessment_completed", "report_viewed", "report_downloaded"],
      {
        description:
          "What share of users who finish an assessment go on to view and download their report",
      }
    ),

    trendInsight("Documents Generated", ["document_generated"], {
      display: "ActionsBar",
      breakdown: "document_type",
      description:
        "Policy / letter / certificate / consent_form documents generated per day",
    }),

    // ── 4. Revenue & Conversion ──────────────────────────────────────────────

    funnelInsight(
      "Pricing → Checkout → Paid Funnel",
      ["pricing_page_viewed", "checkout_started", "subscription_upgraded"],
      {
        description:
          "Conversion from pricing page view through checkout to a paid subscription",
      }
    ),

    trendInsight("Checkout Started", ["checkout_started"], {
      breakdown: "plan",
      description: "Checkout attempts broken down by plan (pro / enterprise)",
    }),

    trendInsight("Subscriptions Upgraded", ["subscription_upgraded"], {
      description: "New paid subscriptions over time",
    }),

    hogqlInsight(
      "Revenue (INR) over Time",
      `SELECT
         toStartOfDay(timestamp) AS day,
         sum(toFloat64OrNull(properties.revenue_inr)) AS total_inr
       FROM events
       WHERE event = 'subscription_upgraded'
         AND timestamp >= now() - interval 30 day
       GROUP BY day
       ORDER BY day`,
      { description: "Total subscription revenue (INR) per day" }
    ),

    trendInsight("Feature Gate Hits", ["feature_gate_hit"], {
      display: "ActionsBar",
      breakdown: "feature",
      description:
        "Which paywalled features (pdf_export, assessment_limit, templates…) users are hitting most — conversion intent signals",
    }),

    trendInsight("Pricing Page Source", ["pricing_page_viewed"], {
      display: "ActionsBar",
      breakdown: "source",
      description:
        "What drives users to the pricing page: feature_gate, navbar, assessment_complete, etc.",
    }),

    // ── 5. User Retention ────────────────────────────────────────────────────

    retentionInsight("Weekly User Retention", "user_logged_in", {
      description:
        "8-week retention cohort — what share of users return to log in each week",
    }),

    // ── 6. NPS & Feedback ────────────────────────────────────────────────────

    hogqlInsight(
      "Average NPS Score by Assessment Type",
      `SELECT
         properties.assessment_type,
         round(avg(toFloat64OrNull(properties.nps_score)), 1) AS avg_nps,
         countIf(properties.would_recommend = 'true') AS promoters,
         count() AS responses
       FROM events
       WHERE event = 'feedback_submitted'
         AND timestamp >= now() - interval 90 day
       GROUP BY properties.assessment_type
       ORDER BY avg_nps DESC`,
      { description: "NPS score and promoter count per assessment type (last 90 days)" }
    ),

    trendInsight("Feedback Submissions", ["feedback_submitted"], {
      description: "Volume of post-assessment feedback submissions over time",
    }),
  ];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\nPostHog Dashboard Setup — ComplianceCheck`);
  console.log(`Host: ${HOST}  Project: ${PROJECT_ID}\n`);

  const dashboard = await createDashboard(
    "ComplianceCheck Overview",
    [
      "End-to-end business metrics for ComplianceCheck — an Indian SME compliance SaaS.",
      "Sections: User Acquisition · Assessment Funnel · Report Engagement · Revenue & Conversion · Retention · NPS.",
    ].join(" ")
  );

  const insights = buildInsightDefs();
  console.log(`\nCreating ${insights.length} insights…`);

  let created = 0;
  let failed = 0;

  for (const def of insights) {
    try {
      await createInsight(def, dashboard.id);
      created++;
    } catch (err) {
      console.error(`  ✗ Failed: "${def.name}" — ${(err as Error).message}`);
      failed++;
    }
  }

  console.log(`\n✅  Done — ${created} insights created, ${failed} failed.`);
  console.log(`\nDashboard URL:`);
  console.log(`  ${HOST}/project/${PROJECT_ID}/dashboard/${dashboard.id}\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
