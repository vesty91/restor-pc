import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 16 * 1024;
const MAX_REPORTS = 20;

const ACCEPTED_CONTENT_TYPES = new Set([
  "application/csp-report",
  "application/reports+json",
  "application/json",
]);

type UsefulCspFields = {
  effectiveDirective?: string;
  blockedSource?: string;
  pagePath?: string;
  disposition?: string;
  statusCode?: number;
};

type NormalizedReport = {
  report: unknown;
  fallbackUrl?: string;
};

function sanitizeBlockedSource(input: unknown): string | undefined {
  if (typeof input !== "string" || input.length === 0) return undefined;

  const specials = [
    "inline",
    "eval",
    "data",
    "data:",
    "blob",
    "blob:",
    "wasm-eval",
  ];
  const lower = input.toLowerCase().trim();
  if (specials.includes(lower)) return lower;

  if (/^https?:\/\//i.test(input)) {
    try {
      return new URL(input).origin;
    } catch {
      /* fall through */
    }
  }

  let safe = input.replace(/[\x00-\x1f\x7f]/g, "");
  safe = safe.split("?")[0].split("#")[0];
  safe = safe.replace(/\/\/[^@]*@/, "//");
  return safe.slice(0, 256) || undefined;
}

function safePath(input: unknown): string | undefined {
  if (typeof input !== "string") return undefined;
  try {
    return new URL(input).pathname.slice(0, 512);
  } catch {
    return input.split("?")[0].split("#")[0].slice(0, 512) || undefined;
  }
}

function extractUsefulFields(
  report: unknown,
  fallbackUrl?: string
): UsefulCspFields | undefined {
  if (!report || typeof report !== "object") return undefined;
  const r = report as Record<string, unknown>;

  let directive: string | undefined =
    (typeof r.effectiveDirective === "string" && r.effectiveDirective) ||
    (typeof r["effective-directive"] === "string" &&
      r["effective-directive"]) ||
    (typeof r["violated-directive"] === "string" && r["violated-directive"]) ||
    undefined;
  if (directive) directive = directive.slice(0, 128);

  const blockedSource = sanitizeBlockedSource(
    r.blockedURL ?? r["blocked-uri"]
  );

  const pagePath = safePath(
    r.documentURL ?? r["document-uri"] ?? fallbackUrl
  );

  const rawDisp = r.disposition;
  const disposition =
    rawDisp === "report" || rawDisp === "enforce" ? rawDisp : undefined;

  const rawStatus = r.statusCode ?? r["status-code"];
  let statusCode: number | undefined;
  if (
    typeof rawStatus === "number" &&
    Number.isInteger(rawStatus) &&
    rawStatus >= 0 &&
    rawStatus <= 599
  ) {
    statusCode = rawStatus;
  } else if (typeof rawStatus === "string") {
    const n = Number(rawStatus);
    if (Number.isInteger(n) && n >= 0 && n <= 599) statusCode = n;
  }

  const hasAny =
    directive ||
    blockedSource ||
    pagePath ||
    disposition ||
    statusCode != null;
  return hasAny
    ? {
        effectiveDirective: directive,
        blockedSource,
        pagePath,
        disposition,
        statusCode,
      }
    : undefined;
}

function normalizeReports(payload: unknown): NormalizedReport[] {
  if (Array.isArray(payload)) {
    const out: NormalizedReport[] = [];
    for (const item of payload) {
      if (!item || typeof item !== "object") continue;
      const r = item as Record<string, unknown>;
      if (r.type !== "csp-violation") continue;
      const body = r.body;
      if (!body || typeof body !== "object") continue;
      out.push({
        report: body,
        fallbackUrl: typeof r.url === "string" ? r.url : undefined,
      });
    }
    return out;
  }

  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (obj["csp-report"] && typeof obj["csp-report"] === "object") {
      return [{ report: obj["csp-report"] }];
    }
    return [{ report: payload }];
  }

  return [];
}

async function readBodyLimited(
  request: Request
): Promise<{ text: string; tooLarge: boolean }> {
  if (!request.body) return { text: "", tooLarge: false };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      total += value.byteLength;
      if (total > MAX_BODY_BYTES) {
        await reader.cancel();
        return { text: "", tooLarge: true };
      }
      chunks.push(value);
    }
  } catch {
    try {
      await reader.cancel();
    } catch {
      /* ignore */
    }
    return { text: "", tooLarge: false };
  }

  const buf = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    buf.set(c, offset);
    offset += c.byteLength;
  }

  return {
    text: new TextDecoder("utf-8", { fatal: false }).decode(buf),
    tooLarge: false,
  };
}

export async function POST(request: Request) {
  try {
    const limited = await enforceRateLimit({
      request,
      scope: "csp-report",
      limit: 30,
      windowMs: 60 * 60 * 1000,
    });
    if (!limited.ok) return new NextResponse(null, { status: 204 });

    const ct =
      request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() ??
      "";
    if (!ACCEPTED_CONTENT_TYPES.has(ct)) {
      return new NextResponse(null, { status: 204 });
    }

    const { text, tooLarge } = await readBodyLimited(request);
    if (tooLarge) return new NextResponse(null, { status: 413 });

    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      return new NextResponse(null, { status: 204 });
    }

    const reports = normalizeReports(payload).slice(0, MAX_REPORTS);
    for (const { report, fallbackUrl } of reports) {
      const useful = extractUsefulFields(report, fallbackUrl);
      if (useful) {
        console.info("[CSP-Report]", useful);
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
