import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";

/**
 * Rafraîchit la session Supabase uniquement sur les routes qui en ont besoin.
 * Les pages marketing / légales / services statiques sont exclues.
 * Les API gardent leur propre contrôle d’autorisation.
 */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/compte/:path*",
    "/boutique/:path*",
    "/admin/:path*",
    "/atelier/:path*",
    "/auth/:path*",
  ],
};
