import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "@/app/auth/callback/route";

const exchangeCodeForSessionMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      exchangeCodeForSession: exchangeCodeForSessionMock,
    },
  })),
}));

describe("auth callback GET", () => {
  beforeEach(() => {
    exchangeCodeForSessionMock.mockReset();
  });

  it("redirige vers /compte si le code OAuth est absent", async () => {
    const response = await GET(
      new Request("http://localhost/auth/callback")
    );
    expect(response.status).toBe(307);
    const location = response.headers.get("location") ?? "";
    expect(location).toContain("/compte");
    expect(location).toContain("error=oauth");
  });

  it("accepte un paramètre next interne", async () => {
    exchangeCodeForSessionMock.mockResolvedValue({ error: null });
    const response = await GET(
      new Request("http://localhost/auth/callback?code=valid&next=/boutique")
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/boutique");
  });

  it("refuse une redirection externe via next", async () => {
    exchangeCodeForSessionMock.mockResolvedValue({ error: null });
    const response = await GET(
      new Request("http://localhost/auth/callback?code=valid&next=//evil.example/phish")
    );
    expect(response.status).toBe(307);
    const location = response.headers.get("location") ?? "";
    expect(location).toBe("http://localhost/compte");
    expect(location).not.toContain("evil.example");
  });

  it("n’utilise jamais 0.0.0.0 comme origine de redirection", async () => {
    exchangeCodeForSessionMock.mockResolvedValue({ error: null });
    const prev = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.restor-pc.fr";
    const response = await GET(
      new Request("https://0.0.0.0:3000/auth/callback?code=valid&next=/compte", {
        headers: {
          host: "0.0.0.0:3000",
          "x-forwarded-proto": "https",
        },
      })
    );
    expect(response.headers.get("location")).toBe(
      "https://www.restor-pc.fr/compte"
    );
    process.env.NEXT_PUBLIC_SITE_URL = prev;
  });

  it("refuse un next sans slash initial", async () => {
    exchangeCodeForSessionMock.mockResolvedValue({ error: null });
    const response = await GET(
      new Request("http://localhost/auth/callback?code=valid&next=https://evil.example")
    );
    expect(response.headers.get("location")).toBe("http://localhost/compte");
  });

  it("redirige vers compte avec erreur si exchange échoue", async () => {
    exchangeCodeForSessionMock.mockResolvedValue({
      error: { message: "invalid code" },
    });
    const response = await GET(
      new Request("http://localhost/auth/callback?code=bad&next=/compte/commandes")
    );
    const location = response.headers.get("location") ?? "";
    expect(location).toContain("/compte");
    expect(location).toContain("error=oauth");
    expect(location).toContain("next=%2Fcompte%2Fcommandes");
    expect(location).not.toContain("invalid code");
  });
});
