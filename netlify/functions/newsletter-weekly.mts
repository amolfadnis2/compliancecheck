import type { Config } from "@netlify/functions";

// Every Monday ~9:00 IST: ask the site to build this week's newsletter draft.
// The draft route emails NEWSLETTER_APPROVER_EMAIL for approval; nothing is
// sent to subscribers from here.
export default async function handler() {
  const secret = process.env.NEWSLETTER_SECRET;
  const site = (process.env.URL || "https://compliancecheck.co.in").replace(/\/$/, "");

  if (!secret) {
    console.error("newsletter-weekly: NEWSLETTER_SECRET is not set");
    return new Response("missing env vars", { status: 500 });
  }

  const res = await fetch(`${site}/api/newsletter/draft`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}` },
  });
  const body = await res.text();
  console.log(`newsletter-weekly: ${res.status} ${body}`);
  return new Response(body, { status: res.status });
}

export const config: Config = {
  // 03:20 UTC Monday = 08:50 IST
  schedule: "20 3 * * 1",
};
