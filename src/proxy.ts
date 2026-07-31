import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";

/**
 * Rafraîchit la session Supabase uniquement sur les routes qui en ont besoin.
 * Les pages marketing / légales / services statiques sont exclues.
 * Les API gardent leur propre contrôle d’autorisation.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

/** Matcher statique requis par Next.js (analyse compile-time). */
export const config = {
  matcher: [
    "/compte/:path*",
    "/boutique/:path*",
    "/admin/:path*",
    "/atelier/:path*",
    // Pas /auth/* : le callback OAuth pose déjà de gros Set-Cookie (JWT) ;
    // un 2e refresh middleware les double et nginx renvoyait 502 (too big header).
  ],
};
