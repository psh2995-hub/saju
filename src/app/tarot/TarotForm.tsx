"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, inputClass, PrimaryButton } from "@/components/ui";
import { SPREAD_SIZE, TAROT_TOPICS, type TarotTopic } from "@/lib/tarot-config";

export function TarotForm() {
  const router = useRouter();
  const [topic, setTopic] = useState<TarotTopic>("love");
  const [question, setQuestion] = useState("");
  const [picks, setPicks] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const positions = TAROT_TOPICS[topic].positions;

  function toggle(i: number) {
    setPicks((p) => (p.includes(i) ? p.filter((x) => x !== i) : p.length < 3 ? [...p, i] : p));
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/readings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "tarot", input: { topic, question, picks } }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "잠시 후 다시 시도해 주세요.");
      setSubmitting(false);
      return;
    }
    router.push(`/r/${data.id}`);
  }

  return (
    <div className="space-y-5 rounded-2xl border border-line bg-surface p-6">
      <Field label="무엇이 궁금한가요?">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(Object.keys(TAROT_TOPICS) as TarotTopic[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTopic(t)}
              className={`rounded-lg border py-2 text-sm ${topic === t ? "border-gold bg-gold/10 text-gold-strong" : "border-line text-muted"}`}
            >
              {TAROT_TOPICS[t].label}
            </button>
          ))}
        </div>
      </Field>
      <Field label="구체적인 질문 (선택)">
        <textarea
          className={`${inputClass} h-24 resize-none`}
          value={question}
          maxLength={300}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="예) 요즘 연락이 뜸해진 그 사람과 다시 가까워질 수 있을까요?"
        />
      </Field>
      <div>
        <p className="mb-1.5 text-sm text-muted">
          질문을 떠올리며 카드 세 장을 골라 주세요 ({picks.length}/3)
        </p>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
          {Array.from({ length: SPREAD_SIZE }, (_, i) => {
            const order = picks.indexOf(i);
            return (
              <button
                key={i}
                type="button"
                onClick={() => toggle(i)}
                aria-label={`${i + 1}번째 카드`}
                className={`relative aspect-[2/3] rounded-md border transition ${
                  order >= 0
                    ? "-translate-y-1 border-gold bg-gold/20"
                    : "border-line bg-[repeating-linear-gradient(45deg,#211d40,#211d40_6px,#2a2550_6px,#2a2550_12px)] hover:border-gold/50"
                }`}
              >
                {order >= 0 && <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gold-strong">{order + 1}</span>}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted">
          고른 순서대로 {positions.map((p, i) => `${i + 1} ${p}`).join(" · ")}
        </p>
      </div>
      {error && <p className="text-sm text-fire">{error}</p>}
      <PrimaryButton type="button" onClick={submit} disabled={submitting || picks.length !== 3}>
        {submitting ? "카드를 펼치는 중…" : "카드 펼치기"}
      </PrimaryButton>
    </div>
  );
}
