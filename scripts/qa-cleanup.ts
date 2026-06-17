/** Cleanup orphaned QA rows from integration test runs. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("aspirations")
    .delete()
    .or("content.ilike.%QA-%,content.ilike.%QAHTTP-%,content.ilike.%BROWSERTEST%")
    .select("id");
  if (error) {
    console.error(error.message);
    process.exit(1);
  }
  console.log(`Deleted ${data?.length ?? 0} orphaned QA rows`);
}

main();
