"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CATEGORY_LABELS,
  type AspirationCategory,
} from "@/types/aspiration";
import {
  Heart,
  LayoutGrid,
  Lightbulb,
  MessageSquare,
  Search,
  Star,
  X,
} from "lucide-react";

const CATEGORIES: {
  value: AspirationCategory | "all";
  icon: typeof Lightbulb;
  label: string;
}[] = [
  { value: "all", icon: LayoutGrid, label: "Semua" },
  { value: "saran", icon: Lightbulb, label: CATEGORY_LABELS.saran },
  { value: "aspirasi", icon: Star, label: CATEGORY_LABELS.aspirasi },
  { value: "keluhan", icon: MessageSquare, label: CATEGORY_LABELS.keluhan },
  { value: "pujian", icon: Heart, label: CATEGORY_LABELS.pujian },
];

interface FeedToolbarProps {
  initialSearch: string;
  initialCategory?: AspirationCategory;
}

function buildFeedUrl(search: string, category?: AspirationCategory): string {
  const params = new URLSearchParams();
  if (search.trim()) {
    params.set("q", search.trim());
  }
  if (category) {
    params.set("category", category);
  }
  const query = params.toString();
  return query ? `/?${query}#feed` : "/#feed";
}

export function FeedToolbar({
  initialSearch,
  initialCategory,
}: FeedToolbarProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState<AspirationCategory | "all">(
    initialCategory ?? "all",
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const normalizedSearch = search.trim();
      const normalizedInitial = initialSearch.trim();

      if (normalizedSearch === normalizedInitial) {
        return;
      }

      const nextCategory = category === "all" ? undefined : category;
      router.replace(buildFeedUrl(normalizedSearch, nextCategory), {
        scroll: false,
      });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [search, initialSearch, category, router]);

  const handleCategoryChange = (value: AspirationCategory | "all") => {
    setCategory(value);
    const nextCategory = value === "all" ? undefined : value;
    router.replace(buildFeedUrl(search, nextCategory), { scroll: false });
  };

  const clearSearch = () => {
    setSearch("");
    const nextCategory = category === "all" ? undefined : category;
    router.replace(buildFeedUrl("", nextCategory), { scroll: false });
  };

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-meranti-forest/40" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari aspirasi, nama, atau kata kunci..."
          aria-label="Cari feed aspirasi"
          className={cn(
            "w-full rounded-2xl border-2 border-meranti-mist bg-white py-3 pl-11 pr-11 text-sm text-meranti-forest",
            "placeholder:text-meranti-forest/40",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meranti-gold focus-visible:ring-offset-2",
          )}
        />
        {search.length > 0 && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Hapus pencarian"
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-meranti-forest/50 transition-colors hover:bg-meranti-sage hover:text-meranti-forest"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="flex min-w-max gap-2">
          {CATEGORIES.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleCategoryChange(value)}
              className={cn(
                "flex min-h-[40px] cursor-pointer items-center gap-2 rounded-2xl border-2 px-3 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meranti-gold focus-visible:ring-offset-2",
                "active:scale-[0.98]",
                category === value
                  ? "border-meranti-forest bg-meranti-forest text-white shadow-md shadow-meranti-forest/20"
                  : "border-meranti-mist bg-white text-meranti-forest hover:border-meranti-forest/30 hover:bg-meranti-sage",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
