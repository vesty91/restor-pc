import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { __nasTestUtils } from "@/lib/fulfillment/nas";

const { publicBase, nasHttpTimeoutMs, fetchWithTimeout } = __nasTestUtils;

describe("NAS security — publicBase()", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("accepte une URL HTTPS valide", () => {
    process.env.NAS_PUBLIC_BASE = "https://nas.example.com";
    expect(publicBase()).toBe("https://nas.example.com");
  });

  it("accepte HTTP hors production", () => {
    (process.env as Record<string, string>).NODE_ENV = "development";
    process.env.NAS_PUBLIC_BASE = "http://192.168.1.10:5000";
    expect(publicBase()).toBe("http://192.168.1.10:5000");
  });

  it("refuse HTTP en production", () => {
    (process.env as Record<string, string>).NODE_ENV = "production";
    process.env.NAS_PUBLIC_BASE = "http://192.168.1.10:5000";
    expect(() => publicBase()).toThrow("https obligatoire en production");
  });

  it("refuse une URL avec username", () => {
    process.env.NAS_PUBLIC_BASE = "https://admin@nas.example.com";
    expect(() => publicBase()).toThrow("identifiants intégrés interdits");
  });

  it("refuse une URL avec password", () => {
    process.env.NAS_PUBLIC_BASE = "https://admin:secret@nas.example.com";
    expect(() => publicBase()).toThrow("identifiants intégrés interdits");
  });

  it("refuse protocole javascript:", () => {
    process.env.NAS_PUBLIC_BASE = "javascript:alert(1)";
    expect(() => publicBase()).toThrow("protocole non autorisé");
  });

  it("refuse protocole data:", () => {
    process.env.NAS_PUBLIC_BASE = "data:text/html,<h1>hi</h1>";
    expect(() => publicBase()).toThrow("protocole non autorisé");
  });
});

describe("NAS security — nasHttpTimeoutMs()", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("renvoie 10000 par défaut si variable absente", () => {
    delete process.env.NAS_HTTP_TIMEOUT_MS;
    expect(nasHttpTimeoutMs()).toBe(10000);
  });

  it("renvoie 10000 si variable invalide", () => {
    process.env.NAS_HTTP_TIMEOUT_MS = "abc";
    expect(nasHttpTimeoutMs()).toBe(10000);
  });

  it("renvoie 10000 si valeur zéro", () => {
    process.env.NAS_HTTP_TIMEOUT_MS = "0";
    expect(nasHttpTimeoutMs()).toBe(10000);
  });

  it("accepte une valeur valide", () => {
    process.env.NAS_HTTP_TIMEOUT_MS = "15000";
    expect(nasHttpTimeoutMs()).toBe(15000);
  });

  it("plafonne à 60000 si valeur supérieure", () => {
    process.env.NAS_HTTP_TIMEOUT_MS = "120000";
    expect(nasHttpTimeoutMs()).toBe(60000);
  });
});

describe("NAS security — fetchWithTimeout() erreurs", () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.NAS_HTTP_TIMEOUT_MS = "5000";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("lève une erreur avec message NAS_DSM_HTTP_ERROR_401 sur réponse 401", async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response("", { status: 401 }));
    await expect(fetchWithTimeout("https://nas.test/api", { method: "POST" })).rejects.toThrow(
      "NAS_DSM_HTTP_ERROR_401",
    );
  });

  it("lève une erreur avec message NAS_DSM_HTTP_ERROR_500 sur réponse 500", async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response("", { status: 500 }));
    await expect(fetchWithTimeout("https://nas.test/api", { method: "POST" })).rejects.toThrow(
      "NAS_DSM_HTTP_ERROR_500",
    );
  });

  it("lève NAS_DSM_TIMEOUT sur AbortError", async () => {
    global.fetch = vi
      .fn()
      .mockRejectedValue(Object.assign(new Error("aborted"), { name: "AbortError" }));
    await expect(fetchWithTimeout("https://nas.test/api", { method: "POST" })).rejects.toThrow(
      "NAS_DSM_TIMEOUT",
    );
  });

  it("lève NAS_DSM_NETWORK_ERROR sur TypeError réseau", async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    await expect(fetchWithTimeout("https://nas.test/api", { method: "POST" })).rejects.toThrow(
      "NAS_DSM_NETWORK_ERROR",
    );
  });

  it("retourne la réponse sur succès (status 200)", async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
    const res = await fetchWithTimeout("https://nas.test/api", {
      method: "POST",
    });
    expect(res.status).toBe(200);
  });

  it("accepte un timeout spécifique en 3e argument", async () => {
    vi.useFakeTimers();
    let aborted = false;
    global.fetch = vi.fn().mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => {
            aborted = true;
            reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
          });
        }),
    );
    const promise = fetchWithTimeout("https://nas.test/api", { method: "POST" }, 200);
    vi.advanceTimersByTime(200);
    await expect(promise).rejects.toThrow("NAS_DSM_TIMEOUT");
    expect(aborted).toBe(true);
    vi.useRealTimers();
  });
});

describe("NAS security — createNasOneTimeShare (comportement observable)", () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.NAS_DSM_URL = "https://nas.test.local";
    process.env.NAS_USER = "testuser";
    process.env.NAS_PASS = "testpass";
    process.env.NAS_PUBLIC_BASE = "https://nas.example.com";
    process.env.NAS_HTTP_TIMEOUT_MS = "5000";
    (process.env as Record<string, string>).NODE_ENV = "test";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("création réussie + logout échoué => résultat conservé, pas de 2e création", async () => {
    const { createNasOneTimeShare } = await import("@/lib/fulfillment/nas");

    const calls: string[] = [];
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      calls.push(url);
      if (url.includes("/webapi/auth.cgi") && calls.length === 1) {
        return new Response(JSON.stringify({ success: true, data: { sid: "fake-sid" } }), {
          status: 200,
        });
      }
      if (url.includes("/webapi/entry.cgi")) {
        return new Response(
          JSON.stringify({
            success: true,
            data: { links: [{ id: "share-id", url: "/sharing/ABC123" }] },
          }),
          { status: 200 },
        );
      }
      // logout appel → échec
      throw new Error("logout network fail");
    });

    const result = await createNasOneTimeShare({
      filePath: "/vesty/RestorPC/Test.zip",
      password: "abc123",
      expireTimes: 1,
    });

    expect(result.id).toBe("share-id");
    expect(result.url).toContain("/sharing/ABC123");
    expect(result.password).toBe("abc123");

    // Vérifie l'ordre : login, create, logout (3 appels exactement)
    expect(calls).toHaveLength(3);
    expect(calls[0]).toContain("/webapi/auth.cgi");
    expect(calls[1]).toContain("/webapi/entry.cgi");
    expect(calls[2]).toContain("/webapi/auth.cgi");

    // Pas de 4e appel (pas de re-création)
    expect((global.fetch as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(3);
  });
});
