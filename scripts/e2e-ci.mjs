#!/usr/bin/env node
/**
 * CI E2E : suppose `npm run build` déjà fait.
 * Démarre le serveur (next start ou standalone préparé), attend /api/health + /contact,
 * lance Playwright. Jamais `next dev`.
 */
import { spawn } from "node:child_process";
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const PORT = Number(process.env.PLAYWRIGHT_PORT || 3010);
const base = `http://127.0.0.1:${PORT}`;

async function waitUrl(path, pred, ms = 90_000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      const res = await fetch(`${base}${path}`);
      if (res.ok) {
        const text = await res.text();
        if (!pred || pred(text)) return;
      }
    } catch {
      /* retry */
    }
    await sleep(1000);
  }
  throw new Error(`Timeout waiting for ${base}${path}`);
}

function prepareStandalone() {
  const serverJs = join(".next", "standalone", "server.js");
  if (!existsSync(serverJs)) return false;

  const standNext = join(".next", "standalone", ".next");
  mkdirSync(standNext, { recursive: true });
  if (existsSync(join(".next", "static"))) {
    cpSync(join(".next", "static"), join(standNext, "static"), { recursive: true });
  }
  if (existsSync("public")) {
    cpSync("public", join(".next", "standalone", "public"), { recursive: true });
  }
  return true;
}

const preferStandalone = process.env.E2E_USE_STANDALONE !== "false";
const useStandalone = preferStandalone && prepareStandalone();

const serverEnv = {
  ...process.env,
  PORT: String(PORT),
  HOSTNAME: "127.0.0.1",
};

const server = useStandalone
  ? spawn("node", [".next/standalone/server.js"], {
      stdio: "inherit",
      shell: false,
      env: serverEnv,
      cwd: join(process.cwd(), ".next", "standalone"),
    })
  : spawn("npx", ["next", "start", "-p", String(PORT), "-H", "127.0.0.1"], {
      stdio: "inherit",
      shell: true,
      env: serverEnv,
    });

console.info(`[e2e-ci] server mode: ${useStandalone ? "standalone" : "next start"}`);

let exitCode = 1;
try {
  await waitUrl("/api/health");
  await waitUrl("/contact", (html) => html.includes("Nom complet"));
  const pw = spawn("npx", ["playwright", "test"], {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      PLAYWRIGHT_BASE_URL: base,
      PLAYWRIGHT_PORT: String(PORT),
    },
  });
  exitCode = await new Promise((resolve) => {
    pw.on("close", (code) => resolve(code ?? 1));
  });
} finally {
  server.kill("SIGTERM");
  await sleep(800);
  try {
    server.kill("SIGKILL");
  } catch {
    /* ignore */
  }
}

process.exit(exitCode);
