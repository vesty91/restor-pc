import { getProductBySlug, getStripePriceId } from "@/lib/data/outils";
import { getPublicSiteUrl, getTermsVersion } from "@/lib/env";
import { createRequestId, jsonError, publicErrorResponse } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { getStripe } from "@/lib/stripe";
import { getCompteUser } from "@/lib/supabase/server";
import { checkoutSchema, publicZodMessage } from "@/lib/validation";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const requestId = createRequestId();
  try {
    const limited = await enforceRateLimit({
      request,
      scope: "checkout",
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });
    if (!limited.ok) {
      return jsonError(
        "RATE_LIMITED",
        "Trop de tentatives de paiement. Reessayez plus tard.",
        429,
        requestId,
      );
    }

    const user = await getCompteUser();
    const email = user?.email?.trim().toLowerCase();
    if (!user || !email) {
      return jsonError(
        "AUTH_REQUIRED",
        "Compte requis. Créez un compte ou connectez-vous pour acheter.",
        401,
        requestId,
      );
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return jsonError("INVALID_BODY", "Requete invalide.", 400, requestId);
    }

    const parsed = checkoutSchema.safeParse(json);
    if (!parsed.success) {
      return jsonError(
        "INVALID_BODY",
        publicZodMessage(parsed.error, "Donnees invalides."),
        400,
        requestId,
      );
    }

    const { slug } = parsed.data;
    const product = getProductBySlug(slug);
    if (!product) {
      return jsonError("UNKNOWN_PRODUCT", "Produit inconnu.", 404, requestId);
    }

    const priceId = getStripePriceId(product);
    if (!priceId) {
      return jsonError(
        "PRICE_NOT_CONFIGURED",
        "Paiement indisponible pour ce produit pour le moment.",
        503,
        requestId,
      );
    }

    const origin = getPublicSiteUrl(new URL(request.url).origin);
    const now = new Date().toISOString();
    const termsVersion = getTermsVersion();
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/boutique/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/boutique/${slug}?canceled=1`,
      metadata: {
        tool_slug: product.slug,
        script_id: product.scriptId,
        user_id: user.id,
        stripe_price_id: priceId,
        terms_version: termsVersion,
        terms_accepted_at: now,
        withdrawal_consent_at: now,
        digital_delivery_requested_at: now,
      },
    });

    if (!session.url) {
      return jsonError(
        "STRIPE_SESSION_ERROR",
        "Impossible de démarrer le paiement.",
        500,
        requestId,
      );
    }

    return NextResponse.json({ url: session.url, requestId });
  } catch (err) {
    return publicErrorResponse(err, "CHECKOUT_FAILED", requestId);
  }
}
