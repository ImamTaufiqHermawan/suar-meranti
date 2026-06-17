import { z } from "zod";

export const visitorIdSchema = z
  .string()
  .trim()
  .min(8, "Visitor ID tidak valid")
  .max(64, "Visitor ID tidak valid");
