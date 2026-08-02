import { z } from "zod";

/** Message public sûr (jamais de détail technique Zod brut côté UI). */
export function publicZodMessage(error: z.ZodError, fallback = "Données invalides."): string {
  const msg = error.issues[0]?.message?.trim();
  if (!msg) return fallback;
  // Évite de remonter des chemins internes ou dumps techniques
  if (msg.length > 160 || /\[.*\]/.test(msg)) return fallback;
  return msg;
}

export function parseOrNull<T>(
  schema: z.ZodType<T>,
  data: unknown,
): { ok: true; data: T } | { ok: false; error: z.ZodError } {
  const parsed = schema.safeParse(data);
  if (parsed.success) return { ok: true, data: parsed.data };
  return { ok: false, error: parsed.error };
}

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email requis.")
  .max(160, "Email trop long.")
  .email("Email invalide.");

export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Téléphone requis.")
  .max(40, "Téléphone trop long.")
  .transform((v) => v.replace(/[^\d+()\s.-]/g, "").trim())
  .refine((v) => {
    const digits = v.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
  }, "Téléphone invalide.");

export const nonEmptyIdSchema = z.string().trim().min(1, "Identifiant requis.");
