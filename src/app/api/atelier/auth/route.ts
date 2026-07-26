import { ATELIER_COOKIE } from "@/lib/atelier-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as { secret?: string };
  const expected = process.env.ATELIER_SECRET?.trim();
  if (!expected) {
    return NextResponse.json({ error: "ATELIER_SECRET non configure" }, { status: 503 });
  }
  if (!body.secret || body.secret !== expected) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ATELIER_COOKIE, expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ATELIER_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
