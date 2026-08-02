/**
 * Applique sql-harness-init + toutes les migrations + assertions courses Stripe
 * sur le conteneur Postgres Docker isolé (lecture réelle, pas de regex).
 *
 * Usage:
 *   node scripts/sql-harness-validate.mjs
 *   node scripts/sql-harness-validate.mjs --container restor-pc-sql-validation-20260801
 */
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const container =
  process.argv.find((a) => a.startsWith("--container="))?.split("=")[1] ||
  (process.argv.includes("--container")
    ? process.argv[process.argv.indexOf("--container") + 1]
    : "restor-pc-sql-validation-20260801");

const dbUser = "postgres";
const dbName = "restor_test";

function psql(sql, label) {
  process.stdout.write(`→ ${label}… `);
  try {
    execFileSync(
      "docker",
      [
        "exec",
        "-i",
        container,
        "psql",
        "-v",
        "ON_ERROR_STOP=1",
        "-U",
        dbUser,
        "-d",
        dbName,
        "-f",
        "-",
      ],
      {
        input: sql,
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      }
    );
    console.log("OK");
  } catch (err) {
    const e = err;
    console.log("FAIL");
    console.error(e.stderr || e.stdout || e.message);
    process.exit(1);
  }
}

function resetDatabase() {
  process.stdout.write("→ reset schema public/auth… ");
  try {
    execFileSync(
      "docker",
      [
        "exec",
        "-i",
        container,
        "psql",
        "-v",
        "ON_ERROR_STOP=1",
        "-U",
        dbUser,
        "-d",
        dbName,
        "-c",
        "drop schema if exists public cascade; drop schema if exists auth cascade; create schema public; grant all on schema public to postgres; grant all on schema public to public;",
      ],
      { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
    );
    console.log("OK");
  } catch (err) {
    console.log("FAIL");
    console.error(err.stderr || err.message);
    process.exit(1);
  }
}

const initSql = readFileSync(join(root, "scripts/sql-harness-init.sql"), "utf8");
const migrationsDir = join(root, "supabase/migrations");
const migrationFiles = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

console.log(`Container: ${container}`);
console.log(`Migrations: ${migrationFiles.length}`);

resetDatabase();
psql(initSql, "sql-harness-init.sql");

for (const file of migrationFiles) {
  const sql = readFileSync(join(migrationsDir, file), "utf8");
  psql(sql, file);
}

const assertions = readFileSync(
  join(root, "scripts/sql-harness-race-assertions.sql"),
  "utf8"
);
psql(assertions, "sql-harness-race-assertions.sql");

console.log("\nHarness SQL validation passed.");
