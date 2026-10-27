"use client";

import { useState } from "react";
import { formatPrice, UI_TEXT, type Currency, type Lang } from "@/lib/i18n";
import { followupPriceFor } from "@/lib/products";
import type { FollowupRow } from "@/lib/supabase";
import { Unlock } from "./Unlock";
import { Eyebrow, inputClass } from "./ui";

type Redirect = { paymentId: string; code: string | null; message: string | null; followupId: string } | null;

/** 결제한 풀이에 이어서 묻는 추가 질문 목록과 질문 입력란 */
export function Followups({
  readingId,
  currency,
  initial,
  mockPayment,
  paymentRedirect,
  lang = "ko",
}: {
  readingId: string;
  currency: Currency;
  initial: FollowupRow[];
  mockPayment: boolean;
  paymentRedirect: Redirect;
  lang?: Lang;
}) {
  const t = UI_TEXT[lang];
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
      setError(lang === "en" ? t.fallbackError : (data.error ?? t.fallbackError));
      return;
    }
    setItems((list) => [...list.filter((f) => f.id !== data.id), data]);
    setQuestion("");
  }

  return (
    <section className="bg-surface-1 p-6 sm:p-8">
      <Eyebrow>MORE QUESTIONS</Eyebrow>
      <h2 className="mt-3 text-xl text-ink">{t.followupTitle}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{t.followupText(formatPrice(followupPriceFor(currency), lang, currency))}</p>

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
              productName={t.followupName}
              price={f.price}
              currency={f.currency}
              initialStatus={f.status}
              initialResult={f.ai_status === "done" ? f.ai_result : null}
              mockPayment={mockPayment}
              paymentRedirect={paymentRedirect?.followupId === f.id ? paymentRedirect : null}
              lang={lang}
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
            placeholder={t.followupPlaceholder}
          />
          {error && <p className="mt-2 text-sm text-error">{error}</p>}
          <button
            type="submit"
            className="mt-3 h-12 w-full border border-gold text-gold transition hover:bg-gold hover:text-black disabled:cursor-not-allowed disabled:border-line-strong disabled:text-muted-soft disabled:hover:bg-transparent"
            disabled={submitting || !question.trim()}
          >
            {submitting ? t.followupSubmitting : t.followupSubmit}
          </button>
        </form>
      )}
    </section>
  );
}
