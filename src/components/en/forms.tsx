"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MONTH_EN } from "@/lib/en";
import { readingPath } from "@/lib/i18n";
import { SPREAD_SIZE, ZODIAC_TAROT_TOPICS, type TarotTopic } from "@/lib/tarot-config";
import { sunSign } from "@/lib/zodiac-signs";
import { Field, inputClass, PrimaryButton, Segmented } from "../ui";

const FALLBACK_ERROR = "Something went wrong. Please try again in a moment.";

/** 출생지 시간대. 서버·브라우저의 시간대 목록 차이로 화면이 어긋나지 않게 고정 목록을 쓴다. */
const TIME_ZONES: [string, string][] = [
  ["", "Same as this device"],
  ["Pacific/Honolulu", "Honolulu"],
  ["America/Anchorage", "Anchorage"],
  ["America/Los_Angeles", "Los Angeles · Pacific"],
  ["America/Vancouver", "Vancouver"],
  ["America/Phoenix", "Phoenix"],
  ["America/Denver", "Denver · Mountain"],
  ["America/Chicago", "Chicago · Central"],
  ["America/Mexico_City", "Mexico City"],
  ["America/New_York", "New York · Eastern"],
  ["America/Toronto", "Toronto"],
  ["America/Bogota", "Bogotá"],
  ["America/Lima", "Lima"],
  ["America/Sao_Paulo", "São Paulo"],
  ["America/Argentina/Buenos_Aires", "Buenos Aires"],
  ["Europe/London", "London"],
  ["Europe/Dublin", "Dublin"],
  ["Europe/Lisbon", "Lisbon"],
  ["Europe/Madrid", "Madrid"],
  ["Europe/Paris", "Paris"],
  ["Europe/Amsterdam", "Amsterdam"],
  ["Europe/Berlin", "Berlin"],
  ["Europe/Rome", "Rome"],
  ["Europe/Stockholm", "Stockholm"],
  ["Europe/Warsaw", "Warsaw"],
  ["Europe/Athens", "Athens"],
  ["Europe/Istanbul", "Istanbul"],
  ["Europe/Moscow", "Moscow"],
  ["Africa/Cairo", "Cairo"],
  ["Africa/Lagos", "Lagos"],
  ["Africa/Johannesburg", "Johannesburg"],
  ["Asia/Dubai", "Dubai"],
  ["Asia/Kolkata", "India"],
  ["Asia/Bangkok", "Bangkok"],
  ["Asia/Ho_Chi_Minh", "Ho Chi Minh City"],
  ["Asia/Jakarta", "Jakarta"],
  ["Asia/Singapore", "Singapore"],
  ["Asia/Kuala_Lumpur", "Kuala Lumpur"],
  ["Asia/Manila", "Manila"],
  ["Asia/Hong_Kong", "Hong Kong"],
  ["Asia/Taipei", "Taipei"],
  ["Asia/Shanghai", "China"],
  ["Asia/Seoul", "Seoul · Korea"],
  ["Asia/Tokyo", "Tokyo"],
  ["Australia/Perth", "Perth"],
  ["Australia/Brisbane", "Brisbane"],
  ["Australia/Sydney", "Sydney"],
  ["Australia/Melbourne", "Melbourne"],
  ["Pacific/Auckland", "Auckland"],
];

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
  onChange,
}: {
  year: number;
  month: number;
  day: number;
  onChange: (v: { year: number; month: number; day: number }) => void;
}) {
  const set = (v: Partial<{ year: number; month: number; day: number }>) => {
    const next = { year, month, day, ...v };
    onChange({ ...next, day: Math.min(next.day, daysIn(next.year, next.month)) });
  };
  return (
    <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-2">
      <select className={inputClass} value={month} onChange={(e) => set({ month: +e.target.value })} aria-label="Month">
        {MONTH_EN.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
      </select>
      <select className={inputClass} value={day} onChange={(e) => set({ day: +e.target.value })} aria-label="Day">
        {range(1, daysIn(year, month)).map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
      <select className={inputClass} value={year} onChange={(e) => set({ year: +e.target.value })} aria-label="Year">
        {range(1920, 2030).reverse().map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );
}

/** 사주·K-별자리 신년운세용 출생 정보. 양력·출생지 시계 기준이다. */
export function EnBirthForm({ kind, submitLabel }: { kind: "saju" | "newyear"; submitLabel: string }) {
  const [v, setV] = useState({
    name: "",
    gender: "F" as "M" | "F",
    year: 1995,
    month: 1,
    day: 1,
    timeUnknown: false,
    hour: 12,
    minute: 0,
    timeZone: "",
  });
  const { submitting, error, run } = useSubmit();
  const set = <K extends keyof typeof v>(key: K, value: (typeof v)[K]) => setV({ ...v, [key]: value });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const timeZone = v.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        void run(kind, {
          name: v.name,
          gender: v.gender,
          calendar: "solar",
          leapMonth: false,
          year: v.year,
          month: v.month,
          day: v.day,
          hour: v.timeUnknown ? null : v.hour,
          minute: v.timeUnknown ? null : v.minute,
          solarTimeCorrection: true,
          timeZone,
        });
      }}
      className="space-y-6 bg-surface-1 p-6 sm:p-8"
    >
      <Field label="Name (optional)">
        <input className={inputClass} value={v.name} onChange={(e) => set("name", e.target.value)} maxLength={20} placeholder="Alex" />
      </Field>
      <Field label="Gender">
        <Segmented value={v.gender} onChange={(g) => set("gender", g)} options={[{ value: "F", label: "Female" }, { value: "M", label: "Male" }]} />
        <p className="mt-2 text-xs text-muted-soft">Korean astrology uses this to set the direction of your ten-year luck cycles.</p>
      </Field>
      <Field label="Date of birth">
        <DateFields year={v.year} month={v.month} day={v.day} onChange={(d) => setV({ ...v, ...d })} />
      </Field>
      <Field label="Time of birth">
        <div className="grid grid-cols-2 gap-2">
          <select className={inputClass} value={v.hour} disabled={v.timeUnknown} onChange={(e) => set("hour", +e.target.value)} aria-label="Hour">
            {range(0, 23).map((h) => <option key={h} value={h}>{hourLabel(h)}</option>)}
          </select>
          <select className={inputClass} value={v.minute} disabled={v.timeUnknown} onChange={(e) => set("minute", +e.target.value)} aria-label="Minute">
            {range(0, 59).map((m) => <option key={m} value={m}>:{String(m).padStart(2, "0")}</option>)}
          </select>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" className="accent-gold" checked={v.timeUnknown} onChange={(e) => set("timeUnknown", e.target.checked)} /> I don&apos;t
          know my birth time
        </label>
      </Field>
      <Field label="Where were you born? (time zone)">
        <select className={inputClass} value={v.timeZone} onChange={(e) => set("timeZone", e.target.value)}>
          {TIME_ZONES.map(([value, label]) => <option key={label} value={value}>{label}</option>)}
        </select>
        <p className="mt-2 text-xs text-muted-soft">Enter the clock time where you were born. Daylight saving time is handled for you.</p>
      </Field>
      {error && <p className="text-sm text-error">{error}</p>}
      <PrimaryButton type="submit" disabled={submitting}>
        {submitting ? "Building your chart…" : submitLabel}
      </PrimaryButton>
    </form>
  );
}

export function ZodiacTarotForm() {
  const [birth, setBirth] = useState({ year: 1995, month: 1, day: 1 });
  const [name, setName] = useState("");
  const [topic, setTopic] = useState<TarotTopic>("love");
  const [question, setQuestion] = useState("");
  const [picks, setPicks] = useState<number[]>([]);
  const { submitting, error, run } = useSubmit();
  const sign = sunSign(birth.month, birth.day);
  const positions = ZODIAC_TAROT_TOPICS[topic].positions;

  function toggle(i: number) {
    setPicks((p) => (p.includes(i) ? p.filter((x) => x !== i) : p.length < 3 ? [...p, i] : p));
  }

  return (
    <div className="space-y-6 bg-surface-1 p-6 sm:p-8">
      <Field label="Your birthday">
        <DateFields {...birth} onChange={setBirth} />
        <p className="mt-3 text-sm text-gold">
          {sign.symbol} {sign.name} <span className="text-muted">· {sign.dates}</span>
        </p>
      </Field>
      <Field label="Name (optional)">
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} maxLength={20} placeholder="Alex" />
      </Field>
      <Field label="What's on your mind?">
        <div className="grid grid-cols-2 gap-px border border-line-strong bg-line-strong sm:grid-cols-4">
          {(Object.keys(ZODIAC_TAROT_TOPICS) as TarotTopic[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTopic(t)}
              className={`h-11 text-sm transition ${topic === t ? "bg-ink font-bold text-surface-2" : "bg-canvas text-muted hover:text-ink"}`}
            >
              {ZODIAC_TAROT_TOPICS[t].label}
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
        onClick={() => void run("zodiac", { ...birth, name, topic, question, picks })}
        disabled={submitting || picks.length !== 3}
      >
        {submitting ? "Turning the cards…" : "Reveal my cards"}
      </PrimaryButton>
    </div>
  );
}
