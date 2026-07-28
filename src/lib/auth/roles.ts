import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/fulfillment/supabase";
import { isAtelierAuthed } from "@/lib/atelier-auth";
import { AppError } from "@/lib/errors";

export type AppRole = "customer" | "technician" | "admin";

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

export async function getUserRole(userId: string): Promise<AppRole | null> {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  return (data?.role as AppRole | undefined) ?? null;
}

export async function requireTechnician(): Promise<User> {
  // Transition : session atelier HMAC OU rôle Supabase technician/admin
  if (await isAtelierAuthed()) {
    return {
      id: "atelier-session",
      email: "atelier@restor-pc.local",
      app_metadata: { role: "technician" },
      user_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as User;
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

export async function requireAdmin(): Promise<User> {
  if (await isAtelierAuthed()) {
    return requireTechnician();
  }
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
