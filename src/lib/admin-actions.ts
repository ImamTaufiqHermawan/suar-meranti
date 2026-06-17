"use server";

import "@/lib/supabase/tls-dev";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import {
  isSupabaseConfigured,
  getSupabaseConnectionHint,
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
import { loginSchema } from "@/lib/auth-validators";
import type { ActionResult } from "@/lib/action-result";

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
