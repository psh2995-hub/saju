"use client";

import { useState } from "react";
import { FOLLOWUP } from "@/lib/products";
import type { FollowupRow } from "@/lib/supabase";
import { Unlock } from "./Unlock";
import { Eyebrow, inputClass } from "./ui";

type Redirect = { paymentId: string; code: string | null; message: string | null; followupId: string } | null;

/** 결제한 풀이에 이어서 묻는 추가 질문 목록과 질문 입력란 */
export function Followups({
  readingId,
  initial,
  mockPayment,
  paymentRedirect,
}: {
  readingId: string;
  initial: FollowupRow[];
  mockPayment: boolean;
  paymentRedirect: Redirect;
}) {
  const [items, setItems] = useState(initial);
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasUnpaid = items.some((f) => f.status === "unpaid");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/followups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ readingId, question }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "잠시 후 다시 시도해 주세요.");
      return;
    }
    setItems((list) => [...list.filter((f) => f.id !== data.id), data]);
    setQuestion("");
  }

  return (
    <section className="bg-surface-1 p-6 sm:p-8">
      <Eyebrow>MORE QUESTIONS</Eyebrow>
      <h2 className="mt-3 text-xl text-ink">더 궁금한 것이 있나요?</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        위 풀이를 바탕으로 한 가지를 더 깊이 물어볼 수 있습니다. 질문 1회 {FOLLOWUP.price.toLocaleString("ko-KR")}원.
      </p>

      <div className="mt-6 space-y-px">
        {items.map((f) => (
          <div key={f.id}>
            <p className="bg-surface-2 px-5 pt-5 text-[15px] text-ink">
              <span className="mr-2 text-gold">Q.</span>
              {f.question}
            </p>
            <Unlock
              compact
              target={{ type: "followup", id: f.id, readingId }}
              productName={FOLLOWUP.name}
              price={f.price}
              initialStatus={f.status}
              initialResult={f.ai_status === "done" ? f.ai_result : null}
              mockPayment={mockPayment}
              paymentRedirect={paymentRedirect?.followupId === f.id ? paymentRedirect : null}
            />
          </div>
        ))}
      </div>

      {!hasUnpaid && (
        <form onSubmit={submit} className={items.length ? "mt-6" : ""}>
          <textarea
            className={`${inputClass} h-28 resize-none py-3`}
            value={question}
            maxLength={300}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="예) 그럼 이직은 언제쯤이 좋을까요?"
          />
          {error && <p className="mt-2 text-sm text-error">{error}</p>}
          <button
            type="submit"
            className="mt-3 h-12 w-full border border-gold text-gold transition hover:bg-gold hover:text-black disabled:cursor-not-allowed disabled:border-line-strong disabled:text-muted-soft disabled:hover:bg-transparent"
            disabled={submitting || !question.trim()}
          >
            {submitting ? "등록 중…" : "질문 등록하기"}
          </button>
        </form>
      )}
    </section>
  );
}
