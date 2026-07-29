import { afterEach, describe, expect, it } from "vitest";
import {
  getHeroMobileVariant,
  getHeroVariant,
  HERO_VARIANTS,
} from "@/lib/hero-variant";

describe("hero-variant", () => {
  const prevDesktop = process.env.NEXT_PUBLIC_HERO_VARIANT;
  const prevMobile = process.env.NEXT_PUBLIC_HERO_MOBILE_VARIANT;

  afterEach(() => {
    if (prevDesktop === undefined) delete process.env.NEXT_PUBLIC_HERO_VARIANT;
    else process.env.NEXT_PUBLIC_HERO_VARIANT = prevDesktop;
    if (prevMobile === undefined) delete process.env.NEXT_PUBLIC_HERO_MOBILE_VARIANT;
    else process.env.NEXT_PUBLIC_HERO_MOBILE_VARIANT = prevMobile;
  });

  it("expose les variantes documentées", () => {
    expect(HERO_VARIANTS).toEqual(["three", "color-panels", "static"]);
  });

  it("accepte three | color-panels | static", () => {
    process.env.NEXT_PUBLIC_HERO_VARIANT = "static";
    process.env.NEXT_PUBLIC_HERO_MOBILE_VARIANT = "three";
    expect(getHeroVariant()).toBe("static");
    expect(getHeroMobileVariant()).toBe("three");
  });

  it("fallback si valeur invalide", () => {
    process.env.NEXT_PUBLIC_HERO_VARIANT = "webgl-ultra";
    process.env.NEXT_PUBLIC_HERO_MOBILE_VARIANT = "";
    expect(getHeroVariant()).toBe("three");
    expect(getHeroMobileVariant()).toBe("color-panels");
  });
});
