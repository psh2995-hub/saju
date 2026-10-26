import { ILJU_SUMMARY } from "@/lib/ilju";
import { DAY_MASTER_SUMMARY, type Element, type SajuChart, type SajuInput } from "@/lib/saju";
import { Eyebrow, Panel } from "./ui";

const ELEMENT_STYLE: Record<Element, { text: string; bg: string; hanja: string }> = {
  목: { text: "text-wood", bg: "bg-wood", hanja: "木" },
  화: { text: "text-fire", bg: "bg-fire", hanja: "火" },
  토: { text: "text-earth", bg: "bg-earth", hanja: "土" },
  금: { text: "text-metal", bg: "bg-metal", hanja: "金" },
  수: { text: "text-water", bg: "bg-water", hanja: "水" },
};

function Char({ hanja, ko, element, yinYang }: { hanja: string; ko: string; element: Element; yinYang: string }) {
  const style = ELEMENT_STYLE[element];
  return (
    <div className="bg-surface-2 py-4">
      <p className={`font-[family-name:var(--font-hanja)] text-[34px] leading-none font-bold ${style.text}`}>{hanja}</p>
      <p className="mt-2 text-[11px] text-muted">
        {ko} · {yinYang}
        {element}
      </p>
    </div>
  );
}

export function SajuChartView({ input, chart }: { input: SajuInput; chart: SajuChart }) {
  const total = Object.values(chart.elementCounts).reduce((a, b) => a + b, 0);
  const dayPillar = chart.pillars.find((p) => p.label === "일주")!;
  const ilju = ILJU_SUMMARY[dayPillar.gan + dayPillar.zhi];
  const dayMaster = DAY_MASTER_SUMMARY[chart.dayMaster.gan];
  const missing = Object.entries(chart.elementCounts).filter(([, n]) => n === 0).map(([el]) => el);
  return (
    <div className="space-y-px">
      <Panel>
        <Eyebrow>四柱八字</Eyebrow>
        <h1 className="mt-3 text-[28px] text-ink">{input.name ? `${input.name}님의 ` : ""}사주 명식</h1>
        <p className="mt-2 text-xs leading-5 text-muted">
          양력 {chart.solarDate} · 음력 {chart.lunarDate} · {chart.zodiac}띠
          {chart.usedTime ? ` · ${chart.usedTime} 기준${chart.corrections.length ? `(${chart.corrections.join(", ")})` : ""}` : " · 시간 모름"}
        </p>
        <div className={`mt-6 grid gap-1.5 text-center ${chart.pillars.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
          {chart.pillars.map((p) => (
            <div key={p.label} className="space-y-1.5">
              <p className="text-xs text-muted-soft">{p.label}</p>
              <p className="text-xs text-gold">{p.label === "일주" ? "일간(나)" : p.ganTenGod}</p>
              <Char hanja={p.gan} ko={p.ganKo} element={p.ganElement} yinYang={p.ganYinYang} />
              <Char hanja={p.zhi} ko={p.zhiKo} element={p.zhiElement} yinYang={p.zhiYinYang} />
              <p className="text-xs text-gold">{p.zhiTenGod}</p>
              <p className="text-[11px] text-muted-soft">지장간 {p.hiddenStems.join(" ")}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <Eyebrow>DAY PILLAR</Eyebrow>
        <h2 className="mt-3 text-xl text-ink">
          일주 <span className="font-[family-name:var(--font-hanja)]">{dayPillar.gan}{dayPillar.zhi}</span>({dayPillar.ganKo}{dayPillar.zhiKo}) — {ilju.title}
        </h2>
        <p className="mt-3 text-[15px] leading-7 text-muted">{ilju.text}</p>
        <p className="mt-5 border-t border-line pt-4 text-sm leading-6 text-muted-soft">
          <span className="text-body">일간 <span className="font-[family-name:var(--font-hanja)]">{chart.dayMaster.gan}</span>({chart.dayMaster.ko}) · {dayMaster.title}</span>
          {" — "}
          {dayMaster.text}
        </p>
      </Panel>

      <Panel>
        <Eyebrow>FIVE ELEMENTS</Eyebrow>
        <h2 className="mt-3 mb-5 text-xl text-ink">오행 분포</h2>
        <div className="space-y-3">
          {(Object.keys(ELEMENT_STYLE) as Element[]).map((el) => {
            const n = chart.elementCounts[el];
            return (
              <div key={el} className="flex items-center gap-3 text-sm">
                <span className={`w-14 ${ELEMENT_STYLE[el].text}`}>
                  {el} <span className="font-[family-name:var(--font-hanja)]">{ELEMENT_STYLE[el].hanja}</span>
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
          <p className="mt-5 text-xs text-muted">없는 오행: {missing.join(", ")} — 정밀 풀이에서 보완 방법을 알려드립니다.</p>
        )}
      </Panel>

      <Panel>
        <Eyebrow>DAEUN</Eyebrow>
        <h2 className="mt-3 mb-5 text-xl text-ink">대운 · 10년 주기의 큰 흐름</h2>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {chart.daeun.map((d) => (
            <div key={d.startAge} className="min-w-16 bg-surface-2 px-2 py-3 text-center">
              <p className="text-xs text-muted">{d.startAge}세</p>
              <p className="mt-1 font-[family-name:var(--font-hanja)] text-lg text-ink">{d.ganZhi}</p>
              <p className="text-xs text-muted-soft">{d.ko}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
