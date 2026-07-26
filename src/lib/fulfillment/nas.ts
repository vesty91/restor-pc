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
  return (process.env.NAS_PUBLIC_BASE || "https://nas.restor-pc.fr").replace(/\/$/, "");
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
    if (!process.env.NAS_SSH_HOST?.trim()) throw httpErr;
    console.warn(
      "NAS HTTP echoue, fallback SSH:",
      httpErr instanceof Error ? httpErr.message : httpErr
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
  const user = requireEnv("NAS_USER");
  const pass = requireEnv("NAS_PASS");

  const loginUrl = new URL(`${base}/webapi/auth.cgi`);
  loginUrl.searchParams.set("api", "SYNO.API.Auth");
  loginUrl.searchParams.set("version", "6");
  loginUrl.searchParams.set("method", "login");
  loginUrl.searchParams.set("account", user);
  loginUrl.searchParams.set("passwd", pass);
  loginUrl.searchParams.set("session", "FileStation");
  loginUrl.searchParams.set("format", "sid");

  const loginRes = await fetch(loginUrl, { method: "GET", cache: "no-store" });
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
    const createUrl = new URL(`${base}/webapi/entry.cgi`);
    createUrl.searchParams.set("api", "SYNO.FileStation.Sharing");
    createUrl.searchParams.set("version", "3");
    createUrl.searchParams.set("method", "create");
    createUrl.searchParams.set("path", JSON.stringify([opts.filePath]));
    createUrl.searchParams.set("expire_times", String(opts.expireTimes));
    createUrl.searchParams.set("password", opts.password);
    createUrl.searchParams.set("_sid", sid);

    const createRes = await fetch(createUrl, { method: "GET", cache: "no-store" });
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
      const logout = new URL(`${base}/webapi/auth.cgi`);
      logout.searchParams.set("api", "SYNO.API.Auth");
      logout.searchParams.set("version", "6");
      logout.searchParams.set("method", "logout");
      logout.searchParams.set("session", "FileStation");
      logout.searchParams.set("_sid", sid);
      await fetch(logout, { method: "GET", cache: "no-store" });
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
