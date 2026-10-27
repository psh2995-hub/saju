import type { Lang } from "@/lib/i18n";
import type { ZodiacChart, ZodiacInput } from "@/lib/zodiac";
import { ELEMENT_KO, MODALITY_KO, POINTS, POINTS_KO, RULER_KO, SIGN_KO, signByKey, type SignKey } from "@/lib/zodiac-signs";
import { Eyebrow, Panel } from "./ui";

const ELEMENT_COLOR = { Fire: "text-fire", Earth: "text-earth", Air: "text-metal", Water: "text-water" } as const;
const ELEMENT_BG = { Fire: "bg-fire", Earth: "bg-earth", Air: "bg-metal", Water: "bg-water" } as const;

type Point = keyof typeof POINTS;
type Element = keyof ZodiacChart["elements"];

/** 별자리 결과 화면의 언어별 문구 */
function texts(lang: Lang) {
  const ko = lang === "ko";
  return {
    sign: (k: SignKey) => (ko ? SIGN_KO[k].name : signByKey(k).name),
    dates: (k: SignKey) => (ko ? SIGN_KO[k].dates : signByKey(k).dates),
    keywords: (k: SignKey) => (ko ? `${SIGN_KO[k].keywords} 사람` : signByKey(k).keywords),
    detail: (k: SignKey) => {
      const s = signByKey(k);
      return ko
        ? `${ELEMENT_KO[s.element]} · ${MODALITY_KO[s.modality]} · 수호성 ${RULER_KO[s.ruler]}`
        : `${s.element} · ${s.modality} · ruled by ${s.ruler}`;
    },
    point: (p: Point) => (ko ? POINTS_KO[p].name : POINTS[p].name),
    meaning: (p: Point) => (ko ? POINTS_KO[p].meaning : POINTS[p].meaning),
    element: (e: Element) => (ko ? ELEMENT_KO[e] : e),
    title: (name?: string) => (ko ? `${name ? `${name}님의 ` : ""}별자리` : `${name ? `${name}'s` : "Your"} zodiac`),
    born: (input: ZodiacInput, place: string | null) => {
      const time = input.hour !== null ? `${input.hour}:${String(input.minute ?? 0).padStart(2, "0")}` : null;
      if (ko) {
        const l = input.lunar;
        const lunar = l ? ` (음력 ${l.leapMonth ? "윤" : ""}${l.month}월 ${l.day}일)` : "";
        return `양력 ${input.year}년 ${input.month}월 ${input.day}일${lunar} · ${time ?? "시간 모름"}${place ? ` · ${place}` : ""}`;
      }
      const date = new Date(Date.UTC(input.year, input.month - 1, input.day)).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });
      const l = input.lunar;
      const lunar = l ? ` (Korean lunar ${l.leapMonth ? "leap " : ""}month ${l.month}, day ${l.day})` : "";
      return `Born ${date}${lunar} · ${time ?? "birth time unknown"}${place ? ` · ${place}` : ""}`;
    },
    noRising: ko ? "태어난 시각과 도시를 넣으면 상승궁도 알 수 있습니다. " : "Add your birth time and city to reveal your Rising sign. ",
    moonNote: ko
      ? "*태어난 날 달이 별자리를 옮겨서, 태어난 시각에 따라 달 별자리가 달라질 수 있습니다."
      : "*The Moon changed signs on your birthday, so your Moon sign depends on your birth time.",
    planets: ko ? "개인 행성" : "PERSONAL PLANETS",
    balance: ko ? "4원소 분포" : "Your element balance",
    twist: (c: ZodiacChart) =>
      ko ? (
        <>
          한국의 띠로 보면 <span className="font-[family-name:var(--font-hanja)] text-body">{c.animal.ganZhi}</span>년생입니다. 별자리와 함께 사주도
          보면 더 입체적으로 알 수 있습니다.
        </>
      ) : (
        <>
          Korean zodiac twist: you were born in a year of the <span className="text-body">{c.animal.name}</span>{" "}
          <span className="font-[family-name:var(--font-hanja)]">{c.animal.ganZhi}</span>. {c.animal.trait}
        </>
      ),
  };
}

export function ZodiacView({ input, chart, lang = "en" }: { input: ZodiacInput; chart: ZodiacChart; lang?: Lang }) {
  const t = texts(lang);
  const sun = chart.placements[0].sign;
  const big = chart.placements.filter((p) => p.point === "sun" || p.point === "moon" || p.point === "rising");
  const personal = chart.placements.filter((p) => p.point === "mercury" || p.point === "venus" || p.point === "mars");
  const total = Object.values(chart.elements).reduce((a, b) => a + b, 0);
  return (
    <div className="space-y-px">
      <Panel>
        <Eyebrow>ZODIAC · BIRTH CHART</Eyebrow>
        <h1 className="mt-3 text-[28px] text-ink">{t.title(input.name)}</h1>
        <p className="mt-2 text-xs leading-5 text-muted">{t.born(input, chart.place)}</p>

        <div className="mt-8 flex items-center gap-5">
          <p className="font-[family-name:var(--font-symbol)] text-6xl text-gold">{signByKey(sun).symbol}</p>
          <div>
            <p className="text-2xl text-ink">{t.sign(sun)}</p>
            <p className="mt-1 text-xs text-muted">
              {t.dates(sun)} · {t.detail(sun)}
            </p>
            <p className="mt-2 text-sm text-body">{t.keywords(sun)}</p>
          </div>
        </div>

        <div className={`mt-8 grid gap-px bg-line ${big.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
          {big.map((p) => (
            <div key={p.point} className="bg-surface-2 px-3 py-5 text-center">
              <p className="text-xs text-gold">
                {t.point(p.point)}
                {p.point === "moon" && chart.moonUncertain ? "*" : ""}
              </p>
              <p className="mt-2 font-[family-name:var(--font-symbol)] text-3xl text-ink">{signByKey(p.sign).symbol}</p>
              <p className="mt-1 text-sm text-ink">{t.sign(p.sign)}</p>
              <p className="mt-1 text-[11px] leading-4 text-muted-soft">{t.meaning(p.point)}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-muted-soft">
          {big.length < 3 && t.noRising}
          {chart.moonUncertain && t.moonNote}
        </p>
      </Panel>

      <Panel>
        <Eyebrow>{t.planets}</Eyebrow>
        <div className="mt-5 grid gap-px bg-line sm:grid-cols-3">
          {personal.map((p) => (
            <div key={p.point} className="flex items-center gap-4 bg-surface-1 py-4 sm:block sm:px-4 sm:text-center">
              <p className="w-16 text-xs text-gold sm:w-auto">{t.point(p.point)}</p>
              <p className="font-[family-name:var(--font-symbol)] text-2xl text-ink sm:mt-2">{signByKey(p.sign).symbol}</p>
              <div>
                <p className="text-sm text-ink sm:mt-1">{t.sign(p.sign)}</p>
                <p className="text-[11px] text-muted-soft">{t.meaning(p.point)}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <Eyebrow>ELEMENTS</Eyebrow>
        <h2 className="mt-3 mb-5 text-xl text-ink">{t.balance}</h2>
        <div className="space-y-3">
          {(Object.keys(chart.elements) as Element[]).map((el) => (
            <div key={el} className="flex items-center gap-3 text-sm">
              <span className={`w-14 ${ELEMENT_COLOR[el]}`}>{t.element(el)}</span>
              <div className="h-1.5 flex-1 bg-surface-3">
                <div className={`h-full ${ELEMENT_BG[el]}`} style={{ width: `${(chart.elements[el] / total) * 100}%` }} />
              </div>
              <span className="w-6 text-right text-muted">{chart.elements[el]}</span>
            </div>
          ))}
        </div>
        <p className="mt-5 border-t border-line pt-4 text-sm leading-6 text-muted-soft">{t.twist(chart)}</p>
      </Panel>
    </div>
  );
}
