import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/fulfillment/supabase";
import { isAtelierAuthed } from "@/lib/atelier-auth";
import { AppError } from "@/lib/errors";

export type AppRole = "customer" | "technician" | "admin";

/**
 * Transition HMAC atelier → Supabase roles.
 * Défaut : true (HMAC encore accepté pour requireTechnician uniquement).
 * Mettre ATELIER_HMAC_FALLBACK=false seulement après attribution d’un admin
 * dans user_roles (voir docs/ADMIN_AUTH.md).
 */
export function isAtelierHmacFallbackEnabled(): boolean {
  const raw = process.env.ATELIER_HMAC_FALLBACK?.trim().toLowerCase();
  if (raw === "false" || raw === "0" || raw === "no") return false;
  return true;
}

export async function requireAuthenticatedUser(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new AppError({
      code: "AUTH_REQUIRED",
      status: 401,
      publicMessage: "Authentification requise.",
    });
  }
  return user;
}

/**
 * Lit le rôle via service role. Toute erreur / absence Supabase → null (refus).
 */
export async function getUserRole(userId: string): Promise<AppRole | null> {
  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) return null;
    const role = data?.role;
    if (role === "customer" || role === "technician" || role === "admin") {
      return role;
    }
    return null;
  } catch {
    return null;
  }
}

function atelierTechnicianStub(): User {
  return {
    id: "atelier-session",
    email: "atelier@restor-pc.local",
    app_metadata: { role: "technician" },
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  } as User;
}

/**
 * Technicien : session HMAC atelier (si fallback actif) OU rôle Supabase
 * technician|admin.
 */
export async function requireTechnician(): Promise<User> {
  if (isAtelierHmacFallbackEnabled() && (await isAtelierAuthed())) {
    return atelierTechnicianStub();
  }

  const user = await requireAuthenticatedUser();
  const role = await getUserRole(user.id);
  if (role !== "technician" && role !== "admin") {
    throw new AppError({
      code: "FORBIDDEN",
      status: 403,
      publicMessage: "Acces refuse.",
    });
  }
  return user;
}

/**
 * Administrateur : uniquement un utilisateur Supabase avec rôle `admin`.
 * La session HMAC atelier n’accorde JAMAIS ce privilège.
 */
export async function requireAdmin(): Promise<User> {
  const user = await requireAuthenticatedUser();
  const role = await getUserRole(user.id);
  if (role !== "admin") {
    throw new AppError({
      code: "FORBIDDEN",
      status: 403,
      publicMessage: "Acces refuse.",
    });
  }
  return user;
}
