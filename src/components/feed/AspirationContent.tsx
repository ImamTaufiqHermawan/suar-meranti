import { sanitizeHtml } from "@/lib/sanitize";

interface AspirationContentProps {
  html: string;
}

export function AspirationContent({ html }: AspirationContentProps) {
  const safeHtml = sanitizeHtml(html);

  return (
    <div
      className="prose-meranti mt-4 text-sm leading-relaxed text-meranti-forest/80 sm:text-base"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
