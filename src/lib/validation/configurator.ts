import { z } from "zod";

/**
 * Entrée contact / partage depuis le configurateur
 * (query params ou payload futur).
 * La validation serveur reste obligatoire à l’envoi contact.
 */
export const configuratorShareSchema = z.object({
  usage: z.string().trim().max(40).optional(),
  budget: z.coerce.number().int().min(0).max(20000).optional(),
  total: z.coerce.number().int().min(0).max(50000).optional(),
});

export type ConfiguratorShareInput = z.infer<typeof configuratorShareSchema>;
