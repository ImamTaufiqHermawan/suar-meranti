"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { loginAdmin, logoutAdmin } from "@/lib/admin-actions";
import { LogIn, LogOut, Shield } from "lucide-react";

interface AdminAuthButtonProps {
  isLoggedIn: boolean;
  username?: string;
}

export function AdminAuthButton({
  isLoggedIn: initialLoggedIn,
  username: initialUsername,
}: AdminAuthButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(initialLoggedIn);
  const [username, setUsername] = useState(initialUsername ?? "");
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.set("username", formUsername);
    formData.set("password", formPassword);

    startTransition(async () => {
      const result = await loginAdmin(formData);
      if (result.success) {
        setIsLoggedIn(true);
        setUsername(formUsername);
        setFormPassword("");
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAdmin();
      setIsLoggedIn(false);
      setUsername("");
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-meranti-mist px-3 py-2 text-sm font-medium text-meranti-forest/70 transition-colors hover:bg-meranti-sage hover:text-meranti-forest"
        aria-expanded={open}
      >
        <Shield className="h-4 w-4" />
        {isLoggedIn ? `Admin: ${username}` : "Admin"}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-meranti-mist bg-white p-4 shadow-xl">
          {isLoggedIn ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-meranti-forest/70">
                Masuk sebagai <strong>{username}</strong>
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                isLoading={isPending}
                className="w-full"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-meranti-forest">
                Login Admin
              </p>
              <Input
                label="Username"
                placeholder="admin.meranti"
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
                autoComplete="username"
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                autoComplete="current-password"
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <Button type="submit" size="sm" isLoading={isPending} className="w-full">
                <LogIn className="h-4 w-4" />
                Masuk
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
