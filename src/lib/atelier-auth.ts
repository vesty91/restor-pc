import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getServerEnv } from "@/lib/env";
import { logEvent } from "@/lib/logging/logger";

export const ATELIER_COOKIE = "restorpc_atelier_session";

const SESSION_TTL_SEC = 60 * 60 * 12;

function sessionSigningKey(): string | null {
  const env = getServerEnv();
  const dedicated = env.ATELIER_SESSION_SECRET?.trim();
  if (dedicated) return dedicated;
  // Transition : fallback ATELIER_SECRET interdit en production
  if (env.NODE_ENV === "production") return null;
  return env.ATELIER_SECRET?.trim() || null;
}

function atelierPassword(): string | null {
  return getServerEnv().ATELIER_SECRET?.trim() || null;
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/**
 * Session opaque signée (HMAC). Le cookie ne contient JAMAIS ATELIER_SECRET.
 * Format: v1.<exp>.<nonce>.<sig>
 */
export function createAtelierSessionToken(): string {
  const key = sessionSigningKey();
  if (!key) {
    throw new Error(
      "ATELIER_SESSION_SECRET manquant (obligatoire en production)"
    );
  }
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SEC;
  const nonce = randomBytes(16).toString("base64url");
  const payload = `v1.${exp}.${nonce}`;
  return `${payload}.${sign(payload, key)}`;
}

export function verifyAtelierSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const key = sessionSigningKey();
  if (!key) return false;
  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return false;
  const [ver, expStr, nonce, sig] = parts;
  const payload = `${ver}.${expStr}.${nonce}`;
  const expected = sign(payload, key);
  if (!safeEqual(sig, expected)) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  return true;
}

export function verifyAtelierPassword(input: string): boolean {
  const expected = atelierPassword();
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    // Compare anyway against a dummy to reduce timing oracle on length
    timingSafeEqual(Buffer.alloc(32), Buffer.alloc(32));
    return false;
  }
  return timingSafeEqual(a, b);
}

export async function isAtelierAuthed(): Promise<boolean> {
  const jar = await cookies();
  return verifyAtelierSessionToken(jar.get(ATELIER_COOKIE)?.value);
}

export function atelierCookieOptions(maxAge = SESSION_TTL_SEC) {
  return {
    httpOnly: true as const,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export function logAtelierAuth(success: boolean, requestId?: string): void {
  logEvent(success ? "info" : "warn", success ? "admin.login.success" : "admin.login.failed", {
    requestId,
  });
}
