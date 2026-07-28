import { z } from "zod";
import { emailSchema, nonEmptyIdSchema } from "./common";

export const orderStatusSchema = z.enum([
  "pending",
  "paid",
  "fulfilled",
  "failed",
  "refunded",
]);

/** Renvoi d’email commande (compte client). */
export const resendOrderEmailSchema = z.object({
  orderId: nonEmptyIdSchema.max(64),
});

/** Livraison manuelle atelier. */
export const fulfillOrderSchema = z.object({
  slug: z.string().trim().min(1, "Produit manquant.").max(80),
  email: emailSchema,
  sendEmail: z.boolean().optional().default(true),
});

export type FulfillOrderInput = z.infer<typeof fulfillOrderSchema>;
export type ResendOrderEmailInput = z.infer<typeof resendOrderEmailSchema>;
