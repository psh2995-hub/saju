"use client";

import * as PortOne from "@portone/browser-sdk/v2";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Eyebrow, PrimaryButton } from "./ui";
import { formatPrice, readingPath, UI_TEXT, USD_CHANNEL_KEY, type Currency, type Lang } from "@/lib/i18n";

export type UnlockTarget = { type: "reading" | "followup"; id: string; readingId: string };

type Props = {
  target: UnlockTarget;
  productName: string;
  /** KRW는 원, USD는 센트 */
  price: number;
  currency?: Currency;
  initialStatus: "unpaid" | "paid" | "refunded";
  initialResult: string | null;
  mockPayment: boolean;
  /** 모바일 결제 후 redirectUrl로 돌아왔을 때 쿼리에 담긴 결제 결과 */
  paymentRedirect: { paymentId: string; code: string | null; message: string | null } | null;
  /** 결제 영역 설명 문구 */
  description?: React.ReactNode;
  /** 추가 질문처럼 작게 보여 줄 때 */
  compact?: boolean;
  /** 생성이 끝났을 때(처음부터 끝나 있던 경우 제외) */
  onDone?: () => void;
  lang?: Lang;
};

type Phase = "unpaid" | "paying" | "generating" | "done" | "failed" | "refunded";

const STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
const CHANNEL_KEY = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;

export function Unlock({ target, productName, price, currency = "KRW", initialStatus, initialResult, mockPayment, paymentRedirect, description, compact, onDone, lang = "ko" }: Props) {
  const t = UI_TEXT[lang];
  const generateUrl = target.type === "reading" ? `/api/readings/${target.id}/generate` : `/api/followups/${target.id}/generate`;
  const customData = target.type === "reading" ? { readingId: target.id } : { followupId: target.id };
  const [phase, setPhase] = useState<Phase>(
    initialStatus === "refunded"
      ? "refunded"
      : initialResult
        ? "done"
        : initialStatus === "paid"
          ? "generating"
          : paymentRedirect && !paymentRedirect.code
            ? "paying"
            : "unpaid",
  );
  const [text, setText] = useState(initialResult ?? "");
  const [error, setError] = useState<string | null>(
    paymentRedirect?.code ? (paymentRedirect.message ?? t.paymentCancelled) : null,
  );
  const [agreed, setAgreed] = useState(false);
  const started = useRef(false);

  // 상태 초기화는 호출하는 쪽(beginGeneration)이 한다. 첫 렌더에서 effect로 바로 호출할 수 있게 하기 위함이다.
  const generate = useCallback(async () => {
    for (;;) {
      const res = await fetch(generateUrl, { method: "POST" });
      if (res.status === 409) {
        // 다른 탭이나 이전 요청이 생성 중이다. 끝나면 저장된 결과를 받는다.
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(lang === "en" ? t.loadFailed : (data.error ?? t.loadFailed));
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        setText((t) => t + decoder.decode(value, { stream: true }));
      }
      setPhase("done");
      onDone?.();
      return;
    }
  }, [generateUrl, onDone, lang, t]);

  const startGeneration = useCallback(() => {
    generate().catch((e) => {
      setError(e instanceof Error ? e.message : t.generationFailed);
      setPhase("failed");
    });
  }, [generate, t]);

  const beginGeneration = useCallback(() => {
    setPhase("generating");
    setError(null);
    setText("");
    startGeneration();
  }, [startGeneration]);

  const confirmPayment = useCallback(
    async (paymentId: string) => {
      const res = await fetch("/api/payments/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.status !== "paid") {
        setError(lang === "en" ? t.paymentIncomplete : (data.error ?? t.paymentIncomplete));
        setPhase("unpaid");
        return;
      }
      beginGeneration();
    },
    [beginGeneration, lang, t],
  );

  // 마운트 시 결제 확인·풀이 생성 요청을 연다. 이 경로의 state 변경은 모두 fetch 응답 이후에 일어난다.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (paymentRedirect) {
      window.history.replaceState(null, "", window.location.pathname);
      if (initialStatus === "unpaid" && !paymentRedirect.code) void confirmPayment(paymentRedirect.paymentId);
      return;
    }
    // 결제는 됐지만 풀이가 아직 없으면 마운트 시 생성 요청을 연다.
    if (initialStatus === "paid" && !initialResult) startGeneration();
  }, [confirmPayment, startGeneration, initialStatus, initialResult, paymentRedirect]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function pay() {
    setError(null);
    if (mockPayment && !STORE_ID) {
      setPhase("paying");
      const res = await fetch("/api/payments/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customData),
      });
      if (!res.ok) {
        setError(t.mockFailed);
        setPhase("unpaid");
        return;
      }
      beginGeneration();
      return;
    }
    const channelKey = currency === "USD" ? USD_CHANNEL_KEY : CHANNEL_KEY;
    if (!STORE_ID || !channelKey) {
      setError(t.paymentNotReady);
      return;
    }

    setPhase("paying");
    const paymentId = `${target.type === "reading" ? "r" : "f"}-${target.id.replaceAll("-", "")}-${Date.now().toString(36)}`;
    const response = await PortOne.requestPayment({
      storeId: STORE_ID,
      channelKey,
      paymentId,
      orderName: productName,
      totalAmount: price,
      currency: currency === "USD" ? "CURRENCY_USD" : "CURRENCY_KRW",
      // 토스페이먼츠 달러 결제는 해외 발급 카드로만 받는다.
      ...(currency === "USD" ? { bypass: { tosspayments: { useInternationalCardOnly: true } } } : {}),
      payMethod: "CARD",
      productType: "PRODUCT_TYPE_DIGITAL",
      customData,
      locale: lang === "en" ? "EN_US" : "KO_KR",
      redirectUrl: `${window.location.origin}${readingPath(target.readingId, lang)}${target.type === "followup" ? `?for=${target.id}` : ""}`,
    });
    if (!response || response.code) {
      setError(response?.message ?? t.paymentCancelled);
      setPhase("unpaid");
      return;
    }
    await confirmPayment(paymentId);
  }

  if (phase === "refunded") {
    return <p className="bg-surface-1 p-6 text-sm text-muted">{t.refunded}</p>;
  }

  if (phase === "unpaid" || phase === "paying") {
    return (
      <section className={compact ? "bg-surface-2 p-5" : "border-t-2 border-gold bg-surface-2 p-6 sm:p-8"}>
        {!compact && <Eyebrow>FULL READING</Eyebrow>}
        <div className={`${compact ? "" : "mt-3 "}flex flex-wrap items-baseline justify-between gap-2`}>
          <h2 className={compact ? "text-base text-ink" : "text-2xl text-ink"}>{productName}</h2>
          <p className={compact ? "text-base text-ink" : "text-2xl text-ink"}>{formatPrice(price, lang, currency)}</p>
        </div>
        {description && <div className="mt-3 text-[15px] leading-7 text-muted">{description}</div>}
        <label className={`${compact ? "mt-4" : "mt-6"} flex items-start gap-2 border-t border-line pt-5 text-xs leading-5 text-muted`}>
          <input type="checkbox" className="mt-0.5 accent-gold" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span>
            {t.agreeBefore}
            <Link href="/refund" className="text-body underline hover:text-gold" target="_blank">
              {t.refundPolicy}
            </Link>
            {t.agreeAfter}
          </span>
        </label>
        {error && <p className="mt-3 text-sm text-error">{error}</p>}
        <PrimaryButton className={compact ? "mt-4 h-12" : "mt-5"} onClick={pay} disabled={!agreed || phase === "paying"}>
          {phase === "paying" ? t.checkingPayment : t.payButton(formatPrice(price, lang, currency), target.type === "followup")}
        </PrimaryButton>
        {mockPayment && !STORE_ID && <p className="mt-3 text-center text-xs text-error">{t.mockNotice}</p>}
      </section>
    );
  }

  return (
    <section className={compact ? "bg-surface-2 p-5 sm:p-6" : "border-t-2 border-gold bg-surface-1 p-6 sm:p-10"}>
      {text ? (
        <div className="reading">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      ) : (
        phase === "generating" && (
          <p className="animate-pulse py-12 text-center text-muted">
            {target.type === "reading" ? t.writingReading : t.writingAnswer}
          </p>
        )
      )}
      {phase === "failed" && (
        <div className="mt-4 text-center">
          <p className="text-sm text-error">{error}</p>
          <button onClick={beginGeneration} className="mt-4 h-11 border border-ink/50 px-5 text-sm text-ink hover:bg-ink hover:text-black">
            {t.retry}
          </button>
        </div>
      )}
      {phase === "done" && !compact && (
        <p className="mt-10 border-t border-line pt-5 text-xs leading-5 text-muted-soft">
          {t.doneNotice}
        </p>
      )}
    </section>
  );
}
