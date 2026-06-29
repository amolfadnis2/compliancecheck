# ComplianceCheck Growth Strategy — SEO, LLMs & Social

A playbook for getting qualified Indian SME traffic to ComplianceCheck through
three compounding channels: organic search, LLM/answer-engine citations, and
(automated) social/community syndication.

This document pairs with code shipped in the same change. Sections marked
**[shipped]** already exist in the repo; **[do]** items are your execution list.

---

## 1. Current state & gaps

**Strong foundation already in place:** dynamic `sitemap.ts` + `robots.ts`,
per-page metadata with OG/Twitter cards, canonical URLs, and JSON-LD on the root
and the penalty calculator. 7 assessment landing pages and 3 free calculators.

**The gaps this strategy closes:**

| Gap | Why it matters | Status |
| --- | --- | --- |
| No content (blog/guides) | The biggest source of long-tail search + LLM citations | **[shipped]** MDX engine + 3 seed posts |
| No programmatic pages | State-level queries are high-intent and near-infinite | **[shipped]** `/guides/[state]` for all 36 states/UTs |
| No LLM policy / `llms.txt` | Answer engines need a clean map + permission to cite | **[shipped]** `/llms.txt` + AI-crawler allows |
| Thin structured data | Rich results + AEO need Service/FAQ/Breadcrumb schema | **[shipped]** schema helpers on all landing pages |
| No social motion | Distribution; you have no time for manual posting | **[shipped]** RSS + draft generator + Action |

---

## 2. Pillar A — SEO

### Keyword clusters to own

1. **Deadline/penalty-driven** (highest intent): "labour code 2025 compliance",
   "DPDP Act 2023 penalty", "POSH annual report due date". These map directly to
   assessment landing pages.
2. **Free-tool intent** (top-of-funnel volume): "CTC calculator", "gratuity
   calculator", "PF ESI penalty calculator". Already strong — keep the tools
   fast and link them into related guides.
3. **Persona pain** (mid-funnel): "HR compliance checklist India", "statutory
   compliance for startups", "what licenses does a restaurant need in India".
   These map to blog guides.
4. **Programmatic state×law long-tail**: "professional tax Maharashtra", "shops
   and establishment act Karnataka", "labour welfare fund Tamil Nadu". One page
   per state, **[shipped]** at `/guides/[state]`.

### Content hub & internal linking

Run a hub-and-spoke model: **guides (spokes) → landing pages → assessment (hub)**.
- Every blog post ends with an `AssessmentCTA` to its `relatedAssessment`.
- Every state guide funnels to the State-Wise assessment.
- **[do]** Add contextual links from high-traffic calculators into 1–2 relevant
  guides (e.g. the gratuity calculator → the Labour Codes guide).

### E-E-A-T (experience, expertise, authority, trust)

- Author byline + `Published`/`Reviewed` dates render on every article. **[do]**
  Keep `lastReviewed` current; stale legal content loses rankings and trust.
- Cite the actual statute in each guide (the assessments already do this well).
- **[do]** Add an "About / who we are" trust block and link policies in the footer.

### Technical hygiene (mostly done)

- Sitemap now auto-includes assessments, blog posts, and all state guides. **[do]**
  Submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools.
- **[do]** Set up Search Console and watch impressions/clicks per cluster monthly.

---

## 3. Pillar B — LLM / Answer-Engine Optimization (AEO)

LLMs (ChatGPT, Claude, Perplexity, Google AI Overviews) increasingly answer
"how do I comply with X in India" directly. Being the cited source is free,
pre-qualified traffic.

### Make it crawlable & quotable [shipped]

- **`robots.ts`** now explicitly *allows* GPTBot, ClaudeBot, PerplexityBot,
  Google-Extended, etc. (We want citations, not walls.)
- **`/llms.txt`** is a curated, machine-readable index of assessments, free
  tools, and guides — generated from the same constants as the UI.
- **Structured data** (Service, FAQPage, BreadcrumbList, BlogPosting) on landing
  pages, guides, and articles gives models clean facts to lift.

### Content patterns that get cited [do]

- **Answer-first**: open each guide with a 1–2 sentence definitive answer to the
  title question (the seed posts already do this). Models quote the top.
- **FAQ blocks**: every guide/landing page carries `FAQPage` schema — expand the
  FAQ sets in `src/lib/seo/assessment-meta.ts` as you learn real questions.
- **Original, citable data**: your "penalty exposure across 18+ laws" is a unique
  asset. **[do]** Publish a methodology/data guide models can reference.
- **Comparison & listicle pages**: "Labour Code vs old labour laws", "every
  license a restaurant needs" — these over-index in AI answers.

### Measure it [do]

- Track referral sessions from `chat.openai.com`, `perplexity.ai`,
  `gemini.google.com` in PostHog. A rising trend = AEO is working.

---

## 4. Pillar C — Social / Community (automated)

You don't have time for manual posting, so the system is **publish once →
syndicate everywhere**, with a human glance only where accuracy matters.

### The pipeline [shipped]

1. Write an MDX article in `content/blog/`.
2. **`/feed.xml`** (RSS) updates automatically.
3. **`scripts/generate-social.mjs`** turns each article into per-platform drafts
   (LinkedIn, X, Reddit, Quora, WhatsApp) in `content/social/<slug>.json`.
4. **`.github/workflows/social-syndication.yml`** runs the generator on every
   article push, commits the drafts, and — if you set a `SOCIAL_WEBHOOK_URL`
   repo secret — pings a scheduler.

### Turning it fully hands-off [do]

Pick one and connect it to `/feed.xml` once:
- **Buffer / Hypefury / Publer**: native "RSS → auto-queue" for LinkedIn + X.
- **Zapier / Make / n8n**: "New item in RSS" → format → post. Most flexible;
  can read the richer `content/social/*.json` drafts via the GitHub webhook.

Set the cadence (e.g. 1 LinkedIn + 1 X per article on publish, then evergreen
re-shares weekly). After that, publishing an article *is* the social campaign.

### Where to engage (the drafts are tailored for these)

- **LinkedIn**: highest fit — HR managers, founders, compliance pros. Post as the
  brand + (ideally) the founder's personal profile (2–3× the reach).
- **Reddit**: r/IndianStartups, r/india, r/legaladviceindia, r/StartUpIndia.
  Value-first; the generated Reddit draft leads with the answer and links softly.
- **Quora India**: answer existing "DPDP/POSH/labour code" questions with the
  generated answer + link. Quora answers rank in Google too.
- **WhatsApp/Telegram**: founder & HR groups; the WhatsApp draft is short and
  forwardable.

> Community etiquette: lead with genuine value, disclose affiliation, never spam.
> One great Reddit/Quora answer beats ten link drops and won't get you banned.

### Link-bait assets [shipped + do]

- Free calculators are your best backlink magnets. **[shipped]** branded dynamic
  OG images + `ShareButtons` make every page shareable.
- **[do, later]** Build `/embed/*` iframe versions of the calculators so other
  Indian HR/finance blogs can embed them — each embed is a backlink.

---

## 5. Measurement

### UTM convention

Tag every off-site link: `?utm_source=<linkedin|reddit|quora|whatsapp>&utm_medium=social&utm_campaign=<slug>`.
For LLM-surfaced links you can't tag; use referrer trends instead.

### PostHog funnel (events already exist)

`pageview` → `assessment_started` → `assessment_completed` →
`pricing_page_viewed` → `checkout_started`. Break down by `utm_source` and
landing path to see which channel and which content actually convert.

### North-star & guardrails

- North star: **`assessment_started` per week from organic + referral**.
- Watch: organic impressions (Search Console), AI-referrer sessions, blog →
  assessment CTR, and cost per started assessment by channel.

---

## 6. Prioritized roadmap

### Now (this change) [shipped]
- MDX blog engine + 3 seed guides; programmatic state guides; `llms.txt`;
  AI-crawler policy; Service/FAQ/Breadcrumb schema on all landing pages; RSS +
  social draft generator + GitHub Action; dynamic OG images; share buttons;
  sitemap auto-includes everything.

### Next 30 days [do]
- Submit sitemaps to Google/Bing; set up Search Console.
- Connect `/feed.xml` to one scheduler (Buffer or Make) — go hands-off.
- Publish 4 more guides targeting deadline keywords (one per assessment).
- Enrich `STATE_DETAILS` for the top 10 economy states.
- Answer 5 existing Quora/Reddit questions using the generated drafts.

### Next 90 days [do]
- 2 guides/week cadence (the Action syndicates each automatically).
- Build embeddable calculator widgets for backlinks.
- Publish the "penalty exposure methodology" data guide as an AEO asset.
- Pursue 5–10 guest posts / directory listings on Indian HR & startup sites.
- Review PostHog by channel; double down on the cluster with the best
  cost-per-`assessment_started`.

---

## 7. How the code fits together

| Need | Where |
| --- | --- |
| Add an article | Create `content/blog/<slug>.mdx` with frontmatter |
| Article → social drafts | `node scripts/generate-social.mjs` (or auto via Action) |
| Assessment SEO facts (blurb, FAQ, routes) | `src/lib/seo/assessment-meta.ts` |
| Schema builders | `src/lib/seo/schema.ts` + `<JsonLd />` |
| LLM site map | `src/app/llms.txt/route.ts` |
| RSS feed | `src/app/feed.xml/route.ts` |
| State guide data | `src/lib/content/state-compliance.ts` |
| OG image card | `src/lib/seo/og.tsx` |

*Last updated: 2026-06-29.*
