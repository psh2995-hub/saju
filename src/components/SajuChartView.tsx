import { DAY_MASTER_SUMMARY, type Element, type SajuChart, type SajuInput } from "@/lib/saju";

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
    <div className="rounded-lg bg-surface-2 py-3">
      <p className={`font-serif text-3xl font-bold ${style.text}`}>{hanja}</p>
      <p className="mt-1 text-xs text-muted">
        {ko} · {yinYang}
        {element}
      </p>
    </div>
  );
}

export function SajuChartView({ input, chart }: { input: SajuInput; chart: SajuChart }) {
  const total = Object.values(chart.elementCounts).reduce((a, b) => a + b, 0);
  const summary = DAY_MASTER_SUMMARY[chart.dayMaster.gan];
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-line bg-surface p-5">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-xl font-bold">
            {input.name ? `${input.name}님의 ` : ""}사주 명식
          </h2>
          <p className="text-xs text-muted">
            양력 {chart.solarDate} · 음력 {chart.lunarDate} · {chart.zodiac}띠
            {chart.usedTime ? ` · ${chart.usedTime} 기준${chart.corrections.length ? `(${chart.corrections.join(", ")})` : ""}` : " · 시간 모름"}
          </p>
        </div>
        <div className={`grid gap-2 text-center ${chart.pillars.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
          {chart.pillars.map((p) => (
            <div key={p.label} className="space-y-1.5">
              <p className="text-xs text-muted">{p.label}</p>
              <p className="text-xs text-gold">{p.label === "일주" ? "일간(나)" : p.ganTenGod}</p>
              <Char hanja={p.gan} ko={p.ganKo} element={p.ganElement} yinYang={p.ganYinYang} />
              <Char hanja={p.zhi} ko={p.zhiKo} element={p.zhiElement} yinYang={p.zhiYinYang} />
              <p className="text-xs text-gold">{p.zhiTenGod}</p>
              <p className="text-[11px] text-muted">지장간 {p.hiddenStems.join(" ")}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="mb-1 font-serif text-lg font-bold">
          일간 {chart.dayMaster.gan}({chart.dayMaster.ko}) — {summary.title}
        </h2>
        <p className="text-sm leading-7 text-muted">{summary.text}</p>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="mb-3 font-serif text-lg font-bold">오행 분포</h2>
        <div className="space-y-2">
          {(Object.keys(ELEMENT_STYLE) as Element[]).map((el) => {
            const n = chart.elementCounts[el];
            return (
              <div key={el} className="flex items-center gap-3 text-sm">
                <span className={`w-12 font-bold ${ELEMENT_STYLE[el].text}`}>
                  {el}({ELEMENT_STYLE[el].hanja})
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <div className={`h-full rounded-full ${ELEMENT_STYLE[el].bg}`} style={{ width: `${(n / total) * 100}%` }} />
                </div>
                <span className="w-8 text-right text-muted">{n}</span>
              </div>
            );
          })}
        </div>
        {Object.entries(chart.elementCounts).some(([, n]) => n === 0) && (
          <p className="mt-3 text-xs text-muted">
            없는 오행: {Object.entries(chart.elementCounts).filter(([, n]) => n === 0).map(([el]) => el).join(", ")} — 정밀 풀이에서
            보완 방법을 알려드립니다.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="mb-3 font-serif text-lg font-bold">대운 (10년 주기의 큰 흐름)</h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {chart.daeun.map((d) => (
            <div key={d.startAge} className="min-w-16 rounded-lg bg-surface-2 px-2 py-2 text-center">
              <p className="text-xs text-muted">{d.startAge}세</p>
              <p className="font-serif text-lg font-bold">{d.ganZhi}</p>
              <p className="text-xs text-muted">{d.ko}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
