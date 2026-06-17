import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(3, "Username wajib diisi"),
  password: z.string().min(6, "Password wajib diisi"),
});
