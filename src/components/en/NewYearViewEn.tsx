import { kSign, kYearName, MONTH_EN, romanize, TEN_GOD_EN, TEN_GOD_YEAR_EN } from "@/lib/en";
import type { NewYearChart } from "@/lib/newyear";
import type { SajuInput } from "@/lib/saju";
import { ELEMENT_TEXT, PillarRow } from "../PillarRow";
import { Eyebrow, Panel } from "../ui";
import { DayPillarIntro } from "./SajuChartViewEn";

export function NewYearViewEn({ input, chart }: { input: SajuInput; chart: NewYearChart }) {
  const y = chart.year;
  return (
    <div className="space-y-px">
      <Panel>
        <Eyebrow>K-ZODIAC FORECAST {y.year}</Eyebrow>
        <h1 className="mt-3 text-[28px] text-ink">
          {input.name ? `${input.name}'s ` : "Your "}
          {y.year} in the {kYearName(y.ganZhi)}
        </h1>
        <div className="mt-6 flex items-center gap-5">
          <p className={`font-[family-name:var(--font-hanja)] text-6xl font-bold ${ELEMENT_TEXT[y.element]}`}>{y.ganZhi}</p>
          <div>
            <p className="text-lg text-ink">
              {romanize(y.ganZhi)} · {kSign(y.ganZhi, false)}
            </p>
            <p className="mt-1 text-sm text-gold">
              For you: {TEN_GOD_EN[y.ganTenGod]} · {TEN_GOD_EN[y.zhiTenGod]}
            </p>
          </div>
        </div>
        <p className="mt-5 text-[15px] leading-7 text-muted">{TEN_GOD_YEAR_EN[y.ganTenGod]}</p>
        {chart.daeun && (
          <p className="mt-4 text-sm text-muted-soft">
            This year falls within your Ten-year Luck Cycle (daeun) of{" "}
            <span className="font-[family-name:var(--font-hanja)] text-body">{chart.daeun.ganZhi}</span>, the {kSign(chart.daeun.ganZhi, false)}, which
            began at age {chart.daeun.startAge}.
          </p>
        )}
      </Panel>

      <Panel>
        <Eyebrow>YOUR KOREAN BIRTH SIGN</Eyebrow>
        <DayPillarIntro chart={chart.base} />
        <div className="mt-6">
          <PillarRow chart={chart.base} lang="en" />
        </div>
      </Panel>

      <Panel>
        <Eyebrow>MONTH BY MONTH</Eyebrow>
        <h2 className="mt-3 mb-5 text-xl text-ink">Your monthly flow</h2>
        <div className="grid grid-cols-3 gap-px bg-line sm:grid-cols-4">
          {chart.months.map((m) => (
            <div key={m.label} className="bg-surface-1 px-2 py-4 text-center">
              <p className="text-xs text-muted">{MONTH_EN[parseInt(m.label) - 1]}</p>
              <p className="mt-1 font-[family-name:var(--font-hanja)] text-lg text-ink">{m.ganZhi}</p>
              <p className="mt-1 text-xs text-gold">{TEN_GOD_EN[m.ganTenGod]}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-muted-soft">
          Korean months follow the solar terms, so each month starts around the 4th–8th (February begins at Ipchun, the start of spring). The gold label is
          the energy that month brings you; the full forecast walks through every month in detail.
        </p>
      </Panel>
    </div>
  );
}
