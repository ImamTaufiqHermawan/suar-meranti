"use server";

import "@/lib/supabase/tls-dev";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import {
  createServerClient,
  isSupabaseConfigured,
  getSupabaseConnectionHint,
  isFetchFailedError,
} from "@/lib/supabase/server";
import {
  createServiceClient,
  isServiceRoleConfigured,
} from "@/lib/supabase/service";
import {
  createAdminSession,
  destroyAdminSession,
  getAdminSession,
} from "@/lib/auth/session";
import {
  aspirationSchema,
  loginSchema,
  prepareContentForStorage,
  visitorIdSchema,
} from "@/lib/validators";
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

export async function loginAdmin(
  formData: FormData,
): Promise<ActionResult<{ username: string }>> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Database belum dikonfigurasi." };
  }

  const raw = {
    username: formData.get("username")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Data login tidak valid",
    };
  }

  if (!isServiceRoleConfigured()) {
    return {
      success: false,
      error:
        "SUPABASE_SERVICE_ROLE_KEY belum diset di .env.local (diperlukan untuk login admin).",
    };
  }

  try {
    const supabase = createServiceClient();
    const { data: admin, error } = await supabase
      .from("admins")
      .select("password_hash")
      .eq("username", parsed.data.username)
      .maybeSingle();

    if (error) {
      console.error("loginAdmin error:", error.message);
      return {
        success: false,
        error:
          "Gagal verifikasi admin. Jalankan migration 003_fix_admin_bcrypt.sql di Supabase.",
      };
    }

    if (!admin?.password_hash) {
      return { success: false, error: "Username atau password salah." };
    }

    const valid = await bcrypt.compare(
      parsed.data.password,
      admin.password_hash,
    );

    if (!valid) {
      return { success: false, error: "Username atau password salah." };
    }

    await createAdminSession(parsed.data.username);
    revalidatePath("/");
    return { success: true, data: { username: parsed.data.username } };
  } catch (error) {
    const hint = getSupabaseConnectionHint(error);
    console.error("loginAdmin error:", error, hint ?? "");
    return { success: false, error: hint ?? "Terjadi kesalahan server." };
  }
}

export async function logoutAdmin(): Promise<ActionResult> {
  await destroyAdminSession();
  revalidatePath("/");
  return { success: true };
}

export async function getAdminSessionAction() {
  return getAdminSession();
}

export async function deleteAspiration(id: string): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Anda harus login sebagai admin." };
  }

  if (!isServiceRoleConfigured()) {
    return {
      success: false,
      error: "SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di server.",
    };
  }

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("aspirations").delete().eq("id", id);

    if (error) {
      console.error("deleteAspiration error:", error.message);
      return { success: false, error: "Gagal menghapus aspirasi." };
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    const hint = getSupabaseConnectionHint(error);
    console.error("deleteAspiration error:", error, hint ?? "");
    return { success: false, error: hint ?? "Terjadi kesalahan server." };
  }
}
