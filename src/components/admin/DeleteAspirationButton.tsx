"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAspiration } from "@/lib/admin-actions";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeleteAspirationButtonProps {
  aspirationId: string;
}

export function DeleteAspirationButton({
  aspirationId,
}: DeleteAspirationButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    startTransition(async () => {
      const result = await deleteAspiration(aspirationId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error);
        setConfirming(false);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      onBlur={() => !isPending && setConfirming(false)}
      disabled={isPending}
      className={cn(
        "flex min-h-[44px] cursor-pointer items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2",
        confirming
          ? "bg-red-600 text-white hover:bg-red-700"
          : "text-red-500 hover:bg-red-50",
        isPending && "opacity-60",
      )}
    >
      <Trash2 className="h-4 w-4" />
      {isPending ? "Menghapus..." : confirming ? "Yakin hapus?" : "Hapus"}
    </button>
  );
}
