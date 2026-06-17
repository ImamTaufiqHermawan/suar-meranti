export type AspirationCategory = "saran" | "aspirasi" | "keluhan" | "pujian";

export interface FeedCursor {
  created_at: string;
  id: string;
}

export interface FeedQuery {
  search?: string;
  category?: AspirationCategory;
  cursor?: FeedCursor;
  limit?: number;
}

export interface FeedPageResult {
  items: Aspiration[];
  nextCursor: FeedCursor | null;
  hasMore: boolean;
}

export interface Aspiration {
  id: string;
  content: string;
  category: AspirationCategory;
  is_anonymous: boolean;
  author_name: string | null;
  author_address: string | null;
  likes_count: number;
  created_at: string;
}

export const CATEGORY_LABELS: Record<AspirationCategory, string> = {
  saran: "Saran",
  aspirasi: "Aspirasi",
  keluhan: "Keluhan",
  pujian: "Pujian",
};

export const CATEGORY_COLORS: Record<
  AspirationCategory,
  { bg: string; text: string; border: string }
> = {
  saran: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  aspirasi: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  keluhan: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  pujian: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
};
