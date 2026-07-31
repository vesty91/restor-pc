import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/site";
import { NextResponse } from "next/server";

function safeNext(path: string | null): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/compte";
  return path;
}

/**
 * Derrière le reverse proxy NAS, `request.url` peut être `https://0.0.0.0:3000`.
 * Ne jamais rediriger le navigateur vers cette origine interne.
 */
function resolveRedirectOrigin(request: Request): string {
  const requestOrigin = new URL(request.url).origin;

  // Dev / tests unitaires
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(requestOrigin)) {
    return requestOrigin;
  }

  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (envUrl) return envUrl;

  const hostHeader =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto");
  const host = hostHeader?.split(",")[0]?.trim();
  if (
    host &&
    proto &&
    !/^0\.0\.0\.0(:\d+)?$/i.test(host) &&
    !/^localhost(:\d+)?$/i.test(host)
  ) {
    return `${proto}://${host}`;
  }

  if (/^https?:\/\/0\.0\.0\.0(:\d+)?$/i.test(requestOrigin)) {
    return siteConfig.url;
  }

  return siteConfig.url;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));
  const origin = resolveRedirectOrigin(request);

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch {
      /* env manquante / erreur réseau — retomber sur erreur oauth */
    }
  }

  return NextResponse.redirect(
    `${origin}/compte?error=oauth&mode=login${next !== "/compte" ? `&next=${encodeURIComponent(next)}` : ""}`
  );
}
