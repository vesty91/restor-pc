import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquants");
  }
  return createBrowserClient(url, key);
}

/** Déconnexion Supabase + redirection (espace client). */
export async function signOutClient(redirectTo = "/compte") {
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.assign(redirectTo);
}
