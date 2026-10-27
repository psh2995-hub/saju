import { NextResponse, type NextRequest } from "next/server";

// i18n.ts의 LANG_COOKIE와 같은 값. proxy는 다른 모듈에 기대지 않게 따로 둔다.
const LANG_COOKIE = "lang";
const ONE_YEAR = 60 * 60 * 24 * 365;

const ADMIN_PATH = /^\/(admin|api\/admin)(\/|$)/;

/**
 * 관리자 화면은 ADMIN_HOST 도메인에서만 연다. 다른 도메인의 /admin은 404이고,
 * 관리자 도메인에서는 관리자 경로만 열며 ADMIN_ALLOWED_IPS가 있으면 그 IP만 받는다.
 * (화면·API에서도 같은 확인을 한 번 더 한다. src/lib/admin/auth.ts)
 */
function adminProxy(request: NextRequest, pathname: string) {
  const adminHost = process.env.ADMIN_HOST?.trim().toLowerCase();
  const onAdminHost = !!adminHost && request.headers.get("host")?.toLowerCase() === adminHost;
  if (!onAdminHost) return ADMIN_PATH.test(pathname) ? new NextResponse("Not Found", { status: 404 }) : null;

  if (pathname === "/") return NextResponse.redirect(new URL("/admin", request.url));
  if (!ADMIN_PATH.test(pathname)) return new NextResponse("Not Found", { status: 404 });
  const allowed = (process.env.ADMIN_ALLOWED_IPS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const ip = request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (allowed.length && (!ip || !allowed.includes(ip))) return new NextResponse("Forbidden", { status: 403 });

  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Content-Security-Policy", "frame-ancestors 'none'");
  // no-referrer면 브라우저가 폼 POST의 Origin을 "null"로 보내므로, 같은 출처에만 보내는 same-origin을 쓴다.
  res.headers.set("Referrer-Policy", "same-origin");
  res.headers.set("X-Content-Type-Options", "nosniff");
  return res;
}

const LOCKED_PAGE = `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>오픈 준비 중</title><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#000;color:#ddd;font-family:sans-serif"><p>오픈 준비 중입니다.</p></body></html>`;

/** 길이가 달라도 같은 시간이 걸리게 비교한다. */
function safeEqual(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

/**
 * 오픈 전 잠금. SITE_PASSWORD가 있으면 사이트 전체에 브라우저 기본 인증(아이디는 아무거나)을 건다.
 * 토스페이먼츠 서버가 부르는 웹훅만 열어 둔다(웹훅은 결제 조회 API로 다시 확인하므로 안전하다).
 */
function siteLock(request: NextRequest, pathname: string) {
  const password = process.env.SITE_PASSWORD;
  if (!password || pathname === "/api/payments/webhook") return null;
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    try {
      const decoded = atob(auth.slice(6));
      if (safeEqual(decoded.slice(decoded.indexOf(":") + 1), password)) return null;
    } catch {}
  }
  return new NextResponse(LOCKED_PAGE, {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Unmyeong Dabang (coming soon)", charset="UTF-8"',
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

/**
 * 첫 화면(/)에서 해외 방문자를 영문 페이지(/en)로 보낸다.
 * - ?lang=ko / ?lang=en(언어 전환 링크)은 선택을 쿠키에 기억한다.
 * - 쿠키가 없으면 Vercel이 넣어 주는 접속 국가가 한국이 아니고, 브라우저 언어가 한국어가 아닐 때만 보낸다.
 * 다른 주소(공유 링크, 결과 페이지)는 그대로 둔다.
 */
function langRedirect(request: NextRequest, pathname: string) {
  if (pathname !== "/" && pathname !== "/en") return;
  const choice = request.nextUrl.searchParams.get("lang");
  if (choice === "ko" || choice === "en") {
    const url = request.nextUrl.clone();
    url.searchParams.delete("lang");
    url.pathname = choice === "en" ? "/en" : "/";
    const res = NextResponse.redirect(url);
    res.cookies.set(LANG_COOKIE, choice, { maxAge: ONE_YEAR, path: "/", sameSite: "lax" });
    return res;
  }

  if (pathname !== "/") return;
  const saved = request.cookies.get(LANG_COOKIE)?.value;
  if (saved === "ko") return;
  const country = request.headers.get("x-vercel-ip-country");
  const prefersKorean = /^ko\b/i.test(request.headers.get("accept-language") ?? "");
  if (saved === "en" || (country && country !== "KR" && !prefersKorean)) {
    return NextResponse.redirect(new URL("/en", request.url));
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  return adminProxy(request, pathname) ?? siteLock(request, pathname) ?? langRedirect(request, pathname);
}

export const config = {
  // 오픈 전 잠금이 사이트 전체에 걸리도록 빌드 정적 파일만 빼고 모든 요청에서 돈다.
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
