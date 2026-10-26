"use client";

import Link from "next/link";
import { useState } from "react";
import { inputClass, PrimaryButton } from "@/components/ui";

/** 매일 운세 알림톡 구독: 번호 입력 → 인증번호 확인 */
export function SubscribeForm({ dayGan }: { dayGan: string }) {
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code" | "done">("phone");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function post(url: string, body: unknown) {
    setBusy(true);
    setError(null);
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) setError(data.error ?? "잠시 후 다시 시도해 주세요.");
    return res.ok;
  }

  if (step === "done") {
    return <p className="text-[15px] leading-7 text-ink">구독이 완료되었습니다. 내일 아침 8시에 첫 운세를 카카오톡으로 보내 드릴게요.</p>;
  }

  return (
    <div className="space-y-4">
      {step === "phone" ? (
        <>
          <input className={inputClass} inputMode="tel" placeholder="휴대전화 번호 (010-0000-0000)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <label className="flex items-start gap-2 text-xs leading-5 text-muted">
            <input type="checkbox" className="mt-0.5 accent-gold" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span>
              매일 운세 발송을 위한 휴대전화 번호 수집·이용에 동의합니다. 수신 거부 시 즉시 삭제됩니다. (
              <Link href="/privacy" target="_blank" className="text-body underline hover:text-gold">
                개인정보처리방침
              </Link>
              )
            </span>
          </label>
          {error && <p className="text-sm text-error">{error}</p>}
          <PrimaryButton
            disabled={busy || !agree || !phone}
            onClick={async () => {
              if (await post("/api/daily/subscribe", { phone, dayGan, agree })) setStep("code");
            }}
          >
            {busy ? "보내는 중…" : "인증번호 받기"}
          </PrimaryButton>
        </>
      ) : (
        <>
          <p className="text-sm text-muted">{phone}로 보낸 인증번호 6자리를 입력해 주세요.</p>
          <input className={inputClass} inputMode="numeric" maxLength={6} placeholder="인증번호" value={code} onChange={(e) => setCode(e.target.value)} />
          {error && <p className="text-sm text-error">{error}</p>}
          <PrimaryButton
            disabled={busy || code.length !== 6}
            onClick={async () => {
              if (await post("/api/daily/verify", { phone, code, dayGan })) setStep("done");
            }}
          >
            {busy ? "확인 중…" : "구독 완료하기"}
          </PrimaryButton>
          <button type="button" className="w-full text-xs text-muted underline" onClick={() => setStep("phone")}>
            번호 다시 입력
          </button>
        </>
      )}
    </div>
  );
}
