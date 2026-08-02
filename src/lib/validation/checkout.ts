import { z } from "zod";

export const checkoutSchema = z.object({
  slug: z.string().trim().min(1, "Produit manquant.").max(80, "Produit invalide."),
  withdrawalConsent: z.literal(true, {
    error: "Le consentement au téléchargement immédiat est obligatoire.",
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
