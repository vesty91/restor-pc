/**
 * Statuts commande boutique — source unique.
 * Ne pas inventer d’autres chaînes côté app.
 */
export const ORDER_STATUSES = [
  "pending",
  "processing",
  "fulfilled",
  "failed",
  "refunded",
  "disputed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

/** Statuts encore livrables (claim processing). */
export const FULFILLABLE_STATUSES: OrderStatus[] = ["pending", "failed"];
