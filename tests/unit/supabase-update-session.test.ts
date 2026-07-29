import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const getUserMock = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: getUserMock },
  })),
}));

describe("updateSession (Supabase SSR)", () => {
  const prevUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const prevKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  beforeEach(() => {
    getUserMock.mockReset();
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = prevUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = prevKey;
  });

  it("retourne next sans erreur si les variables publiques sont absentes", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const request = new NextRequest("http://localhost/compte");
    const response = await updateSession(request);
    expect(response.status).toBe(200);
    expect(getUserMock).not.toHaveBeenCalled();
  });

  it("appelle getUser pour rafraîchir la session", async () => {
    const request = new NextRequest("http://localhost/compte");
    await updateSession(request);
    expect(getUserMock).toHaveBeenCalledOnce();
  });

  it("propage les cookies rafraîchis dans la réponse", async () => {
    const { createServerClient } = await import("@supabase/ssr");
    const createMock = vi.mocked(createServerClient);

    createMock.mockImplementation((_url, _key, options) => {
      const cookiesApi = options?.cookies;
      if (cookiesApi?.setAll) {
        cookiesApi.setAll(
          [
            {
              name: "sb-example-auth-token",
              value: "refreshed-token",
              options: { path: "/", httpOnly: true },
            },
          ],
          {},
        );
      }
      return {
        auth: { getUser: getUserMock },
      } as ReturnType<typeof createServerClient>;
    });

    const request = new NextRequest("http://localhost/boutique");
    const response = await updateSession(request);
    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toBeTruthy();
    expect(setCookie).toContain("sb-example-auth-token");
    expect(setCookie).not.toMatch(/service_role|sk_live|ATELIER_SECRET/i);
  });

  it("ne redirige pas quand la session est absente", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });
    const request = new NextRequest("http://localhost/compte");
    const response = await updateSession(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("ne expose pas les erreurs Supabase dans la réponse", async () => {
    getUserMock.mockResolvedValue({
      data: { user: null },
      error: { message: "JWT expired internal detail", status: 401 },
    });
    const request = new NextRequest("http://localhost/compte");
    const response = await updateSession(request);
    expect(response.status).toBe(200);
    const body = await response.text();
    expect(body).not.toContain("JWT expired");
    expect(body).not.toContain("internal detail");
  });
});
