"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { CategoryBadge } from "@/components/feed/CategoryBadge";
import { AspirationContent } from "@/components/feed/AspirationContent";
import { DeleteAspirationButton } from "@/components/admin/DeleteAspirationButton";
import {
  getLikedAspirationIds,
  likeAspiration,
} from "@/lib/like-actions";
import { loadMoreAspirations } from "@/lib/feed-actions";
import { RelativeTime } from "@/components/feed/RelativeTime";
import { useFeedCount } from "@/components/feed/FeedCountContext";
import { useFeedSync } from "@/components/feed/FeedSyncContext";
import { matchesFeedFilters } from "@/lib/feed-match";
import {
  addLocalLikedId,
  getLocalLikedIds,
  getVisitorId,
  setLocalLikedIds,
} from "@/lib/visitor";
import { cn, getDisplayName } from "@/lib/utils";
import type {
  Aspiration,
  AspirationCategory,
  FeedCursor,
} from "@/types/aspiration";
import { Heart, Loader2, MapPin, MessageSquareHeart, SearchX, UserCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface AspirationCardProps {
  aspiration: Aspiration;
  index: number;
  isAdmin?: boolean;
  initialLiked?: boolean;
  enableEntranceAnimation?: boolean;
  onDeleted?: () => void;
}

export function AspirationCard({
  aspiration,
  index,
  isAdmin = false,
  initialLiked = false,
  enableEntranceAnimation = true,
  onDeleted,
}: AspirationCardProps) {
  const [likes, setLikes] = useState(aspiration.likes_count);
  const [liked, setLiked] = useState(initialLiked);
  const [isPending, startTransition] = useTransition();

  const displayName = getDisplayName(aspiration);

  const handleLike = () => {
    if (liked || isPending) return;

    const visitorId = getVisitorId();
    if (!visitorId) return;

    startTransition(async () => {
      const result = await likeAspiration(aspiration.id, visitorId);
      if (result.success) {
        setLiked(true);
        setLikes((prev) => prev + 1);
        addLocalLikedId(aspiration.id);
      } else if (result.error.includes("sudah menyukai")) {
        setLiked(true);
        addLocalLikedId(aspiration.id);
      }
    });
  };

  return (
    <motion.article
      initial={enableEntranceAnimation ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={
        enableEntranceAnimation
          ? { duration: 0.4, delay: index * 0.08, ease: "easeOut" }
          : { duration: 0.2, ease: "easeOut" }
      }
      className="rounded-3xl border border-meranti-mist bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6"
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
            aspiration.is_anonymous
              ? "bg-meranti-mist text-meranti-forest/50"
              : "bg-meranti-forest/10 text-meranti-forest",
          )}
        >
          <UserCircle2 className="h-7 w-7" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-meranti-forest">{displayName}</h3>
            <CategoryBadge category={aspiration.category} />
          </div>

          {!aspiration.is_anonymous && aspiration.author_address && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-meranti-forest/50">
              <MapPin className="h-3 w-3 shrink-0" />
              {aspiration.author_address}
            </p>
          )}

          <RelativeTime
            dateTime={aspiration.created_at}
            className="mt-0.5 block text-xs text-meranti-forest/40"
          />
        </div>
      </div>

      <AspirationContent html={aspiration.content} />

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-meranti-mist pt-4">
        <button
          type="button"
          onClick={handleLike}
          disabled={liked || isPending}
          aria-label="Sukai postingan"
          className={cn(
            "flex min-h-[44px] min-w-[44px] cursor-pointer items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meranti-gold focus-visible:ring-offset-2",
            "active:scale-95 disabled:cursor-not-allowed",
            liked
              ? "bg-rose-50 text-rose-600"
              : "text-meranti-forest/60 hover:bg-meranti-sage hover:text-rose-500",
          )}
        >
          <Heart
            className={cn("h-5 w-5 transition-all", liked && "fill-rose-500")}
          />
          <span>{likes > 0 ? likes : "Suka"}</span>
        </button>

        {isAdmin && (
          <DeleteAspirationButton
            aspirationId={aspiration.id}
            onDeleted={onDeleted}
          />
        )}
      </div>
    </motion.article>
  );
}

interface AspirationFeedListProps {
  initialItems: Aspiration[];
  initialNextCursor: FeedCursor | null;
  initialHasMore: boolean;
  search: string;
  category?: AspirationCategory;
  isAdmin: boolean;
  hasActiveFilters: boolean;
}

function FeedCardSkeleton() {
  return <div className="h-40 animate-pulse rounded-3xl bg-meranti-mist/60" />;
}

export function AspirationFeedList({
  initialItems,
  initialNextCursor,
  initialHasMore,
  search,
  category,
  isAdmin,
  hasActiveFilters,
}: AspirationFeedListProps) {
  const [items, setItems] = useState(initialItems);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [likedIds, setLikedIds] = useState<Set<string> | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const initialCount = initialItems.length;
  const [ssrIds] = useState(
    () => new Set(initialItems.map((item) => item.id)),
  );
  const { setCount, setHasMore: setFeedHasMore } = useFeedCount();
  const { subscribeToNewAspirations } = useFeedSync();

  useEffect(() => {
    return subscribeToNewAspirations((item) => {
      if (!matchesFeedFilters(item, search, category)) {
        return;
      }

      setItems((current) => {
        if (current.some((existing) => existing.id === item.id)) {
          return current;
        }

        const next = [item, ...current];
        setCount(next.length);
        return next;
      });
    });
  }, [subscribeToNewAspirations, search, category, setCount]);

  useEffect(() => {
    let cancelled = false;
    const visitorId = getVisitorId();
    const localLiked = getLocalLikedIds();

    getLikedAspirationIds(visitorId).then((serverLiked) => {
      if (cancelled) return;
      const merged = new Set([...localLiked, ...serverLiked]);
      setLocalLikedIds([...merged]);
      setLikedIds(merged);
    });

    return () => {
      cancelled = true;
    };
  }, [items]);

  const handleDeleted = useCallback(
    (id: string) => {
      setItems((current) => {
        const next = current.filter((item) => item.id !== id);
        setCount(next.length);
        return next;
      });
    },
    [setCount],
  );

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || isPending || !nextCursor) {
      return;
    }

    setIsLoadingMore(true);
    startTransition(async () => {
      try {
        const result = await loadMoreAspirations({
          search: search || undefined,
          category,
          cursor: nextCursor,
          limit: 10,
        });

        setItems((current) => {
          const existingIds = new Set(current.map((item) => item.id));
          const newItems = result.items.filter(
            (item) => !existingIds.has(item.id),
          );
          const next = [...current, ...newItems];
          setCount(next.length);
          return next;
        });
        setNextCursor(result.nextCursor);
        setHasMore(result.hasMore);
        setFeedHasMore(result.hasMore);
      } finally {
        setIsLoadingMore(false);
      }
    });
  }, [
    hasMore,
    isLoadingMore,
    isPending,
    nextCursor,
    search,
    category,
    startTransition,
    setCount,
    setFeedHasMore,
  ]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (likedIds === null && items.length > 0) {
    return (
      <div className="flex flex-col gap-4">
        {items.map((_, i) => (
          <FeedCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
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
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((aspiration, index) => (
        <AspirationCard
          key={aspiration.id}
          aspiration={aspiration}
          index={index}
          isAdmin={isAdmin}
          initialLiked={likedIds?.has(aspiration.id) ?? false}
          enableEntranceAnimation={
            !ssrIds.has(aspiration.id) || index < initialCount
          }
          onDeleted={() => handleDeleted(aspiration.id)}
        />
      ))}

      {hasMore && (
        <>
          <div ref={sentinelRef} className="h-1" aria-hidden="true" />
          {isLoadingMore && (
            <div className="flex flex-col gap-4">
              <FeedCardSkeleton />
              <FeedCardSkeleton />
            </div>
          )}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={loadMore}
              disabled={isLoadingMore || isPending}
              className={cn(
                "inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-2xl border-2 border-meranti-mist bg-white px-5 py-2.5 text-sm font-medium text-meranti-forest transition-all",
                "hover:border-meranti-forest/30 hover:bg-meranti-sage",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meranti-gold focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memuat...
                </>
              ) : (
                "Muat lebih banyak"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
