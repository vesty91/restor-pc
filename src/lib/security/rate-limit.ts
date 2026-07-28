import { createHash } from "crypto";

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

type MemoryEntry = { count: number; resetAt: number };

const memory = new Map<string, MemoryEntry>();

function getTrustedIp(request: Request): string {
  // Ne faire confiance à x-forwarded-for que derrière un proxy maîtrisé (Vercel).
  const trustProxy = process.env.TRUST_PROXY_HEADERS !== "false";
  if (trustProxy) {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
      const first = forwarded.split(",")[0]?.trim();
      if (first) return first;
    }
    const realIp = request.headers.get("x-real-ip")?.trim();
    if (realIp) return realIp;
  }
  return "unknown";
}

/** Clé stable (IP hashée) pour éviter de stocker l'IP brute en clair si souhaité. */
export function rateLimitKey(
  request: Request,
  scope: string,
  extra?: string
): string {
  const ip = getTrustedIp(request);
  const hash = createHash("sha256")
    .update(`${scope}|${ip}|${extra ?? ""}`)
    .digest("hex")
    .slice(0, 32);
  return `${scope}:${hash}`;
}

function checkMemory(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || now >= entry.resetAt) {
    const resetAt = now + windowMs;
    memory.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, resetAt };
  }
  if (entry.count >= limit) {
    return { ok: false, remaining: 0, resetAt: entry.resetAt };
  }
  entry.count += 1;
  return {
    ok: true,
    remaining: Math.max(0, limit - entry.count),
    resetAt: entry.resetAt,
  };
}

async function checkSupabase(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult | null> {
  if (
    !process.env.SUPABASE_URL?.trim() ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  ) {
    return null;
  }
  try {
    const { getSupabaseAdmin } = await import("@/lib/fulfillment/supabase");
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.rpc("consume_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: Math.ceil(windowMs / 1000),
    });
    if (error || data == null) return null;
    const row = data as {
      allowed?: boolean;
      remaining?: number;
      reset_at?: string;
    };
    return {
      ok: row.allowed === true,
      remaining: typeof row.remaining === "number" ? row.remaining : 0,
      resetAt: row.reset_at ? Date.parse(row.reset_at) : Date.now() + windowMs,
    };
  } catch {
    return null;
  }
}

/**
 * Rate limit : tente Supabase (persistant), sinon mémoire process.
 */
export async function enforceRateLimit(opts: {
  request: Request;
  scope: string;
  limit: number;
  windowMs: number;
  extra?: string;
}): Promise<RateLimitResult> {
  const key = rateLimitKey(opts.request, opts.scope, opts.extra);
  const remote = await checkSupabase(key, opts.limit, opts.windowMs);
  if (remote) return remote;
  return checkMemory(key, opts.limit, opts.windowMs);
}

/** Exposé pour tests unitaires. */
export function __resetMemoryRateLimitsForTests(): void {
  memory.clear();
}

export { getTrustedIp };
