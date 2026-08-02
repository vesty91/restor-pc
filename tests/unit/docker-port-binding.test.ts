import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

describe("docker-compose port binding", () => {
  it("publie le port 3000 sur loopback uniquement", () => {
    const raw = readFileSync(path.resolve(process.cwd(), "docker-compose.yml"), "utf8");
    expect(raw).toMatch(/["']127\.0\.0\.1:3000:3000["']/);
    expect(raw).not.toMatch(/^\s*-\s*["']3000:3000["']\s*$/m);
    expect(raw).not.toMatch(/0\.0\.0\.0:3000:3000/);
  });
});
