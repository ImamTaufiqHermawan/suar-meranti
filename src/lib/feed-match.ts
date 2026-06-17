import type { Aspiration, AspirationCategory } from "@/types/aspiration";

export function matchesFeedFilters(
  item: Aspiration,
  search: string,
  category?: AspirationCategory,
): boolean {
  if (category && item.category !== category) {
    return false;
  }

  const query = search.trim().toLowerCase();
  if (!query) {
    return true;
  }

  const content = item.content.replace(/<[^>]+>/g, " ").toLowerCase();
  const authorName = (item.author_name ?? "").toLowerCase();
  return content.includes(query) || authorName.includes(query);
}
