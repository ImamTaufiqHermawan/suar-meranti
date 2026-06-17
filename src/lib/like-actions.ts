"use server";

import "@/lib/supabase/tls-dev";
import { revalidatePath } from "next/cache";
import {
  createServerClient,
  isSupabaseConfigured,
  getSupabaseConnectionHint,
} from "@/lib/supabase/server";
import { visitorIdSchema } from "@/lib/visitor-validators";
import type { ActionResult } from "@/lib/action-result";

export async function getLikedAspirationIds(
  visitorId: string,
): Promise<string[]> {
  const parsed = visitorIdSchema.safeParse(visitorId);
  if (!parsed.success || !isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("aspiration_likes")
      .select("aspiration_id")
      .eq("visitor_id", parsed.data);

    if (error) {
      console.error("getLikedAspirationIds error:", error.message);
      return [];
    }

    return data?.map((row) => row.aspiration_id as string) ?? [];
  } catch (error) {
    console.error("getLikedAspirationIds error:", error);
    return [];
  }
}

export async function likeAspiration(
  id: string,
  visitorId: string,
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Database belum dikonfigurasi." };
  }

  const visitorParsed = visitorIdSchema.safeParse(visitorId);
  if (!visitorParsed.success) {
    return { success: false, error: "Identitas perangkat tidak valid." };
  }

  try {
    const supabase = createServerClient();

    const { error: insertError } = await supabase
      .from("aspiration_likes")
      .insert({
        aspiration_id: id,
        visitor_id: visitorParsed.data,
      });

    if (insertError) {
      if (insertError.code === "23505") {
        return {
          success: false,
          error: "Anda sudah menyukai postingan ini.",
        };
      }
      console.error("likeAspiration error:", insertError.message);
      return { success: false, error: "Gagal menyukai posting." };
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    const hint = getSupabaseConnectionHint(error);
    console.error("likeAspiration error:", error, hint ?? "");
    return { success: false, error: hint ?? "Terjadi kesalahan server." };
  }
}
