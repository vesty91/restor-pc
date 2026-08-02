import { requireTechnician } from "@/lib/auth/roles";
import { fulfillToolOrder } from "@/lib/fulfillment";
import { getProductBySlug } from "@/lib/data/outils";
import { AppError, createRequestId, jsonError, publicErrorResponse } from "@/lib/errors";
import { fulfillOrderSchema, publicZodMessage } from "@/lib/validation";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const requestId = createRequestId();
  try {
    await requireTechnician();
  } catch (err) {
    if (err instanceof AppError) {
      return jsonError(err.code, err.publicMessage, err.status, requestId);
    }
    return jsonError("AUTH_REQUIRED", "Non authentifie.", 401, requestId);
  }

  try {
    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return jsonError("INVALID_BODY", "Requete invalide.", 400, requestId);
    }

    const parsed = fulfillOrderSchema.safeParse(json);
    if (!parsed.success) {
      return jsonError(
        "INVALID_BODY",
        publicZodMessage(parsed.error, "Donnees invalides."),
        400,
        requestId,
      );
    }

    const { slug, email, sendEmail } = parsed.data;
    if (!getProductBySlug(slug)) {
      return jsonError("UNKNOWN_PRODUCT", "Produit inconnu.", 400, requestId);
    }

    const result = await fulfillToolOrder({
      email,
      toolSlug: slug,
      orderRef: `atelier-${randomUUID()}`,
      source: "atelier",
      sendEmail,
    });

    return NextResponse.json({ ...result, requestId });
  } catch (err) {
    return publicErrorResponse(err, "FULFILL_FAILED", requestId);
  }
}
