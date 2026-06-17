import { cn } from "@/lib/utils";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type AspirationCategory,
} from "@/types/aspiration";

interface CategoryBadgeProps {
  category: AspirationCategory;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const colors = CATEGORY_COLORS[category];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        colors.bg,
        colors.text,
        colors.border,
        className,
      )}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}
