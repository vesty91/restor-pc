import { isAtelierAuthed } from "@/lib/atelier-auth";
import { fulfillToolOrder } from "@/lib/fulfillment";
import { getProductBySlug } from "@/lib/data/outils";
import { createRequestId, jsonError, publicErrorResponse } from "@/lib/errors";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const requestId = createRequestId();
  if (!(await isAtelierAuthed())) {
    return jsonError("AUTH_REQUIRED", "Non authentifie.", 401, requestId);
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
      return jsonError("UNKNOWN_PRODUCT", "Produit inconnu.", 400, requestId);
    }
    if (!email || !email.includes("@")) {
      return jsonError("INVALID_EMAIL", "Email invalide.", 400, requestId);
    }

    const result = await fulfillToolOrder({
      email,
      toolSlug: slug,
      orderRef: `atelier-${randomUUID()}`,
      source: "atelier",
      sendEmail: body.sendEmail !== false,
    });

    return NextResponse.json({ ...result, requestId });
  } catch (err) {
    return publicErrorResponse(err, "FULFILL_FAILED", requestId);
  }
}
