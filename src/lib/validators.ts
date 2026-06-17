import { z } from "zod";
import {
  getPlainTextFromHtml,
  isEmptyHtml,
  sanitizeHtml,
} from "@/lib/sanitize";

export const aspirationSchema = z
  .object({
    content: z.string().trim(),
    category: z.enum(["saran", "aspirasi", "keluhan", "pujian"]),
    is_anonymous: z.boolean(),
    author_name: z.string().trim().optional(),
    author_address: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    const sanitized = sanitizeHtml(data.content);
    const plainLength = getPlainTextFromHtml(sanitized).length;

    if (isEmptyHtml(sanitized) || plainLength < 10) {
      ctx.addIssue({
        code: "custom",
        message: "Pesan minimal 10 karakter",
        path: ["content"],
      });
    }
    if (plainLength > 2000) {
      ctx.addIssue({
        code: "custom",
        message: "Pesan maksimal 2000 karakter",
        path: ["content"],
      });
    }
    if (sanitized.length > 10000) {
      ctx.addIssue({
        code: "custom",
        message: "Konten terlalu panjang",
        path: ["content"],
      });
    }

    if (!data.is_anonymous) {
      if (!data.author_name || data.author_name.length < 2) {
        ctx.addIssue({
          code: "custom",
          message: "Nama wajib diisi (min. 2 karakter)",
          path: ["author_name"],
        });
      }
      if (!data.author_address || data.author_address.length < 3) {
        ctx.addIssue({
          code: "custom",
          message: "Alamat rumah wajib diisi",
          path: ["author_address"],
        });
      }
    }
  });

export const loginSchema = z.object({
  username: z.string().trim().min(3, "Username wajib diisi"),
  password: z.string().min(6, "Password wajib diisi"),
});

export const visitorIdSchema = z
  .string()
  .trim()
  .min(8, "Visitor ID tidak valid")
  .max(64, "Visitor ID tidak valid");

export type AspirationFormData = z.infer<typeof aspirationSchema>;

export function prepareContentForStorage(content: string): string {
  return sanitizeHtml(content);
}
