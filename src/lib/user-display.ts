import type { User } from "@supabase/supabase-js";

/** Champ profil éditable par le client (prioritaire). */
export const DISPLAY_FIRST_NAME_KEY = "display_first_name";

function capitalizeWord(value: string): string {
  const v = value.trim();
  if (!v) return "";
  return v.charAt(0).toUpperCase() + v.slice(1);
}

/** Prénom affiché (profil modifié > OAuth > début d’email). */
export function getUserFirstName(user: User | null | undefined): string | null {
  if (!user) return null;

  const meta = user.user_metadata ?? {};
  const custom = String(meta[DISPLAY_FIRST_NAME_KEY] ?? "").trim();
  if (custom) return capitalizeWord(custom.split(/\s+/)[0] ?? custom);

  const raw = String(
    meta.given_name ||
      meta.first_name ||
      meta.full_name ||
      meta.name ||
      meta.user_name ||
      ""
  ).trim();

  if (raw) {
    const first = raw.split(/\s+/)[0] ?? "";
    if (first) return capitalizeWord(first);
  }

  const email = user.email?.trim();
  if (email?.includes("@")) {
    const local = email.split("@")[0]?.split(/[._+-]/)[0] ?? "";
    if (local.length >= 2) {
      return local.charAt(0).toUpperCase() + local.slice(1).toLowerCase();
    }
  }

  return null;
}

export function normalizeFirstNameInput(value: string): string {
  return value.trim().replace(/\s+/g, " ").slice(0, 40);
}
