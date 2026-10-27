import { NextResponse } from "next/server";
import { requestAllowed, sameOrigin, SESSION_COOKIE, sessionCookieOptions } from "@/lib/admin/auth";

export async function POST(request: Request) {
  if (!requestAllowed(request.headers) || !sameOrigin(request.headers)) return new Response("Not Found", { status: 404 });
  const res = NextResponse.redirect(new URL("/admin/login", request.url), 303);
  res.cookies.set(SESSION_COOKIE, "", sessionCookieOptions(0));
  return res;
}
