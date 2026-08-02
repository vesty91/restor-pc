import { z } from "zod";

/** Authentification atelier (admin). */
export const atelierAuthSchema = z.object({
  secret: z.string().min(1, "Mot de passe requis.").max(256, "Mot de passe trop long."),
});

export type AtelierAuthInput = z.infer<typeof atelierAuthSchema>;
