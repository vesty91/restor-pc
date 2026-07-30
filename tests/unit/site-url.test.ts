import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { siteConfig } from "@/lib/site";
import { getSiteUrl, absoluteUrl } from "@/lib/seo";
import { clearServerEnvCache, getPublicSiteUrl } from "@/lib/env";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

const CANONICAL = "https://www.restor-pc.fr";
const LEGACY = "atelier.restor-pc.fr";

describe("URL canonique www.restor-pc.fr", () => {
  const prev = { ...process.env };

  beforeEach(() => {
    process.env = { ...prev };
    clearServerEnvCache();
  });

  afterEach(() => {
    process.env = { ...prev };
    clearServerEnvCache();
  });

  it("siteConfig.url est https://www.restor-pc.fr", () => {
    expect(siteConfig.url).toBe(CANONICAL);
    expect(siteConfig.legal.host.url).toBe(CANONICAL);
    expect(siteConfig.url).not.toContain(LEGACY);
  });

  it("getSiteUrl utilise NEXT_PUBLIC_SITE_URL ou le fallback www", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(getSiteUrl()).toBe(CANONICAL);

    process.env.NEXT_PUBLIC_SITE_URL = "https://www.restor-pc.fr/";
    expect(getSiteUrl()).toBe(CANONICAL);
  });

  it("getPublicSiteUrl fallback = www", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(getPublicSiteUrl()).toBe(CANONICAL);
  });

  it("absoluteUrl construit des chemins sur www", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(absoluteUrl("/services")).toBe(`${CANONICAL}/services`);
    expect(absoluteUrl("faq")).toBe(`${CANONICAL}/faq`);
  });

  it("sitemap : toutes les URL sur www, aucune atelier", () => {
    const entries = sitemap();
    expect(entries.length).toBeGreaterThan(5);
    for (const entry of entries) {
      expect(entry.url.startsWith(CANONICAL)).toBe(true);
      expect(entry.url).not.toContain(LEGACY);
    }
  });

  it("robots pointe vers le sitemap www", () => {
    const r = robots();
    expect(r.sitemap).toBe(`${CANONICAL}/sitemap.xml`);
    expect(String(r.sitemap)).not.toContain(LEGACY);
  });

  it("identifiants JSON-LD cohérents (#business / #website)", () => {
    expect(`${siteConfig.url}/#business`).toBe(`${CANONICAL}/#business`);
    expect(`${siteConfig.url}/#website`).toBe(`${CANONICAL}/#website`);
  });
});
