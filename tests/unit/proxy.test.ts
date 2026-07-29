import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { config, proxy } from "@/proxy";
import { updateSession } from "@/lib/supabase/middleware";

vi.mock("@/lib/supabase/middleware", () => ({
  updateSession: vi.fn(),
}));

const updateSessionMock = vi.mocked(updateSession);

/** Vérifie qu’un pathname est couvert par le matcher restreint (préfixes documentés). */
function isProxyPath(pathname: string): boolean {
  const prefixes = ["/compte", "/boutique", "/admin", "/atelier", "/auth"];
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

describe("proxy matcher", () => {
  it("exporte le matcher restreint attendu", () => {
    expect(config.matcher).toEqual([
      "/compte/:path*",
      "/boutique/:path*",
      "/admin/:path*",
      "/atelier/:path*",
      "/auth/:path*",
    ]);
    expect(config.matcher).toHaveLength(5);
  });

  it("couvre compte, boutique, admin, atelier et auth", () => {
    const covered = [
      "/compte",
      "/compte/commandes",
      "/boutique",
      "/boutique/checkout",
      "/admin",
      "/admin/licences",
      "/atelier",
      "/auth/callback",
      "/auth/confirm",
    ];
    for (const path of covered) {
      expect(isProxyPath(path), path).toBe(true);
    }
  });

  it("exclut les routes publiques et assets", () => {
    const excluded = [
      "/",
      "/contact",
      "/services",
      "/tarifs",
      "/mentions-legales",
      "/politique-confidentialite",
      "/conseils/foo",
      "/api/health",
      "/api/stripe/webhook",
      "/_next/static/chunks/main.js",
      "/_next/image",
      "/favicon.ico",
      "/robots.txt",
      "/sitemap.xml",
    ];
    for (const path of excluded) {
      expect(isProxyPath(path), path).toBe(false);
    }
  });
});

describe("proxy handler", () => {
  beforeEach(() => {
    updateSessionMock.mockReset();
    updateSessionMock.mockResolvedValue(NextResponse.next());
  });

  it("délègue à updateSession sans modifier la requête", async () => {
    const request = new NextRequest("http://localhost/compte");
    await proxy(request);
    expect(updateSessionMock).toHaveBeenCalledOnce();
    expect(updateSessionMock).toHaveBeenCalledWith(request);
  });
});
