import { ILJU_SUMMARY } from "@/lib/ilju";
import { TEN_GOD_YEAR, type NewYearChart } from "@/lib/newyear";
import type { SajuInput } from "@/lib/saju";
import { PillarRow, ELEMENT_TEXT } from "./PillarRow";
import { Eyebrow, Panel } from "./ui";

export function NewYearView({ input, chart }: { input: SajuInput; chart: NewYearChart }) {
  const y = chart.year;
  const d = chart.base.pillars.find((p) => p.label === "일주")!;
  return (
    <div className="space-y-px">
      <Panel>
        <Eyebrow>NEW YEAR {y.year}</Eyebrow>
        <h1 className="mt-3 text-[28px] text-ink">
          {input.name ? `${input.name}님의 ` : ""}
          {y.year}년 신년운세
        </h1>
        <div className="mt-6 flex items-center gap-5">
          <p className={`font-[family-name:var(--font-hanja)] text-6xl font-bold ${ELEMENT_TEXT[y.element]}`}>{y.ganZhi}</p>
          <div>
            <p className="text-lg text-ink">{y.ko}년</p>
            <p className="mt-1 text-sm text-gold">
              천간 {y.ganTenGod} · 지지 {y.zhiTenGod}
            </p>
          </div>
        </div>
        <p className="mt-5 text-[15px] leading-7 text-muted">{TEN_GOD_YEAR[y.ganTenGod]}</p>
        {chart.daeun && (
          <p className="mt-4 text-sm text-muted-soft">
            이 해는 {chart.daeun.startAge}세부터 이어지는{" "}
            <span className="font-[family-name:var(--font-hanja)] text-body">{chart.daeun.ganZhi}</span>({chart.daeun.ko}) 대운 안에 있습니다.
          </p>
        )}
      </Panel>

      <Panel>
        <Eyebrow>MY PILLARS</Eyebrow>
        <h2 className="mt-3 mb-5 text-xl text-ink">
          나의 명식 · 일주 <span className="font-[family-name:var(--font-hanja)]">{d.gan}{d.zhi}</span> {ILJU_SUMMARY[d.gan + d.zhi].title}
        </h2>
        <PillarRow chart={chart.base} />
      </Panel>

      <Panel>
        <Eyebrow>MONTHLY</Eyebrow>
        <h2 className="mt-3 mb-5 text-xl text-ink">월별 흐름</h2>
        <div className="grid grid-cols-3 gap-px bg-line sm:grid-cols-4">
          {chart.months.map((m) => (
            <div key={m.label} className="bg-surface-1 px-2 py-4 text-center">
              <p className="text-xs text-muted">{m.label}</p>
              <p className="mt-1 font-[family-name:var(--font-hanja)] text-lg text-ink">{m.ganZhi}</p>
              <p className="mt-1 text-xs text-gold">{m.ganTenGod}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-muted-soft">
          월은 절기 기준입니다(2월은 입춘부터). 십성은 그 달 천간이 내 일간에 주는 기운이며, 정밀 풀이에서 달마다 자세히 풀어 드립니다.
        </p>
      </Panel>
    </div>
  );
}
