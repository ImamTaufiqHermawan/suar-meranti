"use server";

import "@/lib/supabase/tls-dev";
import { revalidatePath } from "next/cache";
import {
  createServerClient,
  isSupabaseConfigured,
  getSupabaseConnectionHint,
  isFetchFailedError,
} from "@/lib/supabase/server";
import { aspirationSchema } from "@/lib/validators";
import type { Aspiration } from "@/types/aspiration";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function getAspirations(): Promise<Aspiration[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("aspirations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      const hint = isFetchFailedError(error.message)
        ? getSupabaseConnectionHint(new Error(error.message))
        : undefined;
      console.error("getAspirations error:", error.message, hint ?? "");
      return [];
    }

    return (data as Aspiration[]) ?? [];
  } catch (error) {
    const hint = getSupabaseConnectionHint(error);
    console.error("getAspirations error:", error, hint ?? "");
    return [];
  }
}

export async function submitAspiration(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
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

  const parsed = aspirationSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Data tidak valid";
    return { success: false, error: firstError };
  }

  const { content, category, is_anonymous, author_name, author_address } =
    parsed.data;

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("aspirations")
      .insert({
        content,
        category,
        is_anonymous,
        author_name: is_anonymous ? null : (author_name ?? null),
        author_address: is_anonymous ? null : (author_address ?? null),
      })
      .select("id")
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
    return { success: true, data: { id: data.id } };
  } catch (error) {
    const hint = getSupabaseConnectionHint(error);
    console.error("submitAspiration error:", error, hint ?? "");
    return {
      success: false,
      error: hint ?? "Terjadi kesalahan server. Coba lagi.",
    };
  }
}

export async function likeAspiration(id: string): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Database belum dikonfigurasi." };
  }

  try {
    const supabase = createServerClient();
    const { data: current, error: fetchError } = await supabase
      .from("aspirations")
      .select("likes_count")
      .eq("id", id)
      .single();

    if (fetchError || !current) {
      return { success: false, error: "Posting tidak ditemukan." };
    }

    const { error: updateError } = await supabase
      .from("aspirations")
      .update({ likes_count: current.likes_count + 1 })
      .eq("id", id);

    if (updateError) {
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
