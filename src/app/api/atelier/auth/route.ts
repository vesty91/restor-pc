import { ATELIER_COOKIE, atelierCookieOptions, createAtelierSessionToken, logAtelierAuth, verifyAtelierPassword } from "@/lib/atelier-auth";
import { createRequestId, jsonError } from "@/lib/errors";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const requestId = createRequestId();
  const expected = process.env.ATELIER_SECRET?.trim();
  if (!expected) {
    return jsonError(
      "ATELIER_NOT_CONFIGURED",
      "Espace atelier non configure.",
      503,
      requestId
    );
  }

  let body: { secret?: string };
  try {
    body = (await request.json()) as { secret?: string };
  } catch {
    return jsonError("INVALID_BODY", "Requete invalide.", 400, requestId);
  }

  if (!body.secret || !verifyAtelierPassword(body.secret)) {
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
