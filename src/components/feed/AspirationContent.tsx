interface AspirationContentProps {
  html: string;
}

export function AspirationContent({ html }: AspirationContentProps) {
  // Content is sanitized before insert in submitAspiration().
  return (
    <div
      className="prose-meranti mt-4 text-sm leading-relaxed text-meranti-forest/80 sm:text-base"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
