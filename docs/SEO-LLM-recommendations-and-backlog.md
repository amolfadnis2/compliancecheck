# ComplianceCheck Blog — SEO + LLM/AEO Playbook & Topic Backlog

Prepared 3 July 2026. Covers: (1) why these 3 articles were chosen, (2) technical steps to make the blog rank on Google *and* get cited by LLMs (ChatGPT, Gemini, Perplexity, Claude), (3) a prioritised topic backlog.

---

## 1. The three drafts delivered

| Article | Maps to assessment | Why it's a strong bet |
| --- | --- | --- |
| FSSAI Licence in 2026: New Turnover Limits & Perpetual Validity | Food Business (Rs 999) | Timely — rules changed March 2026, so it's fresh and low-competition on the new angle. "FSSAI registration" is one of the highest-volume compliance queries in India. |
| PF & ESI Applicability: The Employer's Plain-English Guide | Statutory Health Check (Rs 499) | Evergreen, huge search volume ("PF ESI applicability", "ESI wage limit"). Every growing employer searches this. |
| Professional Tax State-Wise Rates & Slabs (2026) | Which Laws Apply to My Business? (Rs 499) | Table-heavy, factual, state-specific — exactly the format LLMs love to quote. Ranks for dozens of "professional tax in [state]" long-tail queries. |

Each draft already includes the AEO building blocks below (TL;DR summary block, structured tables, an FAQ section, cited sources, and a mapped CTA).

---

## 2. Winning on Google (traditional SEO)

**Structured data — highest priority.** Add JSON-LD to every post:
- `Article` schema (headline, datePublished, dateModified, author, publisher).
- `FAQPage` schema built from each article's FAQ section — this earns FAQ rich results and is disproportionately favoured by AI Overviews.
- `BreadcrumbList` for Home > Guides > Article.

**On-page basics (mostly done in the drafts):**
- One `<h1>`, descriptive `<h2>`/`<h3>` with the query in them.
- Primary keyword in title, first 100 words, one subheading, and meta description (already set in frontmatter).
- Meta descriptions under 160 characters.
- Descriptive image `alt` text; the existing OG image setup is good.

**Internal linking — currently the biggest gap.** The 3 articles should link to each other and to older posts ("PF & ESI" → "Labour Codes 2025"; "Professional Tax" → "state-wise assessment"). Also link *from* homepage/assessment landing pages *into* the relevant guide. This spreads authority and keeps readers on-site.

**Freshness signal.** Put a visible "Last updated" date on each post and bump `dateModified` when you revise. Compliance content decays fast — Google rewards maintained pages.

**Technical hygiene.** Ensure `sitemap.xml` lists every post, canonical tags are self-referential (already in frontmatter), and Core Web Vitals stay green (the site is Next.js/Netlify, so this should be fine).

---

## 3. Winning with LLMs (Answer Engine Optimisation / AEO)

LLMs cite sources that are (a) crawlable, (b) factual and self-contained, (c) clearly structured. Tactics:

1. **Lead with a direct answer.** Each draft opens with a "Key facts at a glance" block — an LLM can lift this verbatim. Keep doing this on every post.
2. **Question-shaped headings + FAQ.** LLMs match user questions to H2s phrased as questions and to FAQ blocks. All 3 drafts do this.
3. **State facts atomically.** "ESI applies at 10+ employees; wage ceiling Rs 21,000/month." Short, self-contained, quotable — no facts buried in long paragraphs.
4. **Tables for comparative data.** State-wise slabs, thresholds, fees. Highly extractable.
5. **Cite primary sources** (epfindia.gov.in, fssai.gov.in, labour.gov.in). LLMs weight pages that themselves cite authoritative sources.
6. **Allow the crawlers.** In `robots.txt`, explicitly allow `GPTBot`, `OAI-SearchBot`, `PerplexityBot`, `Google-Extended`, `ClaudeBot`, `CCBot`. If any are blocked, you're invisible to those models. This is a one-line config change with outsized impact.
7. **Entity consistency.** Always write "Professional Tax (PT)", "Employees' State Insurance (ESI)" — consistent naming helps models associate your page with the concept.
8. **Publish dates and update dates in machine-readable form** (already in `article:published_time` / `article:modified_time` meta). LLMs prefer recent, dated content for regulatory topics.

**One-time infra checklist:**
- [ ] Add `FAQPage` + `Article` JSON-LD to the post template.
- [ ] Confirm `robots.txt` allows the AI crawlers listed above.
- [ ] Add visible "Last updated" dates.
- [ ] Add cross-links between all guides.
- [ ] Submit updated `sitemap.xml` in Google Search Console.

---

## 4. Prioritised topic backlog

Ranked by SEO value × conversion fit. P1 = write next.

### P1 — high volume, direct conversion
1. **GST Registration Threshold & Rules for Small Businesses (2026)** — huge volume; pairs with food/auto assessments.
2. **DPDP Act: What SMEs Must Do Before the May 2027 Deadline** — deepens the existing DPDP post; countdown urgency → DPDP assessment (Rs 2,499).
3. **Gratuity Calculation Explained (with the New Labour Code Formula)** — high volume; drives the free gratuity calculator, then statutory assessment.
4. **Shops & Establishments Registration: State-by-State Guide** — evergreen, table-rich, LLM-friendly; → state-wise assessment.

### P2 — strong long-tail, good citability
5. **Cost of Non-Compliance: Penalty Exposure Across Indian Labour & Data Laws** — links the free penalty calculator; excellent LLM listicle.
6. **POSH Act: Do You Need an Internal Committee? (Applicability & Penalties)** — complements existing ICC post; → POSH assessment (Rs 1,999).
7. **CTC vs In-Hand Salary: How PF, ESI, PT and TDS Reduce Take-Home** — massive employee-side volume; drives the free CTC calculator.
8. **Minimum Wages Under the Code on Wages: A State-Wise Overview** — evergreen, updates often (freshness wins).

### P3 — niche / authority-building
9. **Auto Dealership Compliance Checklist (Labour, CMVR, IRDAI MISP, DPDP)** — low competition, high-value; → auto-dealer assessment (Rs 2,999).
10. **Fire NOC & Liquor Licence for Restaurants: State Requirements** — complements the FSSAI post; internal-link cluster for food.
11. **Maternity Benefit Act: Employer Obligations & the 26-Week Rule** — evergreen HR query.
12. **Labour Welfare Fund: Rates & Due Dates by State** — pairs with the PT post as a "state compliance" cluster.

**Cluster strategy:** group posts into three pillar clusters — *Statutory/Payroll* (PF/ESI, PT, LWF, gratuity, CTC), *Food & Industry* (FSSAI, Fire NOC, auto dealer), and *Data & Workplace* (DPDP, POSH). Interlink densely within each cluster and point them all at the matching assessment. This is what builds topical authority for both Google and LLMs.

---

## 5. Suggested cadence
Publish 1–2 posts/week, refresh the top 3 performers quarterly (compliance figures change), and re-submit the sitemap after each batch. Track which posts get cited in AI answers by periodically querying ChatGPT/Perplexity with your target questions and checking whether ComplianceCheck is referenced.
