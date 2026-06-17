import { AspirationFeedList } from "@/components/feed/AspirationCard";
import {
  FeedCountLabel,
  FeedCountProvider,
} from "@/components/feed/FeedCountContext";
import { FeedToolbar } from "@/components/feed/FeedToolbar";
import { getAspirationsPage } from "@/lib/feed-actions";
import { getAdminSession } from "@/lib/auth/session";
import type { AspirationCategory } from "@/types/aspiration";

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
    getAdminSession(),
  ]);

  const isAdmin = Boolean(session);
  const hasActiveFilters = Boolean(search.trim() || category);
  const { items, nextCursor, hasMore } = feedPage;

  const feedKey = `${search}-${category ?? "all"}`;

  return (
    <section id="feed" className="scroll-mt-24">
      <FeedCountProvider
        key={feedKey}
        initialCount={items.length}
        initialHasMore={hasMore}
      >
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold text-meranti-forest sm:text-2xl">
              Feed Aspirasi Warga
            </h2>
            <p className="mt-1 text-sm text-meranti-forest/60">
              Lihat saran dan aspirasi dari warga lainnya
            </p>
          </div>
          <FeedCountLabel />
        </div>

        <FeedToolbar
          key={`toolbar-${feedKey}`}
          initialSearch={search}
          initialCategory={category}
        />

        <AspirationFeedList
          key={feedKey}
          initialItems={items}
          initialNextCursor={nextCursor}
          initialHasMore={hasMore}
          search={search}
          category={category}
          isAdmin={isAdmin}
          hasActiveFilters={hasActiveFilters}
        />
      </FeedCountProvider>
    </section>
  );
}
