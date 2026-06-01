import type { Config } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

// Runs every 4 days to prevent Supabase free-tier project from pausing (pauses after 7 days idle).
export default async function handler() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("keep-alive: missing Supabase env vars");
    return new Response("missing env vars", { status: 500 });
  }

  const supabase = createClient(url, key);
  const { error } = await supabase.from("assessments").select("id").limit(1);

  if (error) {
    console.error("keep-alive: ping failed", error.message);
    return new Response(`ping failed: ${error.message}`, { status: 500 });
  }

  console.log("keep-alive: Supabase ping OK at", new Date().toISOString());
  return new Response("ok", { status: 200 });
}

export const config: Config = {
  // Every 4 days at 06:00 UTC (well within the 7-day pause window)
  schedule: "0 6 */4 * *",
};
