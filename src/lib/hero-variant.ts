/**
 * Variantes Hero — jamais Three.js + Color Panels simultanément.
 *
 * NEXT_PUBLIC_HERO_VARIANT (desktop / défaut) :
 *   - three         → WebGL DiagnosticRig (lazy, ssr:false)
 *   - color-panels  → Cult color panels (CSS / Motion léger)
 *   - static        → carte diagnostic HTML (fallback sûr)
 *
 * NEXT_PUBLIC_HERO_MOBILE_VARIANT (≤1023px) :
 *   mêmes valeurs ; défaut recommandé : color-panels
 *
 * prefers-reduced-motion → toujours static (pas de WebGL).
 * Valeurs invalides → fallback documenté (three / color-panels).
 */
import { z } from "zod";

const heroVariantSchema = z.enum(["three", "color-panels", "static"]);

export type HeroVariant = z.infer<typeof heroVariantSchema>;

export const HERO_VARIANTS = heroVariantSchema.options;

function readVariant(
  raw: string | undefined,
  fallback: HeroVariant
): HeroVariant {
  const parsed = heroVariantSchema.safeParse(raw?.trim());
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
