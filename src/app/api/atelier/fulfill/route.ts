import { isAtelierAuthed } from "@/lib/atelier-auth";
import { fulfillToolOrder } from "@/lib/fulfillment";
import { getProductBySlug } from "@/lib/data/outils";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAtelierAuthed())) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      slug?: string;
      email?: string;
      sendEmail?: boolean;
    };
    const slug = body.slug?.trim();
    const email = body.email?.trim().toLowerCase();
    if (!slug || !getProductBySlug(slug)) {
      return NextResponse.json({ error: "produit inconnu" }, { status: 400 });
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "email invalide" }, { status: 400 });
    }

    const result = await fulfillToolOrder({
      email,
      toolSlug: slug,
      orderRef: `atelier-${randomUUID()}`,
      source: "atelier",
      sendEmail: body.sendEmail !== false,
    });

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "erreur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
