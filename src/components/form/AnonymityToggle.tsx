"use client";

import { cn } from "@/lib/utils";
import { EyeOff, User } from "lucide-react";

interface AnonymityToggleProps {
  isAnonymous: boolean;
  onChange: (value: boolean) => void;
}

export function AnonymityToggle({
  isAnonymous,
  onChange,
}: AnonymityToggleProps) {
  return (
    <div
      className="cursor-pointer rounded-2xl border-2 border-meranti-mist bg-meranti-sage/50 p-4 transition-colors hover:border-meranti-forest/20"
      onClick={() => onChange(!isAnonymous)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onChange(!isAnonymous);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={
        isAnonymous
          ? "Mode anonim aktif, klik untuk tampilkan identitas"
          : "Identitas ditampilkan, klik untuk kirim anonim"
      }
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
              isAnonymous
                ? "bg-meranti-forest/10 text-meranti-forest"
                : "bg-meranti-wood/10 text-meranti-wood",
            )}
          >
            {isAnonymous ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <User className="h-5 w-5" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-meranti-forest">
              {isAnonymous ? "Kirim sebagai Anonim" : "Tampilkan Identitas"}
            </p>
            <p className="text-xs text-meranti-forest/60">
              {isAnonymous
                ? "Nama dan alamat tidak akan ditampilkan"
                : "Nama dan alamat akan terlihat di feed"}
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={!isAnonymous}
          aria-label="Toggle identitas"
          onClick={(e) => {
            e.stopPropagation();
            onChange(!isAnonymous);
          }}
          className={cn(
            "relative h-8 w-14 shrink-0 cursor-pointer rounded-full transition-colors duration-300",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meranti-gold focus-visible:ring-offset-2",
            isAnonymous ? "bg-meranti-forest/20" : "bg-meranti-forest",
          )}
        >
          <span
            className={cn(
              "absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300",
              !isAnonymous && "translate-x-6",
            )}
          />
        </button>
      </div>
    </div>
  );
}
