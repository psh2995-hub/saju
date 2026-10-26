import { NextResponse, type NextRequest } from "next/server";

// i18n.ts의 LANG_COOKIE와 같은 값. proxy는 다른 모듈에 기대지 않게 따로 둔다.
const LANG_COOKIE = "lang";
const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * 첫 화면(/)에서 해외 방문자를 영문 페이지(/en)로 보낸다.
 * - ?lang=ko / ?lang=en(언어 전환 링크)은 선택을 쿠키에 기억한다.
 * - 쿠키가 없으면 Vercel이 넣어 주는 접속 국가가 한국이 아니고, 브라우저 언어가 한국어가 아닐 때만 보낸다.
 * 다른 주소(공유 링크, 결과 페이지)는 그대로 둔다.
 */
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const choice = searchParams.get("lang");

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

export const config = {
  matcher: ["/", "/en"],
};
