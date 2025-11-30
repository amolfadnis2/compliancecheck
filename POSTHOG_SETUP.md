# PostHog + NPS Feedback Setup

## What Was Added

### 1. PostHog Analytics
- **File:** `src/components/providers/posthog-provider.tsx`
- Tracks pageviews, download clicks, feedback submissions

### 2. NPS Feedback Form  
- **File:** `src/components/feedback/feedback-form.tsx`
- 3-step modal: NPS score → Value/UI questions → Features/Comments
- Appears before PDF download

### 3. Feedback API
- **File:** `src/app/api/feedback/route.ts`
- Saves to Supabase `feedback` table

### 4. Database Migration
- **File:** `supabase/migrations/002_feedback_table.sql`
- Run this in Supabase SQL Editor

---

## Setup Steps

### Step 1: Get PostHog Key (5 min)
1. Go to https://posthog.com and sign up (free: 1M events/month)
2. Create a project
3. Copy Project API Key from Settings → Project

### Step 2: Add Key to .env.local
```
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
```

### Step 3: Run Database Migration
1. Go to Supabase Dashboard → SQL Editor
2. Paste contents of `supabase/migrations/002_feedback_table.sql`
3. Click Run

### Step 4: Test Locally
```bash
cd C:\Users\amol.fadnis\compliancecheck
npm run dev
```

1. Complete an assessment
2. Click "Download PDF Report"
3. Feedback form should appear
4. Complete feedback → PDF downloads

### Step 5: Deploy
```bash
git add .
git commit -m "Add PostHog analytics and NPS feedback"
git push
```

---

## Events Tracked

| Event | When | Properties |
|-------|------|------------|
| `$pageview` | Every page | URL |
| `download_report_clicked` | Download button clicked | assessment_type, assessment_id |
| `feedback_submitted` | Feedback completed | nps_score, all answers |
| `feedback_skipped` | User skipped feedback | assessment_type |
| `report_downloaded` | PDF generated | assessment_type, score |

---

## Feedback Questions

**Step 1:** NPS (0-10)

**Step 2:**
- Did this assessment provide value?
- Would you share with other business owners?
- How was the user interface?

**Step 3:**
- How useful is the compliance report?
- Was the time investment reasonable?
- What features would you like? (multi-select)
- Additional comments (optional)

---

## Troubleshooting

**PostHog not tracking?**
- Check NEXT_PUBLIC_POSTHOG_KEY is set
- Ad blockers may block PostHog

**Feedback not saving to DB?**
- Run the SQL migration
- Check Supabase feedback table exists

**PDF not generating?**
- Ensure jspdf is installed: `npm install jspdf`
