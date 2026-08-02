import { revokeNasShare } from "@/lib/fulfillment/nas";
import { getSupabaseAdmin } from "@/lib/fulfillment/supabase";
import { logEvent } from "@/lib/logging/logger";

export type RevocationReason = "refunded" | "disputed";

type RevocationOrderRow = {
  order_id: string;
  license_key: string | null;
  share_id: string | null;
  already_revoked: boolean;
};

type ClaimRevocationResult = {
  reason: RevocationReason;
  payment_intent_id: string;
  orders: RevocationOrderRow[];
};

/**
 * Révocation idempotente après charge.refunded / dispute :
 * 1. Marque le payment_intent (protège fulfill hors-ordre)
 * 2. Passe commandes + licences en revoked / refunded|disputed
 * 3. Supprime les partages Synology (best-effort, rejouable)
 */
export async function revokeAccessByPaymentIntent(opts: {
  paymentIntentId: string;
  reason: RevocationReason;
  stripeEventId?: string | null;
}): Promise<ClaimRevocationResult> {
  const sb = getSupabaseAdmin();
  const pi = opts.paymentIntentId.trim();

  const { data, error } = await sb.rpc("claim_order_revocation", {
    p_payment_intent_id: pi,
    p_reason: opts.reason,
    p_stripe_event_id: opts.stripeEventId ?? null,
  });

  let result: ClaimRevocationResult;

  if (error) {
    // Fallback si RPC absente : update manuel + insert révocation
    logEvent("warn", "stripe.revoke.rpc_fallback", {
      paymentIntentId: pi,
      message: error.message,
    });
    result = await fallbackClaimRevocation(opts);
  } else {
    const raw = data as ClaimRevocationResult;
    result = {
      reason: raw.reason,
      payment_intent_id: raw.payment_intent_id,
      orders: Array.isArray(raw.orders) ? raw.orders : [],
    };
  }

  for (const row of result.orders) {
    if (row.already_revoked) continue;
    let revokeError: string | null = null;
    if (row.share_id) {
      try {
        await revokeNasShare(row.share_id);
        logEvent("info", "nas.link.revoked", {
          orderId: row.order_id,
          shareId: row.share_id,
        });
      } catch (err) {
        revokeError = err instanceof Error ? err.message.slice(0, 500) : "NAS_REVOKE_FAILED";
        logEvent("error", "nas.link.revoke_failed", {
          orderId: row.order_id,
          shareId: row.share_id,
        });
      }
    }

    const { error: markErr } = await sb.rpc("mark_order_assets_revoked", {
      p_order_id: row.order_id,
      p_revoke_error: revokeError,
    });
    if (markErr) {
      await sb
        .from("tool_orders")
        .update({
          assets_revoked_at: new Date().toISOString(),
          revoke_error: revokeError,
          share_url: null,
          share_password: null,
        })
        .eq("id", row.order_id);
    }
  }

  logEvent("info", "stripe.revoke.done", {
    paymentIntentId: pi,
    reason: result.reason,
    orderCount: result.orders.length,
  });

  return result;
}

async function fallbackClaimRevocation(opts: {
  paymentIntentId: string;
  reason: RevocationReason;
  stripeEventId?: string | null;
}): Promise<ClaimRevocationResult> {
  const sb = getSupabaseAdmin();
  const pi = opts.paymentIntentId.trim();

  await sb.from("stripe_payment_revocations").upsert(
    {
      payment_intent_id: pi,
      reason: opts.reason,
      stripe_event_id: opts.stripeEventId ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "payment_intent_id" },
  );

  const { data: orders } = await sb
    .from("tool_orders")
    .select("id, license_key, share_id, assets_revoked_at, status")
    .eq("stripe_payment_intent_id", pi);

  const rows: RevocationOrderRow[] = [];
  for (const o of orders ?? []) {
    const nextStatus =
      o.status === "refunded" ? "refunded" : opts.reason === "refunded" ? "refunded" : opts.reason;

    await sb
      .from("tool_orders")
      .update({ status: nextStatus, error_code: "STRIPE_REVOKED" })
      .eq("id", o.id);

    if (o.license_key) {
      await sb
        .from("script_licenses")
        .update({ status: "revoked" })
        .eq("license_key", o.license_key)
        .neq("status", "revoked");
    }

    rows.push({
      order_id: o.id as string,
      license_key: (o.license_key as string | null) ?? null,
      share_id: (o.share_id as string | null) ?? null,
      already_revoked: o.assets_revoked_at != null,
    });
  }

  return {
    reason: opts.reason,
    payment_intent_id: pi,
    orders: rows,
  };
}

/** True si un refund/dispute a déjà été enregistré pour ce PI (fulfill hors-ordre). */
export async function isPaymentIntentRevoked(
  paymentIntentId: string | null | undefined,
): Promise<RevocationReason | null> {
  if (!paymentIntentId?.trim()) return null;
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("stripe_payment_revocations")
    .select("reason")
    .eq("payment_intent_id", paymentIntentId.trim())
    .maybeSingle();
  if (!data?.reason) return null;
  return data.reason === "disputed" ? "disputed" : "refunded";
}

/**
 * Nettoie licence + partage créés alors qu’un refund a gagné la course
 * pendant le finalize (status n’est plus processing).
 */
export async function cleanupOrphanFulfillmentAssets(opts: {
  orderId: string;
  licenseKey: string;
  shareId: string;
  reason: RevocationReason;
}): Promise<void> {
  const sb = getSupabaseAdmin();

  await sb.from("script_licenses").update({ status: "revoked" }).eq("license_key", opts.licenseKey);

  let revokeError: string | null = null;
  try {
    await revokeNasShare(opts.shareId);
  } catch (err) {
    revokeError = err instanceof Error ? err.message.slice(0, 500) : "NAS_REVOKE_FAILED";
  }

  await sb
    .from("tool_orders")
    .update({
      license_key: opts.licenseKey,
      share_id: opts.shareId,
      status: opts.reason,
      assets_revoked_at: new Date().toISOString(),
      revoke_error: revokeError,
      share_url: null,
      share_password: null,
      error_code: "STRIPE_REVOKED",
    })
    .eq("id", opts.orderId);
}
