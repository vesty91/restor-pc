import { describe, expect, it } from "vitest";
import {
  generateLicenseKey,
  generateSharePassword,
} from "@/lib/fulfillment/keys";

describe("license keys", () => {
  it("génère une clé au format RPC-XXXX-XXXX-XXXX", () => {
    const key = generateLicenseKey();
    expect(key).toMatch(/^RPC-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  });

  it("génère des clés distinctes", () => {
    const a = generateLicenseKey();
    const b = generateLicenseKey();
    expect(a).not.toBe(b);
  });

  it("génère un mot de passe share sans caractères ambigus", () => {
    const pwd = generateSharePassword(12);
    expect(pwd).toHaveLength(12);
    expect(pwd).not.toMatch(/[01IlO]/);
  });
});
