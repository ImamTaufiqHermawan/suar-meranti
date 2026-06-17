"use server";

import "@/lib/supabase/tls-dev";
import {
  createServerClient,
  isSupabaseConfigured,
  getSupabaseConnectionHint,
  isFetchFailedError,
} from "@/lib/supabase/server";
import { feedQuerySchema } from "@/lib/feed-validators";
import type {
  Aspiration,
  FeedPageResult,
  FeedQuery,
} from "@/types/aspiration";
import type { SupabaseClient } from "@supabase/supabase-js";

const EMPTY_FEED_PAGE: FeedPageResult = {
  items: [],
  nextCursor: null,
  hasMore: false,
};

function escapeIlikePattern(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

async function fetchAspirationsPage(
  supabase: SupabaseClient,
  query: FeedQuery,
): Promise<FeedPageResult> {
  const parsed = feedQuerySchema.safeParse({
    search: query.search || undefined,
    category: query.category,
    cursor: query.cursor,
    limit: query.limit ?? 10,
  });

  if (!parsed.success) {
    return EMPTY_FEED_PAGE;
  }

  const { search, category, cursor, limit } = parsed.data;
  const fetchLimit = limit + 1;

  let dbQuery = supabase
    .from("aspirations")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(fetchLimit);

  if (category) {
    dbQuery = dbQuery.eq("category", category);
  }

  if (search && cursor) {
    const sanitizedSearch = search.replace(/,/g, " ");
    const pattern = `%${escapeIlikePattern(sanitizedSearch)}%`;
    dbQuery = dbQuery.or(
      `and(or(content.ilike.${pattern},author_name.ilike.${pattern}),or(created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})))`,
    );
  } else if (search) {
    const sanitizedSearch = search.replace(/,/g, " ");
    const pattern = `%${escapeIlikePattern(sanitizedSearch)}%`;
    dbQuery = dbQuery.or(
      `content.ilike.${pattern},author_name.ilike.${pattern}`,
    );
  } else if (cursor) {
    dbQuery = dbQuery.or(
      `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`,
    );
  }

  const { data, error } = await dbQuery;

  if (error) {
    throw error;
  }

  const rows = (data as Aspiration[]) ?? [];
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const lastItem = items.at(-1);

  return {
    items,
    hasMore,
    nextCursor:
      hasMore && lastItem
        ? { created_at: lastItem.created_at, id: lastItem.id }
        : null,
  };
}

export async function getAspirationsPage(
  query: FeedQuery = {},
): Promise<FeedPageResult> {
  if (!isSupabaseConfigured()) {
    return EMPTY_FEED_PAGE;
  }

  try {
    const supabase = createServerClient();
    return await fetchAspirationsPage(supabase, query);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const hint = isFetchFailedError(message)
      ? getSupabaseConnectionHint(new Error(message))
      : undefined;
    console.error("getAspirationsPage error:", message, hint ?? "");
    return EMPTY_FEED_PAGE;
  }
}

export async function loadMoreAspirations(
  query: FeedQuery,
): Promise<FeedPageResult> {
  return getAspirationsPage(query);
}
