"use client";

import { PLACES, placeById } from "@/lib/places";
import { Field, inputClass, Segmented } from "./ui";

export type BirthValue = {
  name: string;
  gender: "M" | "F";
  calendar: "solar" | "lunar";
  leapMonth: boolean;
  year: number;
  month: number;
  day: number;
  timeUnknown: boolean;
  hour: number;
  minute: number;
  solarTimeCorrection: boolean;
  /** 해외 출생지(places.ts). 빈 값이면 한국 출생이다. */
  placeId: string;
};

export const emptyBirth = (gender: "M" | "F" = "F"): BirthValue => ({
  name: "",
  gender,
  calendar: "solar",
  leapMonth: false,
  year: 1995,
  month: 1,
  day: 1,
  timeUnknown: false,
  hour: 12,
  minute: 0,
  solarTimeCorrection: true,
  placeId: "",
});

/** 서버의 SajuInput 형태로 바꾼다. */
export function toSajuInput(v: BirthValue) {
  return {
    name: v.name,
    gender: v.gender,
    calendar: v.calendar,
    leapMonth: v.leapMonth,
    year: v.year,
    month: v.month,
    day: v.day,
    hour: v.timeUnknown ? null : v.hour,
    minute: v.timeUnknown ? null : v.minute,
    solarTimeCorrection: v.solarTimeCorrection,
    // 해외 출생이면 출생지 시계 기준으로 계산한다(한국 보정은 적용하지 않는다).
    ...(placeById(v.placeId) ? { timeZone: placeById(v.placeId)!.timeZone } : {}),
  };
}

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

/** 이름·성별·생년월일시 입력 묶음. 사주·신년운세·궁합에서 함께 쓴다. */
export function BirthFields({ value, onChange }: { value: BirthValue; onChange: (v: BirthValue) => void }) {
  const set = <K extends keyof BirthValue>(key: K, v: BirthValue[K]) => onChange({ ...value, [key]: v });
  return (
    <div className="space-y-6">
      <Field label="이름 (선택)">
        <input className={inputClass} value={value.name} onChange={(e) => set("name", e.target.value)} maxLength={20} placeholder="홍길동" />
      </Field>
      <Field label="성별">
        <Segmented value={value.gender} onChange={(v) => set("gender", v)} options={[{ value: "F", label: "여성" }, { value: "M", label: "남성" }]} />
      </Field>
      <Field label="생일 기준">
        <Segmented
          value={value.calendar}
          onChange={(v) => onChange({ ...value, calendar: v, leapMonth: v === "solar" ? false : value.leapMonth })}
          options={[{ value: "solar", label: "양력" }, { value: "lunar", label: "음력" }]}
        />
        {value.calendar === "lunar" && (
          <label className="mt-3 flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" className="accent-gold" checked={value.leapMonth} onChange={(e) => set("leapMonth", e.target.checked)} /> 윤달
          </label>
        )}
      </Field>
      <Field label="생년월일">
        <div className="grid grid-cols-3 gap-2">
          <select className={inputClass} value={value.year} onChange={(e) => set("year", +e.target.value)}>
            {range(1920, 2030).reverse().map((y) => <option key={y} value={y}>{y}년</option>)}
          </select>
          <select className={inputClass} value={value.month} onChange={(e) => set("month", +e.target.value)}>
            {range(1, 12).map((m) => <option key={m} value={m}>{m}월</option>)}
          </select>
          <select className={inputClass} value={value.day} onChange={(e) => set("day", +e.target.value)}>
            {range(1, value.calendar === "lunar" ? 30 : 31).map((d) => <option key={d} value={d}>{d}일</option>)}
          </select>
        </div>
      </Field>
      <Field label="태어난 시각">
        <div className="grid grid-cols-2 gap-2">
          <select className={inputClass} value={value.hour} disabled={value.timeUnknown} onChange={(e) => set("hour", +e.target.value)}>
            {range(0, 23).map((h) => <option key={h} value={h}>{h}시</option>)}
          </select>
          <select className={inputClass} value={value.minute} disabled={value.timeUnknown} onChange={(e) => set("minute", +e.target.value)}>
            {range(0, 59).map((m) => <option key={m} value={m}>{m}분</option>)}
          </select>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" className="accent-gold" checked={value.timeUnknown} onChange={(e) => set("timeUnknown", e.target.checked)} /> 태어난 시간을 몰라요
        </label>
        {!value.timeUnknown && !value.placeId && (
          <label className="mt-1 flex items-start gap-2 text-sm text-muted">
            <input
              type="checkbox"
              className="mt-1 accent-gold"
              checked={value.solarTimeCorrection}
              onChange={(e) => set("solarTimeCorrection", e.target.checked)}
            />
            <span>
              한국 시간 보정 적용 (권장)
              <span className="block text-xs text-muted-soft">표준시와 실제 태양시의 차이(약 30분)와 과거 서머타임을 반영합니다.</span>
            </span>
          </label>
        )}
      </Field>
      <Field label="태어난 곳">
        <select className={inputClass} value={value.placeId} onChange={(e) => set("placeId", e.target.value)}>
          <option value="">한국</option>
          <optgroup label="해외 (가까운 도시)">
            {PLACES.filter((p) => p.timeZone !== "Asia/Seoul").map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </optgroup>
        </select>
        {value.placeId && (
          <p className="mt-2 text-xs leading-5 text-muted-soft">해외 출생은 그곳의 현지 시각 그대로 계산합니다. 현지 서머타임도 반영합니다.</p>
        )}
      </Field>
    </div>
  );
}
