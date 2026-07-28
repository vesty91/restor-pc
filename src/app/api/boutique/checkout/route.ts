import { getProductBySlug, getStripePriceId } from "@/lib/data/outils";
import { getPublicSiteUrl, getTermsVersion } from "@/lib/env";
import { createRequestId, jsonError, publicErrorResponse } from "@/lib/errors";
import { getStripe } from "@/lib/stripe";
import { getCompteUser } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const requestId = createRequestId();
  try {
    const user = await getCompteUser();
    const email = user?.email?.trim().toLowerCase();
    if (!user || !email) {
      return jsonError(
        "AUTH_REQUIRED",
        "Compte requis. Créez un compte ou connectez-vous pour acheter.",
        401,
        requestId
      );
    }

    const body = (await request.json()) as {
      slug?: string;
      withdrawalConsent?: boolean;
    };
    const slug = body.slug?.trim();
    if (!slug) {
      return jsonError("MISSING_SLUG", "Produit manquant.", 400, requestId);
    }

    if (body.withdrawalConsent !== true) {
      return jsonError(
        "CONSENT_REQUIRED",
        "Le consentement au téléchargement immédiat est obligatoire.",
        400,
        requestId
      );
    }

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
        requestId
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
        requestId
      );
    }

    return NextResponse.json({ url: session.url, requestId });
  } catch (err) {
    return publicErrorResponse(err, "CHECKOUT_FAILED", requestId);
  }
}
