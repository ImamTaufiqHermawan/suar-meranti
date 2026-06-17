/**
 * QA matrix for submit validation, feed query parsing, and live Supabase reads.
 * Run: npx --yes tsx scripts/qa-feed-matrix.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  aspirationSchema,
} from "../src/lib/validators";
import {
  feedQuerySchema,
  parseFeedCategory,
} from "../src/lib/feed-validators";
import { getPlainTextFromHtml, sanitizeHtml } from "../src/lib/sanitize";

type CaseResult = { name: string; pass: boolean; detail?: string };

const results: CaseResult[] = [];

function assert(name: string, condition: boolean, detail?: string) {
  results.push({ name, pass: condition, detail });
  const icon = condition ? "PASS" : "FAIL";
  console.log(`${icon} ${name}${detail ? ` — ${detail}` : ""}`);
}

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  try {
    const raw = readFileSync(envPath, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // optional for validation-only runs
  }
}

const categories = ["saran", "aspirasi", "keluhan", "pujian"] as const;

const contentFixtures = [
  {
    name: "plain paragraph",
    html: "<p>Ini pesan aspirasi warga yang cukup panjang.</p>",
    expectValid: true,
  },
  {
    name: "bold italic underline",
    html: "<p><strong>Tebal</strong> <em>miring</em> <u>garis</u> teks warga.</p>",
    expectValid: true,
  },
  {
    name: "bullet list",
    html: "<ul><li>Point satu yang panjang</li><li>Point dua yang panjang</li></ul>",
    expectValid: true,
  },
  {
    name: "ordered list",
    html: "<ol><li>Langkah pertama yang jelas</li><li>Langkah kedua yang jelas</li></ol>",
    expectValid: true,
  },
  {
    name: "heading blockquote link",
    html: '<h2>Judul aspirasi</h2><blockquote>Kutipan panjang warga</blockquote><p><a href="https://example.com">Tautan resmi</a> untuk rujukan.</p>',
    expectValid: true,
  },
  {
    name: "multiline breaks",
    html: "<p>Baris satu cukup panjang<br>Baris dua cukup panjang<br>Baris tiga cukup panjang</p>",
    expectValid: true,
  },
  {
    name: "unicode emoji indonesian",
    html: "<p>🌳 Aspirasi hijau: penanaman pohon di RT 05 — mari bersama! 🇮🇩</p>",
    expectValid: true,
  },
  {
    name: "too short",
    html: "<p>pendek</p>",
    expectValid: false,
  },
  {
    name: "empty paragraph",
    html: "<p></p>",
    expectValid: false,
  },
  {
    name: "whitespace only",
    html: "<p>&nbsp;&nbsp;&nbsp;</p>",
    expectValid: false,
  },
  {
    name: "script tag stripped then too short",
    html: '<p><script>alert("x")</script>amankan</p>',
    expectValid: false,
  },
  {
    name: "xss img onerror removed",
    html: '<p><img src=x onerror=alert(1)>Konten aman setelah sanitize panjang.</p>',
    expectValid: true,
  },
];

function runValidationMatrix() {
  console.log("\n=== Validation matrix (aspirationSchema) ===");

  for (const category of categories) {
    for (const fixture of contentFixtures) {
      const anonymousCase = aspirationSchema.safeParse({
        content: fixture.html,
        category,
        is_anonymous: true,
      });
      assert(
        `anon/${category}/${fixture.name}`,
        anonymousCase.success === fixture.expectValid,
        anonymousCase.success
          ? "valid"
          : anonymousCase.error.issues[0]?.message,
      );
    }
  }

  assert(
    "non-anonymous missing name",
    !aspirationSchema.safeParse({
      content: "<p>Konten cukup panjang untuk validasi nama.</p>",
      category: "saran",
      is_anonymous: false,
      author_name: "",
      author_address: "Blok A1",
    }).success,
  );

  assert(
    "non-anonymous missing address",
    !aspirationSchema.safeParse({
      content: "<p>Konten cukup panjang untuk validasi alamat.</p>",
      category: "saran",
      is_anonymous: false,
      author_name: "Budi",
      author_address: "AB",
    }).success,
  );

  assert(
    "non-anonymous valid profile",
    aspirationSchema.safeParse({
      content: "<p>Konten cukup panjang dengan identitas terbuka warga.</p>",
      category: "keluhan",
      is_anonymous: false,
      author_name: "Budi Santoso",
      author_address: "Blok CH.11 No. 5",
    }).success,
  );

  const longPlain = "A".repeat(2001);
  assert(
    "plain text over 2000 chars rejected",
    !aspirationSchema.safeParse({
      content: `<p>${longPlain}</p>`,
      category: "saran",
      is_anonymous: true,
    }).success,
  );

  assert(
    "invalid category rejected",
    !aspirationSchema.safeParse({
      content: "<p>Konten cukup panjang dengan kategori tidak valid.</p>",
      category: "spam",
      is_anonymous: true,
    }).success,
  );
}

function runFeedQueryMatrix() {
  console.log("\n=== Feed query matrix (feedQuerySchema + parseFeedCategory) ===");

  assert("parseFeedCategory valid", parseFeedCategory("keluhan") === "keluhan");
  assert(
    "parseFeedCategory invalid",
    parseFeedCategory("invalid") === undefined,
  );
  assert("parseFeedCategory empty", parseFeedCategory("") === undefined);

  assert(
    "default limit 10",
    feedQuerySchema.safeParse({}).success &&
      feedQuerySchema.parse({}).limit === 10,
  );

  assert(
    "limit max 20",
    feedQuerySchema.safeParse({ limit: 20 }).success,
  );
  assert(
    "limit over 20 rejected",
    !feedQuerySchema.safeParse({ limit: 21 }).success,
  );

  assert(
    "search max 100",
    feedQuerySchema.safeParse({ search: "a".repeat(100) }).success,
  );
  assert(
    "search over 100 rejected",
    !feedQuerySchema.safeParse({ search: "a".repeat(101) }).success,
  );

  for (const category of categories) {
    assert(
      `feed category ${category}`,
      feedQuerySchema.safeParse({ category }).success,
    );
  }

  assert(
    "cursor uuid required",
    feedQuerySchema.safeParse({
      cursor: {
        created_at: new Date().toISOString(),
        id: "00000000-0000-4000-8000-000000000001",
      },
    }).success,
  );
  assert(
    "cursor invalid uuid rejected",
    !feedQuerySchema.safeParse({
      cursor: { created_at: new Date().toISOString(), id: "not-a-uuid" },
    }).success,
  );
}

function runSanitizeMatrix() {
  console.log("\n=== Sanitize matrix ===");

  const dirty =
    '<p>Hello<script>alert(1)</script></p><img src=x onerror=alert(1)><iframe src="evil"></iframe>';
  const clean = sanitizeHtml(dirty);
  assert("removes script", !clean.includes("<script"));
  assert("removes iframe", !clean.includes("<iframe"));
  assert("removes img", !clean.includes("<img"));
  assert("keeps paragraph text", clean.includes("Hello"));

  const plain = getPlainTextFromHtml(
    "<ul><li>Satu</li><li>Dua</li></ul>",
  );
  assert("plain text from list", plain.includes("Satu") && plain.includes("Dua"));
}

async function runSupabaseFeedMatrix() {
  console.log("\n=== Live Supabase feed query matrix ===");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("your-project")) {
    console.log("SKIP live Supabase (env not configured)");
    return;
  }

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  const supabase = createClient(url, key);

  const baseQuery = () =>
    supabase
      .from("aspirations")
      .select("id, category, content, author_name, created_at")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(11);

  for (const category of categories) {
    const { data, error } = await baseQuery().eq("category", category);
    assert(
      `supabase filter category=${category}`,
      !error,
      error?.message ?? `rows=${data?.length ?? 0}`,
    );
    if (data) {
      assert(
        `supabase rows all ${category}`,
        data.every((row) => row.category === category),
      );
    }
  }

  const searchTerms = ["aspirasi", "jalan", "meranti", "100%", "a,b", "test'quote"];
  for (const term of searchTerms) {
    const sanitized = term.replace(/,/g, " ");
    const pattern = `%${sanitized.replace(/[%_\\]/g, "\\$&")}%`;
    const { error } = await supabase
      .from("aspirations")
      .select("id")
      .or(`content.ilike.${pattern},author_name.ilike.${pattern}`)
      .limit(5);
    assert(`supabase search "${term}"`, !error, error?.message);
  }

  const { data: firstPage, error: pageError } = await baseQuery().limit(11);
  assert("supabase first page", !pageError, pageError?.message);
  if (firstPage && firstPage.length > 10) {
    const cursor = firstPage[9];
    const { data: secondPage, error: cursorError } = await baseQuery()
      .or(
        `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`,
      )
      .limit(11);
    assert("supabase cursor page", !cursorError, cursorError?.message);
    if (secondPage) {
      const overlap = secondPage.some((row) =>
        firstPage.slice(0, 10).some((first) => first.id === row.id),
      );
      assert("cursor page no overlap with first page", !overlap);
    }
  } else {
    console.log("SKIP cursor overlap test (<11 rows in DB)");
  }
}

async function runHttpSmoke() {
  console.log("\n=== HTTP smoke (Next dev/prod) ===");
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const paths = [
    "/",
    "/?category=saran",
    "/?category=aspirasi",
    "/?category=keluhan",
    "/?category=pujian",
    "/?category=invalid",
    "/?q=aspirasi",
    "/?q=jalan%20rusak",
    "/?q=100%25",
    "/?q=a,b",
    "/?category=keluhan&q=meranti",
    "/api/health",
  ];

  for (const path of paths) {
    try {
      const res = await fetch(`${base}${path}`, { redirect: "follow" });
      const text = await res.text();
      const hasFatalError =
        text.includes("Application error") ||
        text.includes("Internal Server Error") ||
        text.includes("Export getAspirations doesn't exist");
      assert(`GET ${path}`, res.ok && !hasFatalError, `status=${res.status}`);
    } catch (error) {
      assert(
        `GET ${path}`,
        false,
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}

async function main() {
  loadEnvLocal();
  runValidationMatrix();
  runFeedQueryMatrix();
  runSanitizeMatrix();
  await runSupabaseFeedMatrix();
  await runHttpSmoke();

  const failed = results.filter((r) => !r.pass);
  console.log("\n=== Summary ===");
  console.log(`Total: ${results.length}, Passed: ${results.length - failed.length}, Failed: ${failed.length}`);
  if (failed.length > 0) {
    console.log("\nFailed cases:");
    for (const f of failed) {
      console.log(`- ${f.name}${f.detail ? `: ${f.detail}` : ""}`);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
