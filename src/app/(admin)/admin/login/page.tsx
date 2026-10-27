import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { inputClass } from "@/components/ui";
import { adminConfig, hasValidSession, requestAllowed } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "로그인" };

export default function LoginPage(props: PageProps<"/admin/login">) {
  return (
    <Suspense fallback={null}>
      <Login {...props} />
    </Suspense>
  );
}

const ERRORS: Record<string, string> = {
  "1": "로그인 정보가 올바르지 않습니다.",
  locked: "로그인 실패가 많아 15분 동안 잠겼습니다.",
};

async function Login({ searchParams }: PageProps<"/admin/login">) {
  if (!requestAllowed(await headers())) notFound();
  if (await hasValidSession()) redirect("/admin");
  const { error } = await searchParams;
  const cfg = adminConfig();

  return (
    <div className="mx-auto max-w-sm py-10">
      <h1 className="text-2xl text-ink">관리자 로그인</h1>
      {cfg.problems.length > 0 && (
        <p className="mt-6 bg-surface-2 p-4 text-sm leading-6 text-error">
          Vercel 환경 변수를 먼저 설정해 주세요: {cfg.problems.join(", ")}
        </p>
      )}
      <form action="/api/admin/login" method="post" className="mt-8 space-y-4">
        <input name="password" type="password" required autoComplete="current-password" placeholder="비밀번호" className={inputClass} />
        {cfg.totpSecret && (
          <input
            name="otp"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            required
            autoComplete="one-time-code"
            placeholder="OTP 6자리"
            className={inputClass}
          />
        )}
        {typeof error === "string" && ERRORS[error] && <p className="text-sm text-error">{ERRORS[error]}</p>}
        <button className="h-12 w-full bg-gold text-black hover:bg-gold-dark hover:text-ink">로그인</button>
      </form>
    </div>
  );
}
