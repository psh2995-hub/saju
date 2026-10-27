import { NextResponse } from "next/server";
import { attemptLogin, createSessionToken, requestAllowed, sameOrigin, SESSION_COOKIE, SESSION_HOURS, sessionCookieOptions, adminConfig } from "@/lib/admin/auth";

/** 관리자 로그인 폼(POST). 결과는 303으로 돌려보내고, 실패 이유는 잠김 여부만 구분해 알려 준다. */
export async function POST(request: Request) {
  if (!requestAllowed(request.headers)) return new Response("Not Found", { status: 404 });
  const back = (query: string) => NextResponse.redirect(new URL(`/admin/login${query}`, request.url), 303);
  if (!sameOrigin(request.headers) || adminConfig().problems.length) return back("?error=1");

  const form = await request.formData().catch(() => null);
  const password = String(form?.get("password") ?? "").slice(0, 200);
  const otp = String(form?.get("otp") ?? "").slice(0, 10);
  const result = await attemptLogin(request.headers, password, otp);
  if (!result.ok) return back(result.reason === "locked" ? "?error=locked" : "?error=1");

  const res = NextResponse.redirect(new URL("/admin", request.url), 303);
  res.cookies.set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions(SESSION_HOURS * 3600));
  return res;
}
