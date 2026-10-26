"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BirthFields, emptyBirth, toSajuInput, type BirthValue } from "./BirthFields";
import { Eyebrow, PrimaryButton } from "./ui";

async function createReading(kind: string, input: unknown) {
  const res = await fetch("/api/readings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, input }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "잠시 후 다시 시도해 주세요.");
  return data.id as string;
}

function useSubmit() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function run(kind: string, input: unknown) {
    setSubmitting(true);
    setError(null);
    try {
      router.push(`/r/${await createReading(kind, input)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "잠시 후 다시 시도해 주세요.");
      setSubmitting(false);
    }
  }
  return { submitting, error, run };
}

/** 한 사람의 생년월일시로 만드는 풀이(사주, 신년운세) */
export function SingleBirthForm({ kind, submitLabel }: { kind: "saju" | "newyear"; submitLabel: string }) {
  const [birth, setBirth] = useState<BirthValue>(emptyBirth());
  const { submitting, error, run } = useSubmit();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void run(kind, toSajuInput(birth));
      }}
      className="space-y-6 bg-surface-1 p-6 sm:p-8"
    >
      <BirthFields value={birth} onChange={setBirth} />
      {error && <p className="text-sm text-error">{error}</p>}
      <PrimaryButton type="submit" disabled={submitting}>
        {submitting ? "명식을 세우는 중…" : submitLabel}
      </PrimaryButton>
    </form>
  );
}

export function GunghapForm() {
  const [a, setA] = useState<BirthValue>(emptyBirth("F"));
  const [b, setB] = useState<BirthValue>(emptyBirth("M"));
  const { submitting, error, run } = useSubmit();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void run("gunghap", { a: toSajuInput(a), b: toSajuInput(b) });
      }}
      className="space-y-px"
    >
      <div className="bg-surface-1 p-6 sm:p-8">
        <Eyebrow>01 · 나</Eyebrow>
        <div className="mt-5">
          <BirthFields value={a} onChange={setA} />
        </div>
      </div>
      <div className="bg-surface-1 p-6 sm:p-8">
        <Eyebrow>02 · 상대</Eyebrow>
        <div className="mt-5">
          <BirthFields value={b} onChange={setB} />
        </div>
      </div>
      <div className="bg-surface-1 p-6 sm:p-8">
        {error && <p className="mb-4 text-sm text-error">{error}</p>}
        <PrimaryButton type="submit" disabled={submitting}>
          {submitting ? "두 사람의 명식을 세우는 중…" : "무료로 궁합 보기"}
        </PrimaryButton>
      </div>
    </form>
  );
}
