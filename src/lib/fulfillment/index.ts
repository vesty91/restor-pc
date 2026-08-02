import {
  getNasFilePath,
  getProductBySlug,
  type OutilPack,
  type OutilTool,
} from "@/lib/data/outils";
import { sendPurchaseEmail } from "@/lib/fulfillment/email";
import { generateLicenseKey, generateSharePassword } from "@/lib/fulfillment/keys";
import { createNasOneTimeShare } from "@/lib/fulfillment/nas";
import {
  FULFILLABLE_STATUSES,
  type OrderStatus,
} from "@/lib/fulfillment/order-status";
import {
  cleanupOrphanFulfillmentAssets,
  isPaymentIntentRevoked,
} from "@/lib/fulfillment/revoke";
import { getSupabaseAdmin } from "@/lib/fulfillment/supabase";
import { getTermsVersion } from "@/lib/env";
import { logEvent } from "@/lib/logging/logger";
import { AppError } from "@/lib/errors";

export type { OrderStatus } from "@/lib/fulfillment/order-status";
export { ORDER_STATUSES, isOrderStatus } from "@/lib/fulfillment/order-status";

export type FulfillInput = {
  email: string;
  toolSlug: string;
  /** Stripe session id or atelier-xxx */
  orderRef: string;
  source: "stripe" | "atelier";
  sendEmail?: boolean;
  forceEmail?: boolean;
  userId?: string | null;
  stripeEventId?: string | null;
  stripePaymentIntentId?: string | null;
  stripePriceId?: string | null;
  amountTotal?: number | null;
  currency?: string | null;
  termsVersion?: string | null;
  termsAcceptedAt?: string | null;
  withdrawalConsentAt?: string | null;
  digitalDeliveryRequestedAt?: string | null;
};

export type FulfillResult = {
  licenseKey: string;
  downloadUrl: string;
  downloadPassword: string;
  expireTimes: number;
  toolTitle: string;
  scriptId: string;
  orderId: string;
  status: OrderStatus;
  emailId?: string | null;
  emailError?: string | null;
};

type OrderRow = {
  id: string;
  status: string;
  license_key: string | null;
  share_url: string | null;
  share_password: string | null;
  expire_times: number | null;
  tool_title: string | null;
  script_id: string | null;
  email_sent_at: string | null;
  email_id: string | null;
  email_error: string | null;
  user_id: string | null;
};

async function trySendAndRecord(opts: {
  orderId: string;
  email: string;
  toolTitle: string;
  licenseKey: string;
  downloadUrl: string;
  downloadPassword: string;
  expireTimes: number;
  force?: boolean;
  alreadySentAt?: string | null;
}): Promise<{ emailId: string | null; emailError: string | null }> {
  if (!opts.force && opts.alreadySentAt) {
    return { emailId: null, emailError: null };
  }

  const sb = getSupabaseAdmin();
  try {
    const { id } = await sendPurchaseEmail({
      to: opts.email,
      toolTitle: opts.toolTitle,
      licenseKey: opts.licenseKey,
      downloadUrl: opts.downloadUrl,
      downloadPassword: opts.downloadPassword,
      expireTimes: opts.expireTimes,
    });
    await sb
      .from("tool_orders")
      .update({
        email_sent_at: new Date().toISOString(),
        email_id: id,
        email_error: null,
        email_retry_needed: false,
      })
      .eq("id", opts.orderId);
    logEvent("info", "email.sent", { orderId: opts.orderId });
    return { emailId: id, emailError: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "email_failed";
    logEvent("error", "email.failed", { orderId: opts.orderId });
    await sb
      .from("tool_orders")
      .update({
        email_error: msg.slice(0, 500),
        email_retry_needed: true,
      })
      .eq("id", opts.orderId);
    return { emailId: null, emailError: msg };
  }
}

async function markFailed(orderId: string, code: string): Promise<void> {
  const sb = getSupabaseAdmin();
  await sb
    .from("tool_orders")
    .update({
      status: "failed",
      error_code: code.slice(0, 120),
      failed_at: new Date().toISOString(),
    })
    .eq("id", orderId);
  logEvent("error", "order.processing.failed", { orderId, errorCode: code });
}

/**
 * Réserve atomiquement une commande (unique order_ref).
 * Si déjà fulfilled avec assets → retourne la ligne existante.
 */
async function reserveOrder(input: FulfillInput): Promise<OrderRow> {
  const sb = getSupabaseAdmin();
  const product = getProductBySlug(input.toolSlug);
  if (!product) {
    throw new AppError({
      code: "UNKNOWN_PRODUCT",
      status: 400,
      publicMessage: "Produit inconnu.",
      message: `Produit inconnu: ${input.toolSlug}`,
    });
  }

  const email = input.email.trim().toLowerCase();
  const now = new Date().toISOString();

  const { data: existing } = await sb
    .from("tool_orders")
    .select(
      "id, status, license_key, share_url, share_password, expire_times, tool_title, script_id, email_sent_at, email_id, email_error, user_id"
    )
    .eq("order_ref", input.orderRef)
    .maybeSingle();

  if (existing) {
    return existing as OrderRow;
  }

  const { data: inserted, error } = await sb
    .from("tool_orders")
    .insert({
      order_ref: input.orderRef,
      source: input.source,
      email,
      user_id: input.userId ?? null,
      tool_slug: input.toolSlug,
      tool_title: product.title,
      script_id: product.scriptId,
      status: "pending",
      stripe_event_id: input.stripeEventId ?? null,
      stripe_payment_intent_id: input.stripePaymentIntentId ?? null,
      stripe_price_id: input.stripePriceId ?? null,
      stripe_checkout_session_id:
        input.source === "stripe" ? input.orderRef : null,
      amount_total: input.amountTotal ?? null,
      currency: input.currency ?? null,
      terms_version: input.termsVersion ?? getTermsVersion(),
      terms_accepted_at: input.termsAcceptedAt ?? null,
      withdrawal_consent_at: input.withdrawalConsentAt ?? null,
      digital_delivery_requested_at:
        input.digitalDeliveryRequestedAt ?? now,
    })
    .select(
      "id, status, license_key, share_url, share_password, expire_times, tool_title, script_id, email_sent_at, email_id, email_error, user_id"
    )
    .single();

  if (error) {
    // Course : un autre worker a créé la ligne
    if (error.code === "23505") {
      const { data: raced } = await sb
        .from("tool_orders")
        .select(
          "id, status, license_key, share_url, share_password, expire_times, tool_title, script_id, email_sent_at, email_id, email_error, user_id"
        )
        .eq("order_ref", input.orderRef)
        .maybeSingle();
      if (raced) return raced as OrderRow;
    }
    throw new AppError({
      code: "ORDER_RESERVE_FAILED",
      status: 500,
      publicMessage: "Impossible de réserver la commande.",
      message: error.message,
    });
  }

  return inserted as OrderRow;
}

export async function fulfillToolOrder(input: FulfillInput): Promise<FulfillResult> {
  const product = getProductBySlug(input.toolSlug);
  if (!product) {
    throw new AppError({
      code: "UNKNOWN_PRODUCT",
      status: 400,
      publicMessage: "Produit inconnu.",
    });
  }

  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new AppError({
      code: "INVALID_EMAIL",
      status: 400,
      publicMessage: "Email invalide.",
    });
  }

  if (input.userId) {
    const uuidRe =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRe.test(input.userId)) {
      throw new AppError({
        code: "INVALID_USER_ID",
        status: 400,
        publicMessage: "Identifiant utilisateur invalide.",
      });
    }
  }

  const sb = getSupabaseAdmin();
  const order = await reserveOrder(input);

  // Refund/dispute arrivé avant ou pendant la livraison (hors-ordre Stripe)
  const revokedReason = await isPaymentIntentRevoked(
    input.stripePaymentIntentId
  );
  if (revokedReason) {
    await sb
      .from("tool_orders")
      .update({
        status: revokedReason,
        error_code: "STRIPE_REVOKED",
        user_id: input.userId ?? order.user_id,
      })
      .eq("id", order.id)
      .in("status", ["pending", "processing", "failed"]);
    throw new AppError({
      code: "ORDER_NOT_FULFILLABLE",
      status: 409,
      publicMessage: "Cette commande ne peut plus être livrée.",
    });
  }

  // Déjà livré → idempotent (email seulement si besoin)
  if (
    order.status === "fulfilled" &&
    order.license_key &&
    order.share_url &&
    order.share_password
  ) {
    let emailId = order.email_id;
    let emailError = order.email_error;
    if (input.sendEmail !== false) {
      const sent = await trySendAndRecord({
        orderId: order.id,
        email,
        toolTitle: order.tool_title || product.title,
        licenseKey: order.license_key,
        downloadUrl: order.share_url,
        downloadPassword: order.share_password,
        expireTimes: order.expire_times ?? 1,
        force: input.forceEmail === true,
        alreadySentAt: order.email_sent_at,
      });
      emailId = sent.emailId ?? emailId;
      emailError = sent.emailError;
    }
    return {
      licenseKey: order.license_key,
      downloadUrl: order.share_url,
      downloadPassword: order.share_password,
      expireTimes: order.expire_times ?? 1,
      toolTitle: order.tool_title || product.title,
      scriptId: order.script_id || product.scriptId,
      orderId: order.id,
      status: "fulfilled",
      emailId,
      emailError,
    };
  }

  if (order.status === "refunded" || order.status === "cancelled") {
    throw new AppError({
      code: "ORDER_NOT_FULFILLABLE",
      status: 409,
      publicMessage: "Cette commande ne peut plus être livrée.",
    });
  }

  // Claim processing atomique (pending|failed → processing). Jamais depuis processing concurrent.
  const { data: claimed, error: claimErr } = await sb.rpc("claim_tool_order", {
    p_order_id: order.id,
  });

  if (claimErr) {
    // Fallback si RPC absente : update conditionnel strict
    const { data: updated, error: updClaimErr } = await sb
      .from("tool_orders")
      .update({
        status: "processing",
        processing_started_at: new Date().toISOString(),
        user_id: input.userId ?? order.user_id,
        error_code: null,
      })
      .eq("id", order.id)
      .in("status", FULFILLABLE_STATUSES)
      .select("id")
      .maybeSingle();

    if (updClaimErr) {
      throw new AppError({
        code: "ORDER_CLAIM_FAILED",
        status: 500,
        publicMessage: "Impossible de démarrer la livraison.",
        message: updClaimErr.message,
      });
    }
    if (!updated) {
      // Autre worker en cours ou déjà fulfilled — relire
      const { data: again } = await sb
        .from("tool_orders")
        .select(
          "id, status, license_key, share_url, share_password, expire_times, tool_title, script_id, email_sent_at, email_id, email_error, user_id"
        )
        .eq("id", order.id)
        .maybeSingle();
      if (
        again?.status === "fulfilled" &&
        again.license_key &&
        again.share_url &&
        again.share_password
      ) {
        return {
          licenseKey: again.license_key,
          downloadUrl: again.share_url,
          downloadPassword: again.share_password,
          expireTimes: again.expire_times ?? 1,
          toolTitle: again.tool_title || product.title,
          scriptId: again.script_id || product.scriptId,
          orderId: again.id,
          status: "fulfilled",
          emailId: again.email_id,
          emailError: again.email_error,
        };
      }
      throw new AppError({
        code: "ORDER_CLAIM_RACE",
        status: 409,
        publicMessage: "Livraison déjà en cours. Réessayez dans un instant.",
      });
    }
  } else if (claimed !== true) {
    const { data: again } = await sb
      .from("tool_orders")
      .select(
        "id, status, license_key, share_url, share_password, expire_times, tool_title, script_id, email_sent_at, email_id, email_error, user_id"
      )
      .eq("id", order.id)
      .maybeSingle();
    if (
      again?.status === "fulfilled" &&
      again.license_key &&
      again.share_url &&
      again.share_password
    ) {
      return {
        licenseKey: again.license_key,
        downloadUrl: again.share_url,
        downloadPassword: again.share_password,
        expireTimes: again.expire_times ?? 1,
        toolTitle: again.tool_title || product.title,
        scriptId: again.script_id || product.scriptId,
        orderId: again.id,
        status: "fulfilled",
        emailId: again.email_id,
        emailError: again.email_error,
      };
    }
    throw new AppError({
      code: "ORDER_CLAIM_RACE",
      status: 409,
      publicMessage: "Livraison déjà en cours. Réessayez dans un instant.",
    });
  } else if (input.userId) {
    await sb
      .from("tool_orders")
      .update({ user_id: input.userId })
      .eq("id", order.id)
      .is("user_id", null);
  }

  logEvent("info", "order.processing.started", {
    orderId: order.id,
    orderRef: input.orderRef,
  });

  // Si assets déjà présents (retry après échec email uniquement)
  if (order.license_key && order.share_url && order.share_password) {
    const { data: fulfilledOk } = await sb
      .from("tool_orders")
      .update({ status: "fulfilled" })
      .eq("id", order.id)
      .eq("status", "processing")
      .select("id")
      .maybeSingle();

    if (!fulfilledOk) {
      const { data: current } = await sb
        .from("tool_orders")
        .select("status")
        .eq("id", order.id)
        .maybeSingle();
      if (
        current?.status === "refunded" ||
        current?.status === "disputed" ||
        current?.status === "cancelled"
      ) {
        throw new AppError({
          code: "ORDER_NOT_FULFILLABLE",
          status: 409,
          publicMessage: "Cette commande ne peut plus être livrée.",
        });
      }
    }

    let emailId = order.email_id;
    let emailError = order.email_error;
    if (input.sendEmail !== false) {
      const sent = await trySendAndRecord({
        orderId: order.id,
        email,
        toolTitle: order.tool_title || product.title,
        licenseKey: order.license_key,
        downloadUrl: order.share_url,
        downloadPassword: order.share_password,
        expireTimes: order.expire_times ?? 1,
        force: input.forceEmail === true,
        alreadySentAt: order.email_sent_at,
      });
      emailId = sent.emailId ?? emailId;
      emailError = sent.emailError;
    }

    return {
      licenseKey: order.license_key,
      downloadUrl: order.share_url,
      downloadPassword: order.share_password,
      expireTimes: order.expire_times ?? 1,
      toolTitle: order.tool_title || product.title,
      scriptId: order.script_id || product.scriptId,
      orderId: order.id,
      status: "fulfilled",
      emailId,
      emailError,
    };
  }

  const licenseKey = generateLicenseKey();
  const sharePassword = generateSharePassword();
  const expireTimes = 1;
  const scriptId = product.scriptId;

  const { error: licErr } = await sb.from("script_licenses").insert({
    license_key: licenseKey,
    script_id: scriptId,
    status: "active",
    note: `${input.source}:${input.toolSlug}:${email}`,
    max_machines: 1,
  });

  if (licErr) {
    // Conflit unique improbable : relire
    await markFailed(order.id, "LICENSE_INSERT_FAILED");
    throw new AppError({
      code: "LICENSE_CREATE_FAILED",
      status: 500,
      publicMessage: "Échec de création de licence.",
      message: licErr.message,
    });
  }

  logEvent("info", "license.created", { orderId: order.id });

  let share: { id: string; url: string; password: string };
  try {
    share = await createNasOneTimeShare({
      filePath: getNasFilePath(product),
      password: sharePassword,
      expireTimes,
    });
    logEvent("info", "nas.link.created", { orderId: order.id });
  } catch (err) {
    await markFailed(order.id, "NAS_LINK_FAILED");
    logEvent("error", "nas.link.failed", { orderId: order.id });
    throw new AppError({
      code: "NAS_LINK_FAILED",
      status: 500,
      publicMessage: "Échec de préparation du téléchargement.",
      cause: err,
    });
  }

  const { data: finalized, error: updErr } = await sb.rpc(
    "finalize_tool_order_fulfillment",
    {
      p_order_id: order.id,
      p_license_key: licenseKey,
      p_share_id: share.id,
      p_share_url: share.url,
      p_share_password: share.password,
      p_expire_times: expireTimes,
      p_user_id: input.userId ?? order.user_id,
    }
  );

  if (updErr) {
    // Fallback : update conditionnel status=processing uniquement
    const { data: updated, error: fallbackErr } = await sb
      .from("tool_orders")
      .update({
        license_key: licenseKey,
        share_id: share.id,
        share_url: share.url,
        share_password: share.password,
        expire_times: expireTimes,
        status: "fulfilled",
        fulfilled_at: new Date().toISOString(),
        error_code: null,
        email_status: "pending",
        user_id: input.userId ?? order.user_id,
      })
      .eq("id", order.id)
      .eq("status", "processing")
      .select("id")
      .maybeSingle();

    if (fallbackErr) {
      await markFailed(order.id, "ORDER_UPDATE_FAILED");
      throw new AppError({
        code: "ORDER_UPDATE_FAILED",
        status: 500,
        publicMessage: "Échec d'enregistrement de la commande.",
        message: fallbackErr.message,
      });
    }
    if (!updated) {
      const reason =
        (await isPaymentIntentRevoked(input.stripePaymentIntentId)) ??
        "refunded";
      await cleanupOrphanFulfillmentAssets({
        orderId: order.id,
        licenseKey,
        shareId: share.id,
        reason,
      });
      throw new AppError({
        code: "ORDER_NOT_FULFILLABLE",
        status: 409,
        publicMessage: "Cette commande ne peut plus être livrée.",
      });
    }
  } else if (finalized !== true) {
    const reason =
      (await isPaymentIntentRevoked(input.stripePaymentIntentId)) ?? "refunded";
    await cleanupOrphanFulfillmentAssets({
      orderId: order.id,
      licenseKey,
      shareId: share.id,
      reason,
    });
    throw new AppError({
      code: "ORDER_NOT_FULFILLABLE",
      status: 409,
      publicMessage: "Cette commande ne peut plus être livrée.",
    });
  }

  logEvent("info", "order.fulfilled", { orderId: order.id });

  let emailId: string | null = null;
  let emailError: string | null = null;
  if (input.sendEmail !== false) {
    const sent = await trySendAndRecord({
      orderId: order.id,
      email,
      toolTitle: product.title,
      licenseKey,
      downloadUrl: share.url,
      downloadPassword: share.password,
      expireTimes,
      force: true,
    });
    emailId = sent.emailId;
    emailError = sent.emailError;
    // Échec email ≠ échec fulfillment (pas de nouvelle licence)
  }

  return {
    licenseKey,
    downloadUrl: share.url,
    downloadPassword: share.password,
    expireTimes,
    toolTitle: product.title,
    scriptId,
    orderId: order.id,
    status: "fulfilled",
    emailId,
    emailError,
  };
}

export function isPack(product: OutilTool | OutilPack): product is OutilPack {
  return "isPack" in product && product.isPack === true;
}
