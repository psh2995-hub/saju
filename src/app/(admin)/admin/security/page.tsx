import type { Metadata } from "next";
import { headers } from "next/headers";
import QRCode from "qrcode";
import { Suspense } from "react";
import { inputClass } from "@/components/ui";
import { adminConfig, clientIp, requireAdmin, SESSION_HOURS, suggestedTotpSecret } from "@/lib/admin/auth";
import { kstDateTime, recentLogins } from "@/lib/admin/data";
import { otpauthUri } from "@/lib/admin/totp";
import { SITE_NAME } from "@/lib/site";
import { tdClass, thClass } from "../components";

export const metadata: Metadata = { title: "보안" };

export default function SecurityPage(props: PageProps<"/admin/security">) {
  return (
    <Suspense fallback={<p className="animate-pulse text-muted">불러오는 중…</p>}>
      <Security {...props} />
    </Suspense>
  );
}

const REASON: Record<string, string> = { password: "비밀번호 틀림", otp: "OTP 틀림", locked: "잠김" };

async function Security({ searchParams }: PageProps<"/admin/security">) {
  await requireAdmin();
  const { check } = await searchParams;
  const cfg = adminConfig();
  const ip = clientIp(await headers());
  const logins = await recentLogins();
  const secret = cfg.totpSecret ? null : suggestedTotpSecret();
  const qr = secret ? await QRCode.toString(otpauthUri(secret, "admin", `${SITE_NAME} 관리자`), { type: "svg", margin: 1, width: 200 }) : null;

  return (
    <div className="space-y-10">
      <h1 className="text-2xl text-ink">보안</h1>

      <section className="bg-surface-1 p-6">
        <h2 className="text-lg text-ink">현재 설정</h2>
        <ul className="mt-4 space-y-2 text-sm text-body">
          <li>관리자 도메인: {cfg.host}</li>
          <li>2단계 인증(OTP): {cfg.totpSecret ? <span className="text-gold">켜짐</span> : <span className="text-error">꺼짐</span>}</li>
          <li>
            접속 IP 제한: {cfg.allowedIps.length ? cfg.allowedIps.join(", ") : "없음"} <span className="text-muted">(지금 접속 IP {ip})</span>
          </li>
          <li>로그인 유지: {SESSION_HOURS}시간 · 15분 안에 같은 IP 5회(전체 20회) 실패하면 잠금</li>
        </ul>
      </section>

      {secret && qr && (
        <section className="bg-surface-1 p-6">
          <h2 className="text-lg text-ink">2단계 인증 켜기</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-body">
            <li>Google Authenticator 등 OTP 앱에서 아래 QR을 찍거나, 비밀값을 직접 입력해 등록하세요.</li>
            <li>앱에 나온 6자리를 아래에 넣어 맞는지 확인하세요.</li>
            <li>
              맞으면 Vercel 환경 변수 <code className="text-ink">ADMIN_TOTP_SECRET</code>에 비밀값을 넣고(Production, Sensitive) 다시 배포하세요. 그다음부터
              로그인할 때 OTP를 묻습니다.
            </li>
          </ol>
          <div className="mt-6 flex flex-wrap items-start gap-8">
            <div className="bg-white p-2" dangerouslySetInnerHTML={{ __html: qr }} />
            <div className="space-y-4">
              <p className="text-sm text-muted">비밀값</p>
              <p className="font-mono text-base tracking-wider break-all text-ink">{secret}</p>
              <form action="/api/admin/totp-check" method="post" className="flex gap-2">
                <input name="otp" inputMode="numeric" pattern="\d{6}" maxLength={6} required placeholder="6자리" className={`${inputClass} h-11 w-32`} />
                <button className="h-11 border border-ink/50 px-4 text-sm text-ink hover:bg-ink hover:text-black">확인</button>
              </form>
              {check === "ok" && <p className="text-sm text-gold">맞습니다. 이제 Vercel에 비밀값을 넣으세요.</p>}
              {check === "fail" && <p className="text-sm text-error">맞지 않습니다. 휴대폰 시간이 자동으로 맞춰져 있는지 확인하세요.</p>}
            </div>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg text-ink">최근 로그인 시도</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr>
                <th className={thClass}>시각</th>
                <th className={thClass}>결과</th>
                <th className={thClass}>IP</th>
                <th className={thClass}>브라우저</th>
              </tr>
            </thead>
            <tbody>
              {logins.map((l, i) => (
                <tr key={i}>
                  <td className={tdClass}>{kstDateTime(l.created_at)}</td>
                  <td className={tdClass}>{l.ok ? <span className="text-gold">성공</span> : <span className="text-error">{REASON[l.reason ?? ""] ?? "실패"}</span>}</td>
                  <td className={`${tdClass} font-mono text-xs`}>{l.ip}</td>
                  <td className={`${tdClass} max-w-xs truncate text-xs text-muted`}>{l.user_agent ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
