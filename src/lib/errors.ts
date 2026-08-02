import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export type PublicErrorBody = {
  error: string;
  code: string;
  requestId: string;
};

export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  readonly publicMessage: string;

  constructor(opts: {
    code: string;
    status?: number;
    publicMessage?: string;
    cause?: unknown;
    message?: string;
  }) {
    super(opts.message ?? opts.publicMessage ?? opts.code);
    this.name = "AppError";
    this.code = opts.code;
    this.status = opts.status ?? 500;
    this.publicMessage = opts.publicMessage ?? "Une erreur est survenue.";
    if (opts.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = opts.cause;
    }
  }
}

export function createRequestId(): string {
  return randomUUID();
}

export function logServerError(
  requestId: string,
  event: string,
  err: unknown,
  extra?: Record<string, unknown>,
): void {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  console.error(
    JSON.stringify({
      level: "error",
      timestamp: new Date().toISOString(),
      requestId,
      event,
      message,
      stack: process.env.NODE_ENV === "production" ? undefined : stack,
      ...sanitizeLogExtra(extra),
    }),
  );
}

function sanitizeLogExtra(extra?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!extra) return undefined;
  const blocked = /password|secret|token|authorization|cookie|license_key|share_password|sid/i;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(extra)) {
    if (blocked.test(k)) {
      out[k] = "[redacted]";
    } else {
      out[k] = v;
    }
  }
  return out;
}

export function publicErrorResponse(
  err: unknown,
  fallbackCode = "INTERNAL_ERROR",
  requestId = createRequestId(),
): NextResponse<PublicErrorBody> {
  if (err instanceof AppError) {
    logServerError(requestId, err.code, err);
    return NextResponse.json(
      {
        error: err.publicMessage,
        code: err.code,
        requestId,
      },
      { status: err.status },
    );
  }

  logServerError(requestId, fallbackCode, err);
  return NextResponse.json(
    {
      error: "Une erreur est survenue.",
      code: fallbackCode,
      requestId,
    },
    { status: 500 },
  );
}

export function jsonError(
  code: string,
  publicMessage: string,
  status: number,
  requestId = createRequestId(),
): NextResponse<PublicErrorBody> {
  return NextResponse.json({ error: publicMessage, code, requestId }, { status });
}
