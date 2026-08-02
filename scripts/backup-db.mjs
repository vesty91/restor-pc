/**
 * Sauvegarde de la base Supabase (pg_dump) + copie optionnelle sur le NAS.
 *
 * Prérequis :
 *   - Docker installé (utilise l'image postgres:17-alpine, pas besoin de
 *     pg_dump en local).
 *   - `SUPABASE_DB_URL` défini dans .env.local : connection string Postgres
 *     directe (Supabase Dashboard > Project Settings > Database >
 *     Connection string > URI). Différent de SUPABASE_URL (API REST).
 *
 * Optionnel :
 *   - `BACKUP_NAS_REMOTE_DIR` : dossier distant sur le NAS où copier le
 *     dump via SFTP (réutilise NAS_SSH_HOST/USER/PASS). Si absent, la
 *     sauvegarde reste uniquement locale dans ./backups (gitignored).
 *   - `BACKUP_KEEP` : nombre de sauvegardes locales conservées (défaut 14).
 *   - `NTFY_TOPIC` : active une notification push (ntfy.sh) à chaque
 *     exécution (succès ET échec). Sert de "heartbeat" : si aucune
 *     notification n'arrive un jour donné (PC éteint, tâche non lancée),
 *     c'est en soi le signal d'alerte. Voir docs/BACKUP_RESTORE.md.
 *     `NTFY_SERVER` (défaut https://ntfy.sh) et `NTFY_TOKEN` (si topic
 *     protégé / instance self-hostée) sont optionnels.
 *
 * Usage :
 *   npm run backup:db
 *
 * Planification (Go Live) :
 *   - Windows : Planificateur de tâches, tâche hebdo (ou quotidienne) qui
 *     lance `npm run backup:db` dans le dossier du projet.
 *   - NAS Synology : Task Scheduler DSM avec le même script si Node/Docker
 *     y sont disponibles, sinon exécuter depuis le poste qui héberge le repo.
 */
import { spawn } from "node:child_process";
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createGzip } from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadDotEnvLocal() {
  const envPath = join(root, ".env.local");
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    const [, key, rawVal] = m;
    if (process.env[key] !== undefined) continue;
    let val = rawVal.trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

async function main() {
  loadDotEnvLocal();

  const dbUrl = process.env.SUPABASE_DB_URL?.trim();
  if (!dbUrl) {
    console.error(
      "✗ SUPABASE_DB_URL manquant. Renseignez-le dans .env.local " +
        "(Supabase Dashboard > Project Settings > Database > Connection string > URI).",
    );
    process.exit(1);
  }

  const backupsDir = join(root, "backups");
  if (!existsSync(backupsDir)) mkdirSync(backupsDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `restor-pc-db-${stamp}.sql.gz`;
  const filepath = join(backupsDir, filename);

  console.log(`→ pg_dump (via Docker postgres:17-alpine) → ${filename}`);
  await runPgDump(dbUrl, filepath);

  const sizeKb = (statSync(filepath).size / 1024).toFixed(1);
  console.log(`✓ Dump local OK (${sizeKb} Ko) : backups/${filename}`);

  const keep = Number(process.env.BACKUP_KEEP || 14);
  pruneOldBackups(backupsDir, keep);

  const remoteDir = process.env.BACKUP_NAS_REMOTE_DIR?.trim();
  let nasStatus = "ignorée (non configurée)";
  if (remoteDir && process.env.NAS_SSH_HOST?.trim() && process.env.NAS_SSH_PASS?.trim()) {
    console.log(`→ Copie SFTP vers NAS (${remoteDir})…`);
    await uploadToNas(filepath, filename, remoteDir);
    console.log("✓ Copie NAS OK");
    nasStatus = "OK";
  } else {
    console.log(
      "ℹ Copie NAS ignorée (BACKUP_NAS_REMOTE_DIR ou NAS_SSH_* non défini) — sauvegarde locale uniquement.",
    );
  }

  console.log("✓ Sauvegarde terminée.");

  await notifyNtfy({
    title: "Restor-PC backup OK",
    tags: ["white_check_mark"],
    priority: "default",
    message: `Sauvegarde reussie : ${filename} (${sizeKb} Ko). Copie NAS : ${nasStatus}.`,
  });
}

async function notifyNtfy({ title, message, priority = "default", tags = [] }) {
  const topic = process.env.NTFY_TOPIC?.trim();
  if (!topic) return;
  const server = (process.env.NTFY_SERVER?.trim() || "https://ntfy.sh").replace(/\/+$/, "");
  try {
    const headers = { Title: title, Priority: priority };
    if (tags.length) headers.Tags = tags.join(",");
    const token = process.env.NTFY_TOKEN?.trim();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${server}/${encodeURIComponent(topic)}`, {
      method: "POST",
      body: message,
      headers,
    });
    if (!res.ok) {
      console.warn(`⚠ Notification ntfy non envoyée (HTTP ${res.status})`);
    } else {
      console.log("✓ Notification ntfy envoyée");
    }
  } catch (err) {
    console.warn("⚠ Notification ntfy échouée :", err.message || err);
  }
}

function runPgDump(dbUrl, filepath) {
  return new Promise((resolve, reject) => {
    const docker = spawn(
      "docker",
      [
        "run",
        "--rm",
        "-i",
        "postgres:17-alpine",
        "pg_dump",
        "--no-owner",
        "--no-privileges",
        dbUrl,
      ],
      { stdio: ["ignore", "pipe", "pipe"] },
    );

    const gzip = createGzip();
    const out = createWriteStream(filepath);
    let stderr = "";

    docker.stderr.on("data", (d) => {
      stderr += d.toString();
    });
    docker.on("error", reject);

    docker.stdout.pipe(gzip).pipe(out);

    out.on("finish", () => {
      // pg_dump écrit sur stderr même en cas de succès (progress) parfois ;
      // on ne rejette que sur exit code non nul.
    });

    docker.on("close", (code) => {
      if (code !== 0) {
        if (existsSync(filepath)) {
          try {
            unlinkSync(filepath);
          } catch {
            // best-effort
          }
        }
        reject(new Error(`pg_dump a échoué (code ${code}) :\n${stderr}`));
        return;
      }
      resolve();
    });
  });
}

function pruneOldBackups(dir, keep) {
  const files = readdirSync(dir)
    .filter((f) => f.startsWith("restor-pc-db-") && f.endsWith(".sql.gz"))
    .map((f) => ({ f, mtime: statSync(join(dir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);

  const toDelete = files.slice(keep);
  for (const { f } of toDelete) {
    unlinkSync(join(dir, f));
    console.log(`↺ Rotation : suppression de l'ancienne sauvegarde ${f}`);
  }
}

async function uploadToNas(localPath, filename, remoteDir) {
  const { Client } = await import("ssh2");
  const host = process.env.NAS_SSH_HOST;
  const user = process.env.NAS_SSH_USER?.trim() || "vesty";
  const pass = process.env.NAS_SSH_PASS;
  const port = Number(process.env.NAS_SSH_PORT || 22);

  await new Promise((resolve, reject) => {
    const conn = new Client();
    conn
      .on("ready", () => {
        conn.sftp((err, sftp) => {
          if (err) {
            conn.end();
            reject(err);
            return;
          }
          const remotePath = `${remoteDir.replace(/\/$/, "")}/${filename}`;
          // mkdir -p distant best-effort (ignore si existe déjà)
          conn.exec(`mkdir -p '${remoteDir.replace(/'/g, "")}'`, (mkdirErr, stream) => {
            if (mkdirErr) {
              conn.end();
              reject(mkdirErr);
              return;
            }
            stream.on("close", () => {
              sftp.fastPut(localPath, remotePath, (putErr) => {
                conn.end();
                if (putErr) reject(putErr);
                else resolve();
              });
            });
            stream.resume();
          });
        });
      })
      .on("error", reject)
      .connect({ host, port, username: user, password: pass, readyTimeout: 15_000 });
  });
}

main().catch(async (err) => {
  console.error("✗ Sauvegarde échouée :", err.message || err);
  await notifyNtfy({
    title: "Restor-PC backup ECHEC",
    tags: ["rotating_light"],
    priority: "urgent",
    message: `La sauvegarde a echoue : ${err.message || err}`,
  });
  process.exit(1);
});
