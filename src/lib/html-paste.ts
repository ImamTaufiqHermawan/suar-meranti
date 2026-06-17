const RAW_HTML_TAG =
  /<(h[1-3]|p|ul|ol|li|strong|b|em|i|u|a|blockquote|br)\b[\s/>]/i;

export function looksLikeRawHtml(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed.includes("<")) {
    return false;
  }
  return RAW_HTML_TAG.test(trimmed);
}

export function extractHtmlFromClipboardText(text: string): string | null {
  let trimmed = text.trim();
  const fence = trimmed.match(/^```(?:html)?\s*\n?([\s\S]*?)```\s*$/i);
  if (fence) {
    trimmed = fence[1].trim();
  }
  return looksLikeRawHtml(trimmed) ? trimmed : null;
}

function decodeBasicEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/** TipTap sometimes stores pasted HTML markup as plain text inside a paragraph. */
export function unwrapHtmlStoredAsPlainText(html: string): string {
  const trimmed = html.trim();
  if (looksLikeRawHtml(trimmed)) {
    return trimmed;
  }

  const singleParagraph = trimmed.match(/^<p>([\s\S]*)<\/p>$/i);
  if (!singleParagraph) {
    return trimmed;
  }

  const inner = decodeBasicEntities(
    singleParagraph[1].replace(/<br\s*\/?>/gi, "\n"),
  );

  return looksLikeRawHtml(inner) ? inner : trimmed;
}

export function resolvePasteHtml(
  plainText: string,
  htmlText: string,
): string | null {
  const fromPlain = extractHtmlFromClipboardText(plainText);
  if (fromPlain) {
    return fromPlain;
  }

  if (htmlText.trim()) {
    const fromHtml = extractHtmlFromClipboardText(htmlText);
    if (fromHtml) {
      return fromHtml;
    }
  }

  return null;
}
