"use client";

import { useState, useTransition } from "react";
import { CategoryBadge } from "@/components/feed/CategoryBadge";
import { likeAspiration } from "@/lib/actions";
import { cn, formatRelativeTime, getDisplayName } from "@/lib/utils";
import type { Aspiration } from "@/types/aspiration";
import { Heart, MapPin, UserCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface AspirationCardProps {
  aspiration: Aspiration;
  index: number;
}

export function AspirationCard({ aspiration, index }: AspirationCardProps) {
  const [likes, setLikes] = useState(aspiration.likes_count);
  const [liked, setLiked] = useState(false);
  const [isPending, startTransition] = useTransition();

  const displayName = getDisplayName(aspiration);

  const handleLike = () => {
    if (liked || isPending) return;

    setLiked(true);
    setLikes((prev) => prev + 1);

    startTransition(async () => {
      const result = await likeAspiration(aspiration.id);
      if (!result.success) {
        setLiked(false);
        setLikes(aspiration.likes_count);
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

      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-meranti-forest/80 sm:text-base">
        {aspiration.content}
      </p>

      <div className="mt-4 flex items-center gap-4 border-t border-meranti-mist pt-4">
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
      </div>
    </motion.article>
  );
}
