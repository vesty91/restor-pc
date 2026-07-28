import { z } from "zod";
import { emailSchema } from "./common";

/** Actions administratives génériques (livraison / alertes). */
export const adminFulfillSchema = z.object({
  slug: z.string().trim().min(1).max(80),
  email: emailSchema,
  sendEmail: z.boolean().optional().default(true),
});

export const adminAlertNoteSchema = z.object({
  note: z.string().trim().max(1000).optional().default(""),
});

export type AdminFulfillInput = z.infer<typeof adminFulfillSchema>;
