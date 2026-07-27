import { getProductBySlug, getStripePriceId } from "@/lib/data/outils";
import { getStripe } from "@/lib/stripe";
import { getCompteUser } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const user = await getCompteUser();
    const email = user?.email?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json(
        { error: "Compte requis. Créez un compte ou connectez-vous pour acheter." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as { slug?: string };
    const slug = body.slug?.trim();
    if (!slug) {
      return NextResponse.json({ error: "slug manquant" }, { status: 400 });
    }

    const product = getProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: "produit inconnu" }, { status: 404 });
    }

    const priceId = getStripePriceId(product);
    if (!priceId) {
      return NextResponse.json(
        {
          error: `Prix Stripe non configure (${product.stripePriceEnv}). Ajoutez-le dans .env.local.`,
        },
        { status: 503 }
      );
    }

    const origin = new URL(request.url).origin;
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
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "session Stripe sans URL" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "erreur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
