import { z } from "zod";

export const aspirationSchema = z
  .object({
    content: z
      .string()
      .trim()
      .min(10, "Pesan minimal 10 karakter")
      .max(2000, "Pesan maksimal 2000 karakter"),
    category: z.enum(["saran", "aspirasi", "keluhan", "pujian"]),
    is_anonymous: z.boolean(),
    author_name: z.string().trim().optional(),
    author_address: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
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

export type AspirationFormData = z.infer<typeof aspirationSchema>;
