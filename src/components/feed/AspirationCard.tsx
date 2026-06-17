"use client";

import { useEffect, useState, useTransition } from "react";
import { CategoryBadge } from "@/components/feed/CategoryBadge";
import { AspirationContent } from "@/components/feed/AspirationContent";
import { DeleteAspirationButton } from "@/components/admin/DeleteAspirationButton";
import { getLikedAspirationIds, likeAspiration } from "@/lib/actions";
import {
  addLocalLikedId,
  getLocalLikedIds,
  getVisitorId,
  setLocalLikedIds,
} from "@/lib/visitor";
import { cn, formatRelativeTime, getDisplayName } from "@/lib/utils";
import type { Aspiration } from "@/types/aspiration";
import { Heart, MapPin, UserCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface AspirationCardProps {
  aspiration: Aspiration;
  index: number;
  isAdmin?: boolean;
  initialLiked?: boolean;
}

export function AspirationCard({
  aspiration,
  index,
  isAdmin = false,
  initialLiked = false,
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
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

          <time
            dateTime={aspiration.created_at}
            className="mt-0.5 block text-xs text-meranti-forest/40"
          >
            {formatRelativeTime(aspiration.created_at)}
          </time>
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

        {isAdmin && <DeleteAspirationButton aspirationId={aspiration.id} />}
      </div>
    </motion.article>
  );
}

interface AspirationFeedListProps {
  aspirations: Aspiration[];
  isAdmin: boolean;
}

export function AspirationFeedList({
  aspirations,
  isAdmin,
}: AspirationFeedListProps) {
  const [likedIds, setLikedIds] = useState<Set<string> | null>(null);

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
  }, [aspirations]);

  if (likedIds === null && aspirations.length > 0) {
    return (
      <div className="flex flex-col gap-4">
        {aspirations.map((_, i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-3xl bg-meranti-mist/60"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {aspirations.map((aspiration, index) => (
        <AspirationCard
          key={aspiration.id}
          aspiration={aspiration}
          index={index}
          isAdmin={isAdmin}
          initialLiked={likedIds?.has(aspiration.id) ?? false}
        />
      ))}
    </div>
  );
}
