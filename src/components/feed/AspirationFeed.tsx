import { AspirationFeedList } from "@/components/feed/AspirationCard";
import { FeedToolbar } from "@/components/feed/FeedToolbar";
import { getAspirationsPage } from "@/lib/feed-actions";
import { getAdminSessionAction } from "@/lib/actions";
import type { AspirationCategory } from "@/types/aspiration";
import { MessageSquareHeart, SearchX } from "lucide-react";

interface AspirationFeedProps {
  search?: string;
  category?: AspirationCategory;
}

export async function AspirationFeed({
  search = "",
  category,
}: AspirationFeedProps) {
  const [feedPage, session] = await Promise.all([
    getAspirationsPage({ search, category, limit: 10 }),
    getAdminSessionAction(),
  ]);

  const isAdmin = Boolean(session);
  const hasActiveFilters = Boolean(search.trim() || category);
  const { items, nextCursor, hasMore } = feedPage;

  return (
    <section id="feed" className="scroll-mt-24">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-meranti-forest sm:text-2xl">
            Feed Aspirasi Warga
          </h2>
          <p className="mt-1 text-sm text-meranti-forest/60">
            Lihat saran dan aspirasi dari warga lainnya
          </p>
        </div>
        {items.length > 0 && (
          <p className="text-xs font-medium text-meranti-forest/50 sm:text-sm">
            Menampilkan {items.length}
            {hasMore ? "+" : ""} aspirasi
          </p>
        )}
      </div>

      <FeedToolbar
        key={`toolbar-${search}-${category ?? "all"}`}
        initialSearch={search}
        initialCategory={category}
      />

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-meranti-mist bg-white/60 px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-meranti-sage">
            {hasActiveFilters ? (
              <SearchX className="h-8 w-8 text-meranti-forest/40" />
            ) : (
              <MessageSquareHeart className="h-8 w-8 text-meranti-forest/40" />
            )}
          </div>
          <h3 className="font-heading text-lg font-semibold text-meranti-forest">
            {hasActiveFilters
              ? "Tidak ada aspirasi yang cocok"
              : "Belum ada aspirasi"}
          </h3>
          <p className="mt-2 max-w-sm text-sm text-meranti-forest/60">
            {hasActiveFilters
              ? "Coba ubah kata kunci pencarian atau pilih kategori lain."
              : "Jadilah yang pertama menyampaikan saran atau aspirasi untuk lingkungan Bukit Meranti yang lebih baik!"}
          </p>
        </div>
      ) : (
        <AspirationFeedList
          key={`${search}-${category ?? "all"}`}
          initialItems={items}
          initialNextCursor={nextCursor}
          initialHasMore={hasMore}
          search={search}
          category={category}
          isAdmin={isAdmin}
        />
      )}
    </section>
  );
}
