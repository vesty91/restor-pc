# Fulfillment Stripe — Restor-PC

## Événements écoutés

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `charge.refunded`
- `charge.dispute.created`
- `charge.dispute.closed`

## Idempotence

1. Signature Stripe vérifiée (`STRIPE_WEBHOOK_SECRET`).
2. `claim_stripe_event(event.id)` — insert unique ; reclaim si `result=failed`.
3. Réservation commande unique sur `order_ref` / `stripe_checkout_session_id`.
4. `claim_tool_order(order_id)` — `pending|failed` → `processing` atomique.
5. Assets (licence + NAS) créés une seule fois ; retry email sans recréation.

## Statuts commande

`pending` → `processing` → `fulfilled` | `failed`  
Aussi : `refunded`, `disputed`, `cancelled`.

Source : `src/lib/fulfillment/order-status.ts`.

## Échec email

La commande reste `fulfilled` ; `email_status` / `email_retry_needed` permettent un renvoi via `/api/compte/resend-email`.

## Échec NAS

Commande → `failed` + `error_code=NAS_LINK_FAILED` ; pas de suppression du paiement ; reprise via webhook reclaim ou script atelier.

## user_id

Obligatoire dans les métadonnées Checkout (`user_id`). Sans UUID valide → événement marqué failed `MISSING_USER_ID`.

## Tests locaux

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Déclencher un paiement Test Mode
# Rejouer le même event.id → duplicate OK
```

Jamais de mode Live tant que `ALLOW_STRIPE_LIVE` n’est pas explicitement `true`.
