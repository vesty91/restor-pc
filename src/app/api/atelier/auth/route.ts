import { ATELIER_COOKIE, atelierCookieOptions, createAtelierSessionToken, logAtelierAuth, verifyAtelierPassword } from "@/lib/atelier-auth";
import { createRequestId, jsonError } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { sendAlert } from "@/lib/logging/alerts";
import { atelierAuthSchema, publicZodMessage } from "@/lib/validation";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const requestId = createRequestId();

  const limited = await enforceRateLimit({
    request,
    scope: "atelier-auth",
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });
  if (!limited.ok) {
    await sendAlert({
      event: "admin.login.rate_limited",
      level: "warn",
      message: "Trop de tentatives de connexion atelier",
      fields: { requestId },
    });
    return jsonError(
      "RATE_LIMITED",
      "Trop de tentatives. Reessayez plus tard.",
      429,
      requestId
    );
  }

  const expected = process.env.ATELIER_SECRET?.trim();
  if (!expected) {
    return jsonError(
      "ATELIER_NOT_CONFIGURED",
      "Espace atelier non configure.",
      503,
      requestId
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return jsonError("INVALID_BODY", "Requete invalide.", 400, requestId);
  }

  const parsed = atelierAuthSchema.safeParse(json);
  if (!parsed.success) {
    return jsonError(
      "INVALID_BODY",
      publicZodMessage(parsed.error, "Requete invalide."),
      400,
      requestId
    );
  }

  if (!verifyAtelierPassword(parsed.data.secret)) {
    logAtelierAuth(false, requestId);
    return jsonError("AUTH_DENIED", "Acces refuse.", 401, requestId);
  }

  logAtelierAuth(true, requestId);
  const token = createAtelierSessionToken();
  const res = NextResponse.json({ ok: true, requestId });
  res.cookies.set(ATELIER_COOKIE, token, atelierCookieOptions());
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ATELIER_COOKIE, "", { ...atelierCookieOptions(0), maxAge: 0 });
  return res;
}
