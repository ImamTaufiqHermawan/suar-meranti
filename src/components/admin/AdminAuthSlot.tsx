import { AdminAuthButton } from "@/components/admin/AdminAuthButton";
import { getAdminSession } from "@/lib/auth/session";

export async function AdminAuthSlot() {
  const session = await getAdminSession();

  return (
    <AdminAuthButton
      isLoggedIn={Boolean(session)}
      username={session?.username}
    />
  );
}
