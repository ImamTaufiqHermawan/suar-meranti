import "./tls-dev";
import { createClient } from "@supabase/supabase-js";

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  if (!value) return undefined;
  return value.trim().replace(/^["']|["']$/g, "");
}

export function createServerClient() {
  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    readEnv("NEXT_PUBLIC_SUPABASE_URL") &&
      readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  );
}

export function isFetchFailedError(message: string): boolean {
  return message.toLowerCase().includes("fetch failed");
}

export function getSupabaseConnectionHint(error: unknown): string | undefined {
  if (!(error instanceof Error)) return undefined;

  const message = error.message.toLowerCase();
  const cause = String(error.cause ?? "").toLowerCase();

  if (
    message.includes("fetch failed") ||
    cause.includes("self_signed_cert") ||
    cause.includes("unable to verify") ||
    cause.includes("certificate")
  ) {
    return (
      "Koneksi ke Supabase gagal (proxy SSL kantor). Stop server lalu jalankan ulang: npm run dev"
    );
  }

  return undefined;
}
