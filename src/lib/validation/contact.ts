import { z } from "zod";
import { emailSchema, phoneSchema } from "./common";

export const contactTypeSchema = z.enum([
  "devis",
  "urgence",
  "config",
  "serenite",
  "maintenance",
  "autre",
]);

export const contactUrgencySchema = z.enum(["normal", "today", "asap"]);

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Nom requis.").max(120, "Nom trop long."),
  email: emailSchema,
  phone: phoneSchema,
  city: z.string().trim().max(80).optional().default(""),
  type: contactTypeSchema.optional().default("devis"),
  service: z.string().trim().max(120).optional().default(""),
  mode: z.string().trim().max(80).optional().default(""),
  urgency: contactUrgencySchema.optional().default("normal"),
  message: z.string().trim().min(10, "Message trop court.").max(4000, "Message trop long."),
  consent: z.literal(true, {
    error: "Consentement requis.",
  }),
  /** Honeypot — doit rester vide. */
  company: z.string().optional().default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;
