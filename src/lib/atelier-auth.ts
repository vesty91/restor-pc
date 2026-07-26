import { cookies } from "next/headers";

export const ATELIER_COOKIE = "restorpc_atelier";

export async function isAtelierAuthed(): Promise<boolean> {
  const expected = process.env.ATELIER_SECRET?.trim();
  if (!expected) return false;
  const jar = await cookies();
  return jar.get(ATELIER_COOKIE)?.value === expected;
}
