import sanitizeHtmlLib from "sanitize-html";
import { unwrapHtmlStoredAsPlainText } from "@/lib/html-paste";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
  "h1",
  "h2",
  "h3",
];

export function sanitizeHtml(html: string): string {
  return sanitizeHtmlLib(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}

export function getPlainTextFromHtml(html: string): string {
  const sanitized = sanitizeHtml(html);
  return sanitized
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isEmptyHtml(html: string): boolean {
  return getPlainTextFromHtml(html).length === 0;
}

export function normalizeContentHtml(html: string): string {
  return sanitizeHtml(unwrapHtmlStoredAsPlainText(html));
}
