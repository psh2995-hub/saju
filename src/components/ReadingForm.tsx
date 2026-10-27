"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { KOREA_PLACES, PLACES, placeById } from "@/lib/places";
import { BirthFields, emptyBirth, toSajuInput, type BirthValue } from "./BirthFields";
import { Eyebrow, Field, inputClass, PrimaryButton, Segmented } from "./ui";

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

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

/** 별자리 입력: 생년월일(양력·음력), 태어난 시각, 태어난 곳(상승궁 계산용) */
export function ZodiacForm() {
  const [v, setV] = useState({
    name: "",
    calendar: "solar" as "solar" | "lunar",
    leapMonth: false,
    year: 1995,
    month: 1,
    day: 1,
    timeUnknown: false,
    hour: 12,
    minute: 0,
    placeId: "kr-seoul",
  });
  const { submitting, error, run } = useSubmit();
  const set = <K extends keyof typeof v>(key: K, value: (typeof v)[K]) => setV({ ...v, [key]: value });
  const place = placeById(v.placeId);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void run("zodiac", {
          name: v.name,
          calendar: v.calendar,
          leapMonth: v.leapMonth,
          year: v.year,
          month: v.month,
          day: v.day,
          hour: v.timeUnknown ? null : v.hour,
          minute: v.timeUnknown ? null : v.minute,
          placeId: v.placeId,
          timeZone: place?.timeZone ?? "Asia/Seoul",
        });
      }}
      className="space-y-6 bg-surface-1 p-6 sm:p-8"
    >
      <Field label="이름 (선택)">
        <input className={inputClass} value={v.name} onChange={(e) => set("name", e.target.value)} maxLength={20} placeholder="홍길동" />
      </Field>
      <Field label="생일 기준">
        <Segmented
          value={v.calendar}
          onChange={(c) => setV({ ...v, calendar: c, leapMonth: c === "solar" ? false : v.leapMonth })}
          options={[{ value: "solar", label: "양력" }, { value: "lunar", label: "음력" }]}
        />
        {v.calendar === "lunar" && (
          <label className="mt-3 flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" className="accent-gold" checked={v.leapMonth} onChange={(e) => set("leapMonth", e.target.checked)} /> 윤달
          </label>
        )}
      </Field>
      <Field label="생년월일">
        <div className="grid grid-cols-3 gap-2">
          <select className={inputClass} value={v.year} onChange={(e) => set("year", +e.target.value)}>
            {range(1920, 2030).reverse().map((y) => <option key={y} value={y}>{y}년</option>)}
          </select>
          <select className={inputClass} value={v.month} onChange={(e) => set("month", +e.target.value)}>
            {range(1, 12).map((m) => <option key={m} value={m}>{m}월</option>)}
          </select>
          <select className={inputClass} value={v.day} onChange={(e) => set("day", +e.target.value)}>
            {range(1, v.calendar === "lunar" ? 30 : 31).map((d) => <option key={d} value={d}>{d}일</option>)}
          </select>
        </div>
      </Field>
      <Field label="태어난 시각">
        <div className="grid grid-cols-2 gap-2">
          <select className={inputClass} value={v.hour} disabled={v.timeUnknown} onChange={(e) => set("hour", +e.target.value)}>
            {range(0, 23).map((h) => <option key={h} value={h}>{h}시</option>)}
          </select>
          <select className={inputClass} value={v.minute} disabled={v.timeUnknown} onChange={(e) => set("minute", +e.target.value)}>
            {range(0, 59).map((m) => <option key={m} value={m}>{m}분</option>)}
          </select>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" className="accent-gold" checked={v.timeUnknown} onChange={(e) => set("timeUnknown", e.target.checked)} /> 태어난 시간을 몰라요
        </label>
      </Field>
      <Field label="태어난 곳">
        <select className={inputClass} value={v.placeId} onChange={(e) => set("placeId", e.target.value)}>
          <optgroup label="국내">
            {KOREA_PLACES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </optgroup>
          <optgroup label="해외">
            {PLACES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </optgroup>
        </select>
        <p className="mt-2 text-xs leading-5 text-muted-soft">
          태어난 시각과 도시로 달과 상승궁(첫인상 별자리)을 계산합니다. 목록에 없으면 가장 가까운 도시를 골라 주세요. 과거 서머타임도 반영합니다.
        </p>
      </Field>
      {error && <p className="text-sm text-error">{error}</p>}
      <PrimaryButton type="submit" disabled={submitting}>
        {submitting ? "하늘을 읽는 중…" : "무료로 별자리 보기"}
      </PrimaryButton>
    </form>
  );
}
