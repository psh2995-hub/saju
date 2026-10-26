"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, inputClass, PrimaryButton, Segmented } from "@/components/ui";

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

export function SajuForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"M" | "F">("F");
  const [calendar, setCalendar] = useState<"solar" | "lunar">("solar");
  const [leapMonth, setLeapMonth] = useState(false);
  const [year, setYear] = useState(1995);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [solarTimeCorrection, setSolarTimeCorrection] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/readings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "saju",
        input: {
          name,
          gender,
          calendar,
          leapMonth,
          year,
          month,
          day,
          hour: timeUnknown ? null : hour,
          minute: timeUnknown ? null : minute,
          solarTimeCorrection,
        },
      }),
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
    <form onSubmit={submit} className="space-y-6 bg-surface-1 p-6 sm:p-8">
      <Field label="이름 (선택)">
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} maxLength={20} placeholder="홍길동" />
      </Field>
      <Field label="성별">
        <Segmented value={gender} onChange={setGender} options={[{ value: "F", label: "여성" }, { value: "M", label: "남성" }]} />
      </Field>
      <Field label="생일 기준">
        <Segmented
          value={calendar}
          onChange={(v) => {
            setCalendar(v);
            if (v === "solar") setLeapMonth(false);
          }}
          options={[{ value: "solar", label: "양력" }, { value: "lunar", label: "음력" }]}
        />
        {calendar === "lunar" && (
          <label className="mt-3 flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" className="accent-gold" checked={leapMonth} onChange={(e) => setLeapMonth(e.target.checked)} /> 윤달
          </label>
        )}
      </Field>
      <Field label="생년월일">
        <div className="grid grid-cols-3 gap-2">
          <select className={inputClass} value={year} onChange={(e) => setYear(+e.target.value)}>
            {range(1920, 2030).reverse().map((y) => <option key={y} value={y}>{y}년</option>)}
          </select>
          <select className={inputClass} value={month} onChange={(e) => setMonth(+e.target.value)}>
            {range(1, 12).map((m) => <option key={m} value={m}>{m}월</option>)}
          </select>
          <select className={inputClass} value={day} onChange={(e) => setDay(+e.target.value)}>
            {range(1, calendar === "lunar" ? 30 : 31).map((d) => <option key={d} value={d}>{d}일</option>)}
          </select>
        </div>
      </Field>
      <Field label="태어난 시각">
        <div className="grid grid-cols-2 gap-2">
          <select className={inputClass} value={hour} disabled={timeUnknown} onChange={(e) => setHour(+e.target.value)}>
            {range(0, 23).map((h) => <option key={h} value={h}>{h}시</option>)}
          </select>
          <select className={inputClass} value={minute} disabled={timeUnknown} onChange={(e) => setMinute(+e.target.value)}>
            {range(0, 59).map((m) => <option key={m} value={m}>{m}분</option>)}
          </select>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" className="accent-gold" checked={timeUnknown} onChange={(e) => setTimeUnknown(e.target.checked)} /> 태어난 시간을 몰라요
        </label>
        {!timeUnknown && (
          <label className="mt-1 flex items-start gap-2 text-sm text-muted">
            <input type="checkbox" className="mt-1 accent-gold" checked={solarTimeCorrection} onChange={(e) => setSolarTimeCorrection(e.target.checked)} />
            <span>
              한국 시간 보정 적용 (권장)
              <span className="block text-xs text-muted-soft">표준시와 실제 태양시의 차이(약 30분)와 과거 서머타임을 반영합니다.</span>
            </span>
          </label>
        )}
      </Field>
      {error && <p className="text-sm text-error">{error}</p>}
      <PrimaryButton type="submit" disabled={submitting}>
        {submitting ? "명식을 세우는 중…" : "무료로 내 사주 보기"}
      </PrimaryButton>
    </form>
  );
}
