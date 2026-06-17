"use server";

import "@/lib/supabase/tls-dev";
import { revalidatePath } from "next/cache";
import {
  createServerClient,
  isSupabaseConfigured,
  getSupabaseConnectionHint,
  isFetchFailedError,
} from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/action-result";
import type { Aspiration } from "@/types/aspiration";

export async function submitAspiration(
  formData: FormData,
): Promise<ActionResult<Aspiration>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Database belum dikonfigurasi. Hubungi pengelola sistem.",
    };
  }

  const raw = {
    content: formData.get("content")?.toString() ?? "",
    category: formData.get("category")?.toString() ?? "saran",
    is_anonymous: formData.get("is_anonymous") === "true",
    author_name: formData.get("author_name")?.toString() ?? "",
    author_address: formData.get("author_address")?.toString() ?? "",
  };

  const { aspirationSchema, prepareContentForStorage } = await import(
    "@/lib/validators"
  );

  const parsed = aspirationSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Data tidak valid";
    return { success: false, error: firstError };
  }

  const { content, category, is_anonymous, author_name, author_address } =
    parsed.data;

  const sanitizedContent = prepareContentForStorage(content);

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("aspirations")
      .insert({
        content: sanitizedContent,
        category,
        is_anonymous,
        author_name: is_anonymous ? null : (author_name ?? null),
        author_address: is_anonymous ? null : (author_address ?? null),
      })
      .select(
        "id, content, category, is_anonymous, author_name, author_address, likes_count, created_at",
      )
      .single();

    if (error) {
      const hint = isFetchFailedError(error.message)
        ? getSupabaseConnectionHint(new Error(error.message))
        : undefined;
      console.error("submitAspiration error:", error.message, hint ?? "");
      return {
        success: false,
        error: hint ?? "Gagal mengirim aspirasi. Coba lagi.",
      };
    }

    revalidatePath("/");
    return { success: true, data: data as Aspiration };
  } catch (error) {
    const hint = getSupabaseConnectionHint(error);
    console.error("submitAspiration error:", error, hint ?? "");
    return {
      success: false,
      error: hint ?? "Terjadi kesalahan server. Coba lagi.",
    };
  }
}
