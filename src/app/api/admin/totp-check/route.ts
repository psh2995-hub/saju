import { NextResponse } from "next/server";
import { isAdminRequest, sameOrigin, suggestedTotpSecret } from "@/lib/admin/auth";
import { verifyTotp } from "@/lib/admin/totp";

/** OTP 설정 화면에서 앱에 등록한 코드가 맞는지 확인한다(환경 변수에 넣기 전 확인용). */
export async function POST(request: Request) {
  if (!(await isAdminRequest(request)) || !sameOrigin(request.headers)) return new Response("Not Found", { status: 404 });
  const form = await request.formData().catch(() => null);
  const ok = verifyTotp(suggestedTotpSecret(), String(form?.get("otp") ?? "").trim()) !== null;
  return NextResponse.redirect(new URL(`/admin/security?check=${ok ? "ok" : "fail"}`, request.url), 303);
}
