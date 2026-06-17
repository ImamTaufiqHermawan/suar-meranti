"use client";

import { cn } from "@/lib/utils";
import {
  CATEGORY_LABELS,
  type AspirationCategory,
} from "@/types/aspiration";
import { Heart, Lightbulb, MessageSquare, Star } from "lucide-react";

const CATEGORIES: {
  value: AspirationCategory;
  icon: typeof Lightbulb;
}[] = [
  { value: "saran", icon: Lightbulb },
  { value: "aspirasi", icon: Star },
  { value: "keluhan", icon: MessageSquare },
  { value: "pujian", icon: Heart },
];

interface CategorySelectProps {
  value: AspirationCategory;
  onChange: (value: AspirationCategory) => void;
}

export function CategorySelect({ value, onChange }: CategorySelectProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-meranti-forest">Kategori</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CATEGORIES.map(({ value: cat, icon: Icon }) => (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className={cn(
              "flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 px-3 py-2.5 text-sm font-medium transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meranti-gold focus-visible:ring-offset-2",
              "active:scale-[0.98]",
              value === cat
                ? "border-meranti-forest bg-meranti-forest text-white shadow-md shadow-meranti-forest/20"
                : "border-meranti-mist bg-white text-meranti-forest hover:border-meranti-forest/30 hover:bg-meranti-sage",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{CATEGORY_LABELS[cat]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
