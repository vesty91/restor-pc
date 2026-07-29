type NasShareResult = {
  id: string;
  url: string;
  password: string;
  expireTimes: number;
};

function requireEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`${name} manquant`);
  return v;
}

function publicBase(): string {
  const raw = (process.env.NAS_PUBLIC_BASE || "https://nas.restor-pc.fr").trim();
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new Error("NAS_PUBLIC_BASE invalide (URL non valide).");
  }

  const protocol = u.protocol.toLowerCase();
  const isProd = process.env.NODE_ENV === "production";

  // Bloque explicitement toute URL non HTTP(S) (ex: javascript:, data:, ftp:, etc.)
  const isHttp = protocol === "http:";
  const isHttps = protocol === "https:";
  if (!isHttp && !isHttps) {
    throw new Error("NAS_PUBLIC_BASE invalide (protocole non autorisé).");
  }
  if (isProd && !isHttps) {
    throw new Error(
      "NAS_PUBLIC_BASE invalide (https obligatoire en production)."
    );
  }

  // Les identifiants DSM ne doivent jamais être intégrés dans l'URL.
  // (username/password dans NAS_PUBLIC_BASE)
  if (u.username || u.password) {
    throw new Error("NAS_PUBLIC_BASE invalide (identifiants intégrés interdits).");
  }

  // Retire le slash final pour éviter des doubles slash lors de concaténation.
  return u.toString().replace(/\/$/, "");
}

function nasHttpTimeoutMs(): number {
  const raw = process.env.NAS_HTTP_TIMEOUT_MS?.trim();
  const n = raw ? Number(raw) : NaN;
  if (!Number.isFinite(n) || n <= 0) return 10000;
  // Évite les timeouts excessivement élevés.
  return Math.min(Math.floor(n), 60000);
}

class NasDsmTimeoutError extends Error {
  constructor() {
    super("NAS_DSM_TIMEOUT");
    this.name = "NasDsmTimeoutError";
  }
}

class NasDsmNetworkError extends Error {
  constructor() {
    super("NAS_DSM_NETWORK_ERROR");
    this.name = "NasDsmNetworkError";
  }
}

class NasDsmHttpError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(`NAS_DSM_HTTP_ERROR_${status}`);
    this.name = "NasDsmHttpError";
    this.status = status;
  }
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = nasHttpTimeoutMs()
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    if (!res.ok) {
      // Distingue clairement erreur HTTP.
      throw new NasDsmHttpError(res.status);
    }
    return res;
  } catch (err) {
    // Si l'erreur a déjà été catégorisée, on la conserve.
    if (
      err instanceof NasDsmTimeoutError ||
      err instanceof NasDsmNetworkError ||
      err instanceof NasDsmHttpError
    ) {
      throw err;
    }

    const name =
      err && typeof err === "object" && "name" in err
        ? (err as { name?: unknown }).name
        : undefined;
    // Distinction timeout vs réseau.
    if (name === "AbortError") {
      throw new NasDsmTimeoutError();
    }
    if (err instanceof TypeError) {
      throw new NasDsmNetworkError();
    }
    throw new NasDsmNetworkError();
  } finally {
    clearTimeout(timer);
  }
}

/** Normalise l'URL renvoyee par DSM (parfois absolue avec :9169). */
function toPublicShareUrl(linkUrl: string): string {
  const base = publicBase();
  if (/^https?:\/\//i.test(linkUrl)) {
    try {
      const u = new URL(linkUrl);
      const m = u.pathname.match(/\/sharing\/[^/?#]+/i);
      if (m) return `${base}${m[0]}`;
      return `${base}${u.pathname}`;
    } catch {
      /* fall through */
    }
  }
  const rel = linkUrl.startsWith("/") ? linkUrl : `/${linkUrl}`;
  return `${base}${rel}`;
}

/**
 * Cree un lien File Station Synology (1 DL + mot de passe).
 * 1) API HTTP DSM (NAS_DSM_URL) — compte sans 2FA recommande
 * 2) Fallback SSH + synowebapi (NAS_SSH_HOST) — atelier local uniquement
 */
export async function createNasOneTimeShare(opts: {
  filePath: string;
  password: string;
  expireTimes?: number;
  publicBase?: string;
}): Promise<NasShareResult> {
  const expireTimes = opts.expireTimes ?? 1;
  try {
    return await createViaHttp({ ...opts, expireTimes });
  } catch (httpErr) {
    const sshEnabled = process.env.NAS_SSH_FALLBACK_ENABLED === "true";
    if (!sshEnabled || !process.env.NAS_SSH_HOST?.trim()) throw httpErr;
    console.warn(
      "NAS HTTP echoue, fallback SSH:",
      httpErr instanceof Error ? httpErr.message : "error"
    );
    return await createViaSsh({ ...opts, expireTimes });
  }
}

async function createViaHttp(opts: {
  filePath: string;
  password: string;
  expireTimes: number;
}): Promise<NasShareResult> {
  const base = requireEnv("NAS_DSM_URL").replace(/\/$/, "");
  if (!base.startsWith("https://")) {
    throw new Error("NAS_DSM_URL doit utiliser HTTPS");
  }
  const user = requireEnv("NAS_USER");
  const pass = requireEnv("NAS_PASS");

  // POST : ne pas mettre le mot de passe dans l'URL (logs proxy / historique)
  const loginBody = new URLSearchParams({
    api: "SYNO.API.Auth",
    version: "6",
    method: "login",
    account: user,
    passwd: pass,
    session: "FileStation",
    format: "sid",
  });

  const loginRes = await fetchWithTimeout(`${base}/webapi/auth.cgi`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: loginBody,
    cache: "no-store",
  });
  const loginJson = (await loginRes.json()) as {
    success?: boolean;
    data?: { sid?: string };
    error?: { code?: number };
  };
  if (!loginJson.success || !loginJson.data?.sid) {
    throw new Error(
      `NAS login echoue (code ${loginJson.error?.code ?? "?"}). Verifiez NAS_DSM_URL / 2FA / identifiants.`
    );
  }
  const sid = loginJson.data.sid;

  try {
    const createBody = new URLSearchParams({
      api: "SYNO.FileStation.Sharing",
      version: "3",
      method: "create",
      path: JSON.stringify([opts.filePath]),
      expire_times: String(opts.expireTimes),
      password: opts.password,
      _sid: sid,
    });

    const createRes = await fetchWithTimeout(`${base}/webapi/entry.cgi`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: createBody,
      cache: "no-store",
    });
    const createJson = (await createRes.json()) as {
      success?: boolean;
      data?: { links?: Array<{ id: string; url: string }> };
      error?: { code?: number };
    };
    if (!createJson.success || !createJson.data?.links?.[0]) {
      throw new Error(
        `NAS share create echoue (code ${createJson.error?.code ?? "?"}) pour ${opts.filePath}`
      );
    }
    const link = createJson.data.links[0];
    return {
      id: link.id,
      url: toPublicShareUrl(link.url),
      password: opts.password,
      expireTimes: opts.expireTimes,
    };
  } finally {
    try {
      const logoutBody = new URLSearchParams({
        api: "SYNO.API.Auth",
        version: "6",
        method: "logout",
        session: "FileStation",
        _sid: sid,
      });
      try {
        await fetchWithTimeout(
          `${base}/webapi/auth.cgi`,
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: logoutBody,
            cache: "no-store",
          },
          2000
        );
      } catch {
        // Best-effort : le partage a déjà été créé avec succès.
      }
    } catch {
      /* ignore */
    }
  }
}

async function createViaSsh(opts: {
  filePath: string;
  password: string;
  expireTimes: number;
}): Promise<NasShareResult> {
  const { Client } = await import("ssh2");
  const host = requireEnv("NAS_SSH_HOST");
  const user = process.env.NAS_SSH_USER?.trim() || "vesty";
  const pass = requireEnv("NAS_SSH_PASS");
  const fsPath = opts.filePath;
  const sharePass = opts.password.replace(/'/g, "");
  const expire = opts.expireTimes;

  return new Promise((resolve, reject) => {
    const conn = new Client();
    const timeout = setTimeout(() => {
      conn.end();
      reject(new Error("NAS SSH timeout"));
    }, 60000);

    conn
      .on("ready", () => {
        const vol = `/volume1${fsPath}`;
        const pathJson = JSON.stringify([fsPath]).replace(/'/g, "");
        const inner = `/usr/syno/bin/synowebapi --exec api=SYNO.FileStation.Sharing method=create version=3 path='${pathJson}' expire_times=${expire} password='${sharePass}'`;
        const sudoPw = pass.replace(/'/g, `'\"'\"'`);
        const cmd = `echo '${sudoPw}' | sudo -S -p '' sh -c 'test -f "${vol}" || exit 44; ${inner}'`;

        conn.exec(cmd, { pty: true }, (err, stream) => {
          if (err) {
            clearTimeout(timeout);
            conn.end();
            reject(err);
            return;
          }
          let out = "";
          stream
            .on("close", () => {
              clearTimeout(timeout);
              conn.end();
              try {
                const j = extractJson(out);
                if (!j?.success || !j.data?.links?.[0]) {
                  reject(new Error(`NAS SSH share fail: ${out.slice(-500)}`));
                  return;
                }
                const link = j.data.links[0] as { id: string; url: string };
                resolve({
                  id: link.id,
                  url: toPublicShareUrl(link.url),
                  password: opts.password,
                  expireTimes: opts.expireTimes,
                });
              } catch (e) {
                reject(e);
              }
            })
            .on("data", (d: Buffer) => {
              out += d.toString("utf8");
            });
          stream.stderr?.on("data", (d: Buffer) => {
            out += d.toString("utf8");
          });
        });
      })
      .on("error", (e) => {
        clearTimeout(timeout);
        reject(e);
      })
      .connect({
        host,
        port: Number(process.env.NAS_SSH_PORT || 22),
        username: user,
        password: pass,
        readyTimeout: 20000,
      });
  });
}

function extractJson(text: string): {
  success?: boolean;
  data?: { links?: Array<{ id: string; url: string }> };
} | null {
  const m = text.match(/\{\s*"(data|error|success)"\s*:/);
  if (!m || m.index === undefined) return null;
  const chunk = text.slice(m.index);
  let depth = 0;
  let end: number | null = null;
  for (let i = 0; i < chunk.length; i++) {
    const ch = chunk[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (end == null) return null;
  return JSON.parse(chunk.slice(0, end)) as {
    success?: boolean;
    data?: { links?: Array<{ id: string; url: string }> };
  };
}

/** @internal Réservé aux tests unitaires. */
export const __nasTestUtils = {
  publicBase,
  nasHttpTimeoutMs,
  fetchWithTimeout,
} as const;
