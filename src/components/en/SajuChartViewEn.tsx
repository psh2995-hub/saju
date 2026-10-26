import { ANIMAL_TRAIT_EN, DAY_MASTER_EN, ELEMENT_EN, kSign, PILLAR_EN, romanize, TEN_GOD_EN, YINYANG_EN } from "@/lib/en";
import type { Element, SajuChart, SajuInput } from "@/lib/saju";
import { Eyebrow, Panel } from "../ui";

const ELEMENT_STYLE: Record<Element, { text: string; bg: string; hanja: string }> = {
  목: { text: "text-wood", bg: "bg-wood", hanja: "木" },
  화: { text: "text-fire", bg: "bg-fire", hanja: "火" },
  토: { text: "text-earth", bg: "bg-earth", hanja: "土" },
  금: { text: "text-metal", bg: "bg-metal", hanja: "金" },
  수: { text: "text-water", bg: "bg-water", hanja: "水" },
};

function Char({ hanja, element, yinYang }: { hanja: string; element: Element; yinYang: string }) {
  return (
    <div className="bg-surface-2 py-4">
      <p className={`font-[family-name:var(--font-hanja)] text-[34px] leading-none font-bold ${ELEMENT_STYLE[element].text}`}>{hanja}</p>
      <p className="mt-2 text-[11px] text-muted">
        {YINYANG_EN[yinYang]} {ELEMENT_EN[element]}
      </p>
    </div>
  );
}

/** 일주를 한국식 '탄생 사인'으로 소개한다. 신년운세 화면에서도 쓴다. */
export function DayPillarIntro({ chart }: { chart: SajuChart }) {
  const d = chart.pillars.find((p) => p.label === "일주")!;
  const dm = DAY_MASTER_EN[d.gan];
  return (
    <>
      <h2 className="mt-3 text-xl text-ink">
        The {kSign(d.gan + d.zhi)} <span className="font-[family-name:var(--font-hanja)]">{d.gan}{d.zhi}</span>
        <span className="text-muted"> · {romanize(d.gan + d.zhi)}</span>
      </h2>
      <p className="mt-3 text-[15px] leading-7 text-muted">
        <span className="text-body">{dm.title}.</span> {dm.text} {ANIMAL_TRAIT_EN[d.zhi]}
      </p>
    </>
  );
}

export function SajuChartViewEn({ input, chart }: { input: SajuInput; chart: SajuChart }) {
  const total = Object.values(chart.elementCounts).reduce((a, b) => a + b, 0);
  const missing = (Object.entries(chart.elementCounts) as [Element, number][]).filter(([, n]) => n === 0).map(([el]) => ELEMENT_EN[el]);
  const yearPillar = chart.pillars.find((p) => p.label === "연주")!;
  return (
    <div className="space-y-px">
      <Panel>
        <Eyebrow>四柱八字 · KOREAN BIRTH CHART</Eyebrow>
        <h1 className="mt-3 text-[28px] text-ink">{input.name ? `${input.name}'s ` : "Your "}Four Pillars</h1>
        <p className="mt-2 text-xs leading-5 text-muted">
          Born {chart.solarDate} · {kSign(yearPillar.gan + yearPillar.zhi, false)} year
          {chart.usedTime ? ` · ${chart.usedTime}${input.timeZone ? ` (${input.timeZone})` : " (Korea time)"}` : " · birth time unknown"}
        </p>
        <div className={`mt-6 grid gap-1.5 text-center ${chart.pillars.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
          {chart.pillars.map((p) => (
            <div key={p.label} className="space-y-1.5">
              <p className="text-xs text-muted-soft">{PILLAR_EN[p.label]}</p>
              <p className="text-xs text-gold">{p.label === "일주" ? "You" : TEN_GOD_EN[p.ganTenGod]}</p>
              <Char hanja={p.gan} element={p.ganElement} yinYang={p.ganYinYang} />
              <Char hanja={p.zhi} element={p.zhiElement} yinYang={p.zhiYinYang} />
              <p className="text-xs text-gold">{TEN_GOD_EN[p.zhiTenGod]}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xs leading-5 text-muted-soft">
          Each pillar is a pair of characters: a Heavenly Stem on top and an Earthly Branch (one of the twelve zodiac animals) below. The gold labels
          show how each one relates to you, the Day Master.
        </p>
      </Panel>

      <Panel>
        <Eyebrow>YOUR KOREAN BIRTH SIGN</Eyebrow>
        <DayPillarIntro chart={chart} />
        <p className="mt-5 border-t border-line pt-4 text-sm leading-6 text-muted-soft">
          In Korean astrology, your Day Pillar (ilju), not your birth year, describes who you are at the core.
        </p>
      </Panel>

      <Panel>
        <Eyebrow>FIVE ELEMENTS</Eyebrow>
        <h2 className="mt-3 mb-5 text-xl text-ink">Your Five Elements Balance</h2>
        <div className="space-y-3">
          {(Object.keys(ELEMENT_STYLE) as Element[]).map((el) => {
            const n = chart.elementCounts[el];
            return (
              <div key={el} className="flex items-center gap-3 text-sm">
                <span className={`w-20 ${ELEMENT_STYLE[el].text}`}>
                  {ELEMENT_EN[el]} <span className="font-[family-name:var(--font-hanja)]">{ELEMENT_STYLE[el].hanja}</span>
                </span>
                <div className="h-1.5 flex-1 bg-surface-3">
                  <div className={`h-full ${ELEMENT_STYLE[el].bg}`} style={{ width: `${(n / total) * 100}%` }} />
                </div>
                <span className="w-6 text-right text-muted">{n}</span>
              </div>
            );
          })}
        </div>
        {missing.length > 0 && (
          <p className="mt-5 text-xs text-muted">Missing: {missing.join(", ")}. The full reading shows how to bring it into your life.</p>
        )}
      </Panel>

      <Panel>
        <Eyebrow>DAEUN</Eyebrow>
        <h2 className="mt-3 mb-5 text-xl text-ink">Ten-year Luck Cycles</h2>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {chart.daeun.map((d) => (
            <div key={d.startAge} className="min-w-20 bg-surface-2 px-2 py-3 text-center">
              <p className="text-xs text-muted">Age {d.startAge}</p>
              <p className="mt-1 font-[family-name:var(--font-hanja)] text-lg text-ink">{d.ganZhi}</p>
              <p className="text-[11px] text-muted-soft">{kSign(d.ganZhi, false)}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
