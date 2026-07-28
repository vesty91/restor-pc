import { z } from "zod";

/**
 * Variantes Hero — jamais Three.js + Color Panels simultanément.
 */
const heroVariantSchema = z.enum(["three", "color-panels", "static"]);

export type HeroVariant = z.infer<typeof heroVariantSchema>;

function readVariant(
  raw: string | undefined,
  fallback: HeroVariant
): HeroVariant {
  const parsed = heroVariantSchema.safeParse(raw);
  return parsed.success ? parsed.data : fallback;
}

/** Variante desktop / défaut. */
export function getHeroVariant(): HeroVariant {
  return readVariant(process.env.NEXT_PUBLIC_HERO_VARIANT, "three");
}

/** Variante mobile / fallback léger. */
export function getHeroMobileVariant(): HeroVariant {
  return readVariant(
    process.env.NEXT_PUBLIC_HERO_MOBILE_VARIANT,
    "color-panels"
  );
}
