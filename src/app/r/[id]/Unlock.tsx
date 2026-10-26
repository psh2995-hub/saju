"use client";

import * as PortOne from "@portone/browser-sdk/v2";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Eyebrow, PrimaryButton } from "@/components/ui";
import { formatWon } from "@/lib/products";

type Props = {
  readingId: string;
  productName: string;
  price: number;
  initialStatus: "unpaid" | "paid" | "refunded";
  initialResult: string | null;
  mockPayment: boolean;
  /** 모바일 결제 후 redirectUrl로 돌아왔을 때 쿼리에 담긴 결제 결과 */
  paymentRedirect: { paymentId: string; code: string | null; message: string | null } | null;
};

type Phase = "unpaid" | "paying" | "generating" | "done" | "failed" | "refunded";

const STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
const CHANNEL_KEY = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;

export function Unlock({ readingId, productName, price, initialStatus, initialResult, mockPayment, paymentRedirect }: Props) {
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
    paymentRedirect?.code ? (paymentRedirect.message ?? "결제가 취소되었습니다.") : null,
  );
  const [agreed, setAgreed] = useState(false);
  const started = useRef(false);

  // 상태 초기화는 호출하는 쪽(beginGeneration)이 한다. 첫 렌더에서 effect로 바로 호출할 수 있게 하기 위함이다.
  const generate = useCallback(async () => {
    for (;;) {
      const res = await fetch(`/api/readings/${readingId}/generate`, { method: "POST" });
      if (res.status === 409) {
        // 다른 탭이나 이전 요청이 생성 중이다. 끝나면 저장된 결과를 받는다.
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "풀이를 불러오지 못했습니다.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        setText((t) => t + decoder.decode(value, { stream: true }));
      }
      setPhase("done");
      return;
    }
  }, [readingId]);

  const startGeneration = useCallback(() => {
    generate().catch((e) => {
      setError(e instanceof Error ? e.message : "풀이 생성 중 문제가 생겼습니다.");
      setPhase("failed");
    });
  }, [generate]);

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
        setError(data.error ?? "결제가 완료되지 않았습니다.");
        setPhase("unpaid");
        return;
      }
      beginGeneration();
    },
    [beginGeneration],
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
        body: JSON.stringify({ readingId }),
      });
      if (!res.ok) {
        setError("테스트 결제에 실패했습니다.");
        setPhase("unpaid");
        return;
      }
      beginGeneration();
      return;
    }
    if (!STORE_ID || !CHANNEL_KEY) {
      setError("결제 준비 중입니다. 잠시 후 다시 이용해 주세요.");
      return;
    }

    setPhase("paying");
    const paymentId = `r-${readingId.replaceAll("-", "")}-${Date.now().toString(36)}`;
    const response = await PortOne.requestPayment({
      storeId: STORE_ID,
      channelKey: CHANNEL_KEY,
      paymentId,
      orderName: productName,
      totalAmount: price,
      currency: "CURRENCY_KRW",
      payMethod: "CARD",
      productType: "PRODUCT_TYPE_DIGITAL",
      customData: { readingId },
      redirectUrl: `${window.location.origin}/r/${readingId}`,
    });
    if (!response || response.code) {
      setError(response?.message ?? "결제가 취소되었습니다.");
      setPhase("unpaid");
      return;
    }
    await confirmPayment(paymentId);
  }

  if (phase === "refunded") {
    return <p className="bg-surface-1 p-6 text-sm text-muted">환불 처리된 풀이입니다.</p>;
  }

  if (phase === "unpaid" || phase === "paying") {
    return (
      <section className="border-t-2 border-gold bg-surface-2 p-6 sm:p-8">
        <Eyebrow>FULL READING</Eyebrow>
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-2xl text-ink">{productName}</h2>
          <p className="text-2xl text-ink">{formatWon(price)}</p>
        </div>
        <p className="mt-3 text-[15px] leading-7 text-muted">
          위 결과를 바탕으로 AI 상담가가 당신만을 위한 긴 풀이를 작성해 드립니다. 결제 후 바로 작성이 시작되며, 이 페이지
          주소로 언제든 다시 볼 수 있습니다.
        </p>
        <label className="mt-6 flex items-start gap-2 border-t border-line pt-5 text-xs leading-5 text-muted">
          <input type="checkbox" className="mt-0.5 accent-gold" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span>
            디지털 콘텐츠 특성상 결제 후 풀이 작성이 시작되면 청약철회(환불)가 제한됨을 확인했습니다. (
            <Link href="/refund" className="text-body underline hover:text-gold" target="_blank">
              환불정책
            </Link>
            )
          </span>
        </label>
        {error && <p className="mt-3 text-sm text-error">{error}</p>}
        <PrimaryButton className="mt-5" onClick={pay} disabled={!agreed || phase === "paying"}>
          {phase === "paying" ? "결제 확인 중…" : `${formatWon(price)} 결제하고 풀이 보기`}
        </PrimaryButton>
        {mockPayment && !STORE_ID && <p className="mt-3 text-center text-xs text-error">테스트 모드: 실제 결제 없이 열립니다.</p>}
      </section>
    );
  }

  return (
    <section className="border-t-2 border-gold bg-surface-1 p-6 sm:p-10">
      {text ? (
        <div className="reading">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      ) : (
        phase === "generating" && (
          <p className="animate-pulse py-12 text-center text-muted">상담가가 명식을 살펴보고 있습니다… (1~3분 정도 걸려요)</p>
        )
      )}
      {phase === "failed" && (
        <div className="mt-4 text-center">
          <p className="text-sm text-error">{error}</p>
          <button onClick={beginGeneration} className="mt-4 h-11 border border-ink/50 px-5 text-sm text-ink hover:bg-ink hover:text-black">
            다시 시도
          </button>
        </div>
      )}
      {phase === "done" && (
        <p className="mt-10 border-t border-line pt-5 text-xs leading-5 text-muted-soft">
          이 풀이는 AI가 작성한 참고용 콘텐츠입니다. 이 페이지 주소를 저장해 두면 언제든 다시 볼 수 있습니다.
        </p>
      )}
    </section>
  );
}
