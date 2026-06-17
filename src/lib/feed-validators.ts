import { z } from "zod";

export const feedCursorSchema = z.object({
  created_at: z.string().min(1),
  id: z.string().uuid(),
});

export const feedQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  category: z.enum(["saran", "aspirasi", "keluhan", "pujian"]).optional(),
  cursor: feedCursorSchema.optional(),
  limit: z.number().int().min(1).max(20).default(10),
});

export type FeedQueryInput = z.infer<typeof feedQuerySchema>;

const ASPIRATION_CATEGORIES = [
  "saran",
  "aspirasi",
  "keluhan",
  "pujian",
] as const;

export function parseFeedCategory(
  value: string | undefined,
): (typeof ASPIRATION_CATEGORIES)[number] | undefined {
  if (!value) return undefined;
  const parsed = z.enum(ASPIRATION_CATEGORIES).safeParse(value);
  return parsed.success ? parsed.data : undefined;
}
