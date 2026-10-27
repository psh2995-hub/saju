"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MONTH_EN } from "@/lib/en";
import { readingPath } from "@/lib/i18n";
import { PLACES, placeById } from "@/lib/places";
import { SPREAD_SIZE, TAROT_TOPICS_EN, type TarotTopic } from "@/lib/tarot-config";
import { sunSign } from "@/lib/zodiac-signs";
import { Eyebrow, Field, inputClass, PrimaryButton, Segmented } from "../ui";

const FALLBACK_ERROR = "Something went wrong. Please try again in a moment.";

const deviceTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

/** 출생 도시 선택. 목록에 없으면 이 기기의 시간대를 쓴다(이때 별자리의 상승궁은 계산하지 않는다). */
function PlaceSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <select className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} aria-label="Birth city">
      <option value="">Not listed — use this device&apos;s time zone</option>
      {PLACES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
    </select>
  );
}

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const daysIn = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate();
const hourLabel = (h: number) => `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? "AM" : "PM"}`;

async function createReading(kind: string, input: unknown) {
  const res = await fetch("/api/readings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, input, lang: "en" }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? FALLBACK_ERROR);
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
      router.push(readingPath(await createReading(kind, input), "en"));
    } catch (e) {
      setError(e instanceof Error ? e.message : FALLBACK_ERROR);
      setSubmitting(false);
    }
  }
  return { submitting, error, run };
}

function DateFields({
  year,
  month,
  day,
  lunar = false,
  onChange,
}: {
  year: number;
  month: number;
  day: number;
  /** 음력 날짜는 달마다 29일 또는 30일이라 1~30일을 보여 주고 서버에서 검증한다. */
  lunar?: boolean;
  onChange: (v: { year: number; month: number; day: number }) => void;
}) {
  const maxDay = (y: number, m: number) => (lunar ? 30 : daysIn(y, m));
  const set = (v: Partial<{ year: number; month: number; day: number }>) => {
    const next = { year, month, day, ...v };
    onChange({ ...next, day: Math.min(next.day, maxDay(next.year, next.month)) });
  };
  return (
    <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-2">
      <select className={inputClass} value={month} onChange={(e) => set({ month: +e.target.value })} aria-label="Month">
        {MONTH_EN.map((m, i) => <option key={m} value={i + 1}>{lunar ? `Month ${i + 1}` : m}</option>)}
      </select>
      <select className={inputClass} value={day} onChange={(e) => set({ day: +e.target.value })} aria-label="Day">
        {range(1, maxDay(year, month)).map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
      <select className={inputClass} value={year} onChange={(e) => set({ year: +e.target.value })} aria-label="Year">
        {range(1920, 2030).reverse().map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );
}

/** 양력·음력 선택. 음력은 한국 음력(윤달 포함)이다. */
function CalendarFields({
  calendar,
  leapMonth,
  onChange,
}: {
  calendar: "solar" | "lunar";
  leapMonth: boolean;
  onChange: (v: { calendar: "solar" | "lunar"; leapMonth: boolean }) => void;
}) {
  return (
    <>
      <Segmented
        value={calendar}
        onChange={(c) => onChange({ calendar: c, leapMonth: c === "solar" ? false : leapMonth })}
        options={[{ value: "solar", label: "Regular (solar)" }, { value: "lunar", label: "Korean lunar" }]}
      />
      {calendar === "lunar" && (
        <label className="mt-3 flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" className="accent-gold" checked={leapMonth} onChange={(e) => onChange({ calendar, leapMonth: e.target.checked })} /> Leap
          month
        </label>
      )}
    </>
  );
}

type EnBirth = {
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
  placeId: string;
};

const emptyEnBirth = (gender: "M" | "F" = "F"): EnBirth => ({
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
  placeId: "",
});

/** 서버의 SajuInput 형태로 바꾼다. 출생지를 고르지 않으면 이 기기의 시간대를 쓴다. */
const toSajuInput = (v: EnBirth) => ({
  name: v.name,
  gender: v.gender,
  calendar: v.calendar,
  leapMonth: v.leapMonth,
  year: v.year,
  month: v.month,
  day: v.day,
  hour: v.timeUnknown ? null : v.hour,
  minute: v.timeUnknown ? null : v.minute,
  solarTimeCorrection: true,
  timeZone: placeById(v.placeId)?.timeZone ?? deviceTimeZone(),
});

/** 사주·신년운세·궁합에 쓰는 한 사람의 출생 정보 입력 */
function EnBirthFields({ value: v, onChange }: { value: EnBirth; onChange: (v: EnBirth) => void }) {
  const set = <K extends keyof EnBirth>(key: K, value: EnBirth[K]) => onChange({ ...v, [key]: value });
  return (
    <div className="space-y-6">
      <Field label="Name (optional)">
        <input className={inputClass} value={v.name} onChange={(e) => set("name", e.target.value)} maxLength={20} placeholder="Alex" />
      </Field>
      <Field label="Gender">
        <Segmented value={v.gender} onChange={(g) => set("gender", g)} options={[{ value: "F", label: "Female" }, { value: "M", label: "Male" }]} />
        <p className="mt-2 text-xs text-muted-soft">Korean astrology uses this to set the direction of the ten-year luck cycles.</p>
      </Field>
      <Field label="Calendar">
        <CalendarFields calendar={v.calendar} leapMonth={v.leapMonth} onChange={(c) => onChange({ ...v, ...c })} />
      </Field>
      <Field label="Date of birth">
        <DateFields year={v.year} month={v.month} day={v.day} lunar={v.calendar === "lunar"} onChange={(d) => onChange({ ...v, ...d })} />
      </Field>
      <Field label="Time of birth">
        <TimeFields hour={v.hour} minute={v.minute} unknown={v.timeUnknown} onChange={(t) => onChange({ ...v, ...t })} />
      </Field>
      <Field label="Where were you born?">
        <PlaceSelect value={v.placeId} onChange={(id) => set("placeId", id)} />
        <p className="mt-2 text-xs text-muted-soft">
          Pick the birth city or the nearest one in the same time zone. We use the local clock time there, and handle daylight saving for you.
        </p>
      </Field>
    </div>
  );
}

/** 사주·K-별자리 신년운세: 한 사람의 출생 정보 */
export function EnBirthForm({ kind, submitLabel }: { kind: "saju" | "newyear"; submitLabel: string }) {
  const [birth, setBirth] = useState(emptyEnBirth());
  const { submitting, error, run } = useSubmit();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void run(kind, toSajuInput(birth));
      }}
      className="space-y-6 bg-surface-1 p-6 sm:p-8"
    >
      <EnBirthFields value={birth} onChange={setBirth} />
      {error && <p className="text-sm text-error">{error}</p>}
      <PrimaryButton type="submit" disabled={submitting}>
        {submitting ? "Building your chart…" : submitLabel}
      </PrimaryButton>
    </form>
  );
}

/** K-Compatibility: 두 사람의 출생 정보 */
export function EnGunghapForm() {
  const [a, setA] = useState(emptyEnBirth("F"));
  const [b, setB] = useState(emptyEnBirth("M"));
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
        <Eyebrow>01 · YOU</Eyebrow>
        <div className="mt-5">
          <EnBirthFields value={a} onChange={setA} />
        </div>
      </div>
      <div className="bg-surface-1 p-6 sm:p-8">
        <Eyebrow>02 · THE OTHER PERSON</Eyebrow>
        <div className="mt-5">
          <EnBirthFields value={b} onChange={setB} />
        </div>
      </div>
      <div className="bg-surface-1 p-6 sm:p-8">
        {error && <p className="mb-4 text-sm text-error">{error}</p>}
        <PrimaryButton type="submit" disabled={submitting}>
          {submitting ? "Reading both charts…" : "See our compatibility — free"}
        </PrimaryButton>
      </div>
    </form>
  );
}

function TimeFields({
  hour,
  minute,
  unknown,
  onChange,
}: {
  hour: number;
  minute: number;
  unknown: boolean;
  onChange: (v: { hour: number; minute: number; timeUnknown: boolean }) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <select className={inputClass} value={hour} disabled={unknown} onChange={(e) => onChange({ hour: +e.target.value, minute, timeUnknown: unknown })} aria-label="Hour">
          {range(0, 23).map((h) => <option key={h} value={h}>{hourLabel(h)}</option>)}
        </select>
        <select className={inputClass} value={minute} disabled={unknown} onChange={(e) => onChange({ hour, minute: +e.target.value, timeUnknown: unknown })} aria-label="Minute">
          {range(0, 59).map((m) => <option key={m} value={m}>:{String(m).padStart(2, "0")}</option>)}
        </select>
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" className="accent-gold" checked={unknown} onChange={(e) => onChange({ hour, minute, timeUnknown: e.target.checked })} /> I don&apos;t
        know my birth time
      </label>
    </>
  );
}

/** 별자리(서양 점성술) 입력 */
export function ZodiacForm() {
  const [v, setV] = useState({
    name: "",
    calendar: "solar" as "solar" | "lunar",
    leapMonth: false,
    year: 1995,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    timeUnknown: false,
    placeId: "",
  });
  const { submitting, error, run } = useSubmit();
  const sign = v.calendar === "solar" ? sunSign(v.month, v.day) : null;
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
          placeId: v.placeId || undefined,
          timeZone: placeById(v.placeId)?.timeZone ?? deviceTimeZone(),
        });
      }}
      className="space-y-6 bg-surface-1 p-6 sm:p-8"
    >
      <Field label="Calendar">
        <CalendarFields calendar={v.calendar} leapMonth={v.leapMonth} onChange={(c) => setV({ ...v, ...c })} />
      </Field>
      <Field label="Date of birth">
        <DateFields year={v.year} month={v.month} day={v.day} lunar={v.calendar === "lunar"} onChange={(d) => setV({ ...v, ...d })} />
        {sign && (
          <p className="mt-3 text-sm text-gold">
            <span className="font-[family-name:var(--font-symbol)]">{sign.symbol}</span> {sign.name} <span className="text-muted">· {sign.dates}</span>
          </p>
        )}
      </Field>
      <Field label="Time of birth">
        <TimeFields hour={v.hour} minute={v.minute} unknown={v.timeUnknown} onChange={(t) => setV({ ...v, ...t })} />
      </Field>
      <Field label="Where were you born?">
        <PlaceSelect value={v.placeId} onChange={(placeId) => setV({ ...v, placeId })} />
        <p className="mt-2 text-xs text-muted-soft">Your birth time and city reveal your Moon and Rising signs. Pick the nearest city if yours isn&apos;t listed.</p>
      </Field>
      <Field label="Name (optional)">
        <input className={inputClass} value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} maxLength={20} placeholder="Alex" />
      </Field>
      {error && <p className="text-sm text-error">{error}</p>}
      <PrimaryButton type="submit" disabled={submitting}>
        {submitting ? "Reading the sky…" : "See my zodiac chart — free"}
      </PrimaryButton>
    </form>
  );
}

export function TarotForm() {
  const [topic, setTopic] = useState<TarotTopic>("love");
  const [question, setQuestion] = useState("");
  const [picks, setPicks] = useState<number[]>([]);
  const { submitting, error, run } = useSubmit();
  const positions = TAROT_TOPICS_EN[topic].positions;

  function toggle(i: number) {
    setPicks((p) => (p.includes(i) ? p.filter((x) => x !== i) : p.length < 3 ? [...p, i] : p));
  }

  return (
    <div className="space-y-6 bg-surface-1 p-6 sm:p-8">
      <Field label="What's on your mind?">
        <div className="grid grid-cols-2 gap-px border border-line-strong bg-line-strong sm:grid-cols-4">
          {(Object.keys(TAROT_TOPICS_EN) as TarotTopic[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTopic(t)}
              className={`h-11 text-sm transition ${topic === t ? "bg-ink font-bold text-surface-2" : "bg-canvas text-muted hover:text-ink"}`}
            >
              {TAROT_TOPICS_EN[t].label}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Your question (optional)">
        <textarea
          className={`${inputClass} h-28 resize-none py-3`}
          value={question}
          maxLength={300}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Will things work out with the person I've been talking to?"
        />
      </Field>
      <div>
        <p className="mb-3 text-xs tracking-[0.08em] text-muted">Hold your question in mind and pick three cards ({picks.length}/3)</p>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
          {Array.from({ length: SPREAD_SIZE }, (_, i) => {
            const order = picks.indexOf(i);
            return (
              <button
                key={i}
                type="button"
                onClick={() => toggle(i)}
                aria-label={`Card ${i + 1}`}
                className={`relative aspect-[2/3] border transition ${
                  order >= 0
                    ? "border-gold bg-gold/15"
                    : "border-line-strong bg-[repeating-linear-gradient(135deg,#181818,#181818_5px,#202020_5px,#202020_10px)] hover:border-muted"
                }`}
              >
                {order >= 0 && <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gold">{order + 1}</span>}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-soft">In the order you pick: {positions.map((p, i) => `${i + 1} ${p}`).join(" · ")}</p>
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      <PrimaryButton
        type="button"
        onClick={() => void run("tarot", { topic, question, picks })}
        disabled={submitting || picks.length !== 3}
      >
        {submitting ? "Turning the cards…" : "Reveal my cards"}
      </PrimaryButton>
    </div>
  );
}
